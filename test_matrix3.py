from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

print("Testing cosine_similarity...")
cosine_similarity(np.zeros((1, 5)), np.zeros((1, 5)))
print("Done.")
