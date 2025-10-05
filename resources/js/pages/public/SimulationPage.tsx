// SimulationPage.tsx - Página principal del simulador de meteoritos
// Combina el formulario de configuración con la visualización 3D en tiempo real

import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'  // Contenedor 3D de React Three Fiber
import { Suspense } from 'react'  // Componente para carga diferida
import PersonalizablePlanet from '../../../assets/Planets/personalizableplanet'  // Planeta 3D
import FormMeteroid from '../../components/selectmeteroidform'  // Formulario de configuración
import MapPage from './map.page'
import FormTesting from '@/components/formtesting'
import { MeteroidProvider, useMeteroidContext } from '../../context/MeteroidContext'  // Proveedor del contexto
import { Toaster } from '@/components/sonner'  // Sistema de notificaciones toast
import FloatingChat from '../../components/FloatingChat'  // Chat flotante de NASAbot
import ChatToggleButton from '../../components/ChatToggleButton'  // Botón para abrir/cerrar chat

/**
 * Componente wrapper que obtiene datos del contexto y los pasa al Canvas
 * Esto es necesario porque el Canvas de React Three Fiber crea su propio contexto
 */
const PlanetCanvasWrapper = () => {
    const { meteroidData } = useMeteroidContext()

    return (
        <Canvas>
            <Suspense fallback={null}>
                <PersonalizablePlanet meteroidData={meteroidData} />
            </Suspense>
        </Canvas>
    )
}

/**
 * Componente interno que tiene acceso al contexto para limpiar estados
 */
const SimulationPageContent = () => {
    // Estado para controlar qué sección mostrar
    const [activeSection, setActiveSection] = useState<'simulation' | 'analysis'>('simulation')
    
    // Estado para controlar el chat flotante
    const [isChatOpen, setIsChatOpen] = useState(false)
    
    // Acceso al contexto para limpiar estados
    const { setIsSimulating, setCraterRadius } = useMeteroidContext()

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen)
    }

    // Limpiar estados de simulación cuando se cambia de pestaña
    useEffect(() => {
        if (activeSection === 'simulation') {
            // Cuando volvemos a la pestaña de simulación, limpiar estados
            setIsSimulating(false)
            setCraterRadius(null)
        }
    }, [activeSection, setIsSimulating, setCraterRadius])

    return (
        <Suspense fallback={null}>
            {/* Botones de alternancia */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                display: 'flex',
                gap: '10px'
            }}>
                <button
                    onClick={() => setActiveSection('simulation')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeSection === 'simulation' ? '#007cba' : '#f0f0f0',
                        color: activeSection === 'simulation' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: activeSection === 'simulation' ? 'bold' : 'normal',
                        fontSize: '14px'
                    }}
                >
                    Create your own Meteorite
                </button>
                <button
                    onClick={() => setActiveSection('analysis')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeSection === 'analysis' ? '#007cba' : '#f0f0f0',
                        color: activeSection === 'analysis' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: activeSection === 'analysis' ? 'bold' : 'normal',
                        fontSize: '14px'
                    }}
                >
                    Simulation
                </button>
            </div>

            {/* Sección de Simulación 3D */}
            {activeSection === 'simulation' && (
                <div style={{
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    background: 'black',
                }}>
                    {/* Panel izquierdo - Formulario */}
                    <div style={{
                        width: '420px',
                        padding: '20px',
                        boxSizing: 'border-box',
                        backgroundColor: 'white',
                        color: 'black',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <FormMeteroid onActivateSimulation={() => setActiveSection('analysis')} />
                    </div>

                    {/* Panel derecho - Visualización 3D */}
                    <div style={{
                        flex: 1,
                        height: '100%',
                        width: '600px'
                    }}>
                        <PlanetCanvasWrapper />
                    </div>
                </div>
            )}

            {/* Sección de Análisis con Mapa */}
            {activeSection === 'analysis' && (
                <div style={{
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    background: 'white',
                }}>
                    {/* Panel izquierdo - Formulario */}
                    <div style={{
                        width: '420px',
                        padding: '20px',
                        boxSizing: 'border-box',
                        backgroundColor: 'white',
                        color: 'black',
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}>
                        <FormTesting />
                    </div>

                    {/* Panel derecho - Mapa */}
                    <div style={{
                        flex: 1,
                        height: '100%',
                        width: '100%'
                    }}>
                        <MapPage />
                    </div>
                </div>
            )}
            
            {/* Chat flotante de NASAbot */}
            <FloatingChat isOpen={isChatOpen} onToggle={toggleChat} />
            
            {/* Botón para abrir/cerrar el chat */}
            <ChatToggleButton isOpen={isChatOpen} onClick={toggleChat} />
            
            <Toaster />
        </Suspense>
    )
}

/**
 * Componente principal que envuelve todo con el Provider
 */
const SimulationPage = () => {
    return (
        <MeteroidProvider>
            <SimulationPageContent />
        </MeteroidProvider>
    )
}

export default SimulationPage

