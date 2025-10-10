"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function ScannerForm() {
  const [target, setTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [mode, setMode] = useState<"quick" | "full">("quick");
  const [logs, setLogs] = useState<string>("");
  const eventSrcRef = useRef<EventSource | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const isValidInput =
    /^(?:\d{1,3}\.){3}\d{1,3}$|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(target);

  const startDisabled = !isValidInput || isScanning;
  const stopDisabled = !isScanning;

  const handleStart = () => {
    if (!isValidInput || isScanning) return;
    setIsScanning(true);
    setLogs("");

    // Build SSE URL
    const url = `/api/scan?target=${encodeURIComponent(target)}&mode=${mode}`;

    const es = new EventSource(url);
    eventSrcRef.current = es;

    es.onmessage = (e) => {
      setLogs((prev) => prev + (prev ? "\n" : "") + e.data);
    };

    es.addEventListener("stderr", (e) => {
      const data = (e as MessageEvent).data;
      setLogs((prev) => prev + (prev ? "\n" : "") + `[stderr] ${data}`);
    });

    es.onerror = () => {
      // Auto-close on errors
      es.close();
      eventSrcRef.current = null;
      setIsScanning(false);
    };
  };

  const handleStop = () => {
    // Cancelar la petición al backend
    try {
      eventSrcRef.current?.close();
    } catch {}
    eventSrcRef.current = null;
    setIsScanning(false);
  };

  // Auto scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        eventSrcRef.current?.close();
      } catch {}
      eventSrcRef.current = null;
    };
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 w-[600px] flex flex-col">
      <Image
        src={"/images/ci2-logo.svg"}
        alt="Logo"
        className="w-25 h-25 mx-auto mb-4"
        width={80}
        height={80}
      />
      <h2 className="text-xl font-semibold text-[#003366] mb-4 text-center">
        Ingresa Dominio/IP
      </h2>

      <input
        type="text"
        placeholder="Escribe el Dominio o IP"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        disabled={isScanning}
        className={`border border-[#003366] rounded-lg px-4 py-2 w-sm m-auto mb-4 focus:outline-none focus:ring-2 focus:ring-[#003366] text-black
          ${isScanning ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />

      <div className="flex flex-row justify-center gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="scanMode"
            value="quick"
            checked={mode === "quick"}
            onChange={() => setMode("quick")}
            disabled={isScanning}
            className="text-[#003366] focus:ring-[#003366] cursor-pointer"
          />
          <span className="text-gray-700 text-sm">Escaneo rápido</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="scanMode"
            value="full"
            checked={mode === "full"}
            onChange={() => setMode("full")}
            disabled={isScanning}
            className="text-[#003366] focus:ring-[#003366] cursor-pointer"
          />
          <span className="text-gray-700 text-sm">Escaneo completo</span>
        </label>
      </div>

      <div className="flex justify-center gap-4">
        <button
          disabled={startDisabled}
          onClick={handleStart}
          className={`px-6 py-2 rounded-lg transition-colors font-semibold
            ${
              startDisabled
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[#003366] text-white hover:bg-[#002850] cursor-pointer"
            }`}
        >
          INICIAR ESCANEO
        </button>
        <button
          disabled={stopDisabled}
          onClick={handleStop}
          className={`px-6 py-2 rounded-lg transition-colors font-semibold
            ${
              stopDisabled
                ? "bg-red-200 text-white cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            }`}
        >
          DETENER
        </button>
      </div>

      <div className="mt-4 w-full">
        {isScanning ? (
          <p className="text-center text-sm text-[#003366] mb-2 animate-pulse">
            Escaneando {target}...
          </p>
        ) : (
          <p className="text-center text-sm text-gray-500 mb-2">Listo</p>
        )}
        <div
          ref={logContainerRef}
          className="border border-gray-300 rounded-md p-3 h-56 overflow-auto bg-gray-50 text-sm text-black whitespace-pre-wrap"
        >
          {logs || "Salida del escaneo aparecerá aquí..."}
        </div>
      </div>
    </div>
  );
}
