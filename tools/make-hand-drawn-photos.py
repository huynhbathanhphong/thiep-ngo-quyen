"""Chuyển ảnh thật thành kiểu tranh vẽ tay màu nước, nhẹ nhàng.

Cách dùng (cần opencv-python-headless + numpy):
    python make-hand-drawn-photos.py <thu-muc-anh-goc> <thu-muc-dau-ra>

Mỗi ảnh .jpg trong thư mục gốc được lưu sang thư mục đầu ra cùng tên.
"""
import sys
from pathlib import Path

import cv2
import numpy as np


def watercolor(img: np.ndarray) -> np.ndarray:
    h, w = img.shape[:2]
    scale = 1200 / max(h, w)
    if scale < 1:
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    # Màu bệt mượt như màu nước: làm mịn giữ cạnh nhiều lần
    paint = img
    for _ in range(2):
        paint = cv2.bilateralFilter(paint, 9, 60, 9)
    paint = cv2.stylization(paint, sigma_s=70, sigma_r=0.4)

    # Pastel: sáng và dịu hơn ảnh gốc
    hsv = cv2.cvtColor(paint, cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[..., 1] *= 0.92
    hsv[..., 2] = hsv[..., 2] * 0.78 + 255 * 0.24
    paint = cv2.cvtColor(np.clip(hsv, 0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR)

    # Nét chì mảnh, chỉ giữ các đường viền lớn
    gray = cv2.cvtColor(cv2.GaussianBlur(img, (0, 0), 2.2), cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 40, 110)
    edges = cv2.dilate(edges, np.ones((2, 2), np.uint8))
    lines = 1.0 - cv2.GaussianBlur(edges, (0, 0), 0.8).astype(np.float32) / 255 * 0.45
    out = paint.astype(np.float32) * lines[..., None]

    # Ám giấy ấm + vân giấy nhẹ
    paper = np.array([236, 246, 255], np.float32)  # BGR, hơi kem
    out = out * 0.9 + paper * 0.1
    rng = np.random.default_rng(7)
    grain = cv2.GaussianBlur(rng.normal(0, 1, out.shape[:2]).astype(np.float32), (0, 0), 1.2)
    out += grain[..., None] * 5
    return np.clip(out, 0, 255).astype(np.uint8)


def main(src: str, dst: str) -> None:
    out_dir = Path(dst)
    out_dir.mkdir(parents=True, exist_ok=True)
    for path in sorted(Path(src).glob("*.jpg")):
        img = cv2.imread(str(path))
        if img is None:
            print("Bỏ qua (không đọc được):", path.name)
            continue
        cv2.imwrite(str(out_dir / path.name), watercolor(img), [cv2.IMWRITE_JPEG_QUALITY, 84])
        print("Đã vẽ lại:", path.name)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
