import os
import pandas as pd
from backend.recommendation_engine import RecommendationEngine

# Create a singleton instance of the RecommendationEngine
engine = RecommendationEngine()

def get_engine():
    # If model is not trained yet, this will be handled gracefully
    if engine.df is None:
        engine.load_model()
    return engine

def search_laptops(query=None, filters=None, page=1, limit=12):
    """
    Search and filter laptops in the preprocessed dataset.
    Returns: { "laptops": [...], "total": X, "page": Y, "pages": Z }
    """
    eng = get_engine()
    df = eng.df
    if df is None:
        return {"laptops": [], "total": 0, "page": page, "pages": 0}
        
    filtered_df = df.copy()
    
    # 1. Text Query Matching (Name, Brand, Processor_Name, GPU)
    if query:
        q = str(query).strip().lower()
        mask = (
            filtered_df["Name_Clean"].str.lower().str.contains(q, na=False) |
            filtered_df["Brand"].str.lower().str.contains(q, na=False) |
            filtered_df["Processor_Name"].str.lower().str.contains(q, na=False) |
            filtered_df["GPU"].str.lower().str.contains(q, na=False)
        )
        filtered_df = filtered_df[mask]
        
    # 2. Applying filters
    if filters:
        # Brand (list of strings or string)
        brand_filter = filters.get("brand")
        if brand_filter:
            if isinstance(brand_filter, list):
                filtered_df = filtered_df[filtered_df["Brand"].isin(brand_filter)]
            else:
                filtered_df = filtered_df[filtered_df["Brand"].str.lower() == brand_filter.lower()]
                
        # Price Range
        price_min = filters.get("price_min")
        price_max = filters.get("price_max")
        if price_min is not None:
            filtered_df = filtered_df[filtered_df["Price"] >= float(price_min)]
        if price_max is not None:
            filtered_df = filtered_df[filtered_df["Price"] <= float(price_max)]
            
        # RAM Size
        min_ram = filters.get("min_ram")
        if min_ram is not None:
            filtered_df = filtered_df[filtered_df["RAM_GB"] >= int(min_ram)]
            
        # Storage Size
        min_storage = filters.get("min_storage")
        if min_storage is not None:
            filtered_df = filtered_df[filtered_df["Storage_GB"] >= int(min_storage)]
            
        # Processor Brand
        proc_brand = filters.get("processor_brand")
        if proc_brand:
            filtered_df = filtered_df[filtered_df["Processor_Brand"].str.lower() == proc_brand.lower()]
            
        # GPU Brand
        gpu_brand = filters.get("gpu_brand")
        if gpu_brand:
            filtered_df = filtered_df[filtered_df["GPU_Brand"].str.lower() == gpu_brand.lower()]
            
        # Display type
        disp_type = filters.get("display_type")
        if disp_type:
            filtered_df = filtered_df[filtered_df["Display_type"].str.lower() == disp_type.lower()]
            
        # Purpose Score Threshold (Soft filtering: e.g. score >= 50 for that purpose)
        purpose = filters.get("purpose")
        if purpose:
            purpose_cols = {
                "Programming": "Programming_Score",
                "AI Development": "AI_Development_Score",
                "Gaming": "Gaming_Score",
                "Video Editing": "Video_Editing_Score",
                "Office": "Office_Student_Score",
                "Student": "Office_Student_Score"
            }
            score_col = purpose_cols.get(purpose)
            if score_col:
                filtered_df = filtered_df[filtered_df[score_col] >= 50.0]
                
    total = len(filtered_df)
    
    # 3. Pagination
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    paginated_df = filtered_df.iloc[start_idx:end_idx]
    
    results = []
    for idx, row in paginated_df.iterrows():
        results.append(eng.get_laptop_by_id(int(idx)))
        
    import math
    pages = math.ceil(total / limit)
    
    return {
        "laptops": results,
        "total": total,
        "page": page,
        "pages": pages
    }

