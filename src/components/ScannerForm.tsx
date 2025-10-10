"use client";

import { useState } from "react";
import Image from "next/image";

export default function ScannerForm() {
  const [target, setTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const isValidInput =
    /^(?:\d{1,3}\.){3}\d{1,3}$|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(target);

  const startDisabled = !isValidInput || isScanning;
  const stopDisabled = !isScanning;

  const handleStart = () => {
    setIsScanning(true);
    console.log(`Escaneo iniciado para: ${target}`);
    // Conectar backend con fetch()
  };

  const handleStop = () => {
    setIsScanning(false);
    console.log("Escaneo detenido");
    // Cancelar la petición al backend
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md w-[600px]">
      <Image
        src={"/images/ci2-logo.svg"}
        alt="Logo"
        className="w-32 h-32 mx-auto mb-4"
        width={80}
        height={80}
      />
      <h2 className="text-2xl font-semibold text-[#003366] mb-4 text-center">
        Ingresa Dominio/IP
      </h2>

      <input
        type="text"
        placeholder="Escribe el Dominio o IP"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        disabled={isScanning}
        className={`border rounded-lg px-4 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-[#003366] 
          ${isScanning ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />

      <div className="flex flex-row justify-center gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="scanMode"
            value="quick"
            defaultChecked
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

      {isScanning && (
        <p className="text-center text-sm text-[#003366] mt-4 animate-pulse">
          Escaneando {target}...
        </p>
      )}
    </div>
  );
}
