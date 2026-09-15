import os
import re
import pandas as pd
import numpy as np

def clean_name(name):
    if pd.isna(name) or not isinstance(name, str):
        return ""
    # Strip suffix like ::585119::computer::laptops
    return name.split("::")[0].strip()

def parse_ram(ram):
    if pd.isna(ram) or not isinstance(ram, str):
        return 8  # default fallback
    match = re.search(r"(\d+)\s*GB", ram, re.IGNORECASE)
    if match:
        return int(match.group(1))
    # Check if just raw number
    digits = re.findall(r"\d+", ram)
    if digits:
        return int(digits[0])
    return 8

def parse_ram_expandable(val):
    if pd.isna(val) or not isinstance(val, str):
        return 0
    val_clean = val.strip().lower()
    if "not expandable" in val_clean or "no" in val_clean:
        return 0
    match = re.search(r"(\d+)\s*GB", val, re.IGNORECASE)
    if match:
        return int(match.group(1))
    digits = re.findall(r"\d+", val)
    if digits:
        return int(digits[0])
    return 0

def parse_ghz(ghz):
    if pd.isna(ghz) or not isinstance(ghz, str):
        return 0.0
    match = re.search(r"(\d+(?:\.\d+)?)\s*Ghz", ghz, re.IGNORECASE)
    if match:
        return float(match.group(1))
    digits = re.findall(r"\d+(?:\.\d+)?", ghz)
    if digits:
        return float(digits[0])
    return 0.0

def parse_display(display):
    if pd.isna(display):
        return 15.6  # typical laptop screen
    if isinstance(display, (int, float)):
        return float(display)
    if isinstance(display, str):
        # Extract float
        match = re.search(r"(\d+(?:\.\d+)?)", display)
        if match:
            return float(match.group(1))
    return 15.6

def parse_storage(val, storage_type="SSD"):
    if pd.isna(val) or not isinstance(val, str):
        return 0
    val_upper = val.upper().strip()
    if f"NO {storage_type}" in val_upper or val_upper == "0" or "NO" in val_upper or val_upper == "":
        return 0
    # Search for TB first
    tb_match = re.search(r"(\d+)\s*TB", val_upper)
    if tb_match:
        return int(tb_match.group(1)) * 1024
    # Search for GB
    gb_match = re.search(r"(\d+)\s*GB", val_upper)
    if gb_match:
        return int(gb_match.group(1))
    # Raw number
    digits = re.findall(r"\d+", val_upper)
    if digits:
        return int(digits[0])
    return 0

def parse_adapter(adapter):
    if pd.isna(adapter):
        return None
    if isinstance(adapter, (int, float)):
        return float(adapter)
    adapter_str = str(adapter).strip().lower()
    if adapter_str == "no" or adapter_str == "nan" or adapter_str == "":
        return None
    match = re.search(r"(\d+)", adapter_str)
    if match:
        return float(match.group(1))
    return None

def parse_battery_life(val):
    if pd.isna(val) or not isinstance(val, str):
        return None
    val_clean = val.strip().lower()
    # Pattern: Upto X Hrs or Upto X.Y Hrs or Upto X Hours
    match = re.search(r"upto\s*(\d+(?:\.\d+)?)\s*(?:hrs|hours|hr)", val_clean)
    if not match:
        return None  # garbage value like '45W Adapter'
    num_str = match.group(1)
    try:
        if "." in num_str:
            parts = num_str.split(".")
            hours = int(parts[0])
            mins_str = parts[1]
            if len(mins_str) == 2 and int(mins_str) < 60:
                return hours + int(mins_str) / 60.0
            else:
                return float(num_str)
        return float(num_str)
    except ValueError:
        return None

