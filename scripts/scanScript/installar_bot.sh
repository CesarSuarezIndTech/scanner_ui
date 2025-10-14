#!/bin/bash

echo "=============================================="
echo " Instalador Recon GUI/API v18 - Kali/Debian/Ubuntu"
echo "=============================================="

# Verificar que sea root o usar sudo
if [ "$EUID" -ne 0 ]; then
    echo "Por favor, ejecuta con: sudo $0"
    exit 1
fi

# Actualizar sistema
echo "[1/7] Actualizando sistema..."
apt update && apt upgrade -y

# Instalar dependencias del sistema
echo "[2/7] Instalando herramientas de reconocimiento..."
apt install -y python3 python3-venv python3-pip whois dnsutils nmap whatweb nikto sublist3r wget curl

# Instalar wkhtmltopdf
echo "[3/7] Instalando wkhtmltopdf..."
if ! command -v wkhtmltopdf &> /dev/null; then
    wget -q https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.buster_amd64.deb
    apt install -y ./wkhtmltox_0.12.6-1.buster_amd64.deb
    rm -f wkhtmltox_0.12.6-1.buster_amd64.deb
else
    echo "wkhtmltopdf ya instalado."
fi

# Crear entorno virtual
echo "[4/7] Creando entorno virtual Python..."
python3 -m venv recon_env

# Activar entorno e instalar librerías Python necesarias
echo "[5/7] Instalando librerías Python..."
source recon_env/bin/activate
pip install --upgrade pip

# Librerías base del proyecto
pip install fastapi uvicorn python-whois dnspython requests pdfkit googletrans==4.0.0-rc1

deactivate

# Crear carpeta para reportes
echo "[6/7] Creando carpeta de reportes..."
mkdir -p recon_reports

# Crear script de inicio rápido
echo "[7/7] Creando script de inicio..."
cat << 'EOF' > iniciar_recon_v18.sh
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
EOF

chmod +x iniciar_recon_v18.sh

echo "=============================================="
echo " Instalación completada ✅"
echo " Para iniciar en modo GUI:  ./iniciar_recon_v18.sh"
echo " Para iniciar en modo API:  ./iniciar_recon_v18.sh --api"
echo "=============================================="
