// SelectMeteroidForm.tsx - Formulario interactivo para configurar parámetros del meteorito
// Se sincroniza en tiempo real con PersonalizablePlanet a través del MeteroidContext

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'  // Validador para React Hook Form
import { useForm } from 'react-hook-form'  // Manejo de formularios
import { router } from '@inertiajs/react'  // Para hacer peticiones a Laravel
import { meteroidSchema } from '../../lib/meteroidSchema'
import type { MeteroidFormData } from '../../lib/meteroidSchema'
import { useMeteroidContext } from '../context/MeteroidContext'  // Contexto global

import { Button } from "../components/ui/button"  // Componente de botón
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./form"  // Componentes de formulario de shadcn/ui
import { Input } from "./input"  // Campo de entrada
import { toast } from 'sonner'  // Sistema de notificaciones

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./select"  // Componente selector desplegable

/**
 * Esquema de validación con Zod
 * Define las reglas y tipos para cada campo del formulario
 */
// using shared meteroidSchema and MeteroidFormData from src/lib/meteroidSchema

/**
 * Props del componente FormMeteroid
 */
interface FormMeteroidProps {
    onActivateSimulation?: () => void  // Función para activar la simulación
}

/**
 * Componente principal del formulario de meteorito
 * 
 * Funcionalidades:
 * - Campos para configurar propiedades del meteorito
 * - Validación en tiempo real con Zod
 * - Sincronización automática con el planeta 3D
 * - Botones para guardar y usar modelos NASA
 */
const FormMeteroid: React.FC<FormMeteroidProps> = ({ onActivateSimulation }) => {
    // Obtener estado y función de actualización del contexto
    const { updateMeteroidData } = useMeteroidContext()

    // Configuración del formulario con React Hook Form
    const form = useForm<MeteroidFormData>({
        resolver: zodResolver(meteroidSchema),  // Usar validación Zod
        defaultValues: {
            velocity: undefined,          // Sin valor inicial
            angle: undefined,            // Sin valor inicial
            material: undefined,         // Sin valor inicial
            radiusMeteroid: undefined,   // Sin valor inicial
            namemeteroid: undefined       // Sin valor inicial
        }
    })

    /**
     * Efecto para sincronización en tiempo real con el planeta 3D
     * 
     * Usa form.watch() para escuchar cambios en cualquier campo del formulario
     * Cuando un campo cambia, actualiza inmediatamente el contexto global
     * Esto hace que el planeta 3D se actualice instantáneamente
     */
    useEffect(() => {
        // Suscribirse a cambios en el formulario
        const subscription = form.watch((value) => {
            const updates: any = {}

            // Solo actualizar campos que tienen valores definidos
            if (value.radiusMeteroid !== undefined) updates.radiusMeteroid = value.radiusMeteroid
            if (value.velocity !== undefined) updates.velocity = value.velocity
            if (value.angle !== undefined) updates.angle = value.angle
            if (value.material !== undefined) updates.material = value.material

            // Si hay actualizaciones, enviarlas al contexto
            if (Object.keys(updates).length > 0) {
                updateMeteroidData(updates)
            }
        })

        // Limpiar suscripción cuando el componente se desmonte
        return () => subscription.unsubscribe()
    }, [form.watch, updateMeteroidData])

    /**
     * Manejador para el botón "Use real models of NASA"
     * Para ir a la pagina de Simulation 
     */

    const onSubmitNasaModels = () => {
        onActivateSimulation?.()
        toast.success("Going to use real NASA models!")
    }

    /**
     * Manejador para el botón "Save"
     * Envía los datos del meteorito a Laravel usando Inertia
     * 
     * @param {MeteroidFormData} data - Datos validados del formulario
     */
    const onSubmitSave = async (data: MeteroidFormData) => {
        try {
            console.log("🚀 Enviando datos del meteorito a Laravel:", data)

            // Enviar datos a Laravel usando Inertia
            router.post('/meteorites/store', data, {
                onSuccess: (page) => {
                    console.log("✅ Datos guardados exitosamente en Laravel")

                    // Mostrar toast de éxito
                    toast.success(`Meteoroid "${data.namemeteroid}" saved successfully!`)

                    // Opcional: guardar también en localStorage
                    localStorage.setItem('meteroidData', JSON.stringify(data))
                },
                onError: (errors) => {
                    console.error("❌ Error al guardar en Laravel:", errors)
                    toast.error("Error saving meteoroid data")
                },
                onFinish: () => {
                    console.log("🔄 Petición completada")
                }
            })

        } catch (error) {
            console.error("❌ Error inesperado:", error)
            toast.error("Unexpected error: " + (error as Error).message)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitSave)} className="space-y-4">

                <h1 className='text-2xl font-bold text-black'> Create your Meteroid</h1>


                <FormField
                    control={form.control}
                    name="namemeteroid"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name of the meteoroid</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="Enter meteoroid name"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Enter the name of the meteoroid
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="radiusMeteroid"
                    render={({ field }) => (

                        <FormItem>
                            <FormLabel>Radius of the meteoroid (m)</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="1000"
                                    {...field}
                                    onChange={e => {
                                        const value = e.target.value.replace(/[^0-9.]/g, '')
                                        field.onChange(value ? parseFloat(value) : undefined)
                                    }}
                                />
                            </FormControl>
                            <FormDescription>
                                Enter the radius of the meteoroid in meters
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="velocity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Velocity (m/s)</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="1000"
                                    {...field}
                                    onChange={e => {
                                        const value = e.target.value.replace(/[^0-9.]/g, '')
                                        field.onChange(value ? parseFloat(value) : undefined)
                                    }}
                                />
                            </FormControl>
                            <FormDescription>
                                Enter the velocity of the meteoroid in meters per second
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="angle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Entry Angle (degrees)</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="45"
                                    {...field}
                                    onChange={e => {
                                        const value = e.target.value.replace(/[^0-9.]/g, '')
                                        field.onChange(value ? parseFloat(value) : undefined)
                                    }}
                                />
                            </FormControl>
                            <FormDescription>
                                Enter the entry angle (0-90 degrees)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="material"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Material of the meteoroid</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select material" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rock">Rock</SelectItem>
                                        <SelectItem value="iron">Iron</SelectItem>
                                        <SelectItem value="nickel">Nickel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormDescription>
                                Enter the material of the meteoroid
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div>
                        <Button type="submit" variant="default" className="text-black border-black hover:bg-black hover:text-white" onClick={form.handleSubmit(onSubmitSave)}>
                            Save
                        </Button>
                    </div>
                    <div>
                        <Button type="button" variant="default" className="text-black border-black hover:bg-black hover:text-white" onClick={onSubmitNasaModels}>
                            Use real models of NASA
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}

export default FormMeteroid
