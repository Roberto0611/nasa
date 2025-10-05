import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import axios from 'axios'
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
    LayersControl,
    LayerGroup
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


const MapPage = () => {
    // Leer datos del contexto
    const { location, isSimulating, craterRadius } = useMeteroidContext()
    
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
        <div style={{ display: "flex", height: "100vh", width: "100%" }}>
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
