#!/bin/bash
source recon_env/bin/activate

# Modo por defecto: GUI
if [ "$1" == "--api" ]; then
    echo "[INFO] Iniciando Recon API (FastAPI)..."
    uvicorn recon_gui_v18:app --host 0.0.0.0 --port 8000 --reload
else
    echo "[INFO] Iniciando Recon GUI..."
    python3 recon_gui_v18.py
fi

deactivate
