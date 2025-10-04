// PersonalizablePlanet.tsx - Planeta 3D que se actualiza en tiempo real según el formulario

import React from 'react'
import { useFrame } from '@react-three/fiber'  // Hook para animaciones 3D
import { OrbitControls, Stars } from '@react-three/drei'  // Controles de cámara y efectos
import * as THREE from 'three'  // Biblioteca Three.js para 3D
import { PerspectiveCamera } from '@react-three/drei'  // Cámara 3D

/**
 * Interfaz de datos del meteorito
 */
interface MeteroidData {
    radiusMeteroid: number
    velocity: number
    angle: number
    material: 'rock' | 'iron' | 'nickel'
}

/**
 * Props del componente
 */
interface PersonalizablePlanetProps {
    meteroidData: MeteroidData
}

/**
 * Componente de planeta personalizable que responde a cambios del formulario
 * 
 * Características dinámicas:
 * - Tamaño: Controlado por radiusMeteroid
 * - Velocidad de rotación: Basada en velocity del meteorito
 * - Color y material: Según el tipo de material seleccionado
 * - Propiedades físicas: Metalness y roughness variables
 */
function PersonalizablePlanet({ meteroidData }: PersonalizablePlanetProps) {
    // Referencia al mesh del planeta para poder animarlo
    const earthRef = React.useRef<THREE.Mesh>(null!)

    /**
     * Función que mapea el tipo de material a un color hexadecimal
     * También define las características visuales de cada material
     * 
     * @param {string} material - Tipo de material ('rock', 'iron', 'nickel')
     * @returns {string} Color hexadecimal correspondiente
     */
    const getMaterialColor = (material: string) => {
        switch (material) {
            case 'iron':
                return '#8B7355'  // Marrón dorado - hierro oxidado
            case 'nickel':
                return '#C0C0C0'  // Plateado - metal brillante
            case 'rock':
            default:
                return '#8B4513'  // Marrón tierra - roca sedimentaria
        }
    }

    /**
     * Función para escalar visualmente el radio del meteorito
     * Escala logarítmica para que todos los tamaños sean visibles y manejables
     * 
     * @param {number} realRadius - Radio real en metros del meteorito
     * @returns {number} Radio escalado para visualización 3D
     */
    const getVisualRadius = (realRadius: number) => {
        if (realRadius <= 0) return 0.15  // Radio mínimo para visibilidad

        // Escala logarítmica amigable para el usuario:
        // - 1m → 0.3 visual (pequeño pero visible)
        // - 10m → 0.6 visual (mediano)
        // - 100m → 0.9 visual (grande)
        // - 1,000m → 1.2 visual (muy grande)
        // - 10,000m → 1.5 visual (enorme)
        // - 15,000m → 1.6 visual (máximo práctico)

        const baseSize = 0.15  // Tamaño base mínimo
        const logScale = Math.log10(realRadius + 1) * 0.4  // Factor logarítmico suave
        const visualRadius = baseSize + logScale

        // Límite máximo de 2.5 para que siempre quepa bien en cámara
        // Pero permite ver diferencias hasta meteoritos de 15,000m+
        return Math.min(visualRadius, 2.5)
    }

    /**
     * Calcular velocidad de rotación basada en la velocidad del meteorito
     * - Si velocity > 0: Escala la velocidad (divide por 10000 para valores manejables)
     * - Si velocity = 0: No rota (velocidad 0)
     * - Velocidad mínima: 0.1 para evitar rotación demasiado lenta
     */
    const rotationSpeed = meteroidData.velocity > 0 ? Math.max(meteroidData.velocity / 10, 0.1) : 0

    /**
     * Hook de animación que se ejecuta en cada frame
     * Controla la rotación continua del planeta en el eje Y
     * 
     * @param {object} state - Estado del frame con clock para tiempo transcurrido
     */
    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime()  // Tiempo en segundos desde el inicio
        if (earthRef.current) {
            // Aplicar rotación basada en el tiempo y la velocidad calculada
            earthRef.current.rotation.y = elapsedTime * rotationSpeed
        }
    })


    return (
        <>
            {/* Iluminación del planeta - simula luz solar */}

            <pointLight color="#ebe0c1ff" position={[2, 0, 5]} intensity={12} />
            {/* Campo de estrellas de fondo para ambiente espacial */}
            <Stars
                radius={300}    // Radio del campo de estrellas
                depth={60}      // Profundidad del campo (distribución en Z)
                count={10000}   // Número total de estrellas
                factor={7}      // Tamaño de las estrellas
                saturation={0}  // Saturación del color (0 = blanco)
                fade={true}     // Efecto de fade en las estrellas distantes
            />

            {/* Cámara principal con perspectiva */}
            <PerspectiveCamera
                makeDefault           // Establecer como cámara principal
                position={[-.5, 0, 6]} // Posición: ligeramente a la izquierda, centrada, alejada
            />

            {/* Mesh principal del planeta - geometría + material */}
            <mesh
                ref={earthRef}              // Referencia para animación
                position={[0, 0, 3]}        // Posición en el espacio 3D
                rotation={[0, 0, -.3]}      // Rotación inicial (leve inclinación)
            >
                {/* Geometría esférica del planeta */}
                <sphereGeometry
                    args={[
                        // Radio: usa función de escalado visual para mantener proporciones apropiadas
                        getVisualRadius(meteroidData.radiusMeteroid),
                        10,  // Segmentos horizontales (resolución)
                        10   // Segmentos verticales (resolución)

                    ]}
                />

                {/* Material del planeta - cambia según el tipo seleccionado */}
                <meshStandardMaterial
                    color={getMaterialColor(meteroidData.material)}  // Color basado en material

                    // Metalness: qué tan metálico se ve el material
                    // Hierro y níquel son más metálicos (0.8), roca menos (0.2)
                    metalness={meteroidData.material === 'iron' || meteroidData.material === 'nickel' ? 0.8 : 0.2}

                    // Roughness: qué tan rugosa es la superficie
                    // Roca es muy rugosa (0.9), metales son más lisos (0.3)
                    roughness={meteroidData.material === 'rock' ? 0.9 : 0.3}
                />

                {/* Controles de órbita para interacción del usuario */}
                <OrbitControls
                    enableRotate={true}    // Permitir rotación con mouse
                    zoomSpeed={.6}         // Velocidad del zoom
                    panSpeed={0.5}         // Velocidad del paneo
                    rotateSpeed={0.4}      // Velocidad de rotación manual
                    target={[0, 0, 0]}     // Punto focal de los controles
                />
            </mesh>
        </>
    )
}

export default PersonalizablePlanet
