import React from 'react'
import { CircleCheckBig, Info } from 'lucide-react'

type ModalProps = {
  isOpen: boolean;
  handleClose: () => void;
  handleStop: () => void;
  modalType: 'success' | 'error';
}

interface ErrorModalProps {
  handleClose: () => void;
  handleStop: () => void;
}

export const Modal = (modalProps : ModalProps) => {
  const { isOpen, handleClose, handleStop, modalType } = modalProps;
  const typeList = {
    success: <SuccessModal handleClose={handleClose}/>,
    error: <ErrorModal handleClose={handleClose} handleStop={handleStop}/>
  }
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
          <div className="bg-white p-10 rounded-2xl border-1 border-[#003366] shadow-lg w-130">
            {typeList[modalType]}
          </div>
        </div>
      )}
    </>
  );
};

const SuccessModal = ({ handleClose } : { handleClose: () => void }) => {
  return (
  <section className="Modal flex flex-col items-center text-black">
    <CircleCheckBig size={70} className="text-green-500 mb-3" />
    <div className="flex flex-col items-center">
      <p className="text-xl font-semibold">Escaneo Finalizado</p>
      <p>Tu informe ha sido generado y descargado</p>
    </div>
    <button
      onClick={handleClose}
      className="bg-[#003366] text-white cursor-pointer w-32 h-10 rounded-sm mt-4"
    >
      Aceptar
    </button>
  </section>
  )
}

const ErrorModal = (errorModalProps : ErrorModalProps) => {
  const { handleClose, handleStop } = errorModalProps;
  return (
  <section className="Modal flex flex-col items-center text-black">
    <Info size={40} className="text-[#DF650D] mb-3" />
    <div className="flex flex-col text-center">
      <p className="text-xl font-semibold">¿Está seguro de detener el escaneo?</p>
      <p>Detener el escaneo cancelará el proceso actual y no se generará ningún informe</p>
    </div>
    <div className='flex gap-2'>
      <button
        onClick={handleStop}
        className="bg-[#DF0C1B] text-white cursor-pointe w-32 h-10 rounded-sm mt-4"
      >
        ACEPTAR
      </button>
      <button
        onClick={handleClose}
        className="border-2 border-[#003366] text-[#003366] cursor-pointe font-bold w-32 h-10 rounded-sm mt-4"
      >
        CANCELAR
      </button>
    </div>
  </section>
  )
}
