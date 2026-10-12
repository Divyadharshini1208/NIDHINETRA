# MPLADS AI & Machine Learning Microservice

**Ministry of Statistics & Programme Implementation (MoSPI), Government of India**

---

## 📌 Overview
This service provides an independent AI-assisted decision support and anomaly detection engine for the MPLADS Monitoring Portal. It is architected for **Phase 2** execution to provide:

1. **Progress vs. Expenditure Mismatch Detection**: Identifying instances where financial disbursements significantly outpace certified physical work.
2. **Duplicate Work Candidate Identification**: Utilizing geospatial proximity clustering (DBSCAN) and TF-IDF / vector embeddings on work descriptions to detect overlapping proposals across MLAs/MPs/Local Bodies.
3. **Delay & Cost Overrun Forecasting**: Gradient boosted regression models predicting expected project completion delays based on implementing agency velocity, seasonal patterns, and milestone pace.
4. **Unusual Payment Surge Detection**: Isolation Forest / autoencoder models flagging abnormal tranche disbursement frequencies.

---

## 🛠 Tech Stack
- **Framework**: FastAPI (Python 3.11+)
- **Data Processing**: Pandas, NumPy
- **Machine Learning**: Scikit-Learn (IsolationForest, TF-IDF, GradientBoosting), XGBoost
- **API Server**: Uvicorn

---

## 🚀 How to Run (Phase 2)
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
