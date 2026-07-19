import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
from train_model import train_recommendation_system

app = FastAPI(
    title="DP Laptop Advisor API", 
    description="Backend API for DP Laptop Advisor - AI-Powered Laptop Recommendation System",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev simplicity, allow all. Can restrict to http://localhost:5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    """
    On startup, verify if the model and preprocessed dataset exist.
    If not, trigger the pipeline automatically.
    """
    # Check paths based on current working directory context
    raw_path = "data/laptops_raw.csv"
    clean_path = "data/laptops_clean.csv"
    model_path = "models/recommendation_model.joblib"
    
    # If starting from root directory
    if not os.path.exists(raw_path):
        raw_path = "backend/data/laptops_raw.csv"
        clean_path = "backend/data/laptops_clean.csv"
        model_path = "backend/models/recommendation_model.joblib"
        
    if not os.path.exists(model_path):
        print(f"Serialized model cache {model_path} not found. Triggering automated build pipeline...")
        try:
            train_recommendation_system(raw_path, clean_path, model_path)
            print("Automated pipeline execution successful.")
        except Exception as e:
            print(f"CRITICAL: Failed to train model at startup: {e}")
    else:
        print(f"Model cache found at {model_path}. Server initialization complete.")

app.include_router(router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "DP Laptop Advisor API",
        "docs": "/docs"
    }
