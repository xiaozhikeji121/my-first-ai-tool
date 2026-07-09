const https = require('https');

module.exports = (req, res) => {
  // 1. 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. 手动读取 Body 数据 (这是解决 500 错误的关键！)
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      // 解析 JSON
      const { productName, features, language, tone } = JSON.parse(body);
      console.log('收到数据:', productName, features);

      const apiKey = 'sk-3db2f146a554483bade9ad51731209f9';

      const prompt = `Write a product description for "${productName}". Key features: ${features}. Language: ${language}. Tone: ${tone}.`;

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

      // 3. 发送请求给 DeepSeek
      const apiReq = https.request(options, (apiRes) => {
        let data = '';
        apiRes.on('data', (chunk) => data += chunk);
        apiRes.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (apiRes.statusCode !== 200) {
              return res.status(apiRes.statusCode).json({ error: 'API Error', details: parsed });
            }
            return res.status(200).json({ description: parsed.choices[0].message.content });
          } catch (e) {
            return res.status(500).json({ error: 'Parse Error', details: data });
          }
        });
      });

      apiReq.on('error', (error) => {
        return res.status(500).json({ error: 'Request Failed', details: error.message });
      });

      apiReq.write(postData);
      apiReq.end();

    } catch (error) {
      console.error('JSON 解析失败:', error);
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  });
};
