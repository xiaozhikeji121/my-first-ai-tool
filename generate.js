// api/generate.js (极简测试版 - 先验证路由是否通)

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 直接返回测试数据，不调用任何外部 API
  return res.status(200).json({ 
    description: '✅ 测试成功！API 路由正常工作。DeepSeek 调用已暂时禁用。' 
  });
};
