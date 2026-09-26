const authService = require('../services/authService');

class AuthController {
  async signup(req, res, next) {
    try {
      const result = await authService.signup(req.body);
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const result = await authService.refresh(req.body.refreshToken);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req, res, next) {
    try {
      const result = await authService.verifyOtp(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const result = await authService.resetPassword(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const result = await authService.logout(req.user?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      res.json({ success: true, user: req.user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
