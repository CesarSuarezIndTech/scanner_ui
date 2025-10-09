import Image from "next/image";
export default function ScannerForm() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md w-[600px]">
        <Image src={'images/ci2-logo.svg'} alt="Logo" className="w-32 h-32 mx-auto mb-4" width={80} height={80} />
      <h2 className="text-2xl font-semibold text-[#003366]  mb-4">
        <div className="flex flex-row gap-2 mt-6">
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                type="radio"
                name="scanMode"
                value="quick"
                defaultChecked
                className="text-[#003366] focus:ring-[#003366] cursor-pointer"
                />
                <span className="text-gray-700 font-medium">Escaneo rápido</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                type="radio"
                name="scanMode"
                value="full"
                className="text-[#003366] focus:ring-[#003366] cursor-pointer"
                />
                <span className="text-gray-700 font-medium">Escaneo completo</span>
            </label>
            </div>
        Ingresa Dominio/IP
      </h2>
      <input
        type="text"
        placeholder="Escribe el Domino o IP"
        className="border rounded-lg px-4 py-2 w-full mb-4"
      />
      <div className="flex gap-4">
        <button className="bg-[#003366] text-white px-6 py-2 rounded-lg hover:bg-[#003366] cursor-pointer">
          INICIAR ESCANEO
        </button>
        <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 cursor-pointer">
          DETENER
        </button>
      </div>
    </div>
  );
}