def compare_laptops(id1, id2):
    """
    Compares two laptops spec-by-spec and score-by-score.
    """
    eng = get_engine()
    laptop1 = eng.get_laptop_by_id(id1)
    laptop2 = eng.get_laptop_by_id(id2)
    
    if not laptop1 or not laptop2:
        return None
        
    # Compare each attribute
    comparisons = {
        "Price": {
            "val1": laptop1["Price"],
            "val2": laptop2["Price"],
            "winner": 1 if laptop1["Price"] < laptop2["Price"] else (2 if laptop1["Price"] > laptop2["Price"] else 0),
            "label": "Price (Lower is better)"
        },
        "RAM": {
            "val1": f"{laptop1['RAM_GB']} GB {laptop1['RAM_TYPE']}",
            "val2": f"{laptop2['RAM_GB']} GB {laptop2['RAM_TYPE']}",
            "winner": 1 if laptop1["RAM_GB"] > laptop2["RAM_GB"] else (2 if laptop1["RAM_GB"] < laptop2["RAM_GB"] else 0),
            "label": "RAM Size"
        },
        "Storage": {
            "val1": f"{laptop1['Storage_GB']} GB (SSD: {laptop1['SSD_GB']}G, HDD: {laptop1['HDD_GB']}G)",
            "val2": f"{laptop2['Storage_GB']} GB (SSD: {laptop2['SSD_GB']}G, HDD: {laptop2['HDD_GB']}G)",
            "winner": 1 if laptop1["Storage_GB"] > laptop2["Storage_GB"] else (2 if laptop1["Storage_GB"] < laptop2["Storage_GB"] else 0),
            "label": "Storage Capacity"
        },
        "CPU": {
            "val1": f"{laptop1['Processor_Brand']} ({laptop1['Processor_Name']})",
            "val2": f"{laptop2['Processor_Brand']} ({laptop2['Processor_Name']})",
            "winner": 1 if laptop1["CPU_Score"] > laptop2["CPU_Score"] else (2 if laptop1["CPU_Score"] < laptop2["CPU_Score"] else 0),
            "label": "Processor Performance"
        },
        "GPU": {
            "val1": f"{laptop1['GPU_Brand']} ({laptop1['GPU']})",
            "val2": f"{laptop2['GPU_Brand']} ({laptop2['GPU']})",
            "winner": 1 if laptop1["GPU_Score"] > laptop2["GPU_Score"] else (2 if laptop1["GPU_Score"] < laptop2["GPU_Score"] else 0),
            "label": "Graphics Performance"
        },
        "Battery": {
            "val1": f"{laptop1['Battery_Hours']:.1f} hrs" + (" (estimated)" if laptop1["Battery_Imputed"] else ""),
            "val2": f"{laptop2['Battery_Hours']:.1f} hrs" + (" (estimated)" if laptop2["Battery_Imputed"] else ""),
            "winner": 1 if laptop1["Battery_Hours"] > laptop2["Battery_Hours"] else (2 if laptop1["Battery_Hours"] < laptop2["Battery_Hours"] else 0),
            "label": "Battery Life"
        },
        "Display": {
            "val1": f"{laptop1['Display_Size']:.1f}\" {laptop1['Display_type']}",
            "val2": f"{laptop2['Display_Size']:.1f}\" {laptop2['Display_type']}",
            "winner": 0, # subjective
            "label": "Display Size & Type"
        },
        "Programming Score": {
            "val1": laptop1["Programming_Score"],
            "val2": laptop2["Programming_Score"],
            "winner": 1 if laptop1["Programming_Score"] > laptop2["Programming_Score"] else (2 if laptop1["Programming_Score"] < laptop2["Programming_Score"] else 0),
            "label": "Programming Suitability"
        },
        "AI Score": {
            "val1": laptop1["AI_Development_Score"],
            "val2": laptop2["AI_Development_Score"],
            "winner": 1 if laptop1["AI_Development_Score"] > laptop2["AI_Development_Score"] else (2 if laptop1["AI_Development_Score"] < laptop2["AI_Development_Score"] else 0),
            "label": "AI Development Suitability"
        },
        "Gaming Score": {
            "val1": laptop1["Gaming_Score"],
            "val2": laptop2["Gaming_Score"],
            "winner": 1 if laptop1["Gaming_Score"] > laptop2["Gaming_Score"] else (2 if laptop1["Gaming_Score"] < laptop2["Gaming_Score"] else 0),
            "label": "Gaming Suitability"
        },
        "Video Editing Score": {
            "val1": laptop1["Video_Editing_Score"],
            "val2": laptop2["Video_Editing_Score"],
            "winner": 1 if laptop1["Video_Editing_Score"] > laptop2["Video_Editing_Score"] else (2 if laptop1["Video_Editing_Score"] < laptop2["Video_Editing_Score"] else 0),
            "label": "Video Editing Suitability"
        },
        "Office/Student Score": {
            "val1": laptop1["Office_Student_Score"],
            "val2": laptop2["Office_Student_Score"],
            "winner": 1 if laptop1["Office_Student_Score"] > laptop2["Office_Student_Score"] else (2 if laptop1["Office_Student_Score"] < laptop2["Office_Student_Score"] else 0),
            "label": "Office & Student Suitability"
        },
        "Overall Rating": {
            "val1": laptop1["Overall_Rating"],
            "val2": laptop2["Overall_Rating"],
            "winner": 1 if laptop1["Overall_Rating"] > laptop2["Overall_Rating"] else (2 if laptop1["Overall_Rating"] < laptop2["Overall_Rating"] else 0),
            "label": "Overall Rating Score"
        }
    }
    
    # Calculate overall winner
    score1 = laptop1["Overall_Rating"]
    score2 = laptop2["Overall_Rating"]
    
    overall_winner = laptop1 if score1 >= score2 else laptop2
    
    return {
        "laptop1": laptop1,
        "laptop2": laptop2,
        "comparisons": comparisons,
        "overall_winner_id": overall_winner["id"],
        "overall_winner_name": overall_winner["Name"]
    }
