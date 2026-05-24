const http = require('http');
const url = require('url');
const axios = require('axios');
require('dotenv').config();

// 配置（必須設定環境變數）
const CLIENT_ID = process.env.NOTION_CLIENT_ID;
const CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Error: NOTION_CLIENT_ID and NOTION_CLIENT_SECRET environment variables are required');
  process.exit(1);
}
const REDIRECT_URI = 'https://notion-oauth-inventory.vercel.app/api/oauth/callback';

// 簡單的記憶體存儲（實際應該用資料庫）
let userTokens = {};

// 處理 OAuth callback
async function handleOAuthCallback(req, res, queryParams) {
  const code = queryParams.code;
  
  if (!code) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing authorization code' }));
    return;
  }

  try {
    // 交換 code 換 access token
    const response = await axios.post('https://api.notion.com/v1/oauth/token', {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    }, {
      auth: {
        username: CLIENT_ID,
        password: CLIENT_SECRET
      }
    });

    const { access_token, workspace_id, workspace_name, owner } = response.data;

    // 存儲 token
    const userId = owner.user.id;
    userTokens[userId] = {
      access_token,
      workspace_id,
      workspace_name,
      owner,
      created_at: new Date().toISOString()
    };

    // 返回成功頁面
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>授權成功</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #2d3748; margin: 0 0 10px 0; }
            p { color: #718096; margin: 10px 0; }
            .success { color: #22863a; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ 授權成功</h1>
            <p class="success">Notion 帳號已連接</p>
            <p>Workspace: <strong>${workspace_name}</strong></p>
            <p style="margin-top: 20px; font-size: 12px; color: #a0aec0;">User ID: ${userId}</p>
            <p style="font-size: 14px; margin-top: 30px;">你現在可以關閉此視窗，回到整理助手開始使用。</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth error:', error.response?.data || error.message);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Failed to exchange code for token',
      details: error.response?.data?.error_description || error.message
    }));
  }
}

// 獲取用戶 token
function getTokens(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ tokens: userTokens }));
}

// 主伺服器
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (pathname === '/api/oauth/callback') {
    handleOAuthCallback(req, res, query);
  } else if (pathname === '/api/oauth/tokens') {
    getTokens(req, res);
  } else if (pathname === '/api/oauth/authorize') {
    // 重定向到 Notion 授權頁面
    const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    res.writeHead(302, { Location: authUrl });
    res.end();
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>物品清單助手 - Notion OAuth</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); text-align: center; max-width: 400px; }
            h1 { color: #2d3748; margin: 0 0 10px 0; font-size: 28px; }
            p { color: #718096; margin: 15px 0; line-height: 1.6; }
            .button { display: inline-block; margin-top: 30px; padding: 12px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; transition: background 0.3s; border: none; cursor: pointer; font-size: 16px; }
            .button:hover { background: #5568d3; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>物品清單助手</h1>
            <p>連接你的 Notion 帳號，開始整理物品清單</p>
            <p style="font-size: 14px; color: #a0aec0;">一次授權，之後助手就能自動幫你管理物品資料</p>
            <a href="/api/oauth/authorize" class="button">授權 Notion 帳號</a>
          </div>
        </body>
      </html>
    `);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`OAuth server running on port ${PORT}`);
});
