module.exports = async (req, res) => {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.error('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Serverless Function Started.');
    const { prompt } = req.body;
    console.log('Received prompt:', prompt ? prompt.substring(0, 100) + '...' : 'No prompt');

    const apiKey = 'sk-3db2f146a554483bade9ad51731209f9'; 
    // const apiKey = process.env.DEEPSEEK_API_KEY; // Uncomment this line and remove the above line when using environment variable

    if (!apiKey) {
      console.error('DeepSeek API Key is missing.');
      return res.status(500).json({ error: 'DeepSeek API Key is missing. Please configure it in environment variables.' });
    }
    console.log('API Key available.');

    const requestBody = {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    };
    console.log('DeepSeek Request Body prepared.');

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    };
    console.log('Fetch options prepared. Attempting to fetch DeepSeek API...');

    const response = await fetch('https://api.deepseek.com/chat/completions', fetchOptions);
    console.log('DeepSeek API Fetch response received.');

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DeepSeek API Error (response not ok):', response.status, errorData);
      return res.status(response.status).json({ error: errorData.message || `DeepSeek API Error: ${response.status}` });
    }

    const data = await response.json();
    console.log('DeepSeek API Response data parsed successfully.');
    return res.status(200).json(data);

  } catch (error) {
    console.error('Serverless Function caught an unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error during DeepSeek API call. Check server logs for details.' });
  }
};