const axios = require('axios');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = '71544d92-478c-445e-adf3-60bc65aaa405';
const NOTION_API_URL = 'https://api.notion.com/v1';

const headers = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Notion-Version': '2026-03-11',
  'Content-Type': 'application/json'
};

async function addItem(name, location = '', category = '', status = '', quantity = 1, notes = '') {
  try {
    const data = {
      parent: {
        database_id: DATABASE_ID
      },
      properties: {
        '名稱': {
          rich_text: [
            {
              text: {
                content: name
              }
            }
          ]
        }
      }
    };

    if (location) {
      data.properties['位置'] = {
        multi_select: [{ name: location }]
      };
    }

    if (category) {
      data.properties['分類'] = {
        multi_select: [{ name: category }]
      };
    }

    if (status) {
      data.properties['狀態'] = {
        select: { name: status }
      };
    }

    if (quantity) {
      data.properties['數量'] = {
        number: quantity
      };
    }

    if (notes) {
      data.properties['備註'] = {
        rich_text: [{ text: { content: notes } }]
      };
    }

    const response = await axios.post(`${NOTION_API_URL}/pages`, data, { headers });

    return {
      success: true,
      name: name,
      message: `✅ 已新增：${name}`
    };
  } catch (error) {
    return {
      success: false,
      name: name,
      message: `❌ ${name} 失敗：${error.response?.data?.message || error.message}`
    };
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // 返回 HTML 界面
    const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>物品清單 - 批量新增</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f3f1ed;
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #faf9f7;
      border-radius: 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      padding: 40px;
    }
    h1 {
      color: #3a3a3a;
      margin-bottom: 8px;
      font-size: 24px;
      font-weight: 400;
      letter-spacing: 0.5px;
    }
    .subtitle {
      color: #7a7a7a;
      margin-bottom: 32px;
      font-size: 13px;
      font-weight: 300;
    }
    .form-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
      padding: 24px;
      background: #f7f5f2;
      border-radius: 0;
      border: 1px solid #e8e5e0;
    }
    label {
      display: block;
      font-weight: 500;
      margin-bottom: 8px;
      color: #000;
      font-size: 12px;
      letter-spacing: 0.3px;
    }
    input, select, textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d0d0d0;
      border-radius: 0;
      font-size: 13px;
      font-family: inherit;
      background: white;
      transition: border-color 0.2s;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #000;
    }
    textarea {
      grid-column: 1 / -1;
      resize: vertical;
      min-height: 80px;
    }
    .button-group {
      display: flex;
      gap: 12px;
      grid-column: 1 / -1;
      margin-top: 12px;
    }
    button {
      padding: 10px 20px;
      border: 1px solid #000;
      border-radius: 0;
      font-weight: 500;
      cursor: pointer;
      font-size: 13px;
      background: white;
      color: #000;
      transition: all 0.2s;
      letter-spacing: 0.3px;
    }
    .btn-add {
      flex: 1;
      background: #000;
      color: white;
      border-color: #000;
    }
    .btn-add:hover {
      background: #333;
      border-color: #333;
    }
    .btn-clear {
      flex: 0.5;
      background: white;
      border-color: #d0d0d0;
      color: #666;
    }
    .btn-clear:hover {
      background: #f5f5f5;
      border-color: #000;
    }
    .items-list {
      margin-top: 32px;
    }
    .item-row {
      display: grid;
      grid-template-columns: 1fr 150px 150px 100px;
      gap: 12px;
      padding: 16px;
      background: #fafafa;
      border: 1px solid #e0e0e0;
      margin-bottom: 8px;
      align-items: center;
      font-size: 13px;
    }
    .item-name {
      font-weight: 500;
      color: #000;
    }
    .btn-remove {
      background: white;
      color: #666;
      padding: 6px 12px;
      border: 1px solid #d0d0d0;
      border-radius: 0;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }
    .btn-remove:hover {
      border-color: #000;
      color: #000;
    }
    .submit-btn {
      width: 100%;
      padding: 12px;
      background: #000;
      color: white;
      border: 1px solid #000;
      border-radius: 0;
      font-weight: 500;
      cursor: pointer;
      font-size: 13px;
      margin-top: 24px;
      transition: all 0.2s;
      letter-spacing: 0.3px;
    }
    .submit-btn:hover {
      background: #333;
    }
    .submit-btn:disabled {
      background: #d0d0d0;
      border-color: #d0d0d0;
      cursor: not-allowed;
    }
    .results {
      margin-top: 32px;
      padding: 24px;
      background: #fafafa;
      border: 1px solid #e0e0e0;
      display: none;
    }
    .results.show {
      display: block;
    }
    .result-item {
      padding: 12px;
      margin-bottom: 8px;
      border-radius: 0;
      font-size: 13px;
      border-left: 3px solid #000;
    }
    .result-success {
      background: #f0f0f0;
      color: #000;
      border-left-color: #000;
    }
    .result-error {
      background: #fff0f0;
      color: #000;
      border-left-color: #d0d0d0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📋 物品清單 - 批量新增</h1>
    <p class="subtitle">一次輸入多件物品，自動新增到 Notion</p>

    <form id="itemForm">
      <div class="form-group">
        <div>
          <label>物品名稱 *</label>
          <input type="text" id="itemName" placeholder="例：郵票、手機、書" required>
        </div>
        <div>
          <label>位置</label>
          <select id="location">
            <option value="房間" selected>房間</option>
            <option value="工作室">工作室</option>
          </select>
        </div>
        <div>
          <label>分類</label>
          <input type="text" id="category" placeholder="例：郵票、電子產品">
        </div>
        <div>
          <label>狀態</label>
          <select id="status">
            <option value="留下" selected>留下</option>
            <option value="評估">評估</option>
            <option value="待出售">待出售</option>
            <option value="進垃圾桶">進垃圾桶</option>
          </select>
        </div>
        <div>
          <label>數量</label>
          <input type="number" id="quantity" value="1" min="1">
        </div>
        <div style="grid-column: 1 / -1;">
          <label>備註</label>
          <textarea id="notes" placeholder="備註..."></textarea>
        </div>
        <div class="button-group">
          <button type="button" class="btn-add" onclick="addItem()">➕ 加入清單</button>
          <button type="button" class="btn-clear" onclick="clearForm()">🗑️ 清除</button>
        </div>
      </div>
    </form>

    <div class="items-list">
      <h3 style="color: #3a3a3a; margin-bottom: 15px;" id="itemsTitle" style="display: none;">📝 待新增項目</h3>
      <div id="itemsList"></div>
    </div>

    <button class="submit-btn" id="submitBtn" onclick="submitAll()" disabled>🚀 批量新增到 Notion</button>

    <div class="results" id="results">
      <h3 style="color: #3a3a3a; margin-bottom: 15px;">✨ 新增結果</h3>
      <div id="resultsList"></div>
    </div>
  </div>

  <script>
    let items = [];

    function addItem() {
      const name = document.getElementById('itemName').value.trim();
      if (!name) {
        alert('請輸入物品名稱');
        return;
      }

      const item = {
        id: Date.now(),
        name: name,
        location: document.getElementById('location').value.trim(),
        category: document.getElementById('category').value.trim(),
        status: document.getElementById('status').value,
        quantity: parseInt(document.getElementById('quantity').value) || 1,
        notes: document.getElementById('notes').value.trim()
      };

      items.push(item);
      renderItems();
      clearForm();
    }

    function removeItem(id) {
      items = items.filter(item => item.id !== id);
      renderItems();
    }

    function renderItems() {
      const listDiv = document.getElementById('itemsList');
      const title = document.getElementById('itemsTitle');
      
      if (items.length === 0) {
        listDiv.innerHTML = '';
        title.style.display = 'none';
        document.getElementById('submitBtn').disabled = true;
        return;
      }

      title.style.display = 'block';
      document.getElementById('submitBtn').disabled = false;
      
      listDiv.innerHTML = items.map(item => \`
        <div class="item-row">
          <div>
            <div class="item-name">\${item.name}</div>
            <div style="color: #999; font-size: 12px;">\${item.location || '無位置'} | \${item.category || '無分類'}</div>
          </div>
          <div style="color: #666;">數量: \${item.quantity}</div>
          <div style="color: #666;">\${item.status || '未設定'}</div>
          <button type="button" class="btn-remove" onclick="removeItem(\${item.id})">❌ 移除</button>
        </div>
      \`).join('');
    }

    function clearForm() {
      document.getElementById('itemForm').reset();
      document.getElementById('quantity').value = '1';
    }

    async function submitAll() {
      const btn = document.getElementById('submitBtn');
      btn.disabled = true;
      btn.textContent = '⏳ 新增中...';

      const results = [];
      
      for (const item of items) {
        const response = await fetch('/api/bulk_add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });

        const result = await response.json();
        results.push(result);
      }

      renderResults(results);
      items = [];
      renderItems();
      btn.disabled = false;
      btn.textContent = '🚀 批量新增到 Notion';
    }

    function renderResults(results) {
      const resultsDiv = document.getElementById('results');
      const resultsList = document.getElementById('resultsList');

      resultsList.innerHTML = results.map(result => \`
        <div class="result-item \${result.success ? 'result-success' : 'result-error'}">
          \${result.success ? '✅' : '❌'} \${result.message}
        </div>
      \`).join('');

      resultsDiv.classList.add('show');
    }
  </script>
</body>
</html>
    `;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } else if (req.method === 'POST') {
    // 接收批量新增請求
    const { name, location, category, status, quantity, notes } = req.body;
    
    addItem(name, location, category, status, quantity, notes).then(result => {
      res.status(200).json(result);
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