def clean_processor_brand(brand, name):
    # Sometimes Processor_Brand is a float/GHz like '2.3'
    # Or contains invalid brands
    valid_brands = {"intel", "amd", "apple", "mediatek", "qualcomm"}
    b_str = str(brand).strip().lower()
    n_str = str(name).strip().lower()
    
    # If the brand is valid, return it normalized
    if b_str in valid_brands:
        return b_str.capitalize()
    
    # Otherwise, infer from Processor_Name or Name
    if "intel" in n_str or "celeron" in n_str or "pentium" in n_str or "i3-" in n_str or "i5-" in n_str or "i7-" in n_str or "i9-" in n_str:
        return "Intel"
    if "amd" in n_str or "ryzen" in n_str or "athlon" in n_str:
        return "AMD"
    if "apple" in n_str or "m1" in n_str or "m2" in n_str or "m3" in n_str:
        return "Apple"
    if "mediatek" in n_str or "mt87" in n_str or "kompanio" in n_str:
        return "MediaTek"
    if "qualcomm" in n_str or "snapdragon" in n_str:
        return "Qualcomm"
        
    return "Intel"  # default fallback

def clean_gpu_brand(brand, gpu_name):
    # Fix casing, typos, missing values
    g_str = str(brand).strip().lower() if not pd.isna(brand) else ""
    gpu_n_str = str(gpu_name).strip().lower() if not pd.isna(gpu_name) else ""
    
    if "nvidia" in g_str or "nividia" in g_str or "nvidia" in gpu_n_str or "geforce" in gpu_n_str or "gtx" in gpu_n_str or "rtx" in gpu_n_str:
        return "NVIDIA"
    if "amd" in g_str or "radeon" in gpu_n_str:
        return "AMD"
    if "apple" in g_str or "m1" in gpu_n_str or "m2" in gpu_n_str or "m3" in gpu_n_str:
        return "Apple"
    if "intel" in g_str or "iris" in gpu_n_str or "uhd" in gpu_n_str or "arc" in gpu_n_str:
        return "Intel"
    if "mediatek" in g_str or "arm" in g_str or "adreno" in gpu_n_str or "mali" in gpu_n_str:
        return "ARM"
    
    return "Intel"  # default integrated fallback

def parse_gpu_vram(gpu_name):
    if pd.isna(gpu_name) or not isinstance(gpu_name, str):
        return 0
    # Search for e.g. "4 GB", "6 GB", "8 GB", "16 GB" inside GPU name
    match = re.search(r"(\d+)\s*GB", gpu_name, re.IGNORECASE)
    if match:
        return int(match.group(1))
    return 0

def extract_cpu_details(proc_name):
    if pd.isna(proc_name):
        return "Budget", "Unknown"
    proc_str = str(proc_name).strip().lower()
    
    # Determine Core Tier
    if "i9" in proc_str or "ryzen 9" in proc_str or "m1 max" in proc_str or "m2 max" in proc_str or "m3 max" in proc_str or "m1 ultra" in proc_str or "m2 ultra" in proc_str:
        tier = "Ultra Enthusiast"
    elif "i7" in proc_str or "ryzen 7" in proc_str or "m1 pro" in proc_str or "m2 pro" in proc_str or "m3 pro" in proc_str or "ultra 7" in proc_str:
        tier = "High End"
    elif "i5" in proc_str or "ryzen 5" in proc_str or "m1" in proc_str or "m2" in proc_str or "m3" in proc_str or "ultra 5" in proc_str:
        tier = "Mid Range"
    elif "i3" in proc_str or "ryzen 3" in proc_str or "core 3" in proc_str:
        tier = "Entry Level"
    else:
        tier = "Budget"  # Celeron, Pentium, Athlon, MediaTek etc.

    # Extract generation if possible
    gen_match = re.search(r"(\d+)(?:th|rd|nd|st)\s*gen", proc_str)
    if gen_match:
        gen = f"{gen_match.group(1)}th Gen"
    elif "ryzen" in proc_str:
        # Check series, e.g. Ryzen 5 5600U -> 5000 Series
        series_match = re.search(r"ryzen\s+\d+\s+(\d)\d{3}", proc_str)
        if series_match:
            gen = f"{series_match.group(1)}000 Series"
        else:
            gen = "Modern Series"
    elif "m1" in proc_str:
        gen = "M1 Gen"
    elif "m2" in proc_str:
        gen = "M2 Gen"
    elif "m3" in proc_str:
        gen = "M3 Gen"
    else:
        gen = "Standard"

    return tier, gen

