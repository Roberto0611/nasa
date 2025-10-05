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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip"
import { GraduationCap } from 'lucide-react'
import { duration } from 'node_modules/zod/v4/classic/iso.cjs'
import { Share2, MessageCircle, Instagram, Twitter, Facebook } from 'lucide-react'

type MeteoroidRecord = {
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
    const [nasaMeteoroidsData, setNasaMeteoroidsData] = useState<MeteoroidRecord[]>([])
    const [savedMeteoroidsData, setSavedMeteoroidsData] = useState<MeteoroidRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedNasaId, setSelectedNasaId] = useState<string | null>(null)
    const [selectedNasaName, setSelectedNasaName] = useState<string | null>(null)
    const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null)
    const [selectedSavedName, setSelectedSavedName] = useState<string | null>(null)
    const [impactData, setImpactData] = useState<any>(null) // Datos del impacto para mostrar
    const [showShareButtons, setShowShareButtons] = useState(false)
    const [showInstagramGuide, setShowInstagramGuide] = useState(false)

    const form = useForm<any>({
        defaultValues: {
            selectedNasaMeteoroid: undefined,
            selectedSavedMeteoroid: undefined,
            selectedCity: undefined,
        }
    })

    // Cargar meteoritos guardados y de NASA al montar el componente
    useEffect(() => {
        fetchNasaMeteoroidsFromSupabase()
        fetchSavedMeteoroidsFromSupabase()
    }, [])

    // Fetch NASA meteoroids from Laravel API
    const fetchNasaMeteoroidsFromSupabase = async () => {
        setLoading(true)
        try {
            const response = await fetch('/getMeteoritesNames')

            if (!response.ok) {
                throw new Error('Failed to fetch NASA meteoroids')
            }

            const data = await response.json()

            // Mapear los datos de NASA al formato que espera el componente
            const mappedData: MeteoroidRecord[] = data.map((item: any) => ({
                id: item.id,
                name: item.name,
            }))

            setNasaMeteoroidsData(mappedData)
            toast.success(`${mappedData.length} NASA meteoroids loaded`, { duration: 1000 })
        } catch (error) {
            console.error('Error fetching NASA meteoroids:', error)
            toast.error('Error loading NASA meteoroids', { duration: 1000 })
        } finally {
            setLoading(false)
        }
    }

    // Fetch saved meteoroids from Laravel
    const fetchSavedMeteoroidsFromSupabase = async () => {
        setLoading(true)
        try {
            const response = await fetch('/getAllUserMeteorites')

            if (!response.ok) {
                throw new Error('Failed to fetch meteoroids')
            }

            const data = await response.json()

            // Mapear los datos de la BD al formato que espera el componente
            const mappedData: MeteoroidRecord[] = data.map((item: any) => ({
                id: item.id,
                name: item.name,
                radiusMeteroid: item.radius,  // BD usa 'radius', componente usa 'radiusMeteroid'
                velocity: item.velocity,
                angle: item.entry_angle,  // BD usa 'entry_angle', componente usa 'angle'
                material: item.material,
                lat: item.lat,
                lng: item.lng,
            }))

            setSavedMeteoroidsData(mappedData)
            toast.success(`${mappedData.length} saved meteoroids loaded`, { duration: 1000 })
        } catch (error) {
            console.error('Error fetching saved meteoroids:', error)
            toast.error('Error loading saved meteoroids', { duration: 1000 })
        } finally {
            setLoading(false)
        }
    }

    // Cargar un meteorito seleccionado
    const loadMeteoroidData = (meteoroid: MeteoroidRecord) => {
        if (meteoroid.radiusMeteroid) form.setValue('radiusMeteroid', meteoroid.radiusMeteroid)
        if (meteoroid.velocity) form.setValue('velocity', meteoroid.velocity)
        if (meteoroid.angle) form.setValue('angle', meteoroid.angle)
        if (meteoroid.material) form.setValue('material', meteoroid.material)

        // Actualizar contexto para la visualización 3D
        updateMeteroidData({
            radiusMeteroid: meteoroid.radiusMeteroid || 0,
            velocity: meteoroid.velocity || 0,
            angle: meteoroid.angle || 0,
            material: (meteoroid.material as 'rock' | 'iron' | 'nickel') || 'rock'
        })

        toast.success(`Meteoroid loaded: ${meteoroid.name}`)
    }

    // Establecer ubicación en el mapa
    const setMapLocation = (lat: number, lng: number) => {
        setLocation([lat, lng])
        toast.success(`Location updated: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, { duration: 1000 })
    }

    const onSubmitSimulate = async (data: any) => {
        console.log("Simulating meteoroid impact with data:", data)

        // Verificar que se haya seleccionado un meteorito (NASA o guardado)
        if (!selectedNasaId && !selectedSavedId) {
            toast.error('Please select a meteoroid first')
            return
        }

        try {
            toast.info('Calculating impact area...', { duration: 2000 })

            let response
            let meteoroidName

            // Llamar a la API correspondiente según el tipo seleccionado
            if (selectedNasaId) {
                response = await axios.get(`/getMeteoriteById/${selectedNasaId}`)
                meteoroidName = selectedNasaName
            } else {
                response = await axios.get(`/getUserMeteoriteById/${selectedSavedId}`)
                meteoroidName = selectedSavedName
            }

            const atmosphericImpact = response.data?.atmospheric_impact
            const calculations = response.data?.calculations
            const craterDiameter = atmosphericImpact?.crater_diameter_m

            // Guardar todos los datos del impacto
            setImpactData({
                name: meteoroidName,
                atmospheric_impact: atmosphericImpact,
                calculations: calculations
            })

            if (craterDiameter) {
                // Calcular radio (diámetro / 2)
                const radius = craterDiameter / 2
                setCraterRadius(radius)
                console.log('✅ Crater radius:', radius, 'meters')
                toast.success('Impact area calculated!', { duration: 2000 })
            } else {
                toast.warning('Crater data not available for this meteoroid')
            }

            // Activar la simulación (mostrar círculos en el mapa)
            setIsSimulating(true)

        } catch (error) {
            console.error('❌ Error fetching meteorite data:', error)
            toast.error('Error calculating impact area')
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
        toast.info('Simulation reset')
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

            // Logo NASA (texto estilizado)
            ctx.font = 'bold 60px Arial'
            ctx.fillStyle = '#3b82f6'
            ctx.fillText('NASA', 50, 80)

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
            ctx.fillText('⚡ METEOROID PROPERTIES', 70, yPos + 40)

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
            const centerX = 950
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
            ctx.fillText('Generated by NASA Meteorite Impact Simulator', 50, yPos + 35)
            ctx.fillText('#NASA #SpaceApps #MeteoriteImpact', 50, yPos + 65)

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
            toast.error('Error generating image')
            return
        }

        // Crear archivo
        const file = new File([imageBlob], 'meteorite-impact.png', { type: 'image/png' })

        // Crear texto enriquecido
        const text = `🚀 NASA METEORITE IMPACT SIMULATION 💥

📍 Meteoroid: ${impactData.name}
💥 Crater Diameter: ${impactData.atmospheric_impact?.crater_diameter_m?.toFixed(0)}m
⚡ Energy: ${impactData.calculations?.kinetic_energy_initial_megatons_tnt?.toFixed(2)} Megatons TNT
🔥 Fragmented: ${impactData.atmospheric_impact?.broke ? 'YES' : 'NO'}

Simulated with NASA Space Apps Challenge
#NASA #SpaceApps #MeteoriteImpact #Science`

        // Intentar usar Web Share API si está disponible
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'NASA Meteorite Impact Simulation',
                    text: text
                })
                toast.success('Shared successfully!')
                return
            } catch (error) {
                console.log('Web Share API failed, using fallback')
            }
        }

        // Fallback: descargar imagen y abrir WhatsApp con texto
        const url = URL.createObjectURL(imageBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `nasa-impact-${impactData.name.replace(/\s+/g, '-')}.png`
        link.click()
        URL.revokeObjectURL(url)

        setTimeout(() => {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
            window.open(whatsappUrl, '_blank')
        }, 500)

        toast.success('Image downloaded! Opening WhatsApp...')
    }

    const shareToTwitter = async () => {
        const imageBlob = await generateProfessionalImage()
        if (!imageBlob) {
            toast.error('Error generating image')
            return
        }

        // Descargar imagen primero
        const url = URL.createObjectURL(imageBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `nasa-impact-${impactData.name.replace(/\s+/g, '-')}.png`
        link.click()
        URL.revokeObjectURL(url)

        const text = `🚀 Just simulated a meteorite impact with NASA!

💥 ${impactData.name}
🎯 Crater: ${impactData.atmospheric_impact?.crater_diameter_m?.toFixed(0)}m
⚡ Energy: ${impactData.calculations?.kinetic_energy_initial_megatons_tnt?.toFixed(2)} MT TNT

#NASA #SpaceApps #MeteoriteImpact #SpaceScience`

        setTimeout(() => {
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
            window.open(twitterUrl, '_blank')
        }, 500)

        toast.success('Image downloaded! Opening Twitter...')
    }

    const shareToInstagram = async () => {
        const imageBlob = await generateProfessionalImage()
        if (!imageBlob) {
            toast.error('Error generating image')
            return
        }

        // Descargar imagen
        const url = URL.createObjectURL(imageBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `nasa-impact-${impactData.name.replace(/\s+/g, '-')}.png`
        link.click()
        URL.revokeObjectURL(url)

        const caption = `🚀 NASA METEORITE IMPACT SIMULATION 💥

📍 Meteoroid: ${impactData.name}
💥 Crater Diameter: ${impactData.atmospheric_impact?.crater_diameter_m?.toFixed(0)}m diameter
⚡ Energy: ${impactData.calculations?.kinetic_energy_initial_megatons_tnt?.toFixed(2)} Megatons TNT
🔥 Atmospheric Fragmentation: ${impactData.atmospheric_impact?.broke ? 'YES' : 'NO'}

Simulated with NASA Space Apps Challenge Meteorite Impact Simulator 🌍

#NASA #SpaceApps #MeteoriteImpact #SpaceScience #Astronomy #ScienceIsAwesome`

        // Copiar caption al portapapeles
        try {
            await navigator.clipboard.writeText(caption)

            // Mostrar guía visual
            setShowInstagramGuide(true)

            toast.success('✅ Image downloaded & caption copied!', {
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
            toast.error('Failed to copy caption')
        }
    }

    const shareToFacebook = async () => {
        const imageBlob = await generateProfessionalImage()
        if (!imageBlob) {
            toast.error('Error generating image')
            return
        }

        // Descargar imagen
        const url = URL.createObjectURL(imageBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `nasa-impact-${impactData.name.replace(/\s+/g, '-')}.png`
        link.click()
        URL.revokeObjectURL(url)

        const text = `🚀 NASA METEORITE IMPACT SIMULATION 💥

I just simulated a meteorite impact using NASA's data!

📍 Meteoroid: ${impactData.name}
💥 Crater Diameter: ${impactData.atmospheric_impact?.crater_diameter_m?.toFixed(0)} meters
⚡ Energy Released: ${impactData.calculations?.kinetic_energy_initial_megatons_tnt?.toFixed(2)} Megatons of TNT
🔥 Atmospheric Fragmentation: ${impactData.atmospheric_impact?.broke ? 'YES' : 'NO'}

This was created for NASA Space Apps Challenge using real NASA NEO data!

#NASA #SpaceApps #MeteoriteImpact #SpaceScience`

        setTimeout(() => {
            const fbUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`
            window.open(fbUrl, '_blank')
        }, 500)

        toast.success('Image downloaded! Opening Facebook...')
    }

    const downloadImage = async () => {
        const imageBlob = await generateProfessionalImage()
        if (!imageBlob) {
            toast.error('Error generating image')
            return
        }

        const url = URL.createObjectURL(imageBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `nasa-meteorite-impact-${impactData.name.replace(/\s+/g, '-')}-${Date.now()}.png`
        link.click()
        URL.revokeObjectURL(url)

        toast.success('Professional impact card downloaded! 🎨')
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
                            <h3 className='text-lg font-bold text-blue-600'>Meteoroid Properties</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm text-black">
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Diameter:</span>
                                    <span>{impactData.calculations?.diameter_m?.toFixed(2)} m</span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <GraduationCap className="h-3 w-3 text-blue-500 cursor-help ml-1" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">The width of the meteoroid. Larger diameters result in more devastating impacts.</p>
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
                                            <p className="max-w-xs">Entry speed. Meteoroids typically enter at 11-72 km/s. Velocity is squared in energy calculations.</p>
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
                                            <p className="max-w-xs">Whether the meteoroid broke apart due to atmospheric stress before impact.</p>
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
                            {/* Botón principal de compartir */}
                            <Button
                                type="button"
                                onClick={() => setShowShareButtons(!showShareButtons)}
                                variant="outline"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-2 py-6 text-lg font-bold"
                            >
                                <Share2 size={24} />
                                {showShareButtons ? 'Hide Share Options' : '✨ Share Your Impact Simulation'}
                            </Button>

                            {/* Opciones de compartir con animación */}
                            {showShareButtons && (
                                <div className="space-y-2 animate-in slide-in-from-top duration-300">
                                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-lg border-2 border-blue-500">
                                        <p className="text-white text-sm mb-3 font-semibold">
                                            📸 Your simulation will be converted to a professional NASA-style image card!
                                        </p>

                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <Button
                                                type="button"
                                                onClick={shareToWhatsApp}
                                                className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 py-4"
                                            >
                                                <MessageCircle size={20} />
                                                WhatsApp
                                            </Button>

                                            <Button
                                                type="button"
                                                onClick={shareToInstagram}
                                                className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white flex items-center justify-center gap-2 py-4"
                                            >
                                                <Instagram size={20} />
                                                Instagram
                                            </Button>

                                            <Button
                                                type="button"
                                                onClick={shareToTwitter}
                                                className="bg-black hover:bg-gray-800 text-white flex items-center justify-center gap-2 py-4"
                                            >
                                                <Twitter size={20} />
                                                Twitter/X
                                            </Button>

                                            <Button
                                                type="button"
                                                onClick={shareToFacebook}
                                                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-4"
                                            >
                                                <Facebook size={20} />
                                                Facebook
                                            </Button>
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={downloadImage}
                                            variant="outline"
                                            className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0 font-bold py-4"
                                        >
                                            🎨 Download Professional Impact Card
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Guía visual de Instagram */}
                            {showInstagramGuide && (
                                <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-6 rounded-lg shadow-2xl animate-in slide-in-from-bottom border-4 border-white">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-white font-bold text-xl flex items-center gap-2">
                                            <Instagram size={28} />
                                            How to Post on Instagram
                                        </h3>
                                        <button
                                            onClick={() => setShowInstagramGuide(false)}
                                            className="text-white hover:text-gray-200 text-2xl font-bold"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="space-y-3 text-white">
                                        <div className="flex items-start gap-3 bg-white/20 p-3 rounded-lg backdrop-blur">
                                            <span className="text-2xl font-bold bg-white text-purple-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</span>
                                            <div>
                                                <p className="font-semibold">Image Downloaded ✅</p>
                                                <p className="text-sm">Check your Downloads folder for the NASA impact card</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 bg-white/20 p-3 rounded-lg backdrop-blur">
                                            <span className="text-2xl font-bold bg-white text-pink-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</span>
                                            <div>
                                                <p className="font-semibold">Caption Copied 📋</p>
                                                <p className="text-sm">Your caption is ready in the clipboard</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 bg-white/20 p-3 rounded-lg backdrop-blur">
                                            <span className="text-2xl font-bold bg-white text-orange-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</span>
                                            <div>
                                                <p className="font-semibold">Open Instagram 📱</p>
                                                <p className="text-sm">Tap the + button to create a new post</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 bg-white/20 p-3 rounded-lg backdrop-blur">
                                            <span className="text-2xl font-bold bg-white text-purple-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">4</span>
                                            <div>
                                                <p className="font-semibold">Upload & Paste 🚀</p>
                                                <p className="text-sm">Select your downloaded image, then paste the caption (long press on caption field)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 bg-white/30 p-3 rounded-lg backdrop-blur">
                                        <p className="text-white text-sm font-semibold text-center">
                                            💡 Pro tip: Tag @nasa and use #SpaceApps for maximum visibility!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Botón de nueva simulación */}
                            <Button
                                type="button"
                                onClick={resetSimulation}
                                variant="default"
                                className="w-full text-black border-black hover:bg-black hover:text-white py-4"
                            >
                                🔄 New Simulation
                            </Button>
                        </div>
                    </div>
                ) : (
                    // Formulario original
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitSimulate)} className="space-y-4">

                            <h1 className='text-2xl font-bold text-black'>Simulation of Meteoroid Impact</h1>
                            <br />

                            <FormField
                                control={form.control}
                                name="selectedNasaMeteoroid"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel>NASA Meteoroids</FormLabel>
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
                                                    const selected = nasaMeteoroidsData.find(m => m.name === value)
                                                    if (selected && selected.id) {
                                                        // Guardar el ID y nombre del meteorito seleccionado
                                                        setSelectedNasaId(String(selected.id))
                                                        setSelectedNasaName(selected.name)
                                                        setSelectedMeteoriteId(String(selected.id))
                                                        // Limpiar selección de meteoritos guardados
                                                        setSelectedSavedId(null)
                                                        setSelectedSavedName(null)
                                                        form.setValue('selectedSavedMeteoroid', undefined)
                                                        toast.info(`NASA meteoroid selected: ${selected.name}`, { duration: 3000 })
                                                    }
                                                }}
                                                defaultValue={field.value}
                                                disabled={!!selectedSavedId || loading}
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder={loading ? "Loading..." : selectedSavedId ? "Disabled - Saved selected" : "Select NASA meteoroid"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {nasaMeteoroidsData.length === 0 ? (
                                                        <SelectItem value="none" disabled>
                                                            No NASA meteoroids
                                                        </SelectItem>
                                                    ) : (
                                                        nasaMeteoroidsData.map((meteoroid) => (
                                                            <SelectItem key={meteoroid.id || meteoroid.name} value={meteoroid.name}>
                                                                {meteoroid.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription>
                                            Use real models from NASA
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="selectedSavedMeteoroid"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel>Saved Meteoroids</FormLabel>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <GraduationCap className="h-4 w-4 text-green-600 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">Choose from custom meteoroids you've created and saved. These include your personalized parameters for radius, velocity, angle, and material composition.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value)
                                                    const selected = savedMeteoroidsData.find(m => m.name === value)
                                                    if (selected) {
                                                        // Guardar el ID y nombre del meteorito guardado
                                                        setSelectedSavedId(String(selected.id))
                                                        setSelectedSavedName(selected.name)
                                                        // Limpiar selección de NASA
                                                        setSelectedNasaId(null)
                                                        setSelectedNasaName(null)
                                                        form.setValue('selectedNasaMeteoroid', undefined)

                                                        loadMeteoroidData(selected)
                                                        if (selected.lat && selected.lng) {
                                                            setMapLocation(selected.lat, selected.lng)
                                                        }
                                                        toast.info(`Saved meteoroid selected: ${selected.name}`)
                                                    }
                                                }}
                                                defaultValue={field.value}
                                                disabled={!!selectedNasaId || loading}
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder={loading ? "Loading..." : selectedNasaId ? "Disabled - NASA selected" : "Select saved meteoroid"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {savedMeteoroidsData.length === 0 ? (
                                                        <SelectItem value="none" disabled>
                                                            No saved meteoroids
                                                        </SelectItem>
                                                    ) : (
                                                        savedMeteoroidsData.map((meteoroid) => (
                                                            <SelectItem key={meteoroid.id || meteoroid.name} value={meteoroid.name}>
                                                                {meteoroid.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription>
                                            Use your saved meteoroids
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
                                                    <p className="max-w-xs">Select a preset location or click anywhere on the map to choose your impact site. This determines where the meteoroid will strike Earth.</p>
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
        </TooltipProvider>
    )
}

export default FormTesting
