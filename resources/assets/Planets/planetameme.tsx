import React from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'

import ethiel from "../textures/WhatsApp-Image-2025-09-27-at-9.14.44-PM.jpg"
import ethiel2 from "../textures/Ethiel2.jpg"

import * as THREE from 'three'
import { PerspectiveCamera } from '@react-three/drei'

function PlanetaMeme() {

    const [colorMap, normalMap, specularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
        ethiel
    ])

    const earthRef = React.useRef<THREE.Mesh>(null!)
    const cloudsRef = React.useRef<THREE.Mesh>(null!)

    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime()
        earthRef.current.rotation.y = elapsedTime / 2
        cloudsRef.current.rotation.y = elapsedTime / 2
    })



    return (
        <>

            <pointLight color="#ebe0c1ff" position={[2, 0, 5]} intensity={12} />
            <Stars
                radius={300}
                depth={60}
                count={10000}
                factor={7}
                saturation={0}
                fade={true}
            />

            <PerspectiveCamera makeDefault position={[-.5, 0, 6]} />



            <mesh ref={cloudsRef} position={[0, 0, 2]} rotation={[0, 0, -.3]} >
                <sphereGeometry args={[1.005, 32, 32]} />
                <meshPhongMaterial
                    map={cloudsMap}
                    opacity={0.4}
                    depthWrite={true}
                    transparent={true}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <mesh ref={earthRef} position={[0, 0, 3]} rotation={[0, 0, -.1]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshPhongMaterial
                    specularMap={specularMap}
                />
                <meshStandardMaterial
                    map={colorMap}
                    normalMap={normalMap}
                    metalness={0.4}
                    roughness={0.7}
                />
                {/*<OrbitControls
                    enableRotate={true}
                    zoomSpeed={.6}
                    panSpeed={0.5}
                    rotateSpeed={0.4}
                    target={[0, 0, 0]} />
                */}

            </mesh>
        </>

    )
}

export default PlanetaMeme
// src/earth.tsx
