import os
import joblib
from huggingface_hub import hf_hub_download

MODEL_PATH = hf_hub_download(
    repo_id=os.environ["HF_MODEL_REPO"],
    filename="food_delivery_best_model.pkl"
)

model = joblib.load(MODEL_PATH)