// FormTesting.tsx - Formulario para simulación de impacto de meteoritos
// Carga datos desde Supabase y permite seleccionar ubicación en el mapa

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useMeteroidContext } from '../context/MeteroidContext'
import { Button } from "./ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./form"
import { toast } from 'sonner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./select"

// IDs de toasts para controlar duplicados
const TOAST_IDS = {
    LOADING: 'loading-toast',
    LOCATION: 'location-toast',
    SIMULATION: 'simulation-toast',
    SHARE: 'share-toast',
    DOWNLOAD: 'download-toast',
}
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip"
import { GraduationCap } from 'lucide-react'
import { duration } from 'node_modules/zod/v4/classic/iso.cjs'
import { Share2, MessageCircle, Instagram, Twitter, Facebook } from 'lucide-react'
import ImpactAnalysis from './ImpactAnalysis'

type MeteoriteRecord = {
    id?: number
    name: string
    radiusMeteroid?: number
    radius?: number  // Para manejar el campo 'radius' que viene de la BD
    velocity?: number
    angle?: number
    entry_angle?: number  // Para manejar el campo 'entry_angle' que viene de la BD
    material?: string
    lat?: number
    lng?: number
}

const FormTesting = () => {
    const { updateMeteroidData, setLocation, setSelectedMeteoriteId, setIsSimulating, setCraterRadius } = useMeteroidContext()
    const [nasaMeteoritesData, setNasaMeteoritesData] = useState<MeteoriteRecord[]>([])
    const [savedMeteoritesData, setSavedMeteoritesData] = useState<MeteoriteRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingMoreNasa, setLoadingMoreNasa] = useState(false)
    const [nasaCurrentPage, setNasaCurrentPage] = useState(0)
    const [nasaHasMore, setNasaHasMore] = useState(true)
    const [selectedNasaId, setSelectedNasaId] = useState<string | null>(null)
    const [selectedNasaName, setSelectedNasaName] = useState<string | null>(null)
    const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null)
    const [selectedSavedName, setSelectedSavedName] = useState<string | null>(null)
    const [impactData, setImpactData] = useState<any>(null) // Datos del impacto para mostrar
    const [showShareButtons, setShowShareButtons] = useState(false)
    const [showInstagramGuide, setShowInstagramGuide] = useState(false)
    const [showAIAnalysis, setShowAIAnalysis] = useState(false) // Mostrar análisis con IA

    const form = useForm<any>({
        defaultValues: {
            selectedNasaMeteorite: undefined,
            selectedSavedMeteorite: undefined,
            selectedCity: undefined,
        }
    })

    // Cargar meteoritos guardados y de NASA al montar el componente
    useEffect(() => {
        fetchNasaMeteoritesFromSupabase()
        fetchSavedMeteoritesFromSupabase()
    }, [])

    // Limpiar estados de impacto cuando se monta el componente (cambio de pestaña)
    useEffect(() => {
        // Limpiar los datos de impacto previos
        setImpactData(null)
        setIsSimulating(false)
        setCraterRadius(null)
        
        // Limpiar formulario
        form.reset({
            selectedNasaMeteorite: undefined,
            selectedSavedMeteorite: undefined,
            selectedCity: undefined,
        })
        
        // Limpiar selecciones
        setSelectedNasaId(null)
        setSelectedNasaName(null)
        setSelectedSavedId(null)
        setSelectedSavedName(null)
        setShowShareButtons(false)
        setShowInstagramGuide(false)
    }, [setIsSimulating, setCraterRadius, form])

    // Fetch NASA Meteorites from Laravel API - Cargar primera página
    const fetchNasaMeteoritesFromSupabase = async () => {
        setLoading(true)
        try {
            const response = await fetch('/getMeteoritesNames?page=0')

            if (!response.ok) {
                throw new Error('Failed to fetch NASA Meteorites')
            }

            const result = await response.json()
            const data = result.data || []
            const pagination = result.pagination || {}

            // Mapear los datos de NASA al formato que espera el componente
            const mappedData: MeteoriteRecord[] = data.map((item: any) => ({
                id: item.id,
                name: item.name,
            }))

            setNasaMeteoritesData(mappedData)
            setNasaCurrentPage(0)
            setNasaHasMore(pagination.has_next || false)
            toast.success(`${mappedData.length} NASA Meteorites loaded`, { 
                id: TOAST_IDS.LOADING,
                duration: 1500 
            })
        } catch (error) {
            console.error('Error fetching NASA Meteorites:', error)
            toast.error('Error loading NASA Meteorites', { 
                id: TOAST_IDS.LOADING,
                duration: 2000 
            })
        } finally {
            setLoading(false)
        }
    }

    // Cargar más meteoritos de NASA
    const loadMoreNasaMeteorites = async () => {
        if (!nasaHasMore || loadingMoreNasa) return

        setLoadingMoreNasa(true)
        try {
            const nextPage = nasaCurrentPage + 1
            const response = await fetch(`/getMeteoritesNames?page=${nextPage}`)

            if (!response.ok) {
                throw new Error('Failed to fetch more NASA Meteorites')
            }

            const result = await response.json()
            const data = result.data || []
            const pagination = result.pagination || {}

            const mappedData: MeteoriteRecord[] = data.map((item: any) => ({
                id: item.id,
                name: item.name,
            }))

            setNasaMeteoritesData(prev => [...prev, ...mappedData])
            setNasaCurrentPage(nextPage)
            setNasaHasMore(pagination.has_next || false)
            toast.success(`${mappedData.length} more Meteorites loaded`, { duration: 1000 })
        } catch (error) {
            console.error('Error loading more NASA Meteorites:', error)
            toast.error('Error loading more Meteorites')
        } finally {
            setLoadingMoreNasa(false)
        }
    }

    // Fetch saved Meteorites from Laravel
    const fetchSavedMeteoritesFromSupabase = async () => {
        setLoading(true)
        try {
            const response = await fetch('/getAllUserMeteorites')

            if (!response.ok) {
                throw new Error('Failed to fetch Meteorites')
            }

            const data = await response.json()

            // Mapear los datos de la BD al formato que espera el componente
            const mappedData: MeteoriteRecord[] = data.map((item: any) => ({
                id: item.id,
                name: item.name,
                radiusMeteroid: item.radius,  // BD usa 'radius', componente usa 'radiusMeteroid'
                velocity: item.velocity,
                angle: item.entry_angle,  // BD usa 'entry_angle', componente usa 'angle'
                material: item.material,
                lat: item.lat,
                lng: item.lng,
            }))

            setSavedMeteoritesData(mappedData)
            toast.success(`${mappedData.length} saved Meteorites loaded`, { 
                id: TOAST_IDS.LOADING,
                duration: 1500 
            })
        } catch (error) {
            console.error('Error fetching saved Meteorites:', error)
            toast.error('Error loading saved Meteorites', { 
                id: TOAST_IDS.LOADING,
                duration: 2000 
            })
        } finally {
            setLoading(false)
        }
    }

    // Cargar un meteorito seleccionado
    const loadMeteoriteData = (Meteorite: MeteoriteRecord) => {
        if (Meteorite.radiusMeteroid) form.setValue('radiusMeteroid', Meteorite.radiusMeteroid)
        if (Meteorite.velocity) form.setValue('velocity', Meteorite.velocity)
        if (Meteorite.angle) form.setValue('angle', Meteorite.angle)
        if (Meteorite.material) form.setValue('material', Meteorite.material)

        // Actualizar contexto para la visualización 3D
        updateMeteroidData({
            radiusMeteroid: Meteorite.radiusMeteroid || 0,
            velocity: Meteorite.velocity || 0,
            angle: Meteorite.angle || 0,
            material: (Meteorite.material as 'rock' | 'iron' | 'nickel') || 'rock'
        })

        toast.success(`Meteorite loaded: ${Meteorite.name}`, {
            id: TOAST_IDS.LOADING,
            duration: 2000
        })
    }

    // Establecer ubicación en el mapa
    const setMapLocation = (lat: number, lng: number) => {
        setLocation([lat, lng])
        toast.success(`Location updated: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, { 
            id: TOAST_IDS.LOCATION,
            duration: 1500 
        })
    }

    const onSubmitSimulate = async (data: any) => {
        console.log("Simulating Meteorite impact with data:", data)

        // Verificar que se haya seleccionado un meteorito (NASA o guardado)
        if (!selectedNasaId && !selectedSavedId) {
            toast.error('Please select a Meteorite first', {
                id: TOAST_IDS.SIMULATION,
                duration: 2000
            })
            return
        }

        try {
            toast.info('Calculating impact area...', { 
                id: TOAST_IDS.SIMULATION,
                duration: 2000 
            })

            let response
            let MeteoriteName

            // Llamar a la API correspondiente según el tipo seleccionado
            if (selectedNasaId) {
                response = await axios.get(`/getMeteoriteById/${selectedNasaId}`)
                MeteoriteName = selectedNasaName
            } else {
                response = await axios.get(`/getUserMeteoriteById/${selectedSavedId}`)
                MeteoriteName = selectedSavedName
            }

            const atmosphericImpact = response.data?.atmospheric_impact
            const calculations = response.data?.calculations
            const craterDiameter = atmosphericImpact?.crater_diameter_m

            // Guardar todos los datos del impacto
            setImpactData({
                name: MeteoriteName,
                atmospheric_impact: atmosphericImpact,
                calculations: calculations
            })

            if (craterDiameter) {
                // Calcular radio (diámetro / 2)
                const radius = craterDiameter / 2
                setCraterRadius(radius)
                console.log('✅ Crater radius:', radius, 'meters')
                toast.success('Impact area calculated!', { 
                    id: TOAST_IDS.SIMULATION,
                    duration: 2000 
                })
            } else {
                toast.warning('Crater data not available for this Meteorite', {
                    id: TOAST_IDS.SIMULATION,
                    duration: 2500
                })
            }

            // Activar la simulación (mostrar círculos en el mapa)
            setIsSimulating(true)

        } catch (error) {
            console.error('❌ Error fetching meteorite data:', error)
            toast.error('Error calculating impact area', {
                id: TOAST_IDS.SIMULATION,
                duration: 3000
            })
        }
    }

    // Función para resetear la simulación
    const resetSimulation = () => {
        setImpactData(null)
        setIsSimulating(false)
        setCraterRadius(null)
        setSelectedNasaId(null)
        setSelectedNasaName(null)
        setSelectedSavedId(null)
        setSelectedSavedName(null)
        setShowShareButtons(false)
        setShowInstagramGuide(false)
        form.reset()
        toast.info('Simulation reset', {
            id: TOAST_IDS.SIMULATION,
            duration: 1500
        })
    }

    // Función para generar imagen profesional con Canvas API
    const generateProfessionalImage = async (): Promise<Blob | null> => {
        if (!impactData) return null

        return new Promise((resolve) => {
            const canvas = document.createElement('canvas')
            canvas.width = 1200
            canvas.height = 1200
            const ctx = canvas.getContext('2d')

            if (!ctx) {
                resolve(null)
                return
            }

            // Fondo con gradiente espacial
            const gradient = ctx.createLinearGradient(0, 0, 0, 1200)
            gradient.addColorStop(0, '#0f172a')
            gradient.addColorStop(0.5, '#1e293b')
            gradient.addColorStop(1, '#0c0a1f')
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, 1200, 1200)

            // Estrellas en el fondo
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * 1200
                const y = Math.random() * 400
                const radius = Math.random() * 1.5
                ctx.beginPath()
                ctx.arc(x, y, radius, 0, Math.PI * 2)
                ctx.fill()
            }

            // Logo Meteorica (texto estilizado)
            ctx.font = 'bold 60px Arial'
            ctx.fillStyle = '#3b82f6'
            ctx.fillText('Meteorica', 50, 80)

            ctx.font = '30px Arial'
            ctx.fillStyle = '#94a3b8'
            ctx.fillText('Meteorite Impact Simulator', 50, 120)

            // Línea decorativa
            ctx.strokeStyle = '#3b82f6'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(50, 140)
            ctx.lineTo(1150, 140)
            ctx.stroke()

            // Título del meteorito
            ctx.font = 'bold 48px Arial'
            ctx.fillStyle = '#fbbf24'
            ctx.fillText(impactData.name, 50, 210)

            // Fecha y hora
            const now = new Date()
            ctx.font = '20px Arial'
            ctx.fillStyle = '#94a3b8'
            ctx.fillText(`Simulation Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 50, 250)

            // Panel principal con datos
            let yPos = 320

            // SECCIÓN 1: Propiedades del Meteorito
            ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'
            ctx.fillRect(50, yPos, 1100, 200)

            ctx.fillStyle = '#3b82f6'
            ctx.font = 'bold 32px Arial'
            ctx.fillText('⚡ Meteorite PROPERTIES', 70, yPos + 40)

            ctx.fillStyle = '#ffffff'
            ctx.font = '24px Arial'
            const diameter = impactData.calculations?.diameter_m?.toFixed(2) || 'N/A'
            const mass = impactData.calculations?.mass_kg?.toExponential(2) || 'N/A'
            const velocity = impactData.calculations?.velocity_ms?.toFixed(2) || 'N/A'
            const energy = impactData.calculations?.kinetic_energy_initial_megatons_tnt?.toFixed(2) || 'N/A'

            ctx.fillText(`Diameter: ${diameter} m`, 70, yPos + 90)
            ctx.fillText(`Velocity: ${velocity} m/s`, 70, yPos + 130)
            ctx.fillText(`Mass: ${mass} kg`, 650, yPos + 90)
            ctx.fillText(`Energy: ${energy} MT TNT`, 650, yPos + 130)

            // Barra de energía visual
            const energyBarWidth = Math.min(parseFloat(energy) * 50, 500)
            ctx.fillStyle = '#ef4444'
            ctx.fillRect(70, yPos + 160, energyBarWidth, 20)
            ctx.strokeStyle = '#ffffff'
            ctx.strokeRect(70, yPos + 160, 500, 20)

            yPos += 230

            // SECCIÓN 2: Efectos Atmosféricos
            ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'
            ctx.fillRect(50, yPos, 1100, 200)

            ctx.fillStyle = '#ef4444'
            ctx.font = 'bold 32px Arial'
            ctx.fillText('🔥 ATMOSPHERIC EFFECTS', 70, yPos + 40)

            ctx.fillStyle = '#ffffff'
            ctx.font = '24px Arial'
            const energyRemaining = ((impactData.atmospheric_impact?.f_atm || 0) * 100).toFixed(1)
            const massRemaining = ((impactData.atmospheric_impact?.f_frag || 0) * 100).toFixed(1)
            const fragmented = impactData.atmospheric_impact?.broke ? 'YES' : 'NO'
            const breakupAlt = impactData.atmospheric_impact?.breakup_altitude_m
                ? (impactData.atmospheric_impact.breakup_altitude_m / 1000).toFixed(2) + ' km'
                : 'N/A'

            ctx.fillText(`Energy Remaining: ${energyRemaining}%`, 70, yPos + 90)
            ctx.fillText(`Fragmented: ${fragmented}`, 70, yPos + 130)
            ctx.fillText(`Mass Remaining: ${massRemaining}%`, 650, yPos + 90)
            ctx.fillText(`Breakup Altitude: ${breakupAlt}`, 650, yPos + 130)

            // Gráfico circular de energía
            const centerX = 1050
            const centerY = yPos + 110
            const radius = 60
            const energyPercent = parseFloat(energyRemaining) / 100

            // Fondo del círculo
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(100, 100, 100, 0.3)'
            ctx.fill()

            // Porcentaje de energía
            ctx.beginPath()
            ctx.moveTo(centerX, centerY)
            ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * energyPercent))
            ctx.closePath()
            ctx.fillStyle = '#22c55e'
            ctx.fill()

            // Texto del porcentaje
            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 20px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(`${energyRemaining}%`, centerX, centerY + 7)
            ctx.textAlign = 'left'

            yPos += 230

            // SECCIÓN 3: Cráter de Impacto
            ctx.fillStyle = 'rgba(168, 85, 247, 0.2)'
            ctx.fillRect(50, yPos, 1100, 250)

            ctx.fillStyle = '#a855f7'
            ctx.font = 'bold 32px Arial'
            ctx.fillText('💥 IMPACT CRATER', 70, yPos + 40)

            const craterDiameter = impactData.atmospheric_impact?.crater_diameter_m?.toFixed(0) || 'N/A'
            const craterRadius = impactData.atmospheric_impact?.crater_diameter_m
                ? (impactData.atmospheric_impact.crater_diameter_m / 2).toFixed(0)
                : 'N/A'
            const impactEnergy = (impactData.atmospheric_impact?.E_after_J / 4.184e15)?.toFixed(2) || 'N/A'

            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 40px Arial'
            ctx.fillText(`${craterDiameter} m`, 70, yPos + 120)
            ctx.font = '22px Arial'
            ctx.fillText('Crater Diameter', 70, yPos + 150)

            ctx.font = 'bold 40px Arial'
            ctx.fillText(`${impactEnergy} MT`, 450, yPos + 120)
            ctx.font = '22px Arial'
            ctx.fillText('Impact Energy (TNT Equivalent)', 450, yPos + 150)

            // Visualización del cráter
            const craterCenterX = 950
            const craterCenterY = yPos + 140
            const craterVisualRadius = 80

            // Cráter visual
            const craterGradient = ctx.createRadialGradient(craterCenterX, craterCenterY, 0, craterCenterX, craterCenterY, craterVisualRadius)
            craterGradient.addColorStop(0, '#7c3aed')
            craterGradient.addColorStop(0.5, '#a855f7')
            craterGradient.addColorStop(1, '#1e293b')
            ctx.fillStyle = craterGradient
            ctx.beginPath()
            ctx.arc(craterCenterX, craterCenterY, craterVisualRadius, 0, Math.PI * 2)
            ctx.fill()

            // Ondas de choque
            for (let i = 1; i <= 3; i++) {
                ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 / i})`
                ctx.lineWidth = 3
                ctx.beginPath()
                ctx.arc(craterCenterX, craterCenterY, craterVisualRadius + (i * 20), 0, Math.PI * 2)
                ctx.stroke()
            }

            yPos += 270

            // Footer
            ctx.fillStyle = '#3b82f6'
            ctx.fillRect(50, yPos, 1100, 3)

            ctx.font = '20px Arial'
            ctx.fillStyle = '#94a3b8'
            ctx.fillText('Generated by Meteorica - Meteorite Impact Simulator', 50, yPos + 35)
            ctx.fillText('#Meteorica #NASA #SpaceApps #MeteoriteImpact', 50, yPos + 65)

            // Emoji decorativo
            ctx.font = '50px Arial'
            ctx.fillText('🌍💥🚀', 950, yPos + 50)

            // Convertir a blob
            canvas.toBlob((blob) => {
                resolve(blob)
            }, 'image/png', 1.0)
        })
    }

    // Función mejorada para compartir con imagen
    const shareToWhatsApp = async () => {
        const imageBlob = await generateProfessionalImage()
        if (!imageBlob) {
            toast.error('Error generating image', {
                id: TOAST_IDS.SHARE,
                duration: 2000
            })
            return
        }

        // Crear archivo
        const file = new File([imageBlob], 'meteorite-impact.png', { type: 'image/png' })

        // Crear texto enriquecido
        const text = `🚀 METEORICA - METEORITE IMPACT SIMULATION 💥

