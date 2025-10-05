import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import axios from 'axios'
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
    LayersControl,
    LayerGroup,
    useMap
} from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import L from 'leaflet'

import { useMeteroidContext } from "../../context/MeteroidContext"

const center = {
    lat: 26.915093,
    lng: -101.430703,
}

function DraggableMarker() {
    const { location, setLocation } = useMeteroidContext()
    const [draggable, setDraggable] = useState(false)
    // position stored as { lat, lng }
    const [position, setPosition] = useState<{ lat: number; lng: number }>({ lat: center.lat, lng: center.lng })
    const markerRef = useRef<L.Marker>(null)
    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current
                if (marker != null) {
                    const ll = marker.getLatLng()
                    // update local position and global location
                    setPosition({ lat: ll.lat, lng: ll.lng })
                    setLocation?.([ll.lat, ll.lng])
                }
            },
        }),
        [setLocation],
    )
    const toggleDraggable = useCallback(() => {
        setDraggable((d) => !d)
    }, [])

    // Keep local marker position in sync with context.location
    useEffect(() => {
        if (Array.isArray(location) && location.length === 2) {
            const [lat, lng] = location
            // Only update if different to avoid jitter
            if (lat !== position.lat || lng !== position.lng) {
                setPosition({ lat, lng })
                // if marker ref exists, move it immediately
                const marker = markerRef.current
                if (marker && (marker as any).setLatLng) {
                    ; (marker as any).setLatLng({ lat, lng })
                }
            }
        }
    }, [location])

    return (
        <Marker
            draggable={draggable}
            eventHandlers={eventHandlers}
            position={[position.lat, position.lng]}
            ref={markerRef}>
            <Popup minWidth={90}>
                <span onClick={toggleDraggable}>
                    {draggable
                        ? 'Marker is draggable'
                        : 'Click here to make marker draggable'}
                </span>
            </Popup>
        </Marker>
    )
}

