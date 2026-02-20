from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models, database, auth, market_data, trading

from huggingface_hub import InferenceClient
import os

router = APIRouter(prefix="/chat", tags=["chat"])

# --- LLM Setup ---
HF_TOKEN = os.getenv("HF_TOKEN")
# Chat Model (Generative)
CHAT_MODEL_ID = "HuggingFaceH4/zephyr-7b-beta" 
# Sentiment Model (Classification)
SENTIMENT_MODEL_ID = "ProsusAI/finbert"

try:
    hf_client = InferenceClient(token=HF_TOKEN)
except Exception:
    hf_client = None

def get_sentiment(text: str):
    if not hf_client: return None
    try:
        # ProsusAI/finbert returns sentiment labels
        res = hf_client.text_classification(text, model=SENTIMENT_MODEL_ID)
        # Usually returns list of dicts, get the top one
        if isinstance(res, list) and len(res) > 0:
            top = max(res, key=lambda x: x.get('score', 0))
            return f"{top['label']} ({top['score']:.2f})"
        return str(res)
    except Exception as e:
        return f"Error: {e}"

class ChatRequest(BaseModel):
    message: str

@router.post("/")
def chat_with_bot(request: ChatRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if not hf_client:
        return {"response": "AI Offline: Please set HF_TOKEN environment variable."}

    # Context
    portfolio = trading.get_portfolio(current_user, db)
    holdings_txt = ", ".join([f"{h['symbol']}:{h['quantity']}" for h in portfolio['holdings']])
    
    messages = [
        {"role": "system", "content": f"You are a financial assistant. User Balance: ${portfolio['balance']:.2f}. Holdings: {holdings_txt}. Answer briefly."},
        {"role": "user", "content": request.message}
    ]

    try:
        # If user explicitly asks for sentiment or analysis, we can optionally use FinBERT
        extra_info = ""
        if "sentiment" in request.message.lower() or "analyze" in request.message.lower():
             s = get_sentiment(request.message)
             if s: extra_info = f"\n(Sentiment Analysis of your query: {s})"
        
        completion = hf_client.chat_completion(
            messages=messages,
            model=CHAT_MODEL_ID, 
            max_tokens=150,
            temperature=0.7
        )
        return {"response": completion.choices[0].message.content + extra_info}
    except Exception as e:
        return {"response": f"AI Error: {str(e)}"}
