# Ngô Quyền trong trái tim em

Thiệp số dạng trang web tĩnh, làm theo đề "Ngô Quyền trong trái tim em" dành cho học sinh khối 3–5. Thiệp giới thiệu anh hùng Ngô Quyền và **Trường Tiểu học Ngô Quyền, phường Cẩm Lệ, TP Đà Nẵng**.

Gồm 11 slide, bấm nút ‹ › (hoặc phím ← →, hoặc vuốt) để chuyển trang:

| # | Slide | Nội dung |
|---|---|---|
| 1 | Bìa | Tên thiệp, lời mở đầu |
| 2 | Về em | Giới thiệu bản thân (em tự điền) |
| 3–4 | Anh hùng Ngô Quyền | Tiểu sử, trận Bạch Đằng 938 có mô phỏng thủy triều |
| 5–8 | Trường em | Hai cơ sở, thầy cô, hoạt động, dấu mốc |
| 9–10 | Đố vui | 4 câu trắc nghiệm, chấm sao, pháo giấy |
| 11 | Lời kết | Lời cảm ơn 20/11, nguồn tham khảo |

## Chỗ em cần tự sửa

Thông tin cá nhân nằm ở slide 2 trong `index.html` (tìm `profile-row`).

## Chạy thử trên máy

```bash
python3 -m http.server 8000
```

Rồi mở `http://localhost:8000`.

## Nguồn

- Thông tin và ảnh về trường: fanpage Trường Tiểu học Ngô Quyền – Phường Cẩm Lệ.
- Học 2 buổi/ngày: toplist.vn.
- Dấu mốc (slide 8): Báo Đà Nẵng, Báo Quân đội Nhân dân, blog nhà trường, trang thông tin phường Cẩm Lệ.
- Tranh minh hoạ (Ngô Quyền, trận Bạch Đằng, ngôi trường, thầy cô, đố vui): tự vẽ bằng SVG.
- Ảnh thật (trừ ảnh toàn cảnh trường ở slide 5) được vẽ lại kiểu anime truyện tranh bằng `tools/make-hand-drawn-photos.py` (cần `opencv-python-headless`, `numpy`).
- Thiệp không đăng họ tên, ảnh rõ mặt học sinh. Ảnh thầy cô chỉ đăng khi nhà trường đồng ý.
