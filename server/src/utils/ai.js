const https = require('https');

/**
 * Intelligent restock suggestions based on stock ledger consumption
 */
const generateRestockSuggestions = async (productsWithMetrics) => {
  const claudeApiKey = process.env.CLAUDE_API_KEY;

  // Rule-based statistical forecast engine (always available and instant)
  const defaultSuggestions = productsWithMetrics.map((p) => {
    const dailyRate = p.dailyBurnRate || 0;
    const currentStock = p.currentStock || 0;
    const reorderLevel = p.reorderLevel || 10;
    const daysUntilStockout = dailyRate > 0 ? Math.max(0, Math.round(currentStock / dailyRate)) : currentStock > 0 ? 999 : 0;
    
    // Suggested replenishment quantity: cover 30 days of demand + buffer to reach at least reorder level * 2
    const targetStock = Math.max(reorderLevel * 2, dailyRate * 30);
    const suggestedReorder = Math.max(reorderLevel, Math.ceil(targetStock - currentStock));

    let urgency = 'NORMAL';
    if (currentStock <= 0) {
      urgency = 'CRITICAL';
    } else if (daysUntilStockout <= 7 || currentStock <= reorderLevel) {
      urgency = 'HIGH';
    } else if (daysUntilStockout <= 14) {
      urgency = 'MEDIUM';
    }

    let recommendation = '';
    if (currentStock <= 0) {
      recommendation = `CRITICAL: Out of stock! Average daily consumption is ${dailyRate.toFixed(1)} ${p.uom}. Immediate reorder of ${suggestedReorder} ${p.uom} advised to resume operations.`;
    } else if (dailyRate > 0) {
      recommendation = `~${dailyRate.toFixed(1)} ${p.uom}/day consumed. At ${currentStock} ${p.uom}, ~${daysUntilStockout} days of inventory left. Consider ordering ${suggestedReorder} ${p.uom}.`;
    } else {
      recommendation = `Stock level is ${currentStock} ${p.uom} (reorder point: ${reorderLevel}). Low turnover detected; maintain current level or order up to safety buffer of ${suggestedReorder} ${p.uom}.`;
    }

    return {
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      category: p.category?.name || 'General',
      uom: p.uom?.abbreviation || 'units',
      currentStock,
      reorderLevel,
      dailyBurnRate: parseFloat(dailyRate.toFixed(2)),
      daysUntilStockout,
      suggestedReorder,
      urgency,
      recommendation,
    };
  });

  // If Claude API key is provided, enrich suggestions using Anthropic's Claude API
  if (claudeApiKey && claudeApiKey.trim() !== '') {
    try {
      const prompt = `You are StockSense's AI Supply Chain Analyst. Based on the following 30-day inventory metrics, review each product and return a concise, high-impact tactical insight for the inventory manager:
${JSON.stringify(productsWithMetrics, null, 2)}

Respond with a JSON array of objects with keys: "productId" and "aiInsight" (one punchy actionable sentence under 25 words).`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.content?.[0]?.text;
        const parsed = JSON.parse(content.substring(content.indexOf('['), content.lastIndexOf(']') + 1));
        
        parsed.forEach((item) => {
          const found = defaultSuggestions.find((s) => s.productId === item.productId);
          if (found && item.aiInsight) {
            found.recommendation = item.aiInsight;
          }
        });
      }
    } catch (err) {
      console.warn('Claude API request failed, using built-in statistical engine:', err.message);
    }
  }

  // Sort by urgency: CRITICAL first, then HIGH, then MEDIUM, then NORMAL
  const urgencyWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, NORMAL: 1 };
  defaultSuggestions.sort((a, b) => urgencyWeight[b.urgency] - urgencyWeight[a.urgency]);

  return defaultSuggestions;
};

module.exports = { generateRestockSuggestions };
