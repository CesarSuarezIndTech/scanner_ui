"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";
import { Clock3 } from "lucide-react";

export default function ScannerForm() {
  const [target, setTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [mode, setMode] = useState<"quick" | "full">("quick");
  const [logs, setLogs] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const eventSrcRef = useRef<EventSource | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isValidInput =
    /^(?:\d{1,3}\.){3}\d{1,3}$|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(target);

  const startDisabled = !isValidInput || isScanning;
  const stopDisabled = !isScanning;

  // Helper functions for time formatting and estimation
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const estimateRemainingTime = (): number => {
    if (progress <= 0 || !startTime) return 0;
    const elapsedMs = Date.now() - startTime;
    const progressRate = progress / elapsedMs; // progress per ms
    const remainingProgress = 100 - progress;
    const estimatedRemainingMs = remainingProgress / progressRate;
    return Math.floor(estimatedRemainingMs / 1000);
  };

  const handleStart = () => {
    if (!isValidInput || isScanning) return;
    setIsScanning(true);
    setLogs("");
    setProgress(0);
    setStartTime(Date.now());
    setElapsedTime(0);

    // Start timer for elapsed time
    timerRef.current = setInterval(() => {
      if (startTime) {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    // Build SSE URL
    const url = `/api/scan?target=${encodeURIComponent(target)}&mode=${mode}`;

    const es = new EventSource(url);
    eventSrcRef.current = es;

    es.onmessage = (e) => {
      setLogs((prev: string) => prev + (prev ? "\n" : "") + e.data);
    };

    es.addEventListener("stderr", (e) => {
      const data = (e as MessageEvent).data;
      setLogs((prev: string) => prev + (prev ? "\n" : "") + `[stderr] ${data}`);
    });

    es.addEventListener("progress", (e) => {
      const progressValue = parseInt((e as MessageEvent).data, 10);
      if (!isNaN(progressValue)) {
        setProgress(progressValue);
      }
    });

    es.addEventListener("done", () => {
      // Scan completed
      es.close();
      eventSrcRef.current = null;
      setIsScanning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    });

    es.onerror = () => {
      // Auto-close on errors
      es.close();
      eventSrcRef.current = null;
      setIsScanning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  };

  const handleStop = () => {
    // Cancelar la petición al backend
    try {
      eventSrcRef.current?.close();
    } catch {}
    eventSrcRef.current = null;
    setIsScanning(false);
    setProgress(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
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
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTarget(e.target.value)}
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
            disabled={true} // Full scan disabled for now
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

      <div className="mt-10 px-6 py-4 flex flex-col rounded-[16px] [box-shadow:0px_0px_16px_0px_rgba(0,51,102,0.25)] text-black" >
        <div className="flex justify-between">
          <p className="text-start text-sm text-[#DF0D1B] font-semibold">{`${progress}% Completado`}</p>
          <div className="flex items-center text-xs text-[#8E9398] gap-0.5">
            <Clock3 size={10}/>
            <p>{formatTime(elapsedTime)} {progress > 0 && progress < 100 ? `/ ~${formatTime(estimateRemainingTime())}` : ""}</p>
          </div>
        </div>
        <div className="w-full mt-2 mb-4 bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-[#DF0C1B] h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div
          ref={logContainerRef}
          className="border border-gray-300 rounded-md h-56 overflow-auto bg-black text-sm text-white whitespace-pre-wrap"
        >
          {logs || "Salida del escaneo aparecerá aquí..."}
        </div>
      </div>
    </div>
  );
}