📍 Meteorite: ${impactData.name}
💥 Crater Diameter: ${impactData.atmospheric_impact?.crater_diameter_m?.toFixed(0)}m
⚡ Energy: ${impactData.calculations?.kinetic_energy_initial_megatons_tnt?.toFixed(2)} Megatons TNT
🔥 Fragmented: ${impactData.atmospheric_impact?.broke ? 'YES' : 'NO'}

Simulated with Meteorica - NASA Space Apps Challenge
#Meteorica #NASA #SpaceApps #MeteoriteImpact #Science`

        // Intentar usar Web Share API si está disponible
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'Meteorica - Meteorite Impact Simulation',
                    text: text
                })
                toast.success('Shared successfully!', {
                    id: TOAST_IDS.SHARE,
                    duration: 2000
                })
                return
            } catch (error) {
                console.log('Web Share API failed, using fallback')
            }
        }

        // Fallback: descargar imagen y abrir WhatsApp con texto
        const url = URL.createObjectURL(imageBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `meteorica-impact-${impactData.name.replace(/\s+/g, '-')}.png`
        link.click()
        URL.revokeObjectURL(url)

        setTimeout(() => {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
            window.open(whatsappUrl, '_blank')
        }, 500)

        toast.success('Image downloaded! Opening WhatsApp...', {
            id: TOAST_IDS.DOWNLOAD,
            duration: 2500
        })
    }

    const shareToTwitter = async () => {
        const imageBlob = await generateProfessionalImage()
        if (!imageBlob) {
            toast.error('Error generating image', {
                id: TOAST_IDS.SHARE,
                duration: 2000
            })
            return
        }

        // Descargar imagen primero
        const url = URL.createObjectURL(imageBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `meteorica-impact-${impactData.name.replace(/\s+/g, '-')}.png`
        link.click()
        URL.revokeObjectURL(url)

        const text = `🚀 Just simulated a meteorite impact with Meteorica!

💥 ${impactData.name}
🎯 Crater: ${impactData.atmospheric_impact?.crater_diameter_m?.toFixed(0)}m
⚡ Energy: ${impactData.calculations?.kinetic_energy_initial_megatons_tnt?.toFixed(2)} MT TNT

#Meteorica #NASA #SpaceApps #MeteoriteImpact #SpaceScience`

        setTimeout(() => {
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
            window.open(twitterUrl, '_blank')
        }, 500)

        toast.success('Image downloaded! Opening Twitter...', {
            id: TOAST_IDS.DOWNLOAD,
            duration: 2500
        })
    }

    const shareToInstagram = async () => {
        const imageBlob = await generateProfessionalImage()
        if (!imageBlob) {
            toast.error('Error generating image', {
                id: TOAST_IDS.SHARE,
                duration: 2000
            })
            return
        }

        // Descargar imagen
        const url = URL.createObjectURL(imageBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `nasa-impact-${impactData.name.replace(/\s+/g, '-')}.png`
        link.click()
        URL.revokeObjectURL(url)

        const caption = `🚀 METEORICA - METEORITE IMPACT SIMULATION 💥

📍 Meteorite: ${impactData.name}
💥 Crater Diameter: ${impactData.atmospheric_impact?.crater_diameter_m?.toFixed(0)}m diameter
⚡ Energy: ${impactData.calculations?.kinetic_energy_initial_megatons_tnt?.toFixed(2)} Megatons TNT
🔥 Atmospheric Fragmentation: ${impactData.atmospheric_impact?.broke ? 'YES' : 'NO'}

Simulated with Meteorica - NASA Space Apps Challenge 🌍

#Meteorica #NASA #SpaceApps #MeteoriteImpact #SpaceScience #Astronomy #ScienceIsAwesome`

        // Copiar caption al portapapeles
        try {
            await navigator.clipboard.writeText(caption)

            // Mostrar guía visual
            setShowInstagramGuide(true)

            toast.success('✅ Image downloaded & caption copied!', {
                id: TOAST_IDS.DOWNLOAD,
                duration: 6000
            })

            // Intentar abrir Instagram
            setTimeout(() => {
                if (/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    // Móvil: intentar abrir app
                    window.location.href = 'instagram://camera'
                    setTimeout(() => {
                        window.open('https://www.instagram.com/', '_blank')
                    }, 1500)
                } else {
                    // Desktop: abrir web
                    window.open('https://www.instagram.com/', '_blank')
                }
            }, 1000)

        } catch (error) {
            toast.error('Failed to copy caption', {
                id: TOAST_IDS.SHARE,
                duration: 2000
            })
        }
    }

    const shareToFacebook = async () => {
        const imageBlob = await generateProfessionalImage()
        if (!imageBlob) {
            toast.error('Error generating image', {
                id: TOAST_IDS.SHARE,
                duration: 2000
            })
            return
        }

        // Descargar imagen
        const url = URL.createObjectURL(imageBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `nasa-impact-${impactData.name.replace(/\s+/g, '-')}.png`
        link.click()
        URL.revokeObjectURL(url)

        const text = `🚀 METEORICA - METEORITE IMPACT SIMULATION 💥

I just simulated a meteorite impact using Meteorica with NASA's data!

📍 Meteorite: ${impactData.name}
💥 Crater Diameter: ${impactData.atmospheric_impact?.crater_diameter_m?.toFixed(0)} meters
⚡ Energy Released: ${impactData.calculations?.kinetic_energy_initial_megatons_tnt?.toFixed(2)} Megatons of TNT
🔥 Atmospheric Fragmentation: ${impactData.atmospheric_impact?.broke ? 'YES' : 'NO'}

This was created with Meteorica for NASA Space Apps Challenge using real NASA NEO data!

#Meteorica #NASA #SpaceApps #MeteoriteImpact #SpaceScience`

        setTimeout(() => {
            const fbUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`
            window.open(fbUrl, '_blank')
        }, 500)

        toast.success('Image downloaded! Opening Facebook...', {
            id: TOAST_IDS.DOWNLOAD,
            duration: 2500
        })
    }

    const downloadImage = async () => {
        const imageBlob = await generateProfessionalImage()
        if (!imageBlob) {
            toast.error('Error generating image', {
                id: TOAST_IDS.DOWNLOAD,
                duration: 2000
            })
            return
        }

        const url = URL.createObjectURL(imageBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `meteorica-impact-${impactData.name.replace(/\s+/g, '-')}-${Date.now()}.png`
        link.click()
        URL.revokeObjectURL(url)

        toast.success('Professional impact card downloaded! 🎨', {
            id: TOAST_IDS.DOWNLOAD,
            duration: 2500
        })
    }

    return (
        <TooltipProvider>
            <div id="form-testing-section" className="pb-6">
                {/* Si hay datos de impacto, mostrar la información en lugar del formulario */}
                {impactData ? (
                    <div className="space-y-4 pb-4">
                        <h1 className='text-2xl font-bold text-black'>Impact Analysis Results</h1>
                        <h2 className='text-xl font-semibold text-black'>{impactData.name}</h2>

                        <div className="space-y-3 bg-white/90 p-4 rounded-lg border border-gray-300 shadow-sm">
                            <h3 className='text-lg font-bold text-blue-600'>Meteorite Properties</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm text-black">
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Diameter:</span>
                                    <span>{impactData.calculations?.diameter_m?.toFixed(2)} m</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <GraduationCap className="h-3 w-3 text-blue-500 cursor-help ml-1" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">The width of the Meteorite. Larger diameters result in more devastating impacts.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Mass:</span>
                                    <span>{impactData.calculations?.mass_kg?.toExponential(2)} kg</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <GraduationCap className="h-3 w-3 text-blue-500 cursor-help ml-1" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Total mass calculated from volume and density. Mass directly affects kinetic energy.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Velocity:</span>
                                    <span>{impactData.calculations?.velocity_ms?.toFixed(2)} m/s</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <GraduationCap className="h-3 w-3 text-blue-500 cursor-help ml-1" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Entry speed. Meteorites typically enter at 11-72 km/s. Velocity is squared in energy calculations.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Initial Energy:</span>
                                    <span>{impactData.calculations?.kinetic_energy_initial_megatons_tnt?.toFixed(2)} MT TNT</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <GraduationCap className="h-3 w-3 text-blue-500 cursor-help ml-1" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Energy before atmospheric entry (KE = ½mv²). Measured in megatons of TNT equivalent.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 bg-white/90 p-4 rounded-lg border border-gray-300 shadow-sm">
                            <h3 className='text-lg font-bold text-red-600'>Atmospheric Effects</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm text-black">
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Energy Remaining:</span>
                                    <span>{(impactData.atmospheric_impact?.f_atm * 100)?.toFixed(1)}%</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <GraduationCap className="h-3 w-3 text-red-500 cursor-help ml-1" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Percentage of kinetic energy retained after atmospheric friction and drag.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Mass Remaining:</span>
                                    <span>{(impactData.atmospheric_impact?.f_frag * 100)?.toFixed(1)}%</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <GraduationCap className="h-3 w-3 text-red-500 cursor-help ml-1" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Percentage of original mass that survives atmospheric ablation and fragmentation.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Total Efficiency:</span>
                                    <span>{(impactData.atmospheric_impact?.f_total * 100)?.toFixed(1)}%</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <GraduationCap className="h-3 w-3 text-red-500 cursor-help ml-1" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Combined efficiency factor (energy × mass). Lower values mean more atmospheric protection.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Fragmented:</span>
                                    <span>{impactData.atmospheric_impact?.broke ? 'Yes' : 'No'}</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <GraduationCap className="h-3 w-3 text-red-500 cursor-help ml-1" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Whether the Meteorite broke apart due to atmospheric stress before impact.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                {impactData.atmospheric_impact?.breakup_altitude_m && (
                                    <div className="col-span-2 flex items-center gap-1">
                                        <span className="font-semibold">Breakup Altitude:</span>
                                        <span>{(impactData.atmospheric_impact?.breakup_altitude_m / 1000)?.toFixed(2)} km</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <GraduationCap className="h-3 w-3 text-red-500 cursor-help ml-1" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">Height above ground where fragmentation occurred due to atmospheric pressure.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Final Velocity:</span>
                                    <span>{impactData.atmospheric_impact?.final_velocity_ms?.toFixed(2)} m/s</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <GraduationCap className="h-3 w-3 text-red-500 cursor-help ml-1" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Impact velocity after atmospheric deceleration. Lower than initial entry speed.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Energy Lost:</span>
                                    <span>{impactData.atmospheric_impact?.energy_lost_percent?.toFixed(1)}%</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <GraduationCap className="h-3 w-3 text-red-500 cursor-help ml-1" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Percentage of kinetic energy dissipated as heat, light, and sound in the atmosphere.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 bg-white/90 p-4 rounded-lg border border-gray-300 shadow-sm">
                            <h3 className='text-lg font-bold text-purple-600'>Impact Crater</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm text-black">
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Crater Diameter:</span>
                                    <span>{impactData.atmospheric_impact?.crater_diameter_m?.toFixed(0)} m</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <GraduationCap className="h-3 w-3 text-purple-500 cursor-help ml-1" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Full width of the impact crater from rim to rim. Calculated using scaling laws.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Crater Radius:</span>
                                    <span>{(impactData.atmospheric_impact?.crater_diameter_m / 2)?.toFixed(0)} m</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <GraduationCap className="h-3 w-3 text-purple-500 cursor-help ml-1" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Distance from crater center to rim. Shown on the map as the impact zone.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Impact Energy:</span>
                                    <span>{(impactData.atmospheric_impact?.E_after_J / 4.184e15)?.toFixed(2)} MT TNT</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <GraduationCap className="h-3 w-3 text-purple-500 cursor-help ml-1" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Energy at ground impact after atmospheric losses. For comparison, Hiroshima was ~15 kilotons.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción mejorados */}
                        <div className="space-y-3 pt-2">
                            {/* Botón de Análisis con IA - Diseño Profesional */}
                            <Button
                                type="button"
                                onClick={() => setShowAIAnalysis(true)}
                                variant="outline"
                                className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700 hover:from-slate-800 hover:to-slate-700 flex items-center justify-center gap-3 py-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                AI Impact Analysis + Defense Strategies
                            </Button>

                            {/* Botón principal de compartir - Diseño Profesional */}
                            <Button
                                type="button"
                                onClick={() => setShowShareButtons(!showShareButtons)}
                                variant="outline"
                                className="w-full bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-3 py-6 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                <Share2 size={20} />
                                {showShareButtons ? 'Hide Share Options' : 'Share Your Impact Simulation'}
                            </Button>

                            {/* Opciones de compartir con animación - Diseño Profesional */}
                            {showShareButtons && (
                                <div className="space-y-3 animate-in slide-in-from-top duration-300">
                                    <div className="bg-white border-2 border-slate-200 p-5 rounded-lg shadow-md">
                                        <div className="flex items-start gap-3 mb-4 p-3 bg-slate-50 rounded-md border border-slate-200">
                                            <svg className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-slate-700 text-sm font-medium">
                                                Your simulation will be converted to a professional NASA-style image card
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <Button
                                                type="button"
                                                onClick={shareToWhatsApp}
                                                variant="outline"
                                                className="border-2 border-green-200 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 flex items-center justify-center gap-2 py-5 font-medium transition-all"
                                            >
                                                <MessageCircle size={18} />
                                                WhatsApp
                                            </Button>

                                            <Button
                                                type="button"
                                                onClick={shareToInstagram}
                                                variant="outline"
                                                className="border-2 border-pink-200 bg-pink-50 hover:bg-pink-100 text-pink-700 hover:text-pink-800 flex items-center justify-center gap-2 py-5 font-medium transition-all"
                                            >
                                                <Instagram size={18} />
                                                Instagram
                                            </Button>

                                            <Button
                                                type="button"
                                                onClick={shareToTwitter}
                                                variant="outline"
                                                className="border-2 border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 flex items-center justify-center gap-2 py-5 font-medium transition-all"
                                            >
                                                <Twitter size={18} />
                                                Twitter/X
                                            </Button>

                                            <Button
                                                type="button"
                                                onClick={shareToFacebook}
                                                variant="outline"
                                                className="border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 flex items-center justify-center gap-2 py-5 font-medium transition-all"
                                            >
                                                <Facebook size={18} />
                                                Facebook
                                            </Button>
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={downloadImage}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white border-0 font-semibold py-5 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download Professional Impact Card
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Guía visual de Instagram - Diseño Profesional */}
                            {showInstagramGuide && (
                                <div className="bg-white border-2 border-pink-200 p-6 rounded-lg shadow-lg animate-in slide-in-from-bottom">
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                                                <Instagram size={24} className="text-white" />
                                            </div>
                                            <h3 className="text-slate-900 font-bold text-lg">
                                                How to Post on Instagram
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => setShowInstagramGuide(false)}
                                            className="text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                                            <div>
                                                <p className="font-semibold text-slate-900">Image Downloaded</p>
                                                <p className="text-sm text-slate-600 mt-1">Check your Downloads folder for the NASA impact card</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                                            <div>
                                                <p className="font-semibold text-slate-900">Caption Copied</p>
                                                <p className="text-sm text-slate-600 mt-1">Your caption is ready in the clipboard</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                            <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                                            <div>
                                                <p className="font-semibold text-slate-900">Open Instagram</p>
                                                <p className="text-sm text-slate-600 mt-1">Tap the + button to create a new post</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 bg-pink-50 border border-pink-200 rounded-lg">
                                            <div className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                                            <div>
                                                <p className="font-semibold text-slate-900">Upload & Paste</p>
                                                <p className="text-sm text-slate-600 mt-1">Select your image, then paste the caption (long press on caption field)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            <p className="text-slate-700 text-sm font-medium">
                                                <strong>Pro tip:</strong> Tag @nasa and use #SpaceApps for maximum visibility!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Botón de nueva simulación - Diseño Profesional */}
                            <Button
                                type="button"
                                onClick={resetSimulation}
                                variant="outline"
                                className="w-full bg-white text-slate-700 border-2 border-slate-300 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900 py-5 font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                New Simulation
                            </Button>
                        </div>
                    </div>
                ) : (
                    // Formulario original
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitSimulate)} className="space-y-4">

                            <h1 className='text-2xl font-bold text-black'>Simulation of Meteorite Impact</h1>
                            <br />

                            <FormField
                                control={form.control}
                                name="selectedNasaMeteorite"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel>NASA Meteorites</FormLabel>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <GraduationCap className="h-4 w-4 text-blue-600 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">Select from real meteorites documented by NASA. These are actual space objects that have been identified and catalogued with authentic data.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value)
                                                    const selected = nasaMeteoritesData.find(m => m.name === value)
                                                    if (selected && selected.id) {
                                                        // Guardar el ID y nombre del meteorito seleccionado
                                                        setSelectedNasaId(String(selected.id))
                                                        setSelectedNasaName(selected.name)
                                                        setSelectedMeteoriteId(String(selected.id))
                                                        // Limpiar selección de meteoritos guardados
                                                        setSelectedSavedId(null)
                                                        setSelectedSavedName(null)
                                                        form.setValue('selectedSavedMeteorite', undefined)
                                                        toast.info(`NASA Meteorite selected: ${selected.name}`, { duration: 3000 })
                                                    }
                                                }}
                                                defaultValue={field.value}
                                                disabled={!!selectedSavedId || loading}
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder={loading ? "Loading..." : selectedSavedId ? "Disabled - Saved selected" : "Select NASA Meteorite"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {nasaMeteoritesData.length === 0 ? (
                                                        <SelectItem value="none" disabled>
                                                            No NASA Meteorites
                                                        </SelectItem>
                                                    ) : (
                                                        nasaMeteoritesData.map((Meteorite) => (
                                                            <SelectItem key={Meteorite.id || Meteorite.name} value={Meteorite.name}>
                                                                {Meteorite.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription>
                                            Use real models from NASA ({nasaMeteoritesData.length} loaded)
                                        </FormDescription>
                                        {nasaHasMore && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={loadMoreNasaMeteorites}
                                                disabled={loadingMoreNasa}
                                                className="w-full mt-2 bg-white text-black hover:bg-gray-100 border-gray-300 font-medium"
                                            >
                                                {loadingMoreNasa ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4 mr-2 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        <span className="text-black">Loading...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-black">⬇️ Load More NASA Meteorites</span>
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="selectedSavedMeteorite"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel>Saved Meteorites</FormLabel>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <GraduationCap className="h-4 w-4 text-green-600 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">Choose from custom Meteorites you've created and saved. These include your personalized parameters for radius, velocity, angle, and material composition.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value)
                                                    const selected = savedMeteoritesData.find(m => m.name === value)
                                                    if (selected) {
                                                        // Guardar el ID y nombre del meteorito guardado
                                                        setSelectedSavedId(String(selected.id))
                                                        setSelectedSavedName(selected.name)
                                                        // Limpiar selección de NASA
                                                        setSelectedNasaId(null)
                                                        setSelectedNasaName(null)
                                                        form.setValue('selectedNasaMeteorite', undefined)

                                                        loadMeteoriteData(selected)
                                                        if (selected.lat && selected.lng) {
                                                            setMapLocation(selected.lat, selected.lng)
                                                        }
                                                        toast.info(`Saved Meteorite selected: ${selected.name}`)
                                                    }
                                                }}
                                                defaultValue={field.value}
                                                disabled={!!selectedNasaId || loading}
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder={loading ? "Loading..." : selectedNasaId ? "Disabled - NASA selected" : "Select saved Meteorite"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {savedMeteoritesData.length === 0 ? (
                                                        <SelectItem value="none" disabled>
                                                            No saved Meteorites
                                                        </SelectItem>
                                                    ) : (
                                                        savedMeteoritesData.map((Meteorite) => (
                                                            <SelectItem key={Meteorite.id || Meteorite.name} value={Meteorite.name}>
                                                                {Meteorite.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription>
                                            Use your saved Meteorites
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="selectedCity"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel>Choose a City</FormLabel>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <GraduationCap className="h-4 w-4 text-purple-600 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">Select a preset location or click anywhere on the map to choose your impact site. This determines where the Meteorite will strike Earth.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value)
                                                    switch (value) {
                                                        case 'france':
                                                            setMapLocation(46.2276, 2.2137)
                                                            break
                                                        case 'germany':
                                                            setMapLocation(51.1657, 10.4515)
                                                            break
                                                        case 'spain':
                                                            setMapLocation(40.4637, -3.7492)
                                                            break
                                                    }
                                                }}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Select city" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="france">France</SelectItem>
                                                    <SelectItem value="germany">Germany</SelectItem>
                                                    <SelectItem value="spain">Spain</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription>
                                            You can also select your own location on the map
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="button"
                                onClick={form.handleSubmit(onSubmitSimulate)}
                                variant="default"
                                className="text-black border-black hover:bg-black hover:text-white"
                                disabled={!selectedNasaId && !selectedSavedId}
                            >
                                Simulate
                            </Button>
                        </form>
                    </Form>
                )}
            </div>

            {/* Modal de Análisis con IA */}
            {showAIAnalysis && impactData && (
                <ImpactAnalysis 
                    impactData={impactData}
                    onClose={() => setShowAIAnalysis(false)}
                />
            )}
        </TooltipProvider>
    )
}

export default FormTesting

