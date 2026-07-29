import joblib
import numpy as np

model = joblib.load('backend/models/recommendation_model.joblib')
X = model['feature_matrix']
norms = np.linalg.norm(X, axis=1)
print("Min norm:", np.min(norms))
print("Number of zero norm rows:", np.sum(norms == 0))
