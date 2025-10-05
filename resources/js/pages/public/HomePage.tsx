// HomePage.tsx - Página principal de la aplicación
// Muestra una introducción visual con la Tierra en 3D y navegación hacia el simulador

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'  // Contenedor 3D
import Earth from '../../../assets/Planets/earth'  // Componente de la Tierra con texturas reales
import { LoginForm } from '../../components/menu'  // Componente de navegación/menú
import { Toaster } from '@/components/sonner'  // Sistema de notificaciones toast
/**
 * Página principal de la aplicación
 * 
 * Propósito:
 * - Introducción visual impactante con la Tierra en 3D
 * - Punto de entrada para acceder al simulador
 * - Demostración de capacidades 3D de la aplicación
 * 
 * Layout:
 * - Panel izquierdo: Menú de navegación con botón "Start"
 * - Panel derecho: Tierra 3D con texturas realistas de 8K
 * 
 * Características técnicas:
 * - Carga diferida con Suspense para optimizar rendimiento
 * - Texturas de alta resolución que se cargan progresivamente
 * - Fondo espacial negro para ambiente realista
 */
const HomePage = () => {

    return (
        // Suspense para manejo de carga de componentes 3D
        <Suspense fallback={null}>
            {/* Contenedor principal de pantalla completa */}
            <div style={{
                width: '100vw',      // Ancho completo del viewport
                height: '100vh',     // Alto completo del viewport
                display: 'flex',     // Layout flexbox horizontal
                background: 'black', // Fondo negro espacial
            }}>

                {/* Panel izquierdo - Menú de navegación */}
                <div style={{
                    width: '420px',              // Ancho fijo para consistencia con SimulationPage
                    padding: '20px',             // Espaciado interno
                    boxSizing: 'border-box',     // Incluir padding en width
                    backgroundColor: 'white',    // Fondo blanco para contraste
                    display: 'flex',             // Flex para centrar contenido
                    justifyContent: 'center',    // Centrar horizontalmente
                    alignItems: 'center'         // Centrar verticalmente
                }}>
                    {/* Componente de menú con botón para ir a simulación */}
                    <LoginForm />
                </div>

                {/* Panel derecho - Tierra 3D */}
                <div style={{
                    flex: 1,           // Tomar espacio restante
                    height: '100%',    // Alto completo
                    width: '600px'     // Width mínimo
                }}>
                    {/* Canvas 3D para renderizado de la Tierra */}
                    <Canvas>
                        {/* Suspense anidado para carga de texturas de la Tierra */}
                        <Suspense fallback={null}>
                            {/* Tierra con texturas reales de 8K y animación de rotación */}
                            <Earth />
                        </Suspense>
                    </Canvas>
                </div>

            </div>
            <Toaster />
        </Suspense>
    )
}

export default HomePage
