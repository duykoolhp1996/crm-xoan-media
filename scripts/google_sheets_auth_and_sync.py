import os
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
]

CLIENT_SECRET_FILE = '/Users/Admin/Documents/CRM Xoan/API/client_secret.json'
TOKEN_FILE = '/Users/Admin/Documents/CRM Xoan/API/token.json'
SPREADSHEET_ID = '1_YRVit8_smvCnGNUQFJCKVaUA-VxIWwN7PWJ0e--kso'

def get_credentials():
    creds = None
    if os.path.exists(TOKEN_FILE):
        try:
            creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
        except Exception as e:
            print(f"Token file invalid: {e}")

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as e:
                print(f"Refresh failed: {e}")
                creds = None
        
        if not creds:
            print("🚀 Đang khởi động trình duyệt để xác thực tài khoản Google...")
            flow = InstalledAppFlow.from_client_secrets_file(
                CLIENT_SECRET_FILE,
                SCOPES
            )
            # Use fixed port or port 0 for desktop flow
            creds = flow.run_local_server(port=0, open_browser=True)

        with open(TOKEN_FILE, 'w', encoding='utf-8') as token:
            token.write(creds.to_json())
            print(f"✅ Đã lưu token xác thực tại: {TOKEN_FILE}")

    return creds

