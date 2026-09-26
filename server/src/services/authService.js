const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { sendOtpEmail } = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_stocksense_production_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_refresh_jwt_key_stocksense_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

class AuthService {
  generateTokens(user) {
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
  }

  async signup({ name, email, password, role = 'STAFF' }) {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      const error = new Error('An account with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userRole = role.toUpperCase() === 'MANAGER' ? 'MANAGER' : 'STAFF';

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: userRole,
      },
    });

    const tokens = this.generateTokens(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.deletedAt) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const tokens = this.generateTokens(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      const error = new Error('Refresh token is required');
      error.statusCode = 400;
      throw error;
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.deletedAt || user.refreshToken !== refreshToken) {
      const error = new Error('Refresh token revoked or invalid');
      error.statusCode = 401;
      throw error;
    }

    const tokens = this.generateTokens(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return tokens;
  }

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Return success anyway to avoid user enumeration
      return { success: true, message: 'If an account exists, a 6-digit OTP code has been sent.' };
    }

    // Invalidate previous OTPs
    await prisma.otp.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otp.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    await sendOtpEmail(user.email, code);

    return {
      success: true,
      message: 'If an account exists, a 6-digit OTP code has been sent.',
    };
  }

  async verifyOtp({ email, code }) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      const error = new Error('Invalid or expired verification code');
      error.statusCode = 400;
      throw error;
    }

    const otp = await prisma.otp.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      const error = new Error('Invalid or expired verification code');
      error.statusCode = 400;
      throw error;
    }

    return { success: true, message: 'OTP verified successfully' };
  }

  async resetPassword({ email, code, newPassword }) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      const error = new Error('Invalid verification code or user');
      error.statusCode = 400;
      throw error;
    }

    const otp = await prisma.otp.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      const error = new Error('Invalid or expired verification code');
      error.statusCode = 400;
      throw error;
    }

    // Mark OTP as used
    await prisma.otp.update({
      where: { id: otp.id },
      data: { used: true },
    });

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        refreshToken: null, // logout of all sessions
      },
    });

    return { success: true, message: 'Password has been reset successfully. Please log in.' };
  }

  async logout(userId) {
    if (userId) {
      await prisma.user.update({
        where: { id: Number(userId) },
        data: { refreshToken: null },
      });
    }
    return { success: true, message: 'Logged out successfully' };
  }
}

module.exports = new AuthService();
