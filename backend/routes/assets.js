const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authMiddleware } = require("../middleware/auth");
const https = require("https");

// Simple HTTPS fetch helper (no external deps needed)
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 6000, headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error("JSON parse error")); }
      });
    }).on("error", reject).on("timeout", () => reject(new Error("Timeout")));
  });
}

const SYMBOL_MAP = {
  "BTC": "BTC-USD", "ETH": "ETH-USD", "SOL": "SOL-USD",
  "RELIANCE": "RELIANCE.NS", "TCS": "TCS.NS", "INFY": "INFY.NS",
  "HDFCBANK": "HDFCBANK.NS", "WIPRO": "WIPRO.NS", "SBIN": "SBIN.NS",
  "TATAMOTORS": "TATAMOTORS.NS", "ADANIENT": "ADANIENT.NS",
  "GOLD": "GC=F", "SILVER": "SI=F", "EURUSD": "EURUSD=X",
};

async function getLivePrice(symbol) {
  try {
    const ySym = SYMBOL_MAP[symbol.toUpperCase()] || symbol;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ySym}?interval=1d&range=5d`;
    const data = await httpsGet(url);
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;
    const price = parseFloat(meta.regularMarketPrice.toFixed(2));
    const prev = meta.previousClose || meta.chartPreviousClose || price;
    return {
      price,
      prev_close: prev,
      change: parseFloat((price - prev).toFixed(2)),
      change_pct: parseFloat(((price - prev) / prev * 100).toFixed(2)),
    };
  } catch { return null; }
}

// GET /api/assets
router.get("/", authMiddleware, async (req, res) => {
  try {
    const [assets] = await pool.query("SELECT * FROM assets ORDER BY asset_type, symbol");
    // Fetch live prices in parallel
    const results = await Promise.allSettled(assets.map(a => getLivePrice(a.symbol)));
    const updated = assets.map((a, i) => {
      const live = results[i].status === "fulfilled" ? results[i].value : null;
      if (live) {
        // Update DB in background (don't await)
        pool.query("UPDATE assets SET current_price=? WHERE id=?", [live.price, a.id]).catch(() => {});
        return { ...a, current_price: live.price, prev_close: live.prev_close, change: live.change, change_pct: live.change_pct, live: true };
      }
      return { ...a, change: 0, change_pct: 0, live: false };
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/assets/:symbol/history
router.get("/:symbol/history", authMiddleware, async (req, res) => {
  try {
    const { range = "1mo" } = req.query;
    const ySym = SYMBOL_MAP[req.params.symbol.toUpperCase()] || req.params.symbol;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ySym}?interval=1d&range=${range}`;
    const data = await httpsGet(url);
    const result = data?.chart?.result?.[0];
    if (!result) return res.json({ history: [] });
    const closes = result.indicators?.quote?.[0]?.close || [];
    const timestamps = result.timestamp || [];
    const history = closes
      .map((c, i) => ({ date: new Date(timestamps[i] * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), price: parseFloat((c || 0).toFixed(2)) }))
      .filter(h => h.price > 0);
    const meta = result.meta;
    res.json({ symbol: meta.symbol, currentPrice: meta.regularMarketPrice, previousClose: meta.previousClose || meta.chartPreviousClose, currency: meta.currency, history });
  } catch (err) {
    res.status(500).json({ message: err.message, history: [] });
  }
});

module.exports = router;
