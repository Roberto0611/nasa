// MeteroidContext.tsx - Contexto global para manejo de estado del meteorito
// Permite sincronización en tiempo real entre formulario y visualización 3D

import React, { createContext, useContext, useState } from 'react'

/**
 * Interfaz que define la estructura de datos del meteorito
 * Estos valores controlan tanto el formulario como la visualización 3D
 */
interface MeteroidData {
    radiusMeteroid: number  // Radio del meteorito en metros (afecta tamaño 3D)
    velocity: number        // Velocidad en m/s (afecta rotación del planeta)
    angle: number          // Ángulo de entrada 0-90° (para cálculos físicos)
    material: 'rock' | 'iron' | 'nickel'  // Material (afecta color y propiedades físicas)
}

/**
 * Coordenadas geográficas (lat, lng)
 */
type LatLng = [number, number]

/**
 * Interfaz del contexto que expone el estado y métodos de actualización
 */
interface MeteroidContextType {
    meteroidData: MeteroidData           // Estado actual del meteorito
    updateMeteroidData: (data: Partial<MeteroidData>) => void  // Función para actualizar parcialmente
    // Location for map (lat, lng) and setter
    location: LatLng
    setLocation: (loc: LatLng) => void
}

// Creación del contexto con valor inicial undefined
const MeteroidContext = createContext<MeteroidContextType | undefined>(undefined)

/**
 * Hook personalizado para acceder al contexto del meteorito
 * 
 * @returns {MeteroidContextType} Estado y métodos del meteorito
 * @throws {Error} Si se usa fuera del MeteroidProvider
 */
export const useMeteroidContext = () => {
    const context = useContext(MeteroidContext)
    if (!context) {
        throw new Error('useMeteroidContext must be used within a MeteroidProvider')
    }
    return context
}

/**
 * Props para el componente Provider
 */
interface MeteroidProviderProps {
    children: React.ReactNode  // Componentes hijos que tendrán acceso al contexto
}

/**
 * Proveedor del contexto de meteorito
 * 
 * Funcionalidades:
 * - Mantiene el estado global del meteorito
 * - Proporciona función de actualización parcial
 * - Valores iniciales en 0 (sin defaults)
 * 
 * @param {MeteroidProviderProps} props - Props con children
 * @returns {JSX.Element} Provider envolviendo los children
 */
export const MeteroidProvider: React.FC<MeteroidProviderProps> = ({ children }) => {
    // Estado inicial del meteorito - todos los valores en 0 para empezar sin configuración
    const [meteroidData, setMeteroidData] = useState<MeteroidData>({
        radiusMeteroid: 0,    // Sin tamaño inicial - planeta será mínimo
        velocity: 0,          // Sin velocidad - planeta no rotará
        angle: 0,            // Sin ángulo - valor neutro
        material: 'rock'     // Material por defecto - rock (más común)
    })

    // Estado global para la ubicación del mapa (lat, lng)
    const [location, setLocation] = useState<LatLng>([26.915093, -101.430703])

    /**
     * Función para actualizar parcialmente los datos del meteorito
     * Permite actualizar solo los campos que cambiaron sin afectar otros
     * 
     * @param {Partial<MeteroidData>} data - Datos parciales a actualizar
     */
    const updateMeteroidData = (data: Partial<MeteroidData>) => {
        setMeteroidData(prev => ({ ...prev, ...data }))
    }

    const updateLocation = (loc: LatLng) => {
        setLocation(loc)
    }

    return (
        <MeteroidContext.Provider value={{ meteroidData, updateMeteroidData, location, setLocation: updateLocation }}>
            {children}
        </MeteroidContext.Provider>
    )
}