import sys
import os

# Adjust path to import from backend
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))


from backend import dataset
from backend.recommendation_engine import RecommendationEngine

def run_tests():
    print("=== STARTING BACKEND INTEGRITY VERIFICATION ===")
    
    # 1. Load Recommendation Engine
    print("\nLoading RecommendationEngine...")
    eng = dataset.get_engine()
    if eng.df is None:
        print("FAIL: RecommendationEngine dataset is None!")
        return False
    print(f"SUCCESS: Loaded {len(eng.df)} laptops.")
    print(f"Brands in dataset: {len(eng.get_brands())}")
    
    # 2. Test Autocomplete search
    print("\nTesting autocomplete search for 'RTX'...")
    search_results = dataset.search_laptops(query="RTX", page=1, limit=5)
    print(f"Found {search_results['total']} laptops matching 'RTX'.")
    if search_results['total'] == 0:
        print("FAIL: No laptops found matching 'RTX'!")
        return False
    print(f"First result: {search_results['laptops'][0]['Name']} - Price: {search_results['laptops'][0]['Price']}")
    
    # 3. Test Recommendation Engine
    print("\nTesting Recommendation Logic...")
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
    
    recs = eng.recommend(test_prefs)
    print(f"Generated {len(recs)} recommendations.")
    if len(recs) != 5:
        print(f"FAIL: Expected 5 recommendations, got {len(recs)}!")
        return False
        
    for i, r in enumerate(recs):
        print(f"Rank {i+1}: {r['Brand']} {r['Name']} (Match: {r['Match_Percentage']}% | Price: ₹{r['Price']:,})")
        print(f"  CPU Score: {r['CPU_Score']} | GPU Score: {r['GPU_Score']} | Gaming Score: {r['Gaming_Score']}")
        print(f"  Why Recommended: {r['Why_Recommended'][0]}")
        
    # 4. Test Comparison
    print("\nTesting Comparison Logic...")
    id1 = recs[0]["id"]
    id2 = recs[1]["id"]
    comp = dataset.compare_laptops(id1, id2)
    
    if not comp:
        print("FAIL: Comparison returned None!")
        return False
    print(f"SUCCESS: Comparison completed. Overall Winner: {comp['overall_winner_name']}")
    
    print("\n=== ALL BACKEND TESTS PASSED SUCCESSFULLY ===")
    return True

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
