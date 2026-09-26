const dashboardRepository = require('../repositories/dashboardRepository');
const stockLedgerRepository = require('../repositories/stockLedgerRepository');
const productRepository = require('../repositories/productRepository');
const { generateRestockSuggestions } = require('../utils/ai');
const prisma = require('../lib/prisma');

class DashboardService {
  async getKpis() {
    return dashboardRepository.getKpis();
  }

  async getChartData(days = 7) {
    return stockLedgerRepository.getMovementChartData(Number(days));
  }

  async getTopLowStock() {
    return dashboardRepository.getTopLowStock(5);
  }

  async getActivityFeed() {
    return dashboardRepository.getActivityFeed(10);
  }

  async getAiRestockSuggestions() {
    // 1. Get 30-day outbound consumption by product
    const consumption30Days = await stockLedgerRepository.get30DayConsumption();

    // 2. Get all products with current stock
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        uom: true,
      },
    });

    const productsWithMetrics = await Promise.all(
      products.map(async (p) => {
        const currentStock = await stockLedgerRepository.getCurrentStock(p.id);
        const consumedLast30Days = consumption30Days[p.id] || 0;
        const dailyBurnRate = consumedLast30Days / 30;

        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          uom: p.uom,
          currentStock,
          reorderLevel: p.reorderLevel,
          consumedLast30Days,
          dailyBurnRate,
        };
      })
    );

    return generateRestockSuggestions(productsWithMetrics);
  }
}

module.exports = new DashboardService();
