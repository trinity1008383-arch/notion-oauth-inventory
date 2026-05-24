export default async function handler(req, res) {
  res.status(200).json({
    message: 'Notion OAuth Server is running',
    endpoints: {
      authorize: '/api/oauth?action=authorize',
      callback: '/api/oauth?action=callback',
      tokens: '/api/oauth?action=tokens'
    }
  });
}