def preprocess_dataset(raw_path, clean_path):
    print("Loading raw laptop dataset...")
    df = pd.read_csv(raw_path)
    
    # Drop index column if present
    if "Unnamed: 0" in df.columns:
        df = df.drop(columns=["Unnamed: 0"])
        
    print(f"Loaded {len(df)} rows. Cleaning features...")
    
    # Name cleaning
    df["Name_Clean"] = df["Name"].apply(clean_name)
    
    # Convert Price from Indian Rupees (₹) to Sri Lankan Rupees (RS): 1 ₹ = 3.44 RS
    df["Price"] = (df["Price"] * 3.44).round().astype(int)
    
    # Parse core numerical specs
    df["RAM_GB"] = df["RAM"].apply(parse_ram)
    df["RAM_Expandable_GB"] = df["RAM_Expandable"].apply(parse_ram_expandable)
    df["RAM_TYPE"] = df["RAM_TYPE"].fillna("DDR4").apply(lambda x: str(x).strip())
    df["Ghz"] = df["Ghz"].apply(parse_ghz)
    df["Display_Size"] = df["Display"].apply(parse_display)
    df["Display_type"] = df["Display_type"].fillna("LED").apply(lambda x: str(x).strip())
    
    # Storage cleaning
    df["SSD_GB"] = df["SSD"].apply(lambda x: parse_storage(x, "SSD"))
    df["HDD_GB"] = df["HDD"].apply(lambda x: parse_storage(x, "HDD"))
    df["Storage_GB"] = df["SSD_GB"] + df["HDD_GB"]
    
    # Adapter
    df["Adapter_W"] = df["Adapter"].apply(parse_adapter)
    
    # Processor & GPU Brand Normalization
    df["Processor_Brand"] = df.apply(lambda r: clean_processor_brand(r["Processor_Brand"], r["Processor_Name"]), axis=1)
    df["GPU_Brand"] = df.apply(lambda r: clean_gpu_brand(r["GPU_Brand"], r["GPU"]), axis=1)
    df["GPU_VRAM_GB"] = df["GPU"].apply(parse_gpu_vram)
    
    # Detect CPU Tier and Gen
    cpu_details = df["Processor_Name"].apply(extract_cpu_details)
    df["CPU_Tier"] = [x[0] for x in cpu_details]
    df["CPU_Gen"] = [x[1] for x in cpu_details]
    
    # Battery Life Hours Parsing
    df["Battery_Hours"] = df["Battery_Life"].apply(parse_battery_life)
    df["Battery_Imputed"] = df["Battery_Hours"].isna().astype(int)
    
    # Impute missing Battery Life Hours using Price Bins & Brand median
    df["Price_Bin"] = pd.qcut(df["Price"], q=4, labels=["Budget", "Mid", "High", "Premium"])
    
    # Calculate group medians
    medians = df.groupby(["Brand", "Price_Bin"])["Battery_Hours"].transform("median")
    bin_medians = df.groupby("Price_Bin")["Battery_Hours"].transform("median")
    overall_median = df["Battery_Hours"].median()
    if pd.isna(overall_median):
        overall_median = 6.0
        
    df["Battery_Hours"] = df["Battery_Hours"].fillna(medians).fillna(bin_medians).fillna(overall_median)
    
    # Impute missing Adapter W
    df["Has_Dedicated_GPU"] = (df["GPU_VRAM_GB"] > 0).astype(int)
    adapter_medians = df.groupby(["Has_Dedicated_GPU", "Price_Bin"])["Adapter_W"].transform("median")
    overall_adapter_median = df["Adapter_W"].median()
    if pd.isna(overall_adapter_median):
        overall_adapter_median = 65.0
    df["Adapter_W"] = df["Adapter_W"].fillna(adapter_medians).fillna(overall_adapter_median)
    
    # Save output
    os.makedirs(os.path.dirname(clean_path), exist_ok=True)
    df.to_csv(clean_path, index=False)
    print(f"Successfully preprocessed dataset. Cleaned file saved to: {clean_path}")
    print(f"Total rows: {len(df)}")
    print(f"Imputed battery values: {df['Battery_Imputed'].sum()} rows")
    
if __name__ == "__main__":
    raw = "backend/data/laptops_raw.csv"
    clean = "backend/data/laptops_clean.csv"
    preprocess_dataset(raw, clean)
