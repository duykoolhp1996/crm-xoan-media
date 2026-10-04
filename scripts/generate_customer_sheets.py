import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = openpyxl.Workbook()

# Sheet 1: DANH SÁCH KHÁCH HÀNG
ws1 = wb.active
ws1.title = "Khách Hàng Xoăn Media"

# Title header banner
ws1.merge_cells('A1:Z1')
title_cell = ws1['A1']
title_cell.value = "CRM XOĂN MEDIA - DANH SÁCH & HỒ SƠ KHÁCH HÀNG KỶ YẾU"
title_cell.font = Font(name="Arial", size=16, bold=True, color="FFFFFF")
title_cell.fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
title_cell.alignment = Alignment(horizontal="center", vertical="center")
ws1.row_dimensions[1].height = 42

# Subtitle banner
ws1.merge_cells('A2:Z2')
sub_cell = ws1['A2']
sub_cell.value = "Hệ thống quản lý dữ liệu khách hàng kỷ yếu | Chuẩn đồng bộ Google Sheets, Supabase & CRM"
sub_cell.font = Font(name="Arial", size=10, italic=True, color="94A3B8")
sub_cell.fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
sub_cell.alignment = Alignment(horizontal="center", vertical="center")
ws1.row_dimensions[2].height = 24

headers = [
    "STT",
    "Mã Khách (ID)",
    "Họ & Tên Đại Diện",
    "Số Điện Thoại",
    "Số Zalo",
    "Facebook Link",
    "Tên Lớp",
    "Trường Học",
    "Khối Lớp",
    "Niên Khóa",
    "Khu Vực",
    "Vai Trò Đại Diện",
    "Sĩ Số Lớp",
    "Gói Dịch Vụ",
    "Concept Mong Muốn",
    "Ngày Chụp Dự Kiến",
    "Địa Điểm Chụp",
    "Ngân Sách Dự Kiến (VNĐ)",
    "Tổng Doanh Thu Hợp Đồng (VNĐ)",
    "Đã Thu Cọc (VNĐ)",
    "Còn Lại Cần Thu (VNĐ)",
    "Giai Đoạn Pipeline",
    "Nguồn Khách",
    "Sales Phụ Trách",
    "Ngày Tiếp Nhận",
    "Ghi Chú Chi Tiết"
]

ws1.row_dimensions[3].height = 30
header_font = Font(name="Arial", size=11, bold=True, color="000000")
header_fill = PatternFill(start_color="B8F23D", end_color="B8F23D", fill_type="solid") # Neon Lime brand
thin_border = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)

for col_num, header in enumerate(headers, 1):
    cell = ws1.cell(row=3, column=col_num)
    cell.value = header
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    cell.border = thin_border

