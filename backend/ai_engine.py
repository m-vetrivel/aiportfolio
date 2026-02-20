import market_data
import pandas as pd
import ta
from pydantic import BaseModel
from typing import List, Dict

class Recommendation(BaseModel):
    symbol: str
    signal: str # BUY, SELL, HOLD
    confidence: float
    reasoning: str

def analyze_stock(symbol: str) -> Recommendation:
    # Fetch data (use 6 months to get enough data for indicators)
    history = market_data.get_stock_history(symbol, period="6mo")
    if not history or len(history) < 30:
        return Recommendation(symbol=symbol, signal="HOLD", confidence=0.0, reasoning="Insufficient data")
    
    df = pd.DataFrame(history)
    
    # Calculate Indicators
    # RSI
    df['rsi'] = ta.momentum.rsi(df['Close'], window=14)
    # MACD
    macd = ta.trend.MACD(df['Close'])
    df['macd'] = macd.macd()
    df['macd_signal'] = macd.macd_signal()
    # SMA
    df['sma_50'] = ta.trend.sma_indicator(df['Close'], window=50)
    df['sma_200'] = ta.trend.sma_indicator(df['Close'], window=200)

    last_row = df.iloc[-1]
    
    score = 0
    reasons = []

    # RSI Logic
    if last_row['rsi'] < 30:
        score += 1
        reasons.append(f"RSI is oversold ({last_row['rsi']:.2f}).")
    elif last_row['rsi'] > 70:
        score -= 1
        reasons.append(f"RSI is overbought ({last_row['rsi']:.2f}).")
    else:
        reasons.append(f"RSI is neutral ({last_row['rsi']:.2f}).")

    # MACD Logic
    if last_row['macd'] > last_row['macd_signal']:
        score += 1
        reasons.append("MACD is above signal line (Bullish).")
    else:
        score -= 1
        reasons.append("MACD is below signal line (Bearish).")

    # Trend Logic
    if last_row['Close'] > last_row['sma_50']:
        score += 0.5
        reasons.append("Price is above 50-day SMA.")
    else:
        score -= 0.5
        reasons.append("Price is below 50-day SMA.")

    # Determine Signal
    if score >= 1.5:
        signal = "BUY"
    elif score <= -1.5:
        signal = "SELL"
    else:
        signal = "HOLD"

    return Recommendation(
        symbol=symbol,
        signal=signal,
        confidence=min(abs(score) / 2.5 * 100, 100), # Simple confidence normalization
        reasoning=" ".join(reasons)
    )

def analyze_portfolio(holdings: List[Dict]) -> str:
    """
    Analyzes a list of holdings (symbol, market_value, etc.) and returns specific advice.
    Holdings structure expected: [{'symbol': 'AAPL', 'market_value': 5000}, ...]
    """
    if not holdings:
        return "Your portfolio is empty. Consider adding Safe Haven assets like Gold or Blue Chip stocks to start."
    
    total_value = sum(h.get('market_value', 0) for h in holdings)
    if total_value == 0:
         return "Your portfolio has no value yet."

    # Concentration Risk
    max_holding = max(holdings, key=lambda x: x.get('market_value', 0))
    max_percent = (max_holding.get('market_value', 0) / total_value) * 100
    
    insights = []
    
    if max_percent > 40:
        insights.append(f"High concentration risk in {max_holding['symbol']} ({max_percent:.0f}% of portfolio). Consider diversifying.")
    
    # Mock Sector Analysis (Simple mapping for demo)
    tech_stocks = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META', 'TSLA', 'AMD']
    tech_value = sum(h.get('market_value', 0) for h in holdings if h['symbol'] in tech_stocks)
    tech_percent = (tech_value / total_value) * 100
    
    if tech_percent > 50:
         insights.append(f"Heavy Tech exposure ({tech_percent:.0f}%). Add defensive sectors like Utilities or Consumer Staples to hedge volatility.")
    elif tech_percent < 10:
         insights.append("Low Tech exposure. Consider adding growth stocks for better long-term returns.")

    if not insights:
        insights.append("Your portfolio looks balanced. Continue monitoring individual stock performance.")

    return " ".join(insights)
