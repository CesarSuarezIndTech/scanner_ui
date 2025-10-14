import { useState } from 'react'

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleShow = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)

  return { isOpen, handleShow, handleClose }
}
