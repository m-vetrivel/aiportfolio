from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models, database, auth, market_data
from datetime import datetime

router = APIRouter(prefix="/trade", tags=["trade"])

class TradeRequest(BaseModel):
    symbol: str
    quantity: int
    action: str # "BUY" or "SELL"

@router.post("/")
def execute_trade(trade: TradeRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    symbol = trade.symbol.upper()
    current_price = market_data.get_current_price(symbol)
    
    if current_price is None:
        raise HTTPException(status_code=400, detail="Could not fetch current price for symbol")
    
    total_cost = current_price * trade.quantity

    if trade.action == "BUY":
        if current_user.balance < total_cost:
            raise HTTPException(status_code=400, detail="Insufficient funds")
        
        # Deduct balance
        current_user.balance -= total_cost
        
        # Update or Create Holding
        holding = db.query(models.Holding).filter(
            models.Holding.user_id == current_user.id,
            models.Holding.symbol == symbol
        ).first()

        if holding:
            # Calculate new weighted average price
            total_value_existing = holding.quantity * holding.avg_price
            holding.quantity += trade.quantity
            holding.avg_price = (total_value_existing + total_cost) / holding.quantity
        else:
            new_holding = models.Holding(
                user_id=current_user.id,
                symbol=symbol,
                quantity=trade.quantity,
                avg_price=current_price
            )
            db.add(new_holding)

    elif trade.action == "SELL":
        holding = db.query(models.Holding).filter(
            models.Holding.user_id == current_user.id,
            models.Holding.symbol == symbol
        ).first()

        if not holding or holding.quantity < trade.quantity:
            raise HTTPException(status_code=400, detail="Insufficient holdings")
        
        # Add balance
        current_user.balance += total_cost
        
        # Update Holding
        holding.quantity -= trade.quantity
        if holding.quantity == 0:
            db.delete(holding)
    
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    # Record Transaction
    transaction = models.Transaction(
        user_id=current_user.id,
        symbol=symbol,
        transaction_type=trade.action,
        quantity=trade.quantity,
        price=current_price,
        timestamp=datetime.utcnow()
    )
    db.add(transaction)
    
    db.commit()
    
    return {"message": "Trade executed successfully", "balance": current_user.balance}

@router.get("/portfolio")
def get_portfolio(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    holdings = db.query(models.Holding).filter(models.Holding.user_id == current_user.id).all()
    results = []
    total_value = 0
    
    for h in holdings:
        current_price = market_data.get_current_price(h.symbol) or h.avg_price
        market_value = current_price * h.quantity
        unrealized_pnl = market_value - (h.avg_price * h.quantity)
        pnl_percent = (unrealized_pnl / (h.avg_price * h.quantity)) * 100 if h.quantity > 0 else 0
        
        results.append({
            "symbol": h.symbol,
            "quantity": h.quantity,
            "avg_price": h.avg_price,
            "current_price": current_price,
            "market_value": market_value,
            "unrealized_pnl": unrealized_pnl,
            "pnl_percent": pnl_percent
        })
        total_value += market_value
        
    return {
        "balance": current_user.balance,
        "portfolio_value": total_value,
        "total_equity": current_user.balance + total_value,
        "holdings": results
    }
