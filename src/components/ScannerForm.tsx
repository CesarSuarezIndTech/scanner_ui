"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";
import { Clock3 } from "lucide-react";
import { AnsiUp } from "ansi_up";
import { Modal } from "./Modal";
import { useModal } from "@/hooks/useModal";

export default function ScannerForm() {
  const { isOpen, handleShow, handleClose} = useModal()
  const [target, setTarget] = useState("");
  const [openScan, setOpenScan] = useState<boolean>(false);
  const [showScan, setShowScan] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState(false);
  const [mode, setMode] = useState<"quick" | "full">("quick");
  const [modalType, setModalType] = useState<"error" | "success">("error");
  const [logsHtml, setLogsHtml] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [reportFileName, setReportFileName] = useState<string>("");
  
  const eventSrcRef = useRef<EventSource | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const ansiRef = useRef<AnsiUp | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isValidInput =
    /^(?:\d{1,3}\.){3}\d{1,3}$|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(target);

  const startDisabled = !isValidInput || isScanning;
  const stopDisabled = !isScanning;

  const handleStart = () => {
    if (!isValidInput || isScanning) return;
    setOpenScan(true);
    // Pequeño delay para activar la animación
    setTimeout(() => setShowScan(true), 50);
    setIsScanning(true);
  setLogsHtml("");
    setProgress(0);
    setReportFileName("");
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

    // Inicializar ansi_up una sola vez
    if (!ansiRef.current) {
      ansiRef.current = new AnsiUp();
    }

    es.onmessage = (e) => {
      const msg = typeof e.data === "string" ? e.data : String(e.data);
      const html = ansiRef.current!.ansi_to_html(msg);
      setLogsHtml((prev) => (prev ? prev + "\n" : "") + html);
    };

    es.addEventListener("stderr", (e) => {
      const data = (e as MessageEvent).data as string;
      // Pintar stderr en rojo usando códigos ANSI para que ansi_up lo convierta
      const colored = `\u001b[31m[stderr]\u001b[0m ${data}`;
      const html = ansiRef.current!.ansi_to_html(colored);
      setLogsHtml((prev) => (prev ? prev + "\n" : "") + html);
    });

    es.addEventListener("progress", (e) => {
      const progressValue = parseInt((e as MessageEvent).data, 10);
      if (!isNaN(progressValue)) {
        setProgress(progressValue);
      }
    });

    // Recibir el nombre del archivo generado y preparar la descarga
    es.addEventListener("filename", (e) => {
      const filename = (e as MessageEvent).data as string;
      console.log(filename);
      
      if (filename) setReportFileName(filename);
    });

    es.addEventListener("done", () => {
      // Scan completed
      es.close();
      eventSrcRef.current = null;
      setIsScanning(false);
      handleOpenModal('success')
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
      handleClose()
      timerRef.current = null;
    }
    // Animar salida
    setShowScan(false);
    setTimeout(() => setOpenScan(false), 300);
  };

  const handleOpenModal = (type : 'success' | 'error') => {
    setModalType(type);
    handleShow()
  }

  // Auto scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logsHtml]);

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

  // Descargar automáticamente el reporte cuando llega el nombre del archivo
  useEffect(() => {
    const download = async (name: string) => {
      try {
        const res = await fetch(`/api/download?filename=${encodeURIComponent(name)}`);
        if (!res.ok) return;
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (e) {
        // Silenciar errores de descarga para no interrumpir el flujo
        console.error("No se pudo descargar el reporte:", e);
      }
    };

    if (reportFileName) {
      download(reportFileName);
    }
  }, [reportFileName]);

  return (
    <div className="bg-white rounded-xl w-[600px] flex flex-col">
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
          className={`px-3 py-3 rounded-lg transition-colors w-[11vw] text-sm font-semibold
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
          onClick={() => handleOpenModal('error')}
          className={`px-6 py-2 rounded-lg transition-colors w-[11vw] text-sm font-semibold
            ${
              stopDisabled
                ? "bg-red-200 text-white cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            }`}
        >
          DETENER
        </button>
      </div>
      {openScan &&
        <div 
          className={`mt-10 px-6 py-4 flex flex-col rounded-[16px] [box-shadow:0px_0px_16px_0px_rgba(0,51,102,0.25)] text-black transform transition-all duration-500 ease-out ${
            showScan 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-8 scale-100'
          }`}
          style={{
            transform: showScan ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.95)',
            opacity: showScan ? 1 : 0,
          }}
        >
          <div className="flex justify-between">
            <p className="text-start text-sm text-[#DF0D1B] font-semibold">{`${progress}% Completado`}</p>
            <div className="flex items-center text-xs text-[#8E9398] gap-0.5">
              <Clock3 size={10}/>
              <p>{`${Math.floor(elapsedTime / 60)} minutos`}</p>
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
            className="border border-gray-300 rounded-md h-56 overflow-auto bg-black text-[13px] text-white font-mono"
          >
            <pre
              className="whitespace-pre-wrap break-words leading-tight m-0 p-2"
              dangerouslySetInnerHTML={{ __html: logsHtml || "Salida del escaneo aparecerá aquí..." }}
            />
          </div>
        </div>
      }
        <Modal 
          isOpen={isOpen} 
          handleClose={handleClose}
          handleStop={handleStop} 
          modalType={modalType}
        />
    </div>
  );
}