// Componente para la animación de impacto
function ImpactAnimation({ center, isActive }: { center: [number, number], isActive: boolean }) {
    const map = useMap()
    const [showFlash, setShowFlash] = useState(false)
    const [shockwaveRadius, setShockwaveRadius] = useState(0)
    const [particles, setParticles] = useState<Array<{ id: number, angle: number, distance: number }>>([])
    const [countdown, setCountdown] = useState(3)
    const [impactStarted, setImpactStarted] = useState(false)

    useEffect(() => {
        if (!isActive) return

        // Countdown antes del impacto
        let countdownInterval: NodeJS.Timeout
        if (countdown > 0) {
            countdownInterval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval)
                        setImpactStarted(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => {
            if (countdownInterval) clearInterval(countdownInterval)
        }
    }, [isActive, countdown])

    useEffect(() => {
        if (!impactStarted) return

        // 1. Flash inicial
        setShowFlash(true)
        
        // 2. Zoom dramático al punto de impacto
        map.flyTo(center, 13, {
            duration: 1.5,
            easeLinearity: 0.25
        })

        // 3. Generar partículas
        const particleCount = 40
        const newParticles = Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            angle: (360 / particleCount) * i,
            distance: 0
        }))
        setParticles(newParticles)

        // 4. Animación de onda expansiva
        let frame = 0
        const maxFrames = 120
        const animateShockwave = () => {
            frame++
            if (frame <= maxFrames) {
                setShockwaveRadius(frame * 50) // Expandir 50m por frame
                
                // Expandir partículas
                setParticles(prev => prev.map(p => ({
                    ...p,
                    distance: frame * 25 // Partículas se alejan
                })))
                
                requestAnimationFrame(animateShockwave)
            } else {
                // Limpiar animación
                setShockwaveRadius(0)
                setParticles([])
            }
        }

        // Quitar flash después de 400ms
        setTimeout(() => setShowFlash(false), 400)
        
        // Iniciar animación de onda
        setTimeout(() => requestAnimationFrame(animateShockwave), 300)

        return () => {
            setShowFlash(false)
            setShockwaveRadius(0)
            setParticles([])
        }
    }, [impactStarted, center, map])

    if (!isActive) return null

    return (
        <>
            {/* Countdown */}
            {countdown > 0 && !impactStarted && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10001,
                        pointerEvents: 'none',
                        fontSize: '120px',
                        fontWeight: 'bold',
                        color: '#ffff00',
                        textShadow: '0 0 30px rgba(255, 255, 0, 1), 0 0 60px rgba(255, 200, 0, 0.8)',
                        animation: 'pulse 0.5s ease-in-out infinite'
                    }}
                >
                    {countdown}
                </div>
            )}

            {/* Flash de impacto */}
            {showFlash && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 200, 100, 0.9)',
                        zIndex: 9999,
                        pointerEvents: 'none',
                        animation: 'flash 0.4s ease-out'
                    }}
                />
            )}

            {/* Ondas expansivas múltiples */}
            {shockwaveRadius > 0 && (
                <>
                    <Circle
                        center={center}
                        radius={shockwaveRadius}
                        pathOptions={{
                            color: '#ff6600',
                            fillColor: 'transparent',
                            weight: 5,
                            opacity: Math.max(0, 1 - (shockwaveRadius / 6000))
                        }}
                    />
                    <Circle
                        center={center}
                        radius={shockwaveRadius * 0.75}
                        pathOptions={{
                            color: '#ff3300',
                            fillColor: 'transparent',
                            weight: 4,
                            opacity: Math.max(0, 1 - (shockwaveRadius / 6000))
                        }}
                    />
                    <Circle
                        center={center}
                        radius={shockwaveRadius * 0.5}
                        pathOptions={{
                            color: '#ffff00',
                            fillColor: 'transparent',
                            weight: 3,
                            opacity: Math.max(0, 1 - (shockwaveRadius / 6000))
                        }}
                    />
                    <Circle
                        center={center}
                        radius={shockwaveRadius * 0.25}
                        pathOptions={{
                            color: '#ffffff',
                            fillColor: 'transparent',
                            weight: 2,
                            opacity: Math.max(0, 1 - (shockwaveRadius / 6000))
                        }}
                    />
                </>
            )}

            {/* Partículas/escombros */}
            {particles.map(particle => {
                if (particle.distance === 0) return null
                
                const lat = center[0] + (particle.distance * Math.cos(particle.angle * Math.PI / 180)) / 111000
                const lng = center[1] + (particle.distance * Math.sin(particle.angle * Math.PI / 180)) / (111000 * Math.cos(center[0] * Math.PI / 180))
                
                return (
                    <Circle
                        key={particle.id}
                        center={[lat, lng]}
                        radius={15}
                        pathOptions={{
                            color: '#ff4444',
                            fillColor: '#ff8800',
                            fillOpacity: Math.max(0, 1 - (particle.distance / 2500)),
                            weight: 1,
                            opacity: Math.max(0, 0.8 - (particle.distance / 2500))
                        }}
                    />
                )
            })}
        </>
    )
}


