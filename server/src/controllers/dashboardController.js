const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getKpis(req, res, next) {
    try {
      const kpis = await dashboardService.getKpis();
      res.json({ success: true, kpis });
    } catch (error) {
      next(error);
    }
  }

  async getChart(req, res, next) {
    try {
      const days = req.query.days || 7;
      const chart = await dashboardService.getChartData(days);
      res.json({ success: true, chart });
    } catch (error) {
      next(error);
    }
  }

  async getLowStock(req, res, next) {
    try {
      const lowStock = await dashboardService.getTopLowStock();
      res.json({ success: true, lowStock });
    } catch (error) {
      next(error);
    }
  }

  async getActivity(req, res, next) {
    try {
      const activity = await dashboardService.getActivityFeed();
      res.json({ success: true, activity });
    } catch (error) {
      next(error);
    }
  }

  async getAiSuggestions(req, res, next) {
    try {
      const suggestions = await dashboardService.getAiRestockSuggestions();
      res.json({ success: true, suggestions });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
