import os
import json
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
]
TOKEN_FILE = '/Users/Admin/Documents/CRM Xoan/API/token.json'
SPREADSHEET_ID = '1gbo1qA04CLJdaEsmxqudzPYdrtoAyLdVSk4AoDmo3nU'
PHOTOS_FILE = '/Users/Admin/Documents/CRM Xoan/src/data/photographersData.json'

def sync_accounts():
    creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    service = build('sheets', 'v4', credentials=creds)

    print(f"📊 Đang kết nối tới Google Spreadsheet: {SPREADSHEET_ID}...")

    # 1. Kiểm tra các sheet hiện có
    metadata = service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
    sheets = metadata.get('sheets', [])
    target_sheet_title = "Tài Khoản Đăng Nhập CRM"
    existing_sheet_id = None

    for s in sheets:
        if s['properties']['title'] == target_sheet_title:
            existing_sheet_id = s['properties']['sheetId']
            break

    # Nếu chưa có thì tạo sheet mới
    if existing_sheet_id is None:
        add_sheet_request = {
            'requests': [
                {
                    'addSheet': {
                        'properties': {
                            'title': target_sheet_title,
                            'gridProperties': {
                                'frozenRowCount': 1
                            }
                        }
                    }
                }
            ]
        }
        res = service.spreadsheets().batchUpdate(
            spreadsheetId=SPREADSHEET_ID,
            body=add_sheet_request
        ).execute()
        existing_sheet_id = res['replies'][0]['addSheet']['properties']['sheetId']
        print(f"✅ Đã tạo sheet mới: '{target_sheet_title}' (ID: {existing_sheet_id})")
    else:
        print(f"ℹ️ Sheet '{target_sheet_title}' đã tồn tại (ID: {existing_sheet_id}). Sẽ làm mới dữ liệu.")

    # 2. Chuẩn bị dữ liệu tài khoản
    accounts = []
    stt = 1

    # A. Tài khoản ADMIN
    accounts.append([
        stt,
        'user-admin',
        'Tạ Duy (Admin)',
        'Admin (Toàn Quyền)',
        'Giám Đốc Quản Trị Hệ Thống',
        "'0981108601",
        'admin@xoanmedia.vn',
        'admin@xoanmedia.vn',
        'XoanAdmin@2026',
        'Hà Nội & Hải Phòng',
        '🟢 Đang hoạt động',
        'https://crm.xoanmedia.com/'
    ])
    stt += 1

    # B. Tài khoản SALES (4 nhân sự)
    sales_list = [
        {
            'id': 'user-2',
            'name': 'Lê Hoàng Sơn',
            'role_title': 'Trưởng Nhóm Sales Lead',
            'phone': '0912345678',
            'email': 'son.lh@xoanmedia.vn',
            'username': 'son.lh@xoanmedia.vn',
            'password': 'SonLead@2024',
            'regions': 'Hải Phòng, Hà Nội'
        },
        {
            'id': 'user-sales-1',
            'name': 'Nguyễn Thu Hương',
            'role_title': 'Chuyên viên Sales Tư Vấn',
            'phone': '0987654321',
            'email': 'huong.nt@xoanmedia.vn',
            'username': 'huong.nt@xoanmedia.vn',
            'password': 'HuongSales@2024',
            'regions': 'Hải Phòng, Hà Nội'
        },
        {
            'id': 'user-sales-2',
            'name': 'Trần Hải Đăng',
            'role_title': 'Chuyên viên Sales Tư Vấn',
            'phone': '0966554433',
            'email': 'dang.th@xoanmedia.vn',
            'username': 'dang.th@xoanmedia.vn',
            'password': 'DangSales@2024',
            'regions': 'Hải Phòng, Thái Bình, Nam Định'
        },
        {
            'id': 'user-sales-3',
            'name': 'Vũ Mai Phương',
            'role_title': 'Cộng Tác Viên (CTV) Sales',
            'phone': '0911223344',
            'email': 'phuong.vm@xoanmedia.vn',
            'username': 'phuong.vm@xoanmedia.vn',
            'password': 'PhuongCTV@2024',
            'regions': 'Hải Phòng'
        }
    ]

    for s in sales_list:
        accounts.append([
            stt,
            s['id'],
            s['name'],
            'Sales Tư Vấn',
            s['role_title'],
            f"'{s['phone']}",
            s['email'],
            s['username'],
            s['password'],
            s['regions'],
            '🟢 Đang hoạt động',
            'https://crm.xoanmedia.com/'
        ])
        stt += 1

    # C. Tài khoản THỢ CHỤP / PHOTOGRAPHER (38 nhân sự từ json)
    with open(PHOTOS_FILE, 'r', encoding='utf-8') as f:
        photos = json.load(f)

    for p in photos:
        phone_str = f"'{p.get('phone', '')}" if p.get('phone') else ''
        regions = ', '.join(p.get('activeRegions', []))
        role_desc = f"Thợ Ekip ({p.get('photographerType', 'Full-time')})"
        skills = ', '.join(p.get('skills', []))
        if skills:
            role_desc += f" - {skills}"

        accounts.append([
            stt,
            p.get('id', ''),
            p.get('fullName', ''),
            'Photographer (Thợ Chụp)',
            role_desc,
            phone_str,
            p.get('email', ''),
            p.get('username', p.get('email', '')),
            p.get('password', 'XoanPhoto@2026'),
            regions,
            '🟢 Sẵn sàng nhận ca' if p.get('status') == 'available' else p.get('status', 'available'),
            'https://crm.xoanmedia.com/'
        ])
        stt += 1

    headers = [
        'STT',
        'Mã Nhân Sự (ID)',
        'Họ Và Tên',
        'Phân Quyền Hệ Thống',
        'Vị Trí / Chức Danh',
        'Số Điện Thoại',
        'Email',
        'Tên Đăng Nhập (Username)',
        'Mật Khẩu Đăng Nhập',
        'Khu Vực Phụ Trách',
        'Trạng Thái',
        'Đường Link Đăng Nhập CRM'
    ]

    all_rows = [headers] + accounts

    # 3. Ghi dữ liệu vào sheet
    range_name = f"'{target_sheet_title}'!A1"
    
    # Xóa dữ liệu cũ trước
    service.spreadsheets().values().clear(
        spreadsheetId=SPREADSHEET_ID,
        range=f"'{target_sheet_title}'!A1:Z500"
    ).execute()

    body = {
        'values': all_rows
    }
    service.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=range_name,
        valueInputOption='USER_ENTERED',
        body=body
    ).execute()
    print(f"✅ Đã cập nhật thành công {len(accounts)} tài khoản vào sheet '{target_sheet_title}'!")

    # 4. Định dạng styling thương hiệu Xoăn Media (#B8F23D)
    format_requests = [
        # Đóng băng dòng 1
        {
            'updateSheetProperties': {
                'properties': {
                    'sheetId': existing_sheet_id,
                    'gridProperties': {
                        'frozenRowCount': 1
                    }
                },
                'fields': 'gridProperties.frozenRowCount'
            }
        },
        # Header Styling: Màu nền #B8F23D, chữ đậm, căn giữa
        {
            'repeatCell': {
                'range': {
                    'sheetId': existing_sheet_id,
                    'startRowIndex': 0,
                    'endRowIndex': 1,
                    'startColumnIndex': 0,
                    'endColumnIndex': len(headers)
                },
                'cell': {
                    'userEnteredFormat': {
                        'backgroundColor': {
                            'red': 184 / 255.0,
                            'green': 242 / 255.0,
                            'blue': 61 / 255.0
                        },
                        'textFormat': {
                            'bold': True,
                            'fontSize': 10,
                            'foregroundColor': { 'red': 0, 'green': 0, 'blue': 0 }
                        },
                        'horizontalAlignment': 'CENTER',
                        'verticalAlignment': 'MIDDLE'
                    }
                },
                'fields': 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
            }
        },
        # Định dạng cột Số Điện Thoại (cột F - index 5) và Mật khẩu (cột I - index 8)
        {
            'repeatCell': {
                'range': {
                    'sheetId': existing_sheet_id,
                    'startRowIndex': 1,
                    'endRowIndex': len(all_rows),
                    'startColumnIndex': 5,
                    'endColumnIndex': 6
                },
                'cell': {
                    'userEnteredFormat': {
                        'horizontalAlignment': 'CENTER',
                        'numberFormat': { 'type': 'TEXT' }
                    }
                },
                'fields': 'userEnteredFormat(horizontalAlignment,numberFormat)'
            }
        },
        # Căn giữa cột STT, Mã ID
        {
            'repeatCell': {
                'range': {
                    'sheetId': existing_sheet_id,
                    'startRowIndex': 1,
                    'endRowIndex': len(all_rows),
                    'startColumnIndex': 0,
                    'endColumnIndex': 2
                },
                'cell': {
                    'userEnteredFormat': {
                        'horizontalAlignment': 'CENTER'
                    }
                },
                'fields': 'userEnteredFormat(horizontalAlignment)'
            }
        },
        # Autofit chiều rộng các cột
        {
            'autoResizeDimensions': {
                'dimensions': {
                    'sheetId': existing_sheet_id,
                    'dimension': 'COLUMNS',
                    'startIndex': 0,
                    'endIndex': len(headers)
                }
            }
        }
    ]

    service.spreadsheets().batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={'requests': format_requests}
    ).execute()

    print("🎨 Đã áp dụng định dạng chuẩn thương hiệu Xoăn Media (#B8F23D) thành công!")
    print(f"🔗 Link Google Sheet: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit#gid={existing_sheet_id}")

if __name__ == '__main__':
    sync_accounts()
