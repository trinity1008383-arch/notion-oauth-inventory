#!/usr/bin/env python3
"""
Script to add items to Notion database
"""
import requests
import os
from datetime import datetime

# 設定
NOTION_TOKEN = os.getenv('NOTION_TOKEN', '')
DATABASE_ID = '71544d92-478c-445e-adf3-60bc65aaa405'
NOTION_API_URL = 'https://api.notion.com/v1'

headers = {
    'Authorization': f'Bearer {NOTION_TOKEN}',
    'Notion-Version': '2026-03-11',
    'Content-Type': 'application/json'
}

def get_next_number(database_id):
    """取得下一個編號"""
    url = f'{NOTION_API_URL}/databases/{database_id}/query'
    
    response = requests.post(url, headers=headers, json={})
    
    if response.status_code == 200:
        results = response.json().get('results', [])
        if results:
            # 假設最後一筆的編號是最大的
            last_item = results[-1]
            try:
                last_number = int(last_item['properties']['編號']['title'][0]['text']['content'].split('-')[1])
                return f'M-{str(last_number + 1).zfill(5)}'
            except:
                return 'M-00001'
        return 'M-00001'
    return 'M-00001'

def add_item(name, location='', category='', status='', quantity=1, notes=''):
    """新增物品到 Notion"""

    url = f'{NOTION_API_URL}/pages'

    data = {
        'parent': {
            'database_id': DATABASE_ID
        },
        'properties': {
            '名稱': {
                'rich_text': [
                    {
                        'text': {
                            'content': name
                        }
                    }
                ]
            }
        }
    }

    # 選擇性欄位
    if location:
        data['properties']['位置'] = {
            'multi_select': [{'name': location}]
        }

    if category:
        data['properties']['分類'] = {
            'multi_select': [{'name': category}]
        }

    if status:
        data['properties']['狀態'] = {
            'select': {'name': status}
        }

    if quantity:
        data['properties']['數量'] = {
            'number': quantity
        }

    if notes:
        data['properties']['備註'] = {
            'rich_text': [{'text': {'content': notes}}]
        }
    
    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        return {
            'success': True,
            'name': name,
            'message': f'✅ 已新增：{name}'
        }
    else:
        return {
            'success': False,
            'message': f'❌ 失敗：{response.text}'
        }

# 新增郵票
if __name__ == '__main__':
    result = add_item(
        name='郵票',
        location='房間/櫃/多利箱子01',
        category='郵票',
        status='留下',
        quantity=5,
        notes='一般郵票'
    )
    print(result['message'])
