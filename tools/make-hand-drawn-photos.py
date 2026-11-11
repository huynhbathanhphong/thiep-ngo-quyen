"""Chuyển ảnh thật thành tranh kiểu anime / truyện tranh tươi sáng.

Cách dùng (cần opencv-python-headless + numpy):
    python make-hand-drawn-photos.py <thu-muc-anh-goc> <thu-muc-dau-ra>

Mỗi ảnh .jpg trong thư mục gốc được lưu sang thư mục đầu ra cùng tên.
Các bước: làm mịn giữ cạnh -> gom màu thành mảng bệt (cel shading)
-> tăng màu tươi -> nét mực đen rõ như truyện tranh -> chấm lưới (screentone) ở vùng tối.
"""
import sys
from pathlib import Path

import cv2
import numpy as np


def flat_colors(img: np.ndarray, k: int = 14) -> np.ndarray:
    """Gom ảnh về k màu (k-means trong không gian Lab) để có mảng màu bệt như tranh tô."""
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 12, 1.0)
    cv2.setRNGSeed(7)
    _, labels, centers = cv2.kmeans(lab, k, None, criteria, 3, cv2.KMEANS_PP_CENTERS)
    flat = centers[labels.flatten()].reshape(img.shape).astype(np.uint8)
    return cv2.cvtColor(flat, cv2.COLOR_LAB2BGR)


def ink_lines(smooth: np.ndarray) -> np.ndarray:
    """Nét mực mảnh, gọn: 1.0 là giấy trắng, 0.0 là mực đen."""
    gray = cv2.cvtColor(smooth, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 130)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(edges, connectivity=8)
    keep = np.zeros_like(edges)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] >= 25:  # bỏ nét vụn
            keep[lab == i] = 255
    keep = cv2.dilate(keep, np.ones((2, 2), np.uint8))
    return 1.0 - cv2.GaussianBlur(keep, (0, 0), 0.7).astype(np.float32) / 255 * 0.85


def white_balance(img: np.ndarray) -> np.ndarray:
    """Kéo giãn từng kênh màu để trắng ra trắng, bỏ ám màu."""
    out = np.empty_like(img)
    for c in range(3):
        lo, hi = np.percentile(img[..., c], (1, 99))
        out[..., c] = np.clip((img[..., c].astype(np.float32) - lo) * 255 / max(hi - lo, 1), 0, 255)
    return out


def screentone(shape, value: np.ndarray) -> np.ndarray:
    """Chấm lưới kiểu manga, chỉ phủ nhẹ lên vùng tối."""
    h, w = shape
    yy, xx = np.mgrid[0:h, 0:w]
    dots = ((xx % 6 - 3) ** 2 + (yy % 6 - 3) ** 2) <= 2
    dark = cv2.GaussianBlur((value < 95).astype(np.float32), (0, 0), 2)
    return 1.0 - dots * dark * 0.12


def anime(img: np.ndarray) -> np.ndarray:
    h, w = img.shape[:2]
    scale = 1200 / max(h, w)
    if scale < 1:
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    img = white_balance(img)
    smooth = img
    for _ in range(3):
        smooth = cv2.bilateralFilter(smooth, 9, 60, 60)
    smooth = cv2.edgePreservingFilter(smooth, flags=cv2.RECURS_FILTER, sigma_s=50, sigma_r=0.35)

    color = cv2.medianBlur(flat_colors(smooth, k=22), 5)

    # Màu tươi, sáng, trong kiểu anime
    hsv = cv2.cvtColor(color, cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * 1.25, 0, 255)
    hsv[..., 2] = np.clip(255 * (hsv[..., 2] / 255) ** 0.72, 0, 255)
    color = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)

    out = color * ink_lines(smooth)[..., None] * screentone(img.shape[:2], hsv[..., 2])[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)


def main(src: str, dst: str) -> None:
    out_dir = Path(dst)
    out_dir.mkdir(parents=True, exist_ok=True)
    for path in sorted(Path(src).glob("*.jpg")):
        img = cv2.imread(str(path))
        if img is None:
            print("Bỏ qua (không đọc được):", path.name)
            continue
        cv2.imwrite(str(out_dir / path.name), anime(img), [cv2.IMWRITE_JPEG_QUALITY, 86])
        print("Đã vẽ lại:", path.name)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
