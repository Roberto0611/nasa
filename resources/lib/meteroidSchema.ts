import { z } from 'zod'

export const meteroidSchema = z.object({
    radiusMeteroid: z.number().min(0, 'Radius must be positive'),
    velocity: z.number().min(0, 'Velocity must be positive'),
    angle: z.number().min(0).max(90, 'Angle must be between 0 and 90 degrees'),
    material: z.string().min(1, 'Material is required'),
    // namemeteroid is optional for some forms; include if needed by specific forms
    namemeteroid: z.string().optional(),
})

export type MeteroidFormData = z.infer<typeof meteroidSchema>
