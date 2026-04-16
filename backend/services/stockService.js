// services/stockService.js
// Yahoo Finance via allorigins proxy (no API key needed)

const fetchStockPrice = async (symbol) => {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxy);
    const data = await res.json();
    const parsed = JSON.parse(data.contents);
    const result = parsed?.chart?.result?.[0];
    if (!result) return null;
    const meta = result.meta;
    const closes = result.indicators?.quote?.[0]?.close || [];
    const timestamps = result.timestamp || [];
    const history = closes.map((c, i) => ({
      date: new Date(timestamps[i] * 1000).toLocaleDateString("en-IN"),
      price: parseFloat(c?.toFixed(2) || 0)
    })).filter(h => h.price > 0);
    return {
      symbol: meta.symbol,
      currentPrice: meta.regularMarketPrice,
      previousClose: meta.previousClose || meta.chartPreviousClose,
      change: parseFloat((meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose)).toFixed(2)),
      changePct: parseFloat((((meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose)) / (meta.previousClose || meta.chartPreviousClose)) * 100).toFixed(2)),
      currency: meta.currency,
      history
    };
  } catch (e) {
    return null;
  }
};

// Symbol mapping: our DB symbol → Yahoo Finance symbol
const SYMBOL_MAP = {
  "BTC": "BTC-USD",
  "ETH": "ETH-USD",
  "RELIANCE": "RELIANCE.NS",
  "TCS": "TCS.NS",
  "INFY": "INFY.NS",
  "HDFCBANK": "HDFCBANK.NS",
  "WIPRO": "WIPRO.NS",
  "SBIN": "SBIN.NS",
  "TATAMOTORS": "TATAMOTORS.NS",
  "ADANIENT": "ADANIENT.NS",
  "NIFTY50": "^NSEI",
  "SENSEX": "^BSESN",
  "GOLD": "GC=F",
  "SILVER": "SI=F",
  "EURUSD": "EURUSD=X",
  "USDINR": "USDINR=X",
};

const getYahooSymbol = (symbol) => SYMBOL_MAP[symbol.toUpperCase()] || symbol;

module.exports = { fetchStockPrice, getYahooSymbol };
