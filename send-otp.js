const { Resend } = require('resend');
 
// 初始化 Resend 
const resend = new Resend(process.env.RESEND_API_KEY);
 
// 允许跨域（根据你的前端域名修改，或者开发时用 *） 
const allowedOrigins = ['`https://my-first-ai-tool-001.vercel.app`', 'http://localhost:3000', 'http://localhost:5500'];
 
module.exports = async (req, res) => {
  // 1. 设置 CORS 
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
 
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  // 2. 检查环境变量 
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set in Vercel environment variables!');
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }
 
  try {
    const { email, otp } = req.body;
 
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }
 
    // 3. 发送邮件 
    const data = await resend.emails.send({
      from: 'Describely AI <onboarding@resend.dev>', // 沙盒模式必须用这个发件人 
      to: [email], // 沙盒模式下，这个邮箱必须在 Resend 后台验证过！ 
      subject: 'Your Describely AI Verification Code',
      html: ` 
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #333;">Describely AI Verification</h2>
          <p>Hello,</p>
          <p>Your verification code is:</p>
          <h1 style="color: #6366f1; letter-spacing: 5px; text-align: center; background: #f3f4f6; padding: 20px; border-radius: 8px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <br>
          <p>Best regards,<br>The Describely AI Team</p>
        </div>
      `, 
    });
 
    return res.status(200).json({ success: true, message: 'Email sent successfully', data });
 
  } catch (error) {
    console.error('Resend API Error:', error);
    // 将 Resend 的具体错误返回给前端，方便排查 
    return res.status(500).json({  
      error: 'Failed to send email',  
      details: error.message || 'Unknown error'  
    }); 
  }
};