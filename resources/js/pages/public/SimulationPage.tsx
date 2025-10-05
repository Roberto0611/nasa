// SimulationPage.tsx - Página principal del simulador de meteoritos
// Combina el formulario de configuración con la visualización 3D en tiempo real

import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'  // Contenedor 3D de React Three Fiber
import { Suspense } from 'react'  // Componente para carga diferida
import PersonalizablePlanet from '../../../assets/Planets/personalizableplanet'  // Planeta 3D
import FormMeteroid from '../../components/selectmeteroidform'  // Formulario de configuración
import MapPage from './map.page'
import FormTesting from '@/components/formtesting'
import { MeteroidProvider, useMeteroidContext } from '../../context/MeteroidContext'  // Proveedor del contexto
import { Toaster } from '@/components/sonner'  // Sistema de notificaciones toast

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
 * Página del simulador de meteoritos
 * 
 * Layout de pantalla dividida:
 * - Panel izquierdo (420px): Formulario de configuración del meteorito
 * - Panel derecho (flexible): Visualización 3D del planeta personalizable
 * 
 * Funcionalidades:
 * - Configuración en tiempo real de parámetros del meteorito
 * - Visualización 3D que responde a cambios del formulario
 * - Interfaz intuitiva con controles de cámara
 * - Sistema de carga diferida para optimizar rendimiento
 */
const SimulationPage = () => {
    // Estado para controlar qué sección mostrar
    const [activeSection, setActiveSection] = useState<'simulation' | 'analysis'>('simulation')

    return (
        <MeteroidProvider>
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
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
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
            </Suspense>
            <Toaster />
        </MeteroidProvider>
    )
}

export default SimulationPage

