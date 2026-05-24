const axios = require('axios');

const CLIENT_ID = process.env.NOTION_CLIENT_ID;
const CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://notion-oauth-f0543068.vercel.app/api/oauth/callback';

// 簡單的記憶體存儲（實際應該用資料庫）
let userTokens = {};

// 主頁 - 顯示授權按鈕
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { code, action } = req.query;

  // OAuth callback
  if (action === 'callback' && code) {
    try {
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

      const { access_token, workspace_id, workspace_name } = response.data;
      userTokens[workspace_id] = {
        access_token,
        workspace_name,
        created_at: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        message: `Successfully authorized Notion workspace: ${workspace_name}`,
        workspace_id,
        workspace_name
      });
    } catch (error) {
      console.error('OAuth error:', error.response?.data || error.message);
      res.status(400).json({
        error: 'Failed to authorize',
        details: error.response?.data || error.message
      });
    }
    return;
  }

  // 授權流程開始
  if (action === 'authorize') {
    const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    res.redirect(authUrl);
    return;
  }

  // 主頁
  if (!action) {
    res.status(200).json({
      message: 'Notion OAuth Server',
      endpoints: {
        authorize: '/api/oauth?action=authorize',
        callback: '/api/oauth?action=callback&code=...',
        tokens: '/api/oauth?action=tokens'
      }
    });
    return;
  }

  // 獲取已存儲的 tokens（測試用）
  if (action === 'tokens') {
    res.status(200).json({
      tokens: userTokens,
      count: Object.keys(userTokens).length
    });
    return;
  }

  res.status(404).json({ error: 'Not found' });
}
