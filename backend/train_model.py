import os
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder

from preprocessing import preprocess_dataset
from feature_engineering import engineer_features

def train_recommendation_system(raw_path, clean_path, model_path):
    print("=== STARTING TRAINING PIPELINE ===")
    
    # 1. Run Preprocessing
    preprocess_dataset(raw_path, clean_path)
    
    # 2. Run Feature Engineering
    df = pd.read_csv(clean_path)
    df = engineer_features(df)
    df.to_csv(clean_path, index=False)
    
    print("Fitting encoders and scalers...")
    
    # 3. Define features for Cosine Similarity matrix
    num_features = [
        "Price", "RAM_GB", "Storage_GB", "Ghz", "Display_Size", "Battery_Hours",
        "CPU_Score", "GPU_Score", "Programming_Score", "AI_Development_Score",
        "Gaming_Score", "Video_Editing_Score", "Office_Student_Score", "Portability_Score"
    ]
    
    cat_features = [
        "Brand", "Processor_Brand", "GPU_Brand", "Display_type", "CPU_Tier"
    ]
    
    # Fill any remaining NaNs
    df[num_features] = df[num_features].fillna(0)
    for cat in cat_features:
        df[cat] = df[cat].fillna("Unknown").astype(str)
        
    # Scaler
    scaler = MinMaxScaler()
    scaled_num = scaler.fit_transform(df[num_features])
    
    # Encoder
    encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
    encoded_cat = encoder.fit_transform(df[cat_features])
    
    # Combine into unified feature matrix
    feature_matrix = np.hstack((scaled_num, encoded_cat))
    
    # 4. Save model components
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    
    model_data = {
        "df": df,
        "scaler": scaler,
        "encoder": encoder,
        "num_features": num_features,
        "cat_features": cat_features,
        "feature_matrix": feature_matrix,
        "feature_names_cat": encoder.get_feature_names_out(cat_features).tolist()
    }
    
    joblib.dump(model_data, model_path)
    print(f"=== TRAINING COMPLETE. Model saved to {model_path} ===")
    print(f"Feature matrix shape: {feature_matrix.shape}")

if __name__ == "__main__":
    raw = "backend/data/laptops_raw.csv"
    clean = "backend/data/laptops_clean.csv"
    model = "backend/models/recommendation_model.joblib"
    train_recommendation_system(raw, clean, model)
