#!/usr/bin/env python3
"""
Fix Notion database properties
"""
import requests
import json
import os

NOTION_TOKEN = os.getenv('NOTION_TOKEN', '')
DATABASE_ID = '71544d92-478c-445e-adf3-60bc65aaa405'
NOTION_API_URL = 'https://api.notion.com/v1'

headers = {
    'Authorization': f'Bearer {NOTION_TOKEN}',
    'Notion-Version': '2026-03-11',
    'Content-Type': 'application/json'
}

def update_property(property_name, new_config):
    """更新欄位配置"""
    url = f'{NOTION_API_URL}/databases/{DATABASE_ID}'
    
    data = {
        'properties': {
            property_name: new_config
        }
    }
    
    response = requests.patch(url, headers=headers, json=data)
    
    if response.status_code == 200:
        print(f"✅ {property_name} 更新成功")
        return True
    else:
        print(f"❌ {property_name} 失敗：{response.text}")
        return False

# 修改欄位類型
print("🔧 開始修改欄位類型...")

# 位置 -> multi_select
update_property('位置', {
    'multi_select': {
        'options': []
    }
})

# 分類 -> multi_select
update_property('分類', {
    'multi_select': {
        'options': []
    }
})

# 狀態 -> select
update_property('狀態', {
    'select': {
        'options': [
            {'name': '正常', 'color': 'green'},
            {'name': '損壞', 'color': 'red'},
            {'name': '遺失', 'color': 'gray'}
        ]
    }
})

print("✅ 欄位類型修改完成")
