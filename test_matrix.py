import joblib
import numpy as np

model = joblib.load('backend/models/recommendation_model.joblib')
X = model['feature_matrix']
print("Feature matrix shape:", X.shape)
print("Contains NaN:", np.isnan(X).any())
print("Contains Inf:", np.isinf(X).any())
print("Max value:", np.max(X))
print("Min value:", np.min(X))
