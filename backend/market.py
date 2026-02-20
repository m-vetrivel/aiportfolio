from fastapi import APIRouter, HTTPException
import market_data

router = APIRouter(prefix="/market", tags=["market"])

@router.get("/status")
def get_status():
    return market_data.get_market_status()

@router.get("/quote/{symbol}")
def get_quote(symbol: str):
    data = market_data.get_quote(symbol)
    if not data:
        raise HTTPException(status_code=404, detail="Symbol not found")
    return data
