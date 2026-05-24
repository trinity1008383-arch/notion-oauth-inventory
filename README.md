# Notion OAuth Server for 物品清單

簡單的 OAuth server，用來連接 Notion 帳號到物品清單助手。

## 部署到 Vercel

### 1. 準備
- 確保有 Vercel 帳號（https://vercel.com）
- 有 GitHub 帳號（用來連接 Vercel）

### 2. 部署步驟

#### 方式 A：使用 Vercel CLI（推薦）
```bash
# 安裝 Vercel CLI
npm install -g vercel

# 進入專案目錄
cd notion-oauth-server

# 部署
vercel
```

部署時會問：
- Project name: `notion-oauth-inventory`
- Framework: `Other`
- 其他選項按 Enter 默認

#### 方式 B：使用 GitHub + Vercel
1. 推送到 GitHub：
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. 進 https://vercel.com/dashboard
3. 點「Add New...」> 「Project」
4. 選你的 GitHub repo
5. 部署

### 3. 設定環境變數
部署後，在 Vercel dashboard：
1. 進「Settings」> 「Environment Variables」
2. 新增：
   - `NOTION_CLIENT_ID`: （你的 Client ID）
   - `NOTION_CLIENT_SECRET`: （你的 Client Secret）

### 4. 完成
部署完成後會給你一個 URL，例如：
```
https://notion-oauth-inventory.vercel.app
```

## 本地測試
```bash
npm install
npm run dev
```

然後訪問 `http://localhost:3000`

## 使用流程
1. 用戶訪問 OAuth server 主頁
2. 點「授權 Notion 帳號」
3. 重定向到 Notion 授權頁面
4. 授權後回到成功頁面
5. Token 已存儲，可以開始使用

## API 端點
- `GET /` — 主頁
- `GET /api/oauth/authorize` — 開始 OAuth 流程
- `GET /api/oauth/callback` — OAuth callback（Notion 重定向）
- `GET /api/oauth/tokens` — 獲取所有存儲的 tokens（測試用）
