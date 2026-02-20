from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
import auth, trading, recommendations, chatbot, market


# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Portfolio & Paper Trading API")

# CORS Setup
origins = [
    "http://localhost:5173", # Vite default
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Portfolio & Trading Backend"}

app.include_router(auth.router)
app.include_router(trading.router)
app.include_router(recommendations.router)
app.include_router(chatbot.router)
app.include_router(market.router)