const MapPage = () => {
    // Leer datos del contexto
    const { location, isSimulating, craterRadius } = useMeteroidContext()
    
    // Estado para controlar la animación (se activa una vez al inicio de isSimulating)
    const [showAnimation, setShowAnimation] = useState(false)
    const [hasAnimated, setHasAnimated] = useState(false)
    
    // Usar el radio del cráter del contexto o valor por defecto
    const radiusEnergy = craterRadius || 100000

    // Opciones de estilo para los círculos
    const redOptions = { color: 'red', fillColor: 'red', fillOpacity: 0.2 }
    const blackOptions = { color: 'black', fillColor: 'black', fillOpacity: 0.3 }
    const purpleOptions = { color: 'purple', fillColor: 'purple', fillOpacity: 0.1 }

    const mapRef = useRef(null);

    // Impact center: use selected location if available, otherwise fallback to default center
    const impactCenter: [number, number] = Array.isArray(location) && location.length === 2
        ? [location[0], location[1]]
        : [center.lat, center.lng]

    // Activar animación cuando isSimulating cambia a true
    useEffect(() => {
        if (isSimulating && !hasAnimated) {
            setShowAnimation(true)
            setHasAnimated(true)
            
            // Desactivar animación después de completarse
            setTimeout(() => {
                setShowAnimation(false)
            }, 6000) // 6 segundos de animación total
        }
        
        // Reset cuando se desactiva la simulación
        if (!isSimulating) {
            setShowAnimation(false)
            setHasAnimated(false)
        }
    }, [isSimulating, hasAnimated])

    // Cuando location cambie, hacer flyTo en el mapa
    useEffect(() => {
        if (!mapRef.current) return
        // mapRef.current es una instancia de Map (Leaflet)
        const map = (mapRef.current as any)?.leafletElement || (mapRef.current as any)
        if (map && Array.isArray(location) && location.length === 2) {
            try {
                map.flyTo([location[0], location[1]], 8, { animate: true })
            } catch (e) {
                // Fallback: try setView
                map.setView([location[0], location[1]], 8)
            }
        }
    }, [location])

    return (
        <div style={{ display: "flex", height: "100vh", width: "100%", position: "relative" }}>
            {/* Estilos CSS para la animación de flash */}
            <style>
                {`
                    @keyframes flash {
                        0% { opacity: 0; }
                        50% { opacity: 1; }
                        100% { opacity: 0; }
                    }
                    
                    @keyframes shake {
                        0%, 100% { transform: translate(0, 0); }
                        10%, 30%, 50%, 70%, 90% { transform: translate(-5px, 5px); }
                        20%, 40%, 60%, 80% { transform: translate(5px, -5px); }
                    }
                    
                    @keyframes pulse {
                        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
                    }
                    
                    @keyframes slideDown {
                        0% { transform: translate(-50%, -200%); opacity: 0; }
                        100% { transform: translate(-50%, -50%); opacity: 1; }
                    }
                `}
            </style>

            {/* Overlay de alerta de impacto */}
            {showAnimation && (
                <div
                    style={{
                        position: 'absolute',
                        top: '20%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10000,
                        pointerEvents: 'none',
                        animation: 'slideDown 1s ease-out, shake 0.5s ease-in-out 1s',
                        fontSize: '42px',
                        fontWeight: 'bold',
                        color: '#ff0000',
                        textShadow: '0 0 20px rgba(255, 0, 0, 0.8), 0 0 40px rgba(255, 100, 0, 0.6)',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        padding: '20px 40px',
                        borderRadius: '10px',
                        border: '3px solid #ff0000',
                        textAlign: 'center'
                    }}
                >
                    ⚠️ METEORITE IMPACT ⚠️
                    <div style={{ fontSize: '18px', marginTop: '10px', color: '#ffff00' }}>
                        INITIATING SIMULATION
                    </div>
                </div>
            )}

            <MapContainer
                center={[26.915093, -101.430703]}
                zoom={13}
                ref={mapRef}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Animación de impacto */}
                <ImpactAnimation center={impactCenter} isActive={showAnimation} />

                {/* Solo mostrar círculos de impacto si isSimulating es true */}
                {isSimulating && (
                    <LayersControl position="topleft">
                        <LayersControl.Overlay checked name="Zona de impacto calculada">
                            <Circle
                                center={impactCenter}
                                pathOptions={purpleOptions}
                                radius={radiusEnergy * 2}
                                bubblingMouseEvents={false}
                            >
                                <Popup>Radio de impacto calculado: {(radiusEnergy * 2).toFixed(0)} metros</Popup>
                            </Circle>
                        </LayersControl.Overlay>

                        <LayersControl.Overlay checked name="Zona de destrucción severa">
                            <Circle
                                center={impactCenter}
                                pathOptions={redOptions}
                                radius={radiusEnergy}
                                bubblingMouseEvents={false}
                            >
                                <Popup>Zona de destrucción severa: {(radiusEnergy).toFixed(0)} metros</Popup>
                            </Circle>
                        </LayersControl.Overlay>

                        <LayersControl.Overlay checked name="Epicentro del impacto">
                            <LayerGroup>
                                <Circle
                                    center={impactCenter}
                                    pathOptions={blackOptions}
                                    radius={radiusEnergy / 2}
                                    bubblingMouseEvents={false}
                                >
                                    <Popup>Epicentro: {(radiusEnergy / 2).toFixed(0)} metros</Popup>
                                </Circle>
                                <DraggableMarker />
                            </LayerGroup>
                        </LayersControl.Overlay>
                    </LayersControl>
                )}

                {/* Marcador siempre visible */}
                {!isSimulating && <DraggableMarker />}
            </MapContainer>
        </div>
    )
}
export default MapPage