def populate_sheet():
    creds = get_credentials()
    service = build('sheets', 'v4', credentials=creds)

    print(f"📊 Đang kết nối tới Spreadsheet ID: {SPREADSHEET_ID}...")
    
    # 1. Đổi tên sheet đầu tiên thành 'Khách Hàng' và đổi tên toàn bộ file
    try:
        drive_service = build('drive', 'v3', credentials=creds)
        drive_service.files().update(
            fileId=SPREADSHEET_ID,
            body={'name': 'CRM Xoăn Media - Quản Lý Khách Hàng'}
        ).execute()
        print("✅ Đã cập nhật tên file Google Sheet: 'CRM Xoăn Media - Quản Lý Khách Hàng'")
    except Exception as e:
        print(f"Cập nhật tên Drive: {e}")

    # Lấy thông tin sheet hiện tại
    sheet_metadata = service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
    first_sheet_id = sheet_metadata['sheets'][0]['properties']['sheetId']

    # Rename sheet 1 thành 'Khách Hàng'
    try:
        service.spreadsheets().batchUpdate(
            spreadsheetId=SPREADSHEET_ID,
            body={
                'requests': [{
                    'updateSheetProperties': {
                        'properties': {
                            'sheetId': first_sheet_id,
                            'title': 'Khách Hàng'
                        },
                        'fields': 'title'
                    }
                }]
            }
        ).execute()
    except Exception:
        pass

    # 2. Định nghĩa 26 cột nghiệp vụ
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

    sample_customers = [
        [
            1, "CUST-2026-001", "Nguyễn Thu Trang", "0912345678", "0912345678", "fb.com/thutrang.12a1",
            "12A1", "THPT Ngô Quyền", "Khối 12", "2025-2026", "Hải Phòng", "Lớp trưởng", 42,
            "Gói Kỷ Yếu STANDARD", "Thanh xuân vườn trường + Retro 90s", "2026-04-18", "Trường học & Phim trường Đồ Sơn",
            "8,500,000 ₫", "8,500,000 ₫", "3,000,000 ₫", "5,500,000 ₫", "Đã đặt cọc", "Facebook Ads", "Lê Hoàng Sơn", "2026-10-01",
            "Lớp muốn thuê thêm 1 flycam quay highlight tiệc dạ hội"
        ],
        [
            2, "CUST-2026-002", "Trần Minh Quân", "0988776655", "0988776655", "fb.com/minhquan.chuyenanh",
            "12 Chuyên Anh", "THPT Chuyên Trần Phú", "Khối 12", "2025-2026", "Hải Phòng", "Bí thư", 36,
            "Gói Kỷ Yếu PREMIUM CONCEPT", "Cổ phục Việt Nam + Party Dạ Tiệc", "2026-04-25", "Văn Miếu & Phim trường Wonderland",
            "14,200,000 ₫", "14,200,000 ₫", "5,000,000 ₫", "9,200,000 ₫", "Đã đặt cọc", "TikTok Viral", "Nguyễn Mai Linh", "2026-10-02",
            "Lớp yêu cầu 2 thợ chụp chính + 1 thợ quay video 4K"
        ],
        [
            3, "CUST-2026-003", "Phạm Hải Yến", "0904112233", "0904112233", "fb.com/haiyen.12b3",
            "12B3", "THPT Thái Phiên", "Khối 12", "2025-2026", "Hải Phòng", "Thủ quỹ", 38,
            "Gói Kỷ Yếu STANDARD", "Thanh xuân Hàn Quốc & Áo dài", "2026-05-02", "Sân trường & Cầu Hoàng Văn Thụ",
            "7,800,000 ₫", "0 ₫", "0 ₫", "0 ₫", "Đang tư vấn", "Giới thiệu", "Lê Hoàng Sơn", "2026-10-03",
            "Đang biểu quyết concept giữa áo dài truyền thống và concept cô gái Hà Lan"
        ],
        [
            4, "CUST-2026-004", "Vũ Đức Thắng", "0977223344", "0977223344", "fb.com/ducthang.12toan",
            "12 Chuyên Toán", "THPT Lê Hồng Phong", "Khối 12", "2025-2026", "Hải Phòng", "Lớp trưởng", 35,
            "Gói Kỷ Yếu BASIC", "Áo cử nhân + Áo dài truyền thống", "2026-05-09", "Trường học",
            "4,500,000 ₫", "0 ₫", "0 ₫", "0 ₫", "Đã liên hệ", "Facebook Lead", "Nguyễn Mai Linh", "2026-10-04",
            "Hẹn gọi lại sau giờ học buổi chiều để chốt gói"
        ],
        [
            5, "CUST-2026-005", "Đặng Thị Phương", "0936554433", "0936554433", "fb.com/phuong.daihoc",
            "K18 QTKD", "Đại học Hàng Hải Việt Nam", "Đại học", "2022-2026", "Hải Phòng", "Trưởng ban tổ chức", 55,
            "Gói Kỷ Yếu VIP CINEMATIC", "Dạ tiệc Gala & Pháo sáng bãi biển", "2026-05-16", "Resort Flamingo Cát Bà",
            "22,000,000 ₫", "22,000,000 ₫", "10,000,000 ₫", "12,000,000 ₫", "Đã đặt cọc", "Hotline Xoăn Media", "Tạ Duy (Admin)", "2026-10-04",
            "Hợp đồng doanh nghiệp / lớp đại học quy mô lớn kèm xe đưa đón"
        ]
    ]

    all_values = [headers] + sample_customers

    # 3. Ghi dữ liệu vào sheet 'Khách Hàng'
    service.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range='Khách Hàng!A1',
        valueInputOption='USER_ENTERED',
        body={'values': all_values}
    ).execute()
    print("✅ Đã ghi thành công 26 tiêu đề cột và các dòng khách hàng vào Google Sheet!")

    # 4. Format Header màu sắc thương hiệu Xoăn Media (#B8F23D & #1E293B)
    format_requests = [
        # Format Header row
        {
            'repeatCell': {
                'range': {
                    'sheetId': first_sheet_id,
                    'startRowIndex': 0,
                    'endRowIndex': 1,
                    'startColumnIndex': 0,
                    'endColumnIndex': len(headers)
                },
                'cell': {
                    'userEnteredFormat': {
                        'backgroundColor': {'red': 0.72, 'green': 0.95, 'blue': 0.24}, # Neon Lime #B8F23D
                        'textFormat': {'bold': True, 'foregroundColor': {'red': 0.0, 'green': 0.0, 'blue': 0.0}},
                        'horizontalAlignment': 'CENTER'
                    }
                },
                'fields': 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
        },
        # Freeze top row
        {
            'updateSheetProperties': {
                'properties': {
                    'sheetId': first_sheet_id,
                    'gridProperties': {'frozenRowCount': 1}
                },
                'fields': 'gridProperties.frozenRowCount'
            }
        }
    ]

    service.spreadsheets().batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={'requests': format_requests}
    ).execute()
    print("✅ Đã tạo giao diện đẹp mắt (Header xanh neon, cố định dòng 1) trên Google Sheet!")
    print(f"\n🎉 HOÀN TẤT 100%! Xem trang tính tại: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit")

if __name__ == '__main__':
    populate_sheet()