# Sample Customer Rows (Rich, realistic, formatted data)
sample_customers = [
    [
        1, "CUST-2026-001", "Nguyễn Thu Trang", "0912345678", "0912345678", "fb.com/thutrang.12a1",
        "12A1", "THPT Ngô Quyền", "Khối 12", "2025-2026", "Hải Phòng", "Lớp trưởng", 42,
        "Gói Kỷ Yếu STANDARD", "Thanh xuân vườn trường + Retro 90s", "2026-04-18", "Trường học & Phim trường Đồ Sơn",
        8500000, 8500000, 3000000, 5500000, "Đã đặt cọc", "Facebook Ads", "Lê Hoàng Sơn", "2026-10-01",
        "Lớp muốn thuê thêm 1 flycam quay highlight tiệc dạ hội"
    ],
    [
        2, "CUST-2026-002", "Trần Minh Quân", "0988776655", "0988776655", "fb.com/minhquan.chuyenanh",
        "12 Chuyên Anh", "THPT Chuyên Trần Phú", "Khối 12", "2025-2026", "Hải Phòng", "Bí thư", 36,
        "Gói Kỷ Yếu PREMIUM CONCEPT", "Cổ phục Việt Nam + Party Dạ Tiệc", "2026-04-25", "Văn Miếu & Phim trường Wonderland",
        14200000, 14200000, 5000000, 9200000, "Đã đặt cọc", "TikTok Viral", "Nguyễn Mai Linh", "2026-10-02",
        "Lớp yêu cầu 2 thợ chụp chính + 1 thợ quay video 4K"
    ],
    [
        3, "CUST-2026-003", "Phạm Hải Yến", "0904112233", "0904112233", "fb.com/haiyen.12b3",
        "12B3", "THPT Thái Phiên", "Khối 12", "2025-2026", "Hải Phòng", "Thủ quỹ", 38,
        "Gói Kỷ Yếu STANDARD", "Thanh xuân Hàn Quốc & Áo dài", "2026-05-02", "Sân trường & Cầu Hoàng Văn Thụ",
        7800000, 0, 0, 0, "Đang tư vấn", "Giới thiệu", "Lê Hoàng Sơn", "2026-10-03",
        "Đang biểu quyết concept giữa áo dài truyền thống và concept cô gái Hà Lan"
    ],
    [
        4, "CUST-2026-004", "Vũ Đức Thắng", "0977223344", "0977223344", "fb.com/ducthang.12toan",
        "12 Chuyên Toán", "THPT Lê Hồng Phong", "Khối 12", "2025-2026", "Hải Phòng", "Lớp trưởng", 35,
        "Gói Kỷ Yếu BASIC", "Áo cử nhân + Áo dài truyền thống", "2026-05-09", "Trường học",
        4500000, 0, 0, 0, "Đã liên hệ", "Facebook Lead", "Nguyễn Mai Linh", "2026-10-04",
        "Hẹn gọi lại sau giờ học buổi chiều để chốt gói"
    ],
    [
        5, "CUST-2026-005", "Đặng Thị Phương", "0936554433", "0936554433", "fb.com/phuong.daihoc",
        "K18 QTKD", "Đại học Hàng Hải Việt Nam", "Đại học", "2022-2026", "Hải Phòng", "Trưởng ban tổ chức", 55,
        "Gói Kỷ Yếu VIP CINEMATIC", "Dạ tiệc Gala & Pháo sáng bãi biển", "2026-05-16", "Resort Flamingo Cát Bà",
        22000000, 22000000, 10000000, 12000000, "Đã đặt cọc", "Hotline Xoăn Media", "Tạ Duy (Admin)", "2026-10-04",
        "Hợp đồng doanh nghiệp / lớp đại học quy mô lớn kèm xe đưa đón"
    ]
]

data_font = Font(name="Arial", size=10)
stage_fills = {
    "Đã đặt cọc": PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid"),
    "Đang tư vấn": PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid"),
    "Đã liên hệ": PatternFill(start_color="E0F2FE", end_color="E0F2FE", fill_type="solid"),
    "Chưa liên hệ": PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
}

for row_idx, customer in enumerate(sample_customers, 4):
    ws1.row_dimensions[row_idx].height = 24
    for col_idx, val in enumerate(customer, 1):
        cell = ws1.cell(row=row_idx, column=col_idx)
        cell.value = val
        cell.font = data_font
        cell.border = thin_border

        # Alignments & formats
        if col_idx in [1, 9, 10, 13, 16, 25]: # Numbers / Dates
            cell.alignment = Alignment(horizontal="center", vertical="center")
        elif col_idx in [18, 19, 20, 21]: # Currency
            cell.alignment = Alignment(horizontal="right", vertical="center")
            cell.number_format = '#,##0 "₫"'
        elif col_idx == 22: # Pipeline Stage
            cell.alignment = Alignment(horizontal="center", vertical="center")
            if val in stage_fills:
                cell.fill = stage_fills[val]
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center")

# Auto-adjust column widths
for col in ws1.columns:
    max_len = max(len(str(cell.value or '')) for cell in col[2:]) # calculate from row 3
    col_letter = get_column_letter(col[0].column)
    ws1.column_dimensions[col_letter].width = max(max_len + 4, 12)

