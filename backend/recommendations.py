from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import ai_engine

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

class PortfolioInput(BaseModel):
    holdings: List[Dict[str, Any]]

@router.get("/{symbol}")
def get_recommendation(symbol: str):
    try:
         # Basic sanitization
        rec = ai_engine.analyze_stock(symbol.upper())
        return rec
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/portfolio")
def analyze_portfolio(data: PortfolioInput):
    try:
        insight = ai_engine.analyze_portfolio(data.holdings)
        return {"insight": insight}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
