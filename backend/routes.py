import os
import json
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from backend import dataset

router = APIRouter()

# --- PYDANTIC SCHEMAS ---

class RecommendPreferences(BaseModel):
    budget: float
    purpose: str
    brand: str = "Any"
    processor_brand: str = "Any"
    min_ram: int = 8
    min_storage: int = 256
    gpu_req: str = "Any"
    battery_importance: str = "Medium"
    display_size: str = "Any"
    display_type: str = "Any"
    performance_priority: float = 0.5

class CompareRequest(BaseModel):
    id1: int
    id2: int

class FavoriteRequest(BaseModel):
    laptop_id: int

# --- FILE PATHS FOR BACKEND STORAGE ---
FAVORITES_FILE = "backend/data/favorites.json"
HISTORY_FILE = "backend/data/history.json"

def load_json_file(file_path, default_val):
    if not os.path.exists(file_path):
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            json.dump(default_val, f)
        return default_val
    try:
        with open(file_path, "r") as f:
            return json.load(f)
    except Exception:
        return default_val

def save_json_file(file_path, data):
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            json.dump(data, f)
    except Exception as e:
        print(f"Error saving file {file_path}: {e}")

# --- API ENDPOINTS ---

@router.get("/laptops")
def get_laptops(
    page: int = 1,
    limit: int = 12,
    q: Optional[str] = None,
    brand: Optional[str] = None,
    processor_brand: Optional[str] = None,
    gpu_brand: Optional[str] = None,
    display_type: Optional[str] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    min_ram: Optional[int] = None,
    min_storage: Optional[int] = None,
    purpose: Optional[str] = None
):
    """
    Search, filter, and paginate laptops in the cleaned database.
    """
    filters = {
        "brand": brand,
        "processor_brand": processor_brand,
        "gpu_brand": gpu_brand,
        "display_type": display_type,
        "price_min": price_min,
        "price_max": price_max,
        "min_ram": min_ram,
        "min_storage": min_storage,
        "purpose": purpose
    }
    # Clean filters with None values
    filters = {k: v for k, v in filters.items() if v is not None}
    
    try:
        results = dataset.search_laptops(query=q, filters=filters, page=page, limit=limit)
        
        # Inject metadata helper lists (distinct brands, proc brands etc.) for UI dropdowns
        eng = dataset.get_engine()
        results["meta"] = {
            "brands": eng.get_brands(),
            "processor_brands": eng.get_processor_brands(),
            "display_types": ["LED", "LCD"],
            "purposes": ["Programming", "AI Development", "Gaming", "Video Editing", "Student", "Office"],
            "min_price": float(eng.df["Price"].min()) if eng.df is not None else 7990,
            "max_price": float(eng.df["Price"].max()) if eng.df is not None else 503890
        }
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving laptops: {str(e)}")

@router.post("/recommend")
def recommend_laptops(preferences: RecommendPreferences):
    """
    Compute cosine similarity + weighted matching scores and return top 5 laptops.
    """
    try:
        eng = dataset.get_engine()
        recs = eng.recommend(preferences.dict())
        
        # Save run in history
        history = load_json_file(HISTORY_FILE, [])
        history.insert(0, {
            "preferences": preferences.dict(),
            "results": [{"id": r["id"], "Name": r["Name"], "Price": r["Price"], "Match_Percentage": r["Match_Percentage"]} for r in recs[:3]]
        })
        # Limit history to 20 runs
        save_json_file(HISTORY_FILE, history[:20])
        
        return recs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation engine error: {str(e)}")

@router.get("/laptop/{laptop_id}")
def get_laptop(laptop_id: int):
    """
    Get full specs and engineered scores for a single laptop.
    """
    eng = dataset.get_engine()
    details = eng.get_laptop_by_id(laptop_id)
    if not details:
        raise HTTPException(status_code=404, detail="Laptop not found")
    return details

@router.post("/compare")
def compare_laptops(request: CompareRequest):
    """
    Perform a side-by-side spec comparison between two laptops.
    """
    res = dataset.compare_laptops(request.id1, request.id2)
    if not res:
        raise HTTPException(status_code=404, detail="One or both laptops not found")
    return res

@router.get("/search")
def instant_search(q: str = Query(..., min_length=1)):
    """
    Fast query matching for autocomplete/typeahead.
    """
    eng = dataset.get_engine()
    df = eng.df
    if df is None:
        return []
        
    query_str = q.lower().strip()
    # Match brand or name
    matches = df[
        df["Name_Clean"].str.lower().str.contains(query_str, na=False) |
        df["Brand"].str.lower().str.contains(query_str, na=False)
    ].head(10)
    
    results = []
    for idx, row in matches.iterrows():
        results.append({
            "id": int(idx),
            "Name": row["Name_Clean"],
            "Brand": row["Brand"],
            "Price": int(row["Price"])
        })
    return results

# --- FAVORITES ---

@router.get("/favorites")
def get_favorites():
    """
    Retrieve all favorited laptops.
    """
    fav_ids = load_json_file(FAVORITES_FILE, [])
    eng = dataset.get_engine()
    
    results = []
    for fid in fav_ids:
        details = eng.get_laptop_by_id(fid)
        if details:
            results.append(details)
    return results

@router.post("/favorites")
def toggle_favorite(request: FavoriteRequest):
    """
    Add or remove a laptop from the favorites list.
    """
    fav_ids = load_json_file(FAVORITES_FILE, [])
    lid = request.laptop_id
    
    # Check if laptop exists
    eng = dataset.get_engine()
    if not eng.get_laptop_by_id(lid):
        raise HTTPException(status_code=404, detail="Laptop not found")
        
    if lid in fav_ids:
        fav_ids.remove(lid)
        status = "removed"
    else:
        fav_ids.append(lid)
        status = "added"
        
    save_json_file(FAVORITES_FILE, fav_ids)
    return {"status": status, "favorites": fav_ids}

# --- HISTORY ---

@router.get("/history")
def get_history():
    """
    Get past recommendation queries.
    """
    return load_json_file(HISTORY_FILE, [])
