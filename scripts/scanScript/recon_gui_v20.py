#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Nombre: recon_gui_v21.py
# Descripción: Herramienta CLI de reconocimiento automatizado con colores
# Autor: Andrés Torres (colaboración ChatGPT)
# Versión: v21

import os
import subprocess
import threading
import queue
import time
import sys
from datetime import datetime

# ==========================
# CONFIGURACIÓN GENERAL
# ==========================
NMAP_TIMEOUT = 300
NIKTO_TIMEOUT = 300
WHOIS_TIMEOUT = 60
DNS_TIMEOUT = 60
REPORT_DIR = "recon_reports"
os.makedirs(REPORT_DIR, exist_ok=True)
Avance=0

# ==========================
# COLORES ANSI
# ==========================
class C:
    HEADER = "\033[95m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    END = "\033[0m"
    BOLD = "\033[1m"

# ==========================
# FUNCIÓN INTELIGENTE run_cmd
# ==========================
def run_cmd(cmd, timeout, phase_name):
    print(f"\n{C.BOLD}{C.CYAN}[~] Ejecutando fase: {phase_name}{C.END}")
    print(f"{C.YELLOW}> {cmd}{C.END}\n")

    start_time = time.time()
    process = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    output_queue = queue.Queue()

    def reader_thread():
        for line in process.stdout:
            output_queue.put(line)
        process.stdout.close()

    thread = threading.Thread(target=reader_thread, daemon=True)
    thread.start()

    last_output_time = time.time()
    collected_output = ""

    while True:
        try:
            line = output_queue.get(timeout=1)
            collected_output += line
            print(f"{C.BLUE}{line.strip()}{C.END}")
            last_output_time = time.time()
        except queue.Empty:
            pass

        if process.poll() is not None:
            break

        if time.time() - last_output_time > timeout:
            process.kill()
            print(f"\n{C.RED}[!] Timeout alcanzado en fase '{phase_name}' (sin actividad por {timeout}s){C.END}\n")
            return collected_output + f"\n[!] Timeout alcanzado en {phase_name}\n"

    duration = round(time.time() - start_time, 2)
    print(f"\n{C.GREEN}[✓] Fase '{phase_name}' completada en {duration}s{C.END}\n")
    return collected_output

# ==========================
# FASES DE RECONOCIMIENTO
# ==========================
def whois_lookup(target):
    global Avance
    Avance = 0
    print(f"Avance: {Avance}%")
    return run_cmd(f"whois {target}", WHOIS_TIMEOUT, "WHOIS")

def dns_lookup(target):
    global Avance
    Avance += 25
    print(f"Avance: {Avance}%")
    return run_cmd(f"dig {target} ANY +noall +answer", DNS_TIMEOUT, "DNS Lookup")

def nmap_scan(target):
    global Avance
    Avance += 25
    print(f"Avance: {Avance}%") 
    return run_cmd(f"nmap -sS -sV -O -T4 {target}", NMAP_TIMEOUT, "Escaneo de Puertos y Servicios (Nmap)")

def nikto_scan(target):
    global Avance
    Avance += 25
    print(f"Avance: {Avance}%")
    return run_cmd(f"nikto -h {target} -Tuning x", NIKTO_TIMEOUT, "Vulnerabilidades Web (Nikto)")

# ==========================
# GENERACIÓN DE REPORTE
# ==========================
def generar_reporte(target, results):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_txt = f"{REPORT_DIR}/reporte_{target}_{timestamp}.txt"

    with open(report_txt, "w", encoding="utf-8") as f:
        f.write("=============================================\n")
        f.write(f"REPORTE DE RECONOCIMIENTO - {target}\n")
        f.write(f"Fecha: {datetime.now()}\n")
        f.write("=============================================\n\n")

        for section, content in results.items():
            f.write(f"===== {section.upper()} =====\n\n")
            f.write(content or "[Sin resultados]\n")
            f.write("\n\n")
    import subprocess
    #subprocess.run(["python3", "interpretador_ia_ollama.py", {report_txt}{C.END}])
    print(f"{C.GREEN}\n[📄] Reporte TXT generado en: {report_txt}{C.END}")
    
    #try:
    #   pdf_path = report_txt.replace(".txt", ".pdf")
    #   pdfkit.from_file(report_txt, pdf_path)
    #   print(f"{C.CYAN}[📘] Reporte PDF generado en: {pdf_path}{C.END}\n")
    #except Exception as e:
    #   print(f"{C.YELLOW}[!] No se pudo generar el PDF automáticamente: {e}{C.END}")

# ==========================
# EJECUCIÓN PRINCIPAL
# ==========================
if __name__ == "__main__":
    os.system("clear")
    print(f"{C.BOLD}{C.HEADER}===========================================")
    print("🔍 RECON AUTOMÁTICO v21 - CLI MODE 🔍")
    print("===========================================\n" + C.END)

    # Si se pasa como argumento, usarlo; de lo contrario pedirlo por consola
    if len(sys.argv) >= 2 and sys.argv[1].strip():
        target = sys.argv[1].strip()
    else:
        target = input(f"{C.BOLD}Ingrese el dominio o IP objetivo: {C.END}").strip()

    if not target:
        print(f"{C.RED}Debe ingresar un objetivo válido.{C.END}")
        exit(1)

    print(f"\n{C.CYAN}[*] Iniciando reconocimiento de: {target}{C.END}\n")

    results = {
        "WHOIS": whois_lookup(target),
        "DNS Lookup": dns_lookup(target),
        "NMAP": nmap_scan(target),
        "NIKTO": nikto_scan(target)
    }

    print(f"\n{C.GREEN}[✔] Reconocimiento completado correctamente.{C.END}")
    Avance += 25
    print(f"Avance: {Avance}%")
    generar_reporte(target, results)


