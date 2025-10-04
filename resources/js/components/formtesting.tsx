// FormTesting.tsx - Formulario para simulación de impacto de meteoritos
// Carga datos desde Supabase y permite seleccionar ubicación en el mapa

import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
    name: string
    radiusMeteroid?: number
    velocity?: number
    angle?: number
    material?: string
    lat?: number
    lng?: number
}

const FormTesting = () => {
    const { updateMeteroidData, setLocation } = useMeteroidContext()
    const [nasaMeteoroidsData, setNasaMeteoroidsData] = useState<MeteoroidRecord[]>([])
    const [savedMeteoroidsData, setSavedMeteoroidsData] = useState<MeteoroidRecord[]>([])
    const [loading, setLoading] = useState(false)

    const form = useForm<any>({
        defaultValues: {
            selectedNasaMeteoroid: undefined,
            selectedSavedMeteoroid: undefined,
            selectedCity: undefined,
        }
    })

    // TODO: Fetch NASA meteoroids from Supabase
    const fetchNasaMeteoroidsFromSupabase = async () => {
        setLoading(true)
        try {
            // Aquí irá tu código de fetch desde Supabase
            // const { data, error } = await supabase.from('nasa_meteoroids').select('*')
            // if (error) throw error
            // setNasaMeteoroidsData(data)

            toast.success('NASA meteoroids loaded')
        } catch (error) {
            console.error('Error fetching NASA meteoroids:', error)
            toast.error('Error loading NASA meteoroids')
        } finally {
            setLoading(false)
        }
    }

    // TODO: Fetch saved meteoroids from Supabase
    const fetchSavedMeteoroidsFromSupabase = async () => {
        setLoading(true)
        try {
            // Aquí irá tu código de fetch desde Supabase
            // const { data, error } = await supabase.from('saved_meteoroids').select('*')
            // if (error) throw error
            // setSavedMeteoroidsData(data)

            toast.success('Saved meteoroids loaded')
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

    const onSubmitSimulate = (data: any) => {
        console.log("Simulating meteoroid impact with data:", data)
        toast.success("Starting simulation...")
    }

    return (
        <div id="form-testing-section">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitSimulate)} className="space-y-4">

                    <h1 className='text-2xl font-bold'>Simulation of Meteoroid Impact</h1>
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
                                            <SelectValue placeholder="Select NASA meteoroid" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {nasaMeteoroidsData.map((meteoroid) => (
                                                <SelectItem key={meteoroid.name} value={meteoroid.name}>
                                                    {meteoroid.name}
                                                </SelectItem>
                                            ))}
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
                                            <SelectValue placeholder="Select saved meteoroid" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {savedMeteoroidsData.map((meteoroid) => (
                                                <SelectItem key={meteoroid.name} value={meteoroid.name}>
                                                    {meteoroid.name}
                                                </SelectItem>
                                            ))}
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

                    <Button type="submit">
                        Simulate
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default FormTesting
