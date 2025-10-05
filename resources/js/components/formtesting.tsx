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
        form.reset()
        toast.info('Simulation reset', { duration: 1000 })
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

                        <div className="pt-2">
                            <Button
                                type="button"
                                onClick={resetSimulation}
                                variant="default"
                                className="w-full text-black border-black hover:bg-black hover:text-white"
                            >
                                New Simulation
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
