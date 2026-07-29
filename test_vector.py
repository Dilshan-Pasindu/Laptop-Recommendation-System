import sys
import numpy as np

sys.path.append("backend")
from backend import dataset

eng = dataset.get_engine()
test_prefs = {
    "budget": 80000,
    "purpose": "Gaming",
    "brand": "ASUS",
    "processor_brand": "Intel",
    "min_ram": 16,
    "min_storage": 512,
    "gpu_req": "Dedicated",
    "battery_importance": "Medium",
    "display_size": "Medium",
    "display_type": "LCD",
    "performance_priority": 0.8
}

print("Creating user vector...")
# Mock the creation of user_vector just like in recommend()
import pandas as pd
budget = test_prefs.get("budget", 150000)
purpose = test_prefs.get("purpose", "Programming")
pref_brand = test_prefs.get("brand", "Any")
pref_proc = test_prefs.get("processor_brand", "Any")
min_ram = test_prefs.get("min_ram", 8)
min_storage = test_prefs.get("min_storage", 256)
gpu_req = test_prefs.get("gpu_req", "Any")
battery_imp = test_prefs.get("battery_importance", "Medium")
disp_size_pref = test_prefs.get("display_size", "Any")
disp_type_pref = test_prefs.get("display_type", "Any")
perf_priority = test_prefs.get("performance_priority", 0.5)

user_dict = {feat: 0.0 for feat in eng.num_features}
user_dict["Price"] = float(budget)
user_dict["RAM_GB"] = float(min_ram)
user_dict["Storage_GB"] = float(min_storage)

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
    
if purpose in ["Gaming", "AI Development"]:
    user_dict["Ghz"] = 3.5
elif purpose in ["Programming", "Video Editing"]:
    user_dict["Ghz"] = 2.8
else:
    user_dict["Ghz"] = 2.0
    
if battery_imp == "High":
    user_dict["Battery_Hours"] = 12.0
    user_dict["Battery_Score"] = 80.0
elif battery_imp == "Medium":
    user_dict["Battery_Hours"] = 8.0
    user_dict["Battery_Score"] = 55.0
else:
    user_dict["Battery_Hours"] = 5.0
    user_dict["Battery_Score"] = 35.0
    
score_multiplier = 0.7 + (perf_priority * 0.3)

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

user_df = pd.DataFrame([user_dict], columns=eng.num_features)
user_num_scaled = eng.scaler.transform(user_df)

print("Scaled User numerical features:", user_num_scaled)
print("Contains NaN:", np.isnan(user_num_scaled).any())
print("Max:", np.max(user_num_scaled), "Min:", np.min(user_num_scaled))

user_cat = {
    "Brand": pref_brand if pref_brand != "Any" else eng.df["Brand"].mode()[0],
    "Processor_Brand": pref_proc if pref_proc != "Any" else eng.df["Processor_Brand"].mode()[0],
    "GPU_Brand": "NVIDIA" if gpu_req == "Dedicated" else eng.df["GPU_Brand"].mode()[0],
    "Display_type": disp_type_pref if disp_type_pref != "Any" else eng.df["Display_type"].mode()[0],
    "CPU_Tier": "High End" if purpose in ["Gaming", "AI Development"] else "Mid Range"
}

user_cat_df = pd.DataFrame([user_cat], columns=eng.cat_features)
user_cat_encoded = eng.encoder.transform(user_cat_df)

user_vector = np.hstack((user_num_scaled, user_cat_encoded))

print("Final user_vector contains NaN:", np.isnan(user_vector).any())
print("Computing cosine similarity...")
from sklearn.metrics.pairwise import cosine_similarity
cosine_similarity(eng.feature_matrix, user_vector)
print("Done!")
