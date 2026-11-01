# 🍔 Food Delivery Time Prediction Project

Full-stack machine learning application predicting food delivery time using FastAPI and React (Vite).

---

## 🚀 Running the Project

### 1. Backend (FastAPI)
The backend runs on Python using FastAPI, Uvicorn, and Scikit-learn.

```bash
cd backend
# Activate virtual environment
source .venv/bin/activate

# Run with uvicorn (or python main.py)
uvicorn main:app --reload --port 8000
```
- **API URL**: http://127.0.0.1:8000
- **Docs (Swagger)**: http://127.0.0.1:8000/docs
- **Health Check**: http://127.0.0.1:8000/

### 2. Frontend (React + Vite)
The frontend is a React application built with Vite and styled for responsive desktop and mobile views.

```bash
cd frontend
# Run development server
npm run dev
```
- **App URL**: http://localhost:5173

---

## 🛠️ Issues Fixed

### Backend (`backend/main.py`)
1. **Model Loading Path**: Replaced the hardcoded relative path `"food_delivery_best_model.pkl"` with `Path(__file__).resolve().parent / "food_delivery_best_model.pkl"`, allowing the backend to start from any working directory without `FileNotFoundError`.
2. **Missing Feature `Type_of_order`**: Added the required `type_of_order` field to the Pydantic `DeliveryRequest` schema and passed it into the feature DataFrame.
3. **Column Name Mismatch (`Weatherconditions`)**: Corrected the column name from `Weather_conditions` to `Weatherconditions` and automatically formatted values with the `"conditions "` prefix (e.g., `"conditions Sunny"`) as required by the pre-trained Scikit-Learn OneHotEncoder pipeline.
4. **Input Normalization**: Standardized categorical fields (`Road_traffic_density`, `Type_of_vehicle`, `Festival`, `City` handling `"Metropolitan"`/`"Metropolitian"`) to ensure proper one-hot encoding without silent zeroing out.
5. **Distance Calculation Safeguard**: Added `np.clip(a, 0.0, 1.0)` to avoid `NaN` in `arcsin` during edge cases in haversine distance.
6. **Direct Execution Entrypoint**: Added `if __name__ == "__main__":` block to allow running `python main.py` directly.

### Frontend (`frontend/src/App.jsx` & `frontend/src/App.css`)
1. **Order Type Support**: Added `type_of_order` to the React state and rendered a dropdown (`Meal`, `Snack`, `Drinks`, `Buffet`) sent directly to the backend.
2. **Weather Options**: Added the missing `Fog` option to match all classes supported by the ML model.
3. **Clarified Labels**: Updated `multiple_deliveries` dropdown to clearly show `0 (None)`, `1`, `2`, `3`.
4. **Configurable API Endpoint**: Used `import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"` for flexible deployment.
5. **UI Alignment**: Fixed label text alignment in `App.css` so form fields are cleanly left-aligned.