ws1.column_dimensions['A'].width = 8
ws1.column_dimensions['B'].width = 18
ws1.column_dimensions['C'].width = 22
ws1.column_dimensions['D'].width = 15
ws1.column_dimensions['E'].width = 15
ws1.column_dimensions['F'].width = 24
ws1.column_dimensions['G'].width = 16
ws1.column_dimensions['H'].width = 24
ws1.column_dimensions['N'].width = 26
ws1.column_dimensions['O'].width = 30
ws1.column_dimensions['Q'].width = 32
ws1.column_dimensions['R'].width = 20
ws1.column_dimensions['S'].width = 22
ws1.column_dimensions['T'].width = 18
ws1.column_dimensions['U'].width = 18
ws1.column_dimensions['V'].width = 18
ws1.column_dimensions['Z'].width = 38

# Sheet 2: HƯỚNG DẪN IMPORT VÀO GOOGLE SHEETS
ws2 = wb.create_sheet(title="Hướng Dẫn Google Sheets")
ws2.row_dimensions[1].height = 36
g_title = ws2['A1']
g_title.value = "HƯỚNG DẪN ĐỒNG BỘ FILE SHEET NÀY VỚI CRM XOĂN MEDIA"
g_title.font = Font(name="Arial", size=14, bold=True, color="0F172A")

instructions = [
    ("Bước 1: Mở Google Sheets", "Truy cập https://sheets.google.com và tạo một trang tính mới (hoặc mở file Google Sheet có sẵn của Xoăn Media)."),
    ("Bước 2: Tải file này lên", "Vào menu 'Tệp' (File) > chọn 'Mở' (Open) > chọn tab 'Tải lên' (Upload) và kéo thả file này vào."),
    ("Bước 3: Nhận API Webhook", "Vào 'Tiện ích mở rộng' (Extensions) > 'Apps Script' > dán đoạn mã tự động của CRM Xoăn Media > Triển khai dưới dạng Web App."),
    ("Bước 4: Kết nối với CRM", "Dán link API vào CRM Xoăn Media (Cài Đặt > Cơ Sở Dữ Liệu > Vùng 1: Google Sheets). Dữ liệu sẽ tự động đồng bộ 2 chiều!"),
    ("Định dạng cột", "Các cột ID, Họ Tên, SĐT, Lớp, Trường, Doanh Thu, Cọc, Pipeline đã được chuẩn hóa để tương thích 100% với CRM.")
]

for idx, (step, desc) in enumerate(instructions, 3):
    ws2.row_dimensions[idx].height = 28
    c1 = ws2.cell(row=idx, column=1, value=step)
    c1.font = Font(name="Arial", size=11, bold=True, color="047857")
    c2 = ws2.cell(row=idx, column=2, value=desc)
    c2.font = Font(name="Arial", size=10, color="1E293B")

ws2.column_dimensions['A'].width = 30
ws2.column_dimensions['B'].width = 85

# Save files
xlsx_path_root = "/Users/Admin/Documents/CRM Xoan/danh_sach_khach_hang_xoan_media.xlsx"
xlsx_path_public = "/Users/Admin/Documents/CRM Xoan/public/danh_sach_khach_hang_xoan_media.xlsx"
wb.save(xlsx_path_root)
wb.save(xlsx_path_public)
print("XLSX generated successfully.")

# Also generate UTF-8 BOM CSV
import csv

csv_headers = headers
csv_rows = sample_customers

csv_path_root = "/Users/Admin/Documents/CRM Xoan/mau_danh_sach_khach_hang_xoan_media.csv"
csv_path_public = "/Users/Admin/Documents/CRM Xoan/public/mau_danh_sach_khach_hang_xoan_media.csv"

for p in [csv_path_root, csv_path_public]:
    with open(p, mode='w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(csv_headers)
        writer.writerows(csv_rows)

print("CSV generated successfully.")
