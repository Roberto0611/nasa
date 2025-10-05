import { Toaster as Sonner } from "sonner"
import type { ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      visibleToasts={3}  // Máximo 3 notificaciones visibles
      toastOptions={{
        style: {
          zIndex: 9999,
        },
        duration: 3000,  // 3 segundos de duración por defecto
      }}
      {...props}
    />
  )
}

export { Toaster }
