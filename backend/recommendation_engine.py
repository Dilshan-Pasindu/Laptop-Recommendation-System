import os
import re
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class RecommendationEngine:
    def __init__(self, model_path="backend/models/recommendation_model.joblib"):
        self.model_path = model_path
        self.model_data = None
        self.df = None
        self.scaler = None
        self.encoder = None
        self.num_features = []
        self.cat_features = []
        self.feature_matrix = None
        self.load_model()
        
    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model_data = joblib.load(self.model_path)
                self.df = self.model_data["df"]
                self.scaler = self.model_data["scaler"]
                self.encoder = self.model_data["encoder"]
                self.num_features = self.model_data["num_features"]
                self.cat_features = self.model_data["cat_features"]
                self.feature_matrix = self.model_data["feature_matrix"]
                print(f"Loaded recommendation model with {len(self.df)} laptops.")
            except Exception as e:
                print(f"Error loading model: {e}")
        else:
            print(f"Model path {self.model_path} not found. Running training first...")
            # Fallback path if run from backend folder
            alt_path = "models/recommendation_model.joblib"
            if os.path.exists(alt_path):
                self.model_path = alt_path
                self.load_model()
                
    def get_brands(self):
        if self.df is not None:
            return sorted(self.df["Brand"].unique().tolist())
        return []
        
    def get_processor_brands(self):
        if self.df is not None:
            return sorted(self.df["Processor_Brand"].unique().tolist())
        return []

    def recommend(self, preferences):
        """
        preferences is a dict:
        {
            "budget": 75000,
            "purpose": "Gaming", # Programming, AI Development, Gaming, Video Editing, Student, Office
            "brand": "Any", # Specific brand name or "Any"
            "processor_brand": "Any", # Intel, AMD, Apple, etc.
            "min_ram": 8,
            "min_storage": 512,
            "gpu_req": "Any", # Dedicated, Integrated, Any
            "battery_importance": "Medium", # Low, Medium, High
            "display_size": "Any", # Compact, Medium, Large, Any
            "display_type": "Any", # LED, LCD, Any
            "performance_priority": 0.5 # 0.0 to 1.0
        }
        """
        if self.df is None:
            return []
            
        budget = preferences.get("budget", 150000)
        purpose = preferences.get("purpose", "Programming")
        pref_brand = preferences.get("brand", "Any")
        pref_proc = preferences.get("processor_brand", "Any")
        min_ram = preferences.get("min_ram", 8)
        min_storage = preferences.get("min_storage", 256)
        gpu_req = preferences.get("gpu_req", "Any")
        battery_imp = preferences.get("battery_importance", "Medium")
        disp_size_pref = preferences.get("display_size", "Any")
        disp_type_pref = preferences.get("display_type", "Any")
        perf_priority = preferences.get("performance_priority", 0.5)
        
        # --- 1. USER PREFERENCE VECTOR ---
        # Initialize user dict matching our feature space
        user_dict = {feat: 0.0 for feat in self.num_features}
        
        # Map user input to numerical features
        user_dict["Price"] = float(budget)
        user_dict["RAM_GB"] = float(min_ram)
        user_dict["Storage_GB"] = float(min_storage)
        
        # Display size mapping
        if disp_size_pref == "Compact":
            user_dict["Display_Size"] = 12.5
            user_dict["Portability_Score"] = 90.0
        elif disp_size_pref == "Large":
            user_dict["Display_Size"] = 16.5
            user_dict["Portability_Score"] = 30.0
        elif disp_size_pref == "Medium":
            user_dict["Display_Size"] = 15.6
            user_dict["Portability_Score"] = 55.0
        else:
            user_dict["Display_Size"] = 14.5
            user_dict["Portability_Score"] = 65.0
            
        # Ghz setting
        if purpose in ["Gaming", "AI Development"]:
            user_dict["Ghz"] = 3.5
        elif purpose in ["Programming", "Video Editing"]:
            user_dict["Ghz"] = 2.8
        else:
            user_dict["Ghz"] = 2.0
            
        # Battery hours mapping
        if battery_imp == "High":
            user_dict["Battery_Hours"] = 12.0
            user_dict["Battery_Score"] = 80.0
        elif battery_imp == "Medium":
            user_dict["Battery_Hours"] = 8.0
            user_dict["Battery_Score"] = 55.0
        else:
            user_dict["Battery_Hours"] = 5.0
            user_dict["Battery_Score"] = 35.0
            
        # Engineered scores target based on purpose and priority
        score_multiplier = 0.7 + (perf_priority * 0.3) # 0.7 to 1.0
        
        # Set target scores
        if purpose == "Gaming":
            user_dict["Gaming_Score"] = 90.0 * score_multiplier
            user_dict["GPU_Score"] = 90.0 * score_multiplier
            user_dict["CPU_Score"] = 80.0 * score_multiplier
        elif purpose == "AI Development":
            user_dict["AI_Development_Score"] = 90.0 * score_multiplier
            user_dict["GPU_Score"] = 90.0 * score_multiplier
            user_dict["CPU_Score"] = 85.0 * score_multiplier
            user_dict["RAM_Score"] = 85.0 * score_multiplier
        elif purpose == "Programming":
            user_dict["Programming_Score"] = 90.0 * score_multiplier
            user_dict["CPU_Score"] = 80.0 * score_multiplier
            user_dict["RAM_Score"] = 80.0 * score_multiplier
        elif purpose == "Video Editing":
            user_dict["Video_Editing_Score"] = 90.0 * score_multiplier
            user_dict["GPU_Score"] = 75.0 * score_multiplier
            user_dict["RAM_Score"] = 80.0 * score_multiplier
        elif purpose in ["Office", "Student"]:
            user_dict["Office_Student_Score"] = 90.0 * score_multiplier
            user_dict["CPU_Score"] = 50.0 * score_multiplier
            user_dict["Budget_Score"] = 85.0
            
        user_dict["Overall_Rating"] = 75.0 * score_multiplier
        
        # Scale numerical vector
        user_df = pd.DataFrame([user_dict], columns=self.num_features)
        user_num_scaled = self.scaler.transform(user_df)
        
        # Set categorical features
        user_cat = {
            "Brand": pref_brand if pref_brand != "Any" else self.df["Brand"].mode()[0],
            "Processor_Brand": pref_proc if pref_proc != "Any" else self.df["Processor_Brand"].mode()[0],
            "GPU_Brand": "NVIDIA" if gpu_req == "Dedicated" else self.df["GPU_Brand"].mode()[0],
            "Display_type": disp_type_pref if disp_type_pref != "Any" else self.df["Display_type"].mode()[0],
            "CPU_Tier": "High End" if purpose in ["Gaming", "AI Development"] else "Mid Range"
        }
        
        user_cat_df = pd.DataFrame([user_cat], columns=self.cat_features)
        user_cat_encoded = self.encoder.transform(user_cat_df)
        
        # Unified preference vector
        user_vector = np.hstack((user_num_scaled, user_cat_encoded))
        
        # --- 2. COMPUTE COSINE SIMILARITY ---
        cos_similarities = cosine_similarity(self.feature_matrix, user_vector).flatten()
        cos_similarities = np.nan_to_num(cos_similarities, nan=0.0)
        
        # --- 3. COMPUTE WEIGHTED MATCH SCORE ---
        weighted_scores = []
        for idx, row in self.df.iterrows():
            score = 0.0
            
            # A. Budget match (30% weight)
            # 100% score if under budget. Exponential decay if over budget.
            price = row["Price"]
            if price <= budget:
                budget_match = 100.0
            else:
                # E.g., 20% over budget -> exp(-3 * 0.2) = exp(-0.6) = 54.8% match
                overrun = (price - budget) / budget
                budget_match = np.exp(-3.5 * overrun) * 100.0
            score += 0.30 * budget_match
            
            # B. Purpose match (25% weight)
            purpose_col_map = {
                "Programming": "Programming_Score",
                "AI Development": "AI_Development_Score",
                "Gaming": "Gaming_Score",
                "Video Editing": "Video_Editing_Score",
                "Office": "Office_Student_Score",
                "Student": "Office_Student_Score"
            }
            purpose_score = row[purpose_col_map.get(purpose, "Programming_Score")]
            score += 0.25 * purpose_score
            
            # C. RAM match (12% weight)
            ram = row["RAM_GB"]
            if ram >= min_ram:
                ram_match = 100.0
            else:
                ram_match = (ram / min_ram) * 100.0
            score += 0.12 * ram_match
            
            # D. CPU score match (13% weight)
            # Target CPU score based on purpose
            target_cpu = 80.0 if purpose in ["Gaming", "AI Development", "Programming"] else 50.0
            cpu_match = min(100.0, (row["CPU_Score"] / target_cpu) * 100.0)
            score += 0.13 * cpu_match
            
            # E. GPU match (10% weight)
            # If user requires Dedicated, check if laptop has dedicated GPU
            has_ded = row["GPU_VRAM_GB"] > 0
            if gpu_req == "Dedicated" and not has_ded:
                gpu_match = 10.0 # very low match
            elif gpu_req == "Integrated" and has_ded:
                gpu_match = 40.0 # moderate match (some might not want high power consumption)
            else:
                # Compare against target GPU score
                target_gpu = 75.0 if purpose in ["Gaming", "AI Development", "Video Editing"] else 20.0
                gpu_match = min(100.0, (row["GPU_Score"] / target_gpu) * 100.0)
            score += 0.10 * gpu_match
            
            # F. Battery match (5% weight)
            target_battery = 10.0 if battery_imp == "High" else (7.0 if battery_imp == "Medium" else 4.0)
            battery_match = min(100.0, (row["Battery_Hours"] / target_battery) * 100.0)
            score += 0.05 * battery_match
            
            # G. Storage match (5% weight)
            storage = row["Storage_GB"]
            if storage >= min_storage:
                storage_match = 100.0
            else:
                storage_match = (storage / min_storage) * 100.0
            score += 0.05 * storage_match
            
            # Save final score
            weighted_scores.append(score)
            
        weighted_scores = np.array(weighted_scores)
        
        # --- 4. COMBINE SIMILARITY AND WEIGHTED SCORE ---
        # Blended Score: 40% Cosine Similarity + 60% Weighted Match Score
        # Cosine Similarity is in [-1, 1], but feature space is positive, so it's in [0, 1]. Multiply by 100.
        blend_scores = 0.40 * (cos_similarities * 100.0) + 0.60 * weighted_scores
        
        # Apply brand multiplier if user specifies brand preference (soft filter)
        if pref_brand != "Any":
            # Add small bonus (+5%) if it matches preferred brand, up to max 100
            brand_mask = (self.df["Brand"].str.lower() == pref_brand.lower()).values
            blend_scores[brand_mask] = np.minimum(100.0, blend_scores[brand_mask] + 5.0)
            
        # Apply processor brand multiplier if user specifies preference
        if pref_proc != "Any":
            proc_mask = (self.df["Processor_Brand"].str.lower() == pref_proc.lower()).values
            blend_scores[proc_mask] = np.minimum(100.0, blend_scores[proc_mask] + 3.0)
            
        # Make sure no values exceed 100 or drop below 0
        blend_scores = np.clip(blend_scores, 0, 100)
        
        # --- 5. SORT AND EXTRACT TOP 5 ---
        temp_df = self.df.copy()
        temp_df["Match_Percentage"] = blend_scores.round(1)
        temp_df["Cosine_Similarity"] = cos_similarities.round(3)
        temp_df["Weighted_Score"] = weighted_scores.round(1)
        
        # Hard constraint filters (optional, let's keep them soft or apply boundary filters)
        # We won't strictly drop matches unless they are completely irrelevant (e.g. price > 1.8 * budget)
        # to ensure the recommender always returns 5 laptops.
        temp_df = temp_df[temp_df["Price"] <= budget * 1.6]
        
        # Sort descending
        top_laptops = temp_df.sort_values(by="Match_Percentage", ascending=False).head(5)
        
        results = []
        for idx, row in top_laptops.iterrows():
            laptop_id = int(idx)
            
            # Generate why recommended points
            reasons = []
            
            # Budget
            if row["Price"] <= budget:
                reasons.append(f"Fits your budget (₹{int(row['Price']):,} is within your ₹{int(budget):,} limit)")
            else:
                reasons.append(f"Worth the stretch: {row['Brand']} specs justify the ₹{int(row['Price'] - budget):,} budget overrun")
                
            # Purpose Score check
            purp_score = row[purpose_col_map.get(purpose, "Programming_Score")]
            if purp_score >= 80:
                reasons.append(f"Top-tier performance for {purpose} (Score: {purp_score}/100)")
            elif purp_score >= 60:
                reasons.append(f"Reliable performance for {purpose} tasks (Score: {purp_score}/100)")
                
            # Specs match
            if row["RAM_GB"] >= min_ram:
                reasons.append(f"Meets your memory preference with {row['RAM_GB']} GB of {row['RAM_TYPE']}")
            if row["Storage_GB"] >= min_storage:
                reasons.append(f"Ample storage capacity ({row['Storage_GB']} GB total: {row['SSD_GB']}GB SSD + {row['HDD_GB']}GB HDD)")
                
            # GPU check
            if row["GPU_VRAM_GB"] > 0:
                reasons.append(f"Dedicated {row['GPU_Brand']} graphics ({row['GPU']} with {row['GPU_VRAM_GB']}GB VRAM)")
            elif gpu_req == "Integrated":
                reasons.append(f"Integrated {row['GPU_Brand']} graphics for optimal power efficiency")
                
            # Battery Check
            battery_text = f"Offers {row['Battery_Hours']:.1f} hours of battery life"
            if row["Battery_Imputed"] == 1:
                battery_text += " (estimated based on category)"
            if row["Battery_Hours"] >= 8.0:
                reasons.append(f"🔋 {battery_text} - perfect for working on-the-go")
            else:
                reasons.append(battery_text)
                
            # CPU
            reasons.append(f"Powered by a robust {row['Processor_Brand']} processor ({row['Processor_Name']})")
            
            # Display
            reasons.append(f"Features a {row['Display_Size']:.1f}-inch {row['Display_type']} display")
            
            # Generate short Description
            gpu_desc = f"{row['GPU']} Dedicated GPU" if row["GPU_VRAM_GB"] > 0 else f"{row['GPU_Brand']} Integrated Graphics"
            desc = (
                f"The {row['Name_Clean']} is a premium {row['Display_Size']:.1f}\" laptop designed by {row['Brand']}. "
                f"It is powered by the {row['Processor_Name']} running at {row['Ghz']}GHz, paired with {row['RAM_GB']}GB of memory "
                f"and {row['Storage_GB']}GB of storage. Excellent for users seeking {purpose.lower()}-centric laptops."
            )
            
            results.append({
                "id": laptop_id,
                "Brand": row["Brand"],
                "Name": row["Name_Clean"],
                "Price": int(row["Price"]),
                "Processor_Name": row["Processor_Name"],
                "Processor_Brand": row["Processor_Brand"],
                "CPU_Tier": row["CPU_Tier"],
                "CPU_Gen": row["CPU_Gen"],
                "CPU_Score": float(row["CPU_Score"]),
                "GPU": row["GPU"],
                "GPU_Brand": row["GPU_Brand"],
                "GPU_VRAM_GB": int(row["GPU_VRAM_GB"]),
                "GPU_Score": float(row["GPU_Score"]),
                "RAM_GB": int(row["RAM_GB"]),
                "RAM_TYPE": row["RAM_TYPE"],
                "Storage_GB": int(row["Storage_GB"]),
                "SSD_GB": int(row["SSD_GB"]),
                "HDD_GB": int(row["HDD_GB"]),
                "Display_Size": float(row["Display_Size"]),
                "Display_type": row["Display_type"],
                "Battery_Hours": float(row["Battery_Hours"]),
                "Battery_Imputed": bool(row["Battery_Imputed"]),
                "Adapter_W": float(row["Adapter_W"]),
                "Overall_Rating": float(row["Overall_Rating"]),
                "Programming_Score": float(row["Programming_Score"]),
                "AI_Development_Score": float(row["AI_Development_Score"]),
                "Gaming_Score": float(row["Gaming_Score"]),
                "Video_Editing_Score": float(row["Video_Editing_Score"]),
                "Office_Student_Score": float(row["Office_Student_Score"]),
                "Portability_Score": float(row["Portability_Score"]),
                "Match_Percentage": float(row["Match_Percentage"]),
                "Description": desc,
                "Why_Recommended": reasons[:5] # top 5 compelling points
            })
            
        return results

    def get_laptop_by_id(self, laptop_id):
        if self.df is None or laptop_id < 0 or laptop_id >= len(self.df):
            return None
        row = self.df.iloc[laptop_id]
        
        gpu_desc = f"{row['GPU']} Dedicated GPU" if row["GPU_VRAM_GB"] > 0 else f"{row['GPU_Brand']} Integrated Graphics"
        desc = (
            f"The {row['Name_Clean']} is a premium {row['Display_Size']:.1f}\" laptop designed by {row['Brand']}. "
            f"It is powered by the {row['Processor_Name']} running at {row['Ghz']}GHz, paired with {row['RAM_GB']}GB of memory "
            f"and {row['Storage_GB']}GB of storage."
        )
        
        # Highlights
        highlights = [
            f"Features a powerful {row['Processor_Name']} clocking {row['Ghz']} GHz",
            f"Equipped with {row['RAM_GB']} GB of speedy {row['RAM_TYPE']}",
            f"Storage setup: {row['SSD_GB']} GB SSD and {row['HDD_GB']} GB HDD",
            f"Visuals handled by {row['GPU_Brand']} {row['GPU']}",
            f"Stunning {row['Display_Size']:.1f}-inch {row['Display_type']} display panel"
        ]
        if row["Battery_Hours"] >= 8.0:
            bat_type = " (estimated)" if row["Battery_Imputed"] == 1 else ""
            highlights.append(f"🔋 Outstanding {row['Battery_Hours']:.1f} hours of battery backup{bat_type}")
            
        return {
            "id": int(laptop_id),
            "Brand": row["Brand"],
            "Name": row["Name_Clean"],
            "Price": int(row["Price"]),
            "Processor_Name": row["Processor_Name"],
            "Processor_Brand": row["Processor_Brand"],
            "CPU_Tier": row["CPU_Tier"],
            "CPU_Gen": row["CPU_Gen"],
            "CPU_Score": float(row["CPU_Score"]),
            "GPU": row["GPU"],
            "GPU_Brand": row["GPU_Brand"],
            "GPU_VRAM_GB": int(row["GPU_VRAM_GB"]),
            "GPU_Score": float(row["GPU_Score"]),
            "RAM_GB": int(row["RAM_GB"]),
            "RAM_TYPE": row["RAM_TYPE"],
            "Storage_GB": int(row["Storage_GB"]),
            "SSD_GB": int(row["SSD_GB"]),
            "HDD_GB": int(row["HDD_GB"]),
            "Display_Size": float(row["Display_Size"]),
            "Display_type": row["Display_type"],
            "Battery_Hours": float(row["Battery_Hours"]),
            "Battery_Imputed": bool(row["Battery_Imputed"]),
            "Adapter_W": float(row["Adapter_W"]),
            "Overall_Rating": float(row["Overall_Rating"]),
            "Programming_Score": float(row["Programming_Score"]),
            "AI_Development_Score": float(row["AI_Development_Score"]),
            "Gaming_Score": float(row["Gaming_Score"]),
            "Video_Editing_Score": float(row["Video_Editing_Score"]),
            "Office_Student_Score": float(row["Office_Student_Score"]),
            "Portability_Score": float(row["Portability_Score"]),
            "Description": desc,
            "Highlights": highlights
        }
