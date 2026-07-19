import pandas as pd
import numpy as np

def calculate_cpu_score(row):
    # Base CPU Tier scores
    tier_scores = {
        "Ultra Enthusiast": 95,
        "High End": 75,
        "Mid Range": 55,
        "Entry Level": 35,
        "Budget": 15
    }
    base_score = tier_scores.get(row["CPU_Tier"], 15)
    
    # Adjust score slightly using Ghz
    ghz = row["Ghz"]
    adjustment = 0
    if ghz > 0:
        # Standard Ghz baseline is around 2.5 Ghz
        adjustment = (ghz - 2.5) * 5
        # Cap adjustment to [-15, 10]
        adjustment = max(-15, min(10, adjustment))
        
    score = base_score + adjustment
    return float(np.clip(score, 10, 100))

def calculate_gpu_score(row):
    gpu_name = str(row["GPU"]).lower()
    vram = row["GPU_VRAM_GB"]
    
    # Dedicated GPU logic (VRAM > 0 or explicit high-end keywords)
    if vram > 0 or any(kw in gpu_name for kw in ["rtx", "gtx", "radeon rx", "intel arc"]):
        # Base on VRAM
        if vram >= 16:
            base = 98
        elif vram >= 12:
            base = 90
        elif vram >= 8:
            base = 80
        elif vram >= 6:
            base = 68
        elif vram >= 4:
            base = 48
        else:
            base = 38
            
        # Series generation modifier
        modifier = 0
        if "40" in gpu_name: # RTX 40-series
            modifier = 5
        elif "30" in gpu_name: # RTX 30-series
            modifier = 2
        elif "16" in gpu_name: # GTX 16-series
            modifier = -5
            
        score = base + modifier
    else:
        # Integrated GPU logic
        if any(kw in gpu_name for kw in ["iris xe", "iris"]):
            score = 25
        elif "arc" in gpu_name:
            score = 28
        elif any(kw in gpu_name for kw in ["radeon", "vega"]):
            score = 22
        elif row["GPU_Brand"] == "Apple":
            # Apple Silicon M1/M2/M3 unified graphics
            if "max" in gpu_name or "ultra" in gpu_name:
                score = 65
            elif "pro" in gpu_name:
                score = 45
            else:
                score = 35
        else:
            score = 12 # basic UHD / Intel Graphics
            
    return float(np.clip(score, 10, 100))

def engineer_features(df):
    print("Engineering features & deriving scores...")
    
    # 1. CPU & GPU Scores
    df["CPU_Score"] = df.apply(calculate_cpu_score, axis=1)
    df["GPU_Score"] = df.apply(calculate_gpu_score, axis=1)
    
    # 2. Portability Score (smaller display = more portable)
    # Display ranges typically from ~11.6 to 17.3
    df["Portability_Score"] = df["Display_Size"].apply(
        lambda size: max(10, min(100, 100 - ((size - 11.6) / (17.3 - 11.6) * 90)))
    )
    
    # 3. RAM Score (capped at 32GB)
    df["RAM_Score"] = df["RAM_GB"].apply(lambda ram: min(100, (ram / 32) * 100))
    
    # 4. Storage Score (SSD heavy, HDD light)
    df["Storage_Score"] = df.apply(
        lambda r: min(100, ((r["SSD_GB"] + 0.2 * r["HDD_GB"]) / 1024) * 100), axis=1
    )
    
    # 5. Programming Score
    # Highly RAM and CPU dependent, with SSD storage as a secondary factor
    df["Programming_Score"] = 0.4 * df["RAM_Score"] + 0.4 * df["CPU_Score"] + 0.2 * df["Storage_Score"]
    
    # 6. AI Development Score
    # Heavily depends on GPU power (CUDA/unified memory) and RAM.
    # Integrated GPUs (which lack VRAM) are capped to lower values since training/inference is highly constrained.
    def calc_ai_score(row):
        is_apple_silicon = row["Processor_Brand"] == "Apple"
        has_ded_gpu = row["GPU_VRAM_GB"] > 0 or ("arc" in str(row["GPU"]).lower())
        
        # If integrated, cap score. Apple Silicon unified memory gets a slightly higher cap.
        cap = 100
        if not has_ded_gpu:
            cap = 45 if is_apple_silicon else 35
            
        raw_score = 0.45 * row["GPU_Score"] + 0.35 * row["RAM_Score"] + 0.2 * row["CPU_Score"]
        return float(min(cap, raw_score))
        
    df["AI_Development_Score"] = df.apply(calc_ai_score, axis=1)
    
    # 7. Gaming Score
    # Highly GPU heavy
    df["Gaming_Score"] = 0.7 * df["GPU_Score"] + 0.3 * df["CPU_Score"]
    
    # 8. Video Editing Score
    # Needs GPU power, RAM, Storage space, and larger screen size is preferred (inverse of portability)
    df["Video_Editing_Score"] = (
        0.35 * df["GPU_Score"] + 
        0.30 * df["RAM_Score"] + 
        0.20 * df["Storage_Score"] + 
        0.15 * (100 - df["Portability_Score"])
    )
    
    # 9. Office & Student Score
    # Battery hours, lower price (budget friendly), and portability are key.
    # We define a budget score (higher score for lower price)
    max_price = df["Price"].max()
    # Normalize budget: log scaling or capping. Let's say under ₹100,000 is good, under ₹50,000 is great.
    df["Budget_Score"] = df["Price"].apply(lambda p: max(10, min(100, (1 - min(p, 120000) / 120000) * 90 + 10)))
    df["Battery_Score"] = df["Battery_Hours"].apply(lambda h: min(100, (h / 15) * 100))
    
    df["Office_Student_Score"] = (
        0.4 * df["Battery_Score"] + 
        0.3 * df["Budget_Score"] + 
        0.3 * df["Portability_Score"]
    )
    
    # 10. Overall Rating (weighted composite)
    df["Overall_Rating"] = (
        0.25 * df["CPU_Score"] + 
        0.15 * df["GPU_Score"] + 
        0.20 * df["Programming_Score"] + 
        0.20 * df["Office_Student_Score"] + 
        0.20 * df["Portability_Score"]
    )
    
    # Round all engineered scores to 1 decimal place
    score_cols = [
        "CPU_Score", "GPU_Score", "Portability_Score", "RAM_Score", "Storage_Score",
        "Programming_Score", "AI_Development_Score", "Gaming_Score", "Video_Editing_Score",
        "Budget_Score", "Battery_Score", "Office_Student_Score", "Overall_Rating"
    ]
    for col in score_cols:
        df[col] = df[col].round(1)
        
    print("Feature engineering complete!")
    return df

if __name__ == "__main__":
    import os
    clean_path = "backend/data/laptops_clean.csv"
    if os.path.exists(clean_path):
        df = pd.read_csv(clean_path)
        df = engineer_features(df)
        df.to_csv(clean_path, index=False)
        print("Updated clean dataset with engineered features.")
    else:
        print(f"Error: {clean_path} does not exist. Run preprocessing first.")
