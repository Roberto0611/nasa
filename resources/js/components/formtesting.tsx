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
            toast.success(`${mappedData.length} NASA meteoroids loaded`)
        } catch (error) {
            console.error('Error fetching NASA meteoroids:', error)
            toast.error('Error loading NASA meteoroids')
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
            toast.success(`${mappedData.length} saved meteoroids loaded`)
        } catch (error) {
            console.error('Error fetching saved meteoroids:', error)
            toast.error('Error loading saved meteoroids')
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
        toast.success(`Location updated: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    }

    const onSubmitSimulate = async (data: any) => {
        console.log("Simulating meteoroid impact with data:", data)
        
        if (!selectedNasaId) {
            toast.error('Please select a NASA meteoroid first')
            return
        }

        try {
            toast.info('Calculating impact area...')
            
            // Llamar a la API para obtener los datos del meteorito y el cráter
            const response = await axios.get(`/getMeteoriteById/${selectedNasaId}`)
            const atmosphericImpact = response.data?.atmospheric_impact
            const calculations = response.data?.calculations
            const craterDiameter = atmosphericImpact?.crater_diameter_m
            
            // Guardar todos los datos del impacto
            setImpactData({
                name: selectedNasaName,
                atmospheric_impact: atmosphericImpact,
                calculations: calculations
            })
            
            if (craterDiameter) {
                // Calcular radio (diámetro / 2)
                const radius = craterDiameter / 2
                setCraterRadius(radius)
                console.log('✅ Crater radius:', radius, 'meters')
                toast.success('Impact area calculated!')
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
        form.reset()
        toast.info('Simulation reset')
    }

    return (
        <div id="form-testing-section" className="pb-6">
            {/* Si hay datos de impacto, mostrar la información en lugar del formulario */}
            {impactData ? (
                <div className="space-y-4 pb-4">
                    <h1 className='text-2xl font-bold text-black'>Impact Analysis Results</h1>
                    <h2 className='text-xl font-semibold text-black'>{impactData.name}</h2>
                    
                    <div className="space-y-3 bg-white/90 p-4 rounded-lg border border-gray-300 shadow-sm">
                        <h3 className='text-lg font-bold text-blue-600'>Meteoroid Properties</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-black">
                            <div><span className="font-semibold">Diameter:</span> {impactData.calculations?.diameter_m?.toFixed(2)} m</div>
                            <div><span className="font-semibold">Mass:</span> {impactData.calculations?.mass_kg?.toExponential(2)} kg</div>
                            <div><span className="font-semibold">Velocity:</span> {impactData.calculations?.velocity_ms?.toFixed(2)} m/s</div>
                            <div><span className="font-semibold">Initial Energy:</span> {impactData.calculations?.kinetic_energy_initial_megatons_tnt?.toFixed(2)} MT TNT</div>
                        </div>
                    </div>

                    <div className="space-y-3 bg-white/90 p-4 rounded-lg border border-gray-300 shadow-sm">
                        <h3 className='text-lg font-bold text-red-600'>Atmospheric Effects</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-black">
                            <div><span className="font-semibold">Energy Remaining:</span> {(impactData.atmospheric_impact?.f_atm * 100)?.toFixed(1)}%</div>
                            <div><span className="font-semibold">Mass Remaining:</span> {(impactData.atmospheric_impact?.f_frag * 100)?.toFixed(1)}%</div>
                            <div><span className="font-semibold">Total Efficiency:</span> {(impactData.atmospheric_impact?.f_total * 100)?.toFixed(1)}%</div>
                            <div><span className="font-semibold">Fragmented:</span> {impactData.atmospheric_impact?.broke ? 'Yes' : 'No'}</div>
                            {impactData.atmospheric_impact?.breakup_altitude_m && (
                                <div className="col-span-2"><span className="font-semibold">Breakup Altitude:</span> {(impactData.atmospheric_impact?.breakup_altitude_m / 1000)?.toFixed(2)} km</div>
                            )}
                            <div><span className="font-semibold">Final Velocity:</span> {impactData.atmospheric_impact?.final_velocity_ms?.toFixed(2)} m/s</div>
                            <div><span className="font-semibold">Energy Lost:</span> {impactData.atmospheric_impact?.energy_lost_percent?.toFixed(1)}%</div>
                        </div>
                    </div>

                    <div className="space-y-3 bg-white/90 p-4 rounded-lg border border-gray-300 shadow-sm">
                        <h3 className='text-lg font-bold text-purple-600'>Impact Crater</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-black">
                            <div><span className="font-semibold">Crater Diameter:</span> {impactData.atmospheric_impact?.crater_diameter_m?.toFixed(0)} m</div>
                            <div><span className="font-semibold">Crater Radius:</span> {(impactData.atmospheric_impact?.crater_diameter_m / 2)?.toFixed(0)} m</div>
                            <div><span className="font-semibold">Impact Energy:</span> {(impactData.atmospheric_impact?.E_after_J / 4.184e15)?.toFixed(2)} MT TNT</div>
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
                                <FormLabel>NASA Meteoroids</FormLabel>
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
                                                toast.info(`NASA meteoroid selected: ${selected.name}`)
                                            }
                                        }}
                                        defaultValue={field.value}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={loading ? "Loading..." : "Select NASA meteoroid"} />
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
                                <FormLabel>Saved Meteoroids</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value)
                                            const selected = savedMeteoroidsData.find(m => m.name === value)
                                            if (selected) {
                                                loadMeteoroidData(selected)
                                                if (selected.lat && selected.lng) {
                                                    setMapLocation(selected.lat, selected.lng)
                                                }
                                            }
                                        }}
                                        defaultValue={field.value}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={loading ? "Loading..." : "Select saved meteoroid"} />
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
                                <FormLabel>Choose a City</FormLabel>
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
                        disabled={!selectedNasaId}
                    >
                        Simulate
                    </Button>
                </form>
            </Form>
            )}
        </div>
    )
}

export default FormTesting
