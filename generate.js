const https = require('https');

module.exports = async (req, res) => {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('=== 收到 AI 生成请求 ===');

  try {
    const { productName, features, language, tone } = req.body;
    console.log('请求参数:', { productName, features, language, tone });

    const apiKey = 'sk-3db2f146a554483bade9ad51731209f9';

    const prompt = `Write a product description for "${productName}". Key features: ${features}. Language: ${language}. Tone: ${tone}. Make it compelling for e-commerce.`;

    const postData = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a professional e-commerce copywriter.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    const options = {
      hostname: 'api.deepseek.com',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('正在请求 DeepSeek API...');

    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => data += chunk);
      apiRes.on('end', () => {
        console.log('DeepSeek 响应状态码:', apiRes.statusCode);
        try {
          const parsed = JSON.parse(data);
          if (apiRes.statusCode !== 200) {
            console.error('API 业务报错:', parsed);
            return res.status(apiRes.statusCode).json({ 
              error: 'API Error', 
              details: parsed 
            });
          }
          const description = parsed.choices[0].message.content;
          console.log('生成成功:', description.substring(0, 50));
          return res.status(200).json({ description });
        } catch (e) {
          console.error('JSON 解析失败:', data);
          return res.status(500).json({ error: 'Parse Error', details: data });
        }
      });
    });

    apiReq.on('error', (error) => {
      console.error('网络请求错误:', error.message);
      return res.status(500).json({ error: 'Request Failed', details: error.message });
    });

    apiReq.write(postData);
    apiReq.end();

  } catch (error) {
    console.error('服务器代码崩溃:', error.message, error.stack);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
};

