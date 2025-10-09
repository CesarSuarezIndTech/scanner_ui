"use client";

import { useState } from "react";
import Image from "next/image";

export default function ScannerForm() {
  const [target, setTarget] = useState("");

  const isDisabled = target.trim() === "";

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
        className="border rounded-lg px-4 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-[#003366]"
      />

      <div className="flex flex-row justify-center gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="scanMode"
            value="quick"
            defaultChecked
            className="text-[#003366] focus:ring-[#003366] cursor-pointer"
          />
          <span className="text-gray-700 text-sm">Escaneo rápido</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="scanMode"
            value="full"
            className="text-[#003366] focus:ring-[#003366] cursor-pointer"
          />
          <span className="text-gray-700 text-sm">Escaneo completo</span>
        </label>
      </div>

      <div className="flex justify-center gap-4">
        <button
          disabled={isDisabled}
          className={`px-6 py-2 rounded-lg transition-colors 
            ${
              isDisabled
                ? "bg-[#7a94ad] text-white cursor-not-allowed"
                : "bg-[#003366] text-white hover:bg-[#002850] cursor-pointer"
            }`}
        >
          INICIAR ESCANEO
        </button>

        <button
          disabled={isDisabled}
          className={`px-6 py-2 rounded-lg transition-colors 
            ${
              isDisabled
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            }`}
        >
          DETENER
        </button>
      </div>
    </div>
  );
}
