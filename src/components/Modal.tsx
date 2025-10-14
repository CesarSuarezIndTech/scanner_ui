import React from 'react'
import { CircleCheckBig } from 'lucide-react'

type ModalProps = {
  isOpen: boolean;
  handleClose: () => void;
}

export const Modal = ({ isOpen, handleClose } : ModalProps) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
          <div className="bg-white p-10 rounded-2xl border-1 border-[#003366] shadow-lg w-130">
            <section className="Modal flex flex-col items-center text-black">
              <CircleCheckBig size={70} className="text-green-500 mb-3" />
              <div className="flex flex-col items-center">
                <p className="text-xl font-semibold">Escaneo Finalizado</p>
                <p>Tu informe ha sido generado y descargado</p>
              </div>
              <button
                onClick={handleClose}
                className="bg-[#003366] text-white w-32 h-10 rounded-sm mt-4"
              >
                Aceptar
              </button>
            </section>
          </div>
        </div>
      )}
    </>
  );
};
