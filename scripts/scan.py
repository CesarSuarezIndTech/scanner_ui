#!/usr/bin/env python3
import sys
import time

# Dummy scanner script: prints lines periodically to simulate progress
# Usage: python3 scan.py <target> <mode>

def main():
    if len(sys.argv) < 3:
        print("Uso: scan.py <target> <mode>")
        sys.stdout.flush()
        sys.exit(1)

    target = sys.argv[1]
    mode = sys.argv[2]

    print(f"Iniciando escaneo para {target} con modo {mode}")
    sys.stdout.flush()

    steps = 10 if mode == "quick" else 25
    for i in range(1, steps + 1):
        print(f"[{i}/{steps}] Escaneando... ")
        sys.stdout.flush()
        time.sleep(0.5)

    print("Escaneo completado.")
    sys.stdout.flush()

if __name__ == "__main__":
    main()
