#instalación modelo ia
# curl -fsSL https://ollama.com/install.sh | sh
# ollama pull mistral

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Nombre: interpretador_ia_ollama.py
# Descripción: Analiza un reporte técnico (WHOIS, DNS, NMAP, NIKTO) y genera interpretación con IA local (Ollama).
# Autor: Jhonathan Vargas 
# Fecha: 2025-10-09

import subprocess
import sys
from datetime import datetime
import os

def interpretar_reporte(ruta_reporte, modelo="mistral"):
    """Lee el reporte y lo interpreta con Ollama."""
    if not os.path.exists(ruta_reporte):
        print(f"[ERROR] No se encontró el archivo: {ruta_reporte}")
        return
    
    with open(ruta_reporte, "r", encoding="utf-8") as f:
        contenido = f.read()
    
    prompt = f"""
Contesta en español
    Eres un analista de ciberseguridad experto en español. Interpreta el siguiente reporte técnico de reconocimiento (WHOIS, DNS, NMAP, NIKTO)
y genera un informe profesional en español, estructurado así:

1. Resumen ejecutivo
2. Detalle técnico (por secciones)
3. Nivel de riesgo (bajo, medio, alto)
4. Recomendaciones de mitigación
5. Conclusión general

Aquí está el reporte completo:

{contenido}
"""

    try:
        resultado = subprocess.run(
            ["ollama", "run", modelo],
            input=prompt.encode("utf-8"),
            capture_output=True,
            timeout=300
        )
        salida = resultado.stdout.decode("utf-8").strip()
        print("\n🧠 Interpretación generada por IA:\n")
        print(salida)
        
        # Guardar resultado
        nombre_salida = f"{os.path.splitext(ruta_reporte)[0]}_interpretado.txt"
        with open(nombre_salida, "w", encoding="utf-8") as f:
            f.write(f"===== INTERPRETACIÓN GENERADA ({datetime.now()}) =====\n\n")
            f.write(salida)
        
        print(f"\n✅ Interpretación guardada en: {nombre_salida}")
        
    except Exception as e:
        print(f"[ERROR] No se pudo ejecutar Ollama: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python3 interpretador_ia_ollama.py <ruta_reporte.txt>")
    else:
        interpretar_reporte(sys.argv[1])
