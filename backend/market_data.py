import yfinance as yf
from datetime import datetime
import pytz

# In-memory cache
price_cache = {}

def get_market_status():
    """
    Checks if NYSE is open. 
    Simplification: Mon-Fri 9:30 AM - 4:00 PM ET, excluding holidays (not strictly handled here).
    """
    ny_tz = pytz.timezone('America/New_York')
    now = datetime.now(ny_tz)
    
    # Check Weekend
    if now.weekday() >= 5: # 5=Sat, 6=Sun
        return {"status": "CLOSED", "reason": "Weekend"}

    # Check Time
    start = now.replace(hour=9, minute=30, second=0, microsecond=0)
    end = now.replace(hour=16, minute=0, second=0, microsecond=0)
    
    if start <= now <= end:
         return {"status": "OPEN", "reason": "Market Open"}
    else:
         return {"status": "CLOSED", "reason": "After Hours"}

def fetch_price(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        # fast_info is reliable for real-time
        price = ticker.fast_info.last_price
        # Also get change % if possible, though fast_info might split it
        return price
    except Exception as e:
        print(f"Error fetching price for {symbol}: {e}")
        return None

def get_quote(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.fast_info
        return {
            "symbol": symbol.upper(),
            "price": info.last_price,
            "previous_close": info.previous_close,
            "change_percent": ((info.last_price - info.previous_close) / info.previous_close * 100) if info.previous_close else 0
        }
    except Exception:
        return None

def get_current_price(symbol: str):
    # Backward compatibility
    q = get_quote(symbol)
    return q['price'] if q else None

def get_stock_history(symbol: str, period="1mo"):
    # Existing implementation
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period)
        hist.reset_index(inplace=True)
        hist['Date'] = hist['Date'].dt.strftime('%Y-%m-%d')
        return hist.to_dict(orient="records")
    except Exception as e:
        print(f"Error fetching history for {symbol}: {e}")
        return []
