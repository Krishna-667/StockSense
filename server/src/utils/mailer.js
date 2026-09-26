const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

const sendOtpEmail = async (email, otpCode) => {
  const transporter = createTransporter();

  const message = {
    from: `"StockSense Security" <${process.env.SMTP_USER || 'no-reply@stocksense.com'}>`,
    to: email,
    subject: 'Your StockSense Verification Code',
    text: `Your password reset OTP code is: ${otpCode}. This code will expire in 10 minutes. If you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">StockSense Security</h2>
        <p style="color: #475569; font-size: 15px;">You requested a password reset for your StockSense account.</p>
        <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb;">${otpCode}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This code is valid for 10 minutes. If you did not initiate this request, no action is needed.</p>
      </div>
    `,
  };

  if (transporter) {
    try {
      await transporter.sendMail(message);
      console.log(`📧 OTP email sent via SMTP to: ${email}`);
      return true;
    } catch (err) {
      console.error('SMTP send failed, falling back to console log:', err.message);
    }
  }

  // Fallback to clear console notice in dev
  console.log('====================================================');
  console.log(`🔑 StockSense OTP for ${email}: [ ${otpCode} ]`);
  console.log('====================================================');
  return true;
};

module.exports = { sendOtpEmail };
