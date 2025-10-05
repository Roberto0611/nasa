<?php

namespace App\Http\Controllers;

use App\Models\meteoritos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use PhpParser\Node\Stmt\Foreach_;

class MeteoriteController extends Controller
{
    public function getAllMeteorites()
    {
        $apiKey = env('NASA_API_KEY', 'DEMO_KEY');
        
        $response = Http::get('https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=', [
            'api_key' => $apiKey
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $allNeos = $data['near_earth_objects'] ?? [];
            
            // Filtrar solo los que tienen aproximaciones a la Tierra
            $earthOrbitingNeos = array_filter($allNeos, function($neo) {
                $closeApproaches = $neo['close_approach_data'] ?? [];
                
                foreach ($closeApproaches as $approach) {
                    if (($approach['orbiting_body'] ?? '') === 'Earth') {
                        return true;
                    }
                }
                return false;
            });

            return response()->json([
                'total_neos' => count($allNeos),
                'earth_orbiting_count' => count($earthOrbitingNeos),
                'earth_orbiting_neos' => array_values($earthOrbitingNeos),
            ]);
        }
        
        return response()->json(['error' => 'API request failed']);
    }

    public function getMeteoritesNames(){
        $apiKey = env('NASA_API_KEY', 'DEMO_KEY');

        $response = Http::get('https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=', [
            'api_key' => $apiKey
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $allNeos = $data['near_earth_objects'] ?? [];

            // Filtrar solo los que tienen aproximaciones a la Tierra
            $earthOrbitingNeos = array_filter($allNeos, function($neo) {
                $closeApproaches = $neo['close_approach_data'] ?? [];
                
                foreach ($closeApproaches as $approach) {
                    if (($approach['orbiting_body'] ?? '') === 'Earth') {
                        return true;
                    }
                }
                return false;
            });

            // Obtener objetos con nombre e ID de los meteoritos que orbitan la Tierra
            $meteoriteData = array_map(function($neo) {
                return [
                    'id' => $neo['id'] ?? '',
                    'name' => $neo['name'] ?? ''
                ];
            }, $earthOrbitingNeos);

            return response()->json(array_values($meteoriteData));
        }

        return response()->json(['error' => 'API request failed']);
    }

    public function getMeteoriteById($id)
    {
        $apiKey = env('NASA_API_KEY');
        $response = Http::get("https://api.nasa.gov/neo/rest/v1/neo/{$id}", [
            'api_key' => $apiKey
        ]);

        if (! $response->successful()) {
            return response()->json(['error' => 'API request failed'], 500);
        }

        $data = $response->json();

        // --- Extraer diámetro (usar media geométrica entre min y max) ---
        $d_min = $data['estimated_diameter']['meters']['estimated_diameter_min'] ?? 0.0;
        $d_max = $data['estimated_diameter']['meters']['estimated_diameter_max'] ?? $d_min;
        // usar media geométrica para evitar sesgos
        $diameter = ($d_min > 0 && $d_max > 0) ? sqrt($d_min * $d_max) : $d_min;
        $radius = $diameter / 2.0;

        // --- Densidad por defecto (puede venir del form) ---
        // sugerencias: rock 2500-3000, iron 7800, nickel 8900
        // LUEGO PONER QUE ESTO CAMBIE SEGUN EL MATERIAL
        $rho_obj = floatval(request()->input('material_density_kg_m3', 2700));

        // volumen y masa (esfera equivalente)
        $volume = (4.0/3.0) * pi() * pow($radius, 3);
        $mass = $rho_obj * $volume;

        // --- Velocidad: parsear y validar ---
        $vel_km_s = 0.0;
        if (! empty($data['close_approach_data'][0]['relative_velocity']['kilometers_per_second'])) {
            $vel_km_s = floatval($data['close_approach_data'][0]['relative_velocity']['kilometers_per_second']);
        }
        // permitir override por el usuario (por ejemplo en el simulador)
        $vel_user_km_s = request()->input('velocity_km_s', null);
        if ($vel_user_km_s !== null) {
            $vel_km_s = floatval($vel_user_km_s);
        }

        // convertir a m/s
        $v0 = $vel_km_s * 1000.0;

        // opción: forzar mínimo físico (escape) pero permitir override con flag
        $allow_suborbital = filter_var(request()->input('allow_suborbital', false), FILTER_VALIDATE_BOOLEAN);
        $v_min_physical = 11000.0; // m/s (valor típico mínimo para impactos desde el espacio)
        if (! $allow_suborbital && $v0 > 0 && $v0 < $v_min_physical) {
            // si la velocidad de la API es menor que la mínima física y no se permite override, la ajustamos
            $v0 = $v_min_physical;
        }

        // energía inicial
        $kineticEnergy = 0.5 * $mass * pow($v0, 2);

        // parámetros por defecto (puedes pasarlos via request/form)
        $theta_deg = floatval(request()->input('entry_angle_deg', 45.0)); // 0-90, 90 vertical
        $strength = floatval(request()->input('material_strength_Pa', 1e7)); // Pa
        $C_d = floatval(request()->input('drag_coefficient', 1.0));
        $rho0 = floatval(request()->input('atm_density_sea_level', 1.225));
        $H = floatval(request()->input('scale_height', 8000.0));

        // ejecutar simulación
        $atmosphericResults = $this->estimateAtmosphericEffects(
            $diameter,
            $rho_obj,
            $v0,
            $theta_deg,
            $strength,
            $C_d,
            $rho0,
            $H
        );

        return response()->json([
            'data' => $data,
            'calculations' => [
                'diameter_m' => $diameter,
                'radius_m' => $radius,
                'volume_m3' => $volume,
                'mass_kg' => $mass,
                'velocity_ms' => $v0,
                'kinetic_energy_initial_J' => $kineticEnergy,
                'kinetic_energy_initial_megatons_tnt' => $kineticEnergy / 4.184e15
            ],
            'atmospheric_impact' => $atmosphericResults,
            'user_parameters_needed' => [
                'entry_angle_deg' => 'Ángulo de entrada (0-90°, donde 90 es vertical)',
                'material_strength_Pa' => 'Resistencia del material (rubble: 1e4-1e6, rock: 1e7, iron: 1e8)',
                'drag_coefficient' => 'Coeficiente de arrastre (típicamente 0.8-1.5)',
                'material_density_kg_m3' => 'Densidad del material (rock: 2500-3000, iron: 7800, nickel: 8900)',
                'velocity_km_s' => 'Velocidad de entrada en km/s (si el usuario la sobreescribe)'
            ]
        ]);
    }

    /**
     * estimateAtmosphericEffects
     * Modelo mejorado:
     * - ablación por fricción (simple)
     * - ruptura por presión dinámica q = 0.5 rho v^2 > strength
     * - actualización coherente de masa, área y energía
     * - dt adaptativo y pasos de integración semi-implícitos (más estables)
     */
    private function estimateAtmosphericEffects(
        $D,            // diameter (m)
        $rho_obj,      // object density (kg/m³)
        $v0,           // entry speed (m/s)
        $theta_deg,    // entry angle from horizontal (deg); 90 = vertical
        $strength = 1e7,   // material tensile strength (Pa)
        $C_d = 1.0,        // drag coefficient
        $rho0 = 1.225,     // sea-level air density (kg/m³)
        $H = 8000.0        // scale height (m)
    ) {
        // constantes de ablación y parámetros físicos (valores típicos)
        $Lambda = 0.1;       // coeficiente de transferencia de calor (0.05 - 0.2)
        $Q = 6e6;            // calor de ablación efectivo J/kg (roca ~6e6 J/kg)
        $g = 9.81;

        // geometría y masa inicial
        $radius = $D / 2.0;
        $area = pi() * pow($radius, 2);  // área frontal
        $mass = $rho_obj * (4.0/3.0) * pi() * pow($radius, 3);

        // condiciones iniciales
        $theta = deg2rad(max(0.0, min(90.0, $theta_deg)));
        $v = max(0.0, $v0);
        $h = 120000.0;  // altitud inicial (m)
        $t = 0.0;

        $E_initial = 0.5 * $mass * pow($v0, 2);
        $E_remain = $E_initial;

        $broke = false;
        $breakup_alt = null;
        $fragments_mass = 0.0;
        $mass_before_break = $mass;

        // parámetros de integración adaptativa
        $dt = 0.05;         // tiempo inicial (s)
        $t_max = 3600;      // límite por seguridad
        $min_dt = 1e-4;
        $max_dt = 1.0;

        $iterations = 0;
        $max_iterations = 500000;

        // Umbral para considerar que el cuerpo es "tan grande" que la atmósfera aporta poco
        $big_object_threshold = 1000.0; // m (1 km) - para cuerpos >> este valor, atmósfera poco efecto relativo

        while ($h > 0 && $v > 10.0 && $t < $t_max && $iterations < $max_iterations) {
            // densidad atmosférica simple exponencial
            $rho_air = $rho0 * exp(-$h / $H);

            // presión dinámica
            $q = 0.5 * $rho_air * pow($v, 2);

            // ABLOCIÓN: estimación de masa perdida por calentamiento (simple)
            // dm/dt ≈ - (Lambda * A * rho_air * v^3) / (2 * Q)
            $dm_dt_ablation = - ( $Lambda * $area * $rho_air * pow($v, 3) ) / (2.0 * $Q);

            if ($dm_dt_ablation < 0) {
                // limitar ablación a no borrar masa instantáneamente
                $dm_ablation = max($mass * -0.9999, $dm_dt_ablation * $dt); // no más del 99.99% en un paso
            } else {
                $dm_ablation = 0.0;
            }

            // RUPTURA: si la presión dinámica supera la resistencia material -> ruptura
            if (!$broke && $q >= $strength) {
                $broke = true;
                $breakup_alt = $h;
                $mass_before_break = $mass;

                // Heurística basada en altitud de ruptura: a mayor altura más fragmentación
                if ($h > 30000) {
                    $fragments_mass = 0.1 * $mass;
                } elseif ($h > 20000) {
                    $fragments_mass = 0.25 * $mass;
                } elseif ($h > 10000) {
                    $fragments_mass = 0.5 * $mass;
                } else {
                    $fragments_mass = 0.8 * $mass;
                }
                // Después de la ruptura, la masa que queda como "fragmentos grandes" será fragments_mass,
                // y el resto (1 - fragments_mass/mass) se dispersa en polvo (permitimos ablación acelerada)
            }

            // Fuerza de arrastre Fd = 0.5 Cd rho_air v^2 A
            $F_d = 0.5 * $C_d * $rho_air * pow($v, 2) * $area;

            // Aceleraciones
            $a_drag = - $F_d / max(1e-6, $mass); // proteger división por 0
            $a_gravity = - $g * sin($theta);

            // Actualizar velocidad (método semi-implícito: v_{n+1} = v_n + a * dt)
            $v_new = $v + ($a_drag + $a_gravity) * $dt;
            if ($v_new < 0) {
                $v_new = 0.0;
            }

            // Distancia vertical recorrida aprox: ds = v_avg * dt
            $v_avg = 0.5 * ($v + $v_new);
            $ds = $v_avg * $dt;
            $dh = - $ds * sin($theta);
            $h_new = $h + $dh;
            if ($h_new < 0) {
                $h_new = 0.0;
            }

            // Trabajo del arrastre (energía transferida al aire) ~ Fd * ds
            $work_drag = $F_d * $ds;
            $E_remain -= $work_drag;
            if ($E_remain < 0) {
                $E_remain = 0.0;
            }

            // Aplicar ablación (masa perdida por calor)
            $mass += $dm_ablation; // dm_ablation es negativo
            if ($mass < 0) $mass = 0.0;

            // Si rompió, ajustar área y masa coherentemente (una sola vez)
            if ($broke && $mass > 0 && $mass != $mass_before_break) {
                // fragments_mass calculado arriba es la fracción de masa que queda (en kg)
                // Normalizamos: fragments_mass está en kg ya
            }
            if ($broke && $mass > 0 && $mass_before_break > 0) {
                // si la ruptura acaba de ocurrir: asignar masa al remanente
                if ($mass > 0 && $mass > $mass_before_break * 0.9999) {
                    // primera vez que aplicamos la fragmentación: convertir a masa de fragmentos
                    $mass = max(1e-6, $fragments_mass);
                    // reasignar área según nuevo tamaño efectivo (asumir fragmentos equivalentes a una esfera con densidad rho_obj)
                    $radius = pow( (3.0 * $mass) / (4.0 * pi() * $rho_obj) , 1.0/3.0 );
                    $area = pi() * pow($radius, 2);
                }
            }

            // Si el objeto es enorme (>= umbral), la ablación/fractura afecta menos: opción de limitar efecto
            if ($D >= $big_object_threshold) {
                // reducir efecto de ablación artificialmente (la atmósfera apenas frena a super-objetos)
                // (para simuladores simplificados). Ajustar hiperparámetros según necesidad.
                $mass = max($mass, $rho_obj * (4.0/3.0) * pi() * pow($D/2.0, 3) * 0.9);
            }

            // Avanzar variables
            $v = $v_new;
            $h = $h_new;
            $t += $dt;
            $iterations++;

            // adaptar dt en función de velocidad y altitud (dt más pequeño si v grande)
            $dt = max($min_dt, min($max_dt, 0.05 + 1000.0 / (1.0 + $v))); // heurística simple
        }

        // Resultados y coherencias finales
        $f_atm = ($E_initial > 0) ? ($E_remain / $E_initial) : 0.0;
        $original_mass = $rho_obj * (4.0/3.0) * pi() * pow($D/2.0, 3);
        $f_frag = ($original_mass > 0) ? ($mass / $original_mass) : 0.0;
        $f_total = $f_atm * $f_frag;

        // estimación simple de energía en megatones de TNT
        $initial_megatons = $E_initial / 4.184e15;
        $final_megatons = $E_remain / 4.184e15;

        // estimación de cráter (modelo grosero - escala empírica)
        $crater_energy_J = $E_remain; // energía que impacta el suelo
        // Modelo más realista basado en Melosh (Earth Impact Effects)
        $E_mt = $crater_energy_J / 4.184e15;
        $crater_diameter_m = 0.07 * pow($E_mt, 0.333) * 1000; // salida en metros
        if ($h <= 0 && $crater_energy_J > 1e12) { // si impacta
            // Estimación empírica realista (Melosh/Holsapple)
            // Escala: 1e24 J ≈ 180 km de diámetro (Chicxulub)
            $g = 9.81;
            $rho_t = 2700;
            $C = 1.3;
            $crater_diameter_m = $C * pow($crater_energy_J / ($g * $rho_t), 0.25);
            // Clasificación rápida del impacto
            $impact_scale = 'minor';
            if ($crater_diameter_m > 100000) $impact_scale = 'global';
            elseif ($crater_diameter_m > 10000) $impact_scale = 'regional';
            elseif ($crater_diameter_m > 1000) $impact_scale = 'local';
        }

        return [
            'f_atm' => $f_atm,
            'f_frag' => $f_frag,
            'f_total' => $f_total,
            'broke' => $broke,
            'breakup_altitude_m' => $breakup_alt,
            'E_initial_J' => $E_initial,
            'E_after_J' => $E_remain,
            'energy_lost_percent' => (1.0 - $f_atm) * 100.0,
            'mass_lost_percent' => (1.0 - $f_frag) * 100.0,
            'final_velocity_ms' => $v,
            'final_altitude_m' => $h,
            'simulation_time_s' => $t,
            'initial_megatons_tnt' => $initial_megatons,
            'final_megatons_tnt' => $final_megatons,
            'crater_diameter_m' => $crater_diameter_m
        ];
    }

    public function store(Request $request)
    {
        $meteorite = new meteoritos();
        $meteorite->name = $request->input('namemeteroid');
        $meteorite->radius = $request->input('radiusMeteroid');
        $meteorite->velocity = $request->input('velocity');
        $meteorite->entry_angle = $request->input('angle');
        $meteorite->material = $request->input('material');
        $meteorite->save();

        return back()->with('success', 'Meteorito registrado exitosamente');
    }


    public function getAllUserMeteorites()
    {
        $meteorites = meteoritos::all();
        return response()->json($meteorites);
    }

    public function getUserMeteoriteById($id)
    {
        $meteorite = meteoritos::find($id);
        if (!$meteorite) {
            return response()->json(['error' => 'Meteorito no encontrado'], 404);
        }

        // --- Extraer datos del meteorito del usuario ---
        $radius = floatval($meteorite->radius); // radio en metros
        $diameter = $radius * 2.0;
        $vel_km_s = floatval($meteorite->velocity); // velocidad en km/s
        $v0 = $vel_km_s; // ya esta en m/s
        $theta_deg = floatval($meteorite->entry_angle); // ángulo de entrada en grados
        $material = $meteorite->material; // string: 'rock', 'iron', 'nickel', etc.

        // --- Mapear material a densidad (kg/m³) ---
        $materialDensities = [
            'rock' => 2700,
            'iron' => 7800,
            'nickel' => 8900,
            'rubble' => 2000,
            'ice' => 917
        ];
        $rho_obj = $materialDensities[strtolower($material)] ?? 2700; // por defecto rock

        // --- Mapear material a resistencia (Pa) ---
        $materialStrengths = [
            'rock' => 1e7,
            'iron' => 1e8,
            'nickel' => 1e8,
            'rubble' => 1e5,
            'ice' => 1e6
        ];
        $strength = $materialStrengths[strtolower($material)] ?? 1e7; // por defecto rock

        // --- Calcular volumen y masa (esfera equivalente) ---
        $volume = (4.0/3.0) * pi() * pow($radius, 3);
        $mass = $rho_obj * $volume;

        // --- Energía cinética inicial ---
        $kineticEnergy = 0.5 * $mass * pow($v0, 2);

        // --- Parámetros atmosféricos por defecto ---
        $C_d = floatval(request()->input('drag_coefficient', 1.0));
        $rho0 = floatval(request()->input('atm_density_sea_level', 1.225));
        $H = floatval(request()->input('scale_height', 8000.0));

        // --- Ejecutar simulación atmosférica ---
        $atmosphericResults = $this->estimateAtmosphericEffects(
            $diameter,
            $rho_obj,
            $v0,
            $theta_deg,
            $strength,
            $C_d,
            $rho0,
            $H
        );

        return response()->json([
            'data' => $meteorite,
            'calculations' => [
                'diameter_m' => $diameter,
                'radius_m' => $radius,
                'volume_m3' => $volume,
                'mass_kg' => $mass,
                'velocity_ms' => $v0,
                'kinetic_energy_initial_J' => $kineticEnergy,
                'kinetic_energy_initial_megatons_tnt' => $kineticEnergy / 4.184e15,
                'material_density_kg_m3' => $rho_obj,
                'material_strength_Pa' => $strength
            ],
            'atmospheric_impact' => $atmosphericResults,
            'parameters_used' => [
                'entry_angle_deg' => $theta_deg,
                'material_strength_Pa' => $strength,
                'drag_coefficient' => $C_d,
                'material_density_kg_m3' => $rho_obj,
                'velocity_km_s' => $vel_km_s
            ]
        ]);
    }
}
