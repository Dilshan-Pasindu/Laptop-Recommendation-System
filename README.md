# 💻 DP Laptop Advisor — AI-Powered Laptop Recommendation System

> An intelligent full-stack web application that helps users find their perfect laptop using a machine learning recommendation engine powered by cosine similarity and weighted scoring.

---

## ✨ Features

- 🤖 **AI Recommendation Engine** — Input your budget, purpose, and preferences to get the top 5 matched laptops ranked by a multi-factor weighted score
- 🔍 **Smart Search & Filtering** — Full-text search across 3,900+ laptops with live autocomplete and advanced filters (brand, RAM, storage, GPU, price range, display type)
- ⚖️ **Side-by-Side Comparison** — Compare any two laptops across 13 specification categories with winner highlights and overall score
- 📄 **Laptop Detail Pages** — Deep-dive view with CPU/GPU benchmarks, purpose-specific AI scores, battery, highlights, and more
- ❤️ **Favourites** — Save and revisit your shortlisted laptops
- 🕓 **Recommendation History** — Review past recommendation queries and their results

---

## 🛠️ Tech Stack

### Backend
| Technology | Role |
|---|---|
| Python 3.9 | Core language |
| FastAPI | REST API framework |
| Uvicorn | ASGI server |
| Pandas / NumPy | Data processing |
| Scikit-learn | ML pipeline (MinMaxScaler, OneHotEncoder, Cosine Similarity) |
| Joblib | Model serialisation |

### Frontend
| Technology | Role |
|---|---|
| React 19 + Vite | UI framework & bundler |
| React Router v7 | Client-side routing |
| Framer Motion | Animations |
| Tailwind CSS v4 | Styling |
| Recharts | Score visualisation |
| Axios | API communication |
| Lucide React | Icon library |

---

## 📁 Project Structure

```
Laptop Recommendation System/
├── backend/
│   ├── app.py                   # FastAPI app entry point
│   ├── routes.py                # All API endpoints
│   ├── dataset.py               # Singleton engine & data access helpers
│   ├── recommendation_engine.py # Core ML engine (cosine similarity + scoring)
│   ├── preprocessing.py         # Raw CSV cleaning pipeline
│   ├── feature_engineering.py   # Score computation (CPU, GPU, Gaming, etc.)
│   ├── train_model.py           # Model training & serialisation pipeline
│   ├── data/
│   │   ├── laptops_raw.csv      # Raw dataset
│   │   └── laptops_clean.csv    # Preprocessed dataset
│   └── models/
│       └── recommendation_model.joblib  # Serialised ML model cache
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Landing page
│   │   │   ├── Recommend.jsx    # Recommendation wizard
│   │   │   ├── Search.jsx       # Browse & filter all laptops
│   │   │   ├── Compare.jsx      # Side-by-side comparison tool
│   │   │   └── LaptopDetails.jsx # Full spec detail page
│   │   ├── services/
│   │   │   └── api.js           # Axios API client
│   │   ├── App.jsx              # Root component & routing
│   │   └── index.css            # Global design system
│   ├── index.html
│   └── package.json
├── requirements.txt
├── verify_backend.py            # Backend integrity test script
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+ and npm

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "Laptop Recommendation System"
```

### 2. Set up the Backend

```bash
# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate       # macOS / Linux
# venv\Scripts\activate        # Windows

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Start the Backend Server

From the project root directory:

```bash
uvicorn backend.app:app --reload
```

The API will be running at **http://localhost:8000**

> 💡 On first startup, the server will automatically detect if the model cache is missing and trigger the full training pipeline. This may take a minute.

### 4. Set up the Frontend

Open a **second terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/laptops` | Search and filter all laptops (paginated) |
| `GET` | `/laptop/{id}` | Get full details for a single laptop |
| `GET` | `/search?q=` | Autocomplete / instant search |
| `POST` | `/recommend` | Get top 5 AI-matched laptop recommendations |
| `POST` | `/compare` | Side-by-side spec comparison of two laptops |
| `GET` | `/favorites` | Retrieve saved favourites |
| `POST` | `/favorites` | Toggle a laptop in/out of favourites |
| `GET` | `/history` | Retrieve past recommendation history |

Interactive API docs are available at **http://localhost:8000/docs**

---

## 🧠 How the AI Engine Works

1. **Data Preprocessing** — Raw laptop CSV is cleaned, prices normalised, missing values imputed, and spec strings parsed
2. **Feature Engineering** — Derived scores computed for CPU, GPU, Gaming, Programming, AI Development, Video Editing, Office/Student, and Portability use cases
3. **Model Training** — A `MinMaxScaler` and `OneHotEncoder` are fitted on 14 numeric + 5 categorical features and saved via Joblib
4. **Recommendation** — A user preference vector is constructed from form inputs and cosine-similarity is computed against the full feature matrix. The results are re-ranked using a weighted score that factors in budget fit, purpose alignment, brand preference, and hardware thresholds
5. **Match Percentage** — A transparent 0–100% match score is calculated and returned alongside human-readable "Why Recommended" explanations

---

## ✅ Verifying the Backend

A test script is included to verify the entire backend pipeline end-to-end:

```bash
# Make sure your virtual environment is active first
venv/bin/python verify_backend.py
```

This tests the data loading, autocomplete search, recommendation engine, and comparison logic.

---

## 📝 License

This project is developed by **Dilshan Pasindu** for personal and academic use.
