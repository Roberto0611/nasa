<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DeflectionController extends Controller
{
    /**
     * Simula estrategias de deflección de asteroides
     * Basado en física real y misiones como NASA DART
     */
    public function simulateDeflection(Request $request)
    {
        try {
            $impactData = $request->input('impactData');
            $strategy = $request->input('strategy');
            $leadTime = $request->input('leadTime', 5); // años por defecto
            
            // Extraer datos del asteroide
            $asteroidMass = $impactData['calculations']['mass_kg'] ?? 1e9;
            $asteroidVelocity = $impactData['calculations']['velocity_ms'] ?? 20000;
            $asteroidDiameter = $impactData['calculations']['diameter_m'] ?? 50;
            
            // Calcular según estrategia
            $result = $this->calculateDeflection($strategy, $leadTime, $asteroidMass, $asteroidVelocity, $asteroidDiameter);
            
            return response()->json([
                'success' => true,
                'strategy' => $strategy,
                'results' => $result
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in deflection simulation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error simulating deflection: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Calcula los efectos de cada estrategia de deflección
     */
    private function calculateDeflection($strategy, $leadTime, $asteroidMass, $asteroidVelocity, $asteroidDiameter)
    {
        $results = [];
        
        switch($strategy) {
            case 'kinetic':
                // Basado en misión NASA DART (2022)
                // Impactador de 570 kg a 6.6 km/s
                $impactorMass = 570; // kg
                $impactorVelocity = 6600; // m/s
                
                // Momentum transfer: Δv = (m_impactor × v_impactor × β) / m_asteroid
                // β = momentum enhancement factor (típicamente 2-5 por eyección de material)
                $beta = 3.5; // factor de mejora por eyección
                
                $deltaV = ($impactorMass * $impactorVelocity * $beta) / $asteroidMass;
                
                $results = [
                    'deltaV_ms' => round($deltaV, 6),
                    'deltaV_cms' => round($deltaV * 100, 4), // cm/s más legible
                    'impactor_mass_kg' => $impactorMass,
                    'impact_velocity_kms' => $impactorVelocity / 1000,
                    'momentum_enhancement' => $beta,
                    'cost_billion_usd' => 0.33, // Costo real de DART
                    'success_probability' => 0.85,
                    'lead_time_years' => $leadTime,
                    'launch_time_months' => 10, // tiempo típico de lanzamiento
                    'description' => 'High-speed spacecraft collision to change asteroid velocity',
                    'mission_reference' => 'NASA DART (2022)',
                    'advantages' => 'Proven technology, relatively cheap, fast deployment',
                    'disadvantages' => 'Requires precise targeting, one-shot attempt'
                ];
                break;
                
            case 'gravity-tractor':
                // Tractor gravitacional: nave cerca del asteroide usando gravedad
                $spacecraftMass = 20000; // kg (nave grande)
                $distance = 100; // metros de separación
                $G = 6.674e-11; // constante gravitacional
                
                // Fuerza gravitacional: F = G × m1 × m2 / r²
                $force = ($G * $spacecraftMass * $asteroidMass) / pow($distance, 2);
                
                // Aceleración del asteroide: a = F / m
                $acceleration = $force / $asteroidMass;
                
                // Tiempo en segundos
                $timeSeconds = $leadTime * 365.25 * 24 * 3600;
                
                // Δv = a × t
                $deltaV = $acceleration * $timeSeconds;
                
                $results = [
                    'deltaV_ms' => round($deltaV, 6),
                    'deltaV_cms' => round($deltaV * 100, 4),
                    'spacecraft_mass_kg' => $spacecraftMass,
                    'hover_distance_m' => $distance,
                    'gravitational_force_N' => $force,
                    'cost_billion_usd' => 5.0,
                    'success_probability' => 0.95,
                    'lead_time_years' => $leadTime,
                    'operation_duration_years' => $leadTime - 1,
                    'description' => 'Spacecraft hovers near asteroid, using gravity to slowly pull it off course',
                    'mission_reference' => 'ESA/NASA Concept',
                    'advantages' => 'Precise control, can adjust mid-mission, very high success rate',
                    'disadvantages' => 'Requires many years of lead time, expensive, slow'
                ];
                break;
                
            case 'nuclear':
                // Explosión nuclear cercana (standoff)
                // Basado en estudios de Lawrence Livermore National Lab
                $yieldMegatons = 1.0; // 1 megaton TNT
                $yieldJoules = $yieldMegatons * 4.184e15;
                $standoffDistance = $asteroidDiameter * 3; // 3 diámetros de distancia
                
                // Energía transferida (aprox 1% de la explosión al asteroide)
                $transferEfficiency = 0.01;
                $energyTransferred = $yieldJoules * $transferEfficiency;
                
                // Δv estimado basado en ablación y momentum
                // Aproximación: Δv ≈ sqrt(2 × E / m)
                $deltaV = sqrt(2 * $energyTransferred / $asteroidMass);
                
                $results = [
                    'deltaV_ms' => round($deltaV, 6),
                    'deltaV_cms' => round($deltaV * 100, 4),
                    'warhead_yield_MT' => $yieldMegatons,
                    'standoff_distance_m' => $standoffDistance,
                    'energy_joules' => $yieldJoules,
                    'transfer_efficiency' => $transferEfficiency * 100, // porcentaje
                    'cost_billion_usd' => 10.0,
                    'success_probability' => 0.70,
                    'lead_time_years' => $leadTime,
                    'warning_time_months' => 6,
                    'description' => 'Nuclear detonation near (not on) asteroid to vaporize surface and create thrust',
                    'mission_reference' => 'LLNL/DOE Studies',
                    'advantages' => 'Highest delta-V, works on large asteroids, proven nuclear tech',
                    'disadvantages' => 'Political/legal issues, risk of fragmentation, expensive, risky'
                ];
                break;
                
            case 'laser':
                // Ablación láser: evaporar material para crear thrust
                $laserPowerMW = 10; // 10 MW láser
                $laserPowerWatts = $laserPowerMW * 1e6;
                $operationYears = min($leadTime - 0.5, 3); // máximo 3 años de operación
                $operationSeconds = $operationYears * 365.25 * 24 * 3600;
                
                // Eficiencia de ablación (típicamente 0.01-0.1)
                $ablationEfficiency = 0.05;
                
                // Masa evaporada por segundo (aproximado)
                $massLossRate = ($laserPowerWatts * $ablationEfficiency) / (3e6); // J/kg para vaporización
                $totalMassLost = $massLossRate * $operationSeconds;
                
                // Velocidad de eyección del material ~1000 m/s
                $ejectionVelocity = 1000;
                
                // Rocket equation simplificado: Δv ≈ v_exhaust × ln(m_initial / m_final)
                $deltaV = $ejectionVelocity * log($asteroidMass / ($asteroidMass - $totalMassLost));
                
                $results = [
                    'deltaV_ms' => round($deltaV, 6),
                    'deltaV_cms' => round($deltaV * 100, 4),
                    'laser_power_MW' => $laserPowerMW,
                    'operation_years' => $operationYears,
                    'mass_ablated_kg' => round($totalMassLost, 2),
                    'ejection_velocity_ms' => $ejectionVelocity,
                    'cost_billion_usd' => 8.0,
                    'success_probability' => 0.75,
                    'lead_time_years' => $leadTime,
                    'description' => 'Powerful laser vaporizes asteroid surface, creating rocket-like thrust',
                    'mission_reference' => 'NASA/ESA Concept (DE-STAR)',
                    'advantages' => 'Precise, can adjust continuously, no explosives needed',
                    'disadvantages' => 'Unproven technology, requires sustained power, expensive'
                ];
                break;
                
            default:
                throw new \Exception('Unknown strategy: ' . $strategy);
        }
        
        // Calcular deflexión angular y distancia de paso
        $deflectionAngle = $this->calculateDeflectionAngle($results['deltaV_ms'], $asteroidVelocity, $leadTime);
        $missDistance = $this->calculateMissDistance($deflectionAngle, $leadTime, $asteroidVelocity);
        
        // Determinar éxito (debe pasar a más de 1 radio terrestre = 6371 km)
        $earthRadius = 6371; // km
        $success = $missDistance > $earthRadius;
        
        // Calcular margen de seguridad
        $lunarDistance = 384400; // km
        $safetyMargin = $missDistance / $earthRadius;
        
        // Agregar resultados orbitales
        $results['deflection_angle_deg'] = round(rad2deg($deflectionAngle), 8);
        $results['deflection_angle_arcsec'] = round(rad2deg($deflectionAngle) * 3600, 4);
        $results['miss_distance_km'] = round($missDistance, 2);
        $results['miss_distance_earth_radii'] = round($safetyMargin, 2);
        $results['miss_distance_lunar_distances'] = round($missDistance / $lunarDistance, 4);
        $results['earth_saved'] = $success;
        $results['safety_level'] = $this->getSafetyLevel($missDistance, $earthRadius);
        
        // Tiempo de misión total
        $preparationTime = $results['launch_time_months'] ?? ($results['warning_time_months'] ?? 12);
        $results['total_mission_duration_months'] = round($leadTime * 12, 0);
        $results['preparation_time_months'] = $preparationTime;
        
        return $results;
    }
    
    /**
     * Calcula el ángulo de deflexión
     */
    private function calculateDeflectionAngle($deltaV, $velocity, $leadTime)
    {
        // Tiempo disponible en segundos
        $timeSeconds = $leadTime * 365.25 * 24 * 3600;
        
        // Distancia recorrida: d = v × t
        $distance = $velocity * $timeSeconds;
        
        // Desplazamiento perpendicular: s = deltaV × t
        $displacement = $deltaV * $timeSeconds;
        
        // Ángulo: tan(θ) ≈ s / d para ángulos pequeños
        $angle = atan2($displacement, $distance);
        
        return $angle;
    }
    
    /**
     * Calcula la distancia de paso cerca de la Tierra
     */
    private function calculateMissDistance($deflectionAngle, $leadTime, $velocity)
    {
        // Distancia promedio Tierra-asteroide al momento de deflexión
        // Asumimos ~0.1 AU cuando se detecta
        $AU = 1.496e8; // km
        $detectionDistance = 0.1 * $AU;
        
        // Distancia de paso: d = r × tan(θ)
        $missDistance = $detectionDistance * tan($deflectionAngle);
        
        // Convertir a km y aplicar factor de escala realista
        $missDistanceKm = abs($missDistance);
        
        return $missDistanceKm;
    }
    
    /**
     * Determina el nivel de seguridad
     */
    private function getSafetyLevel($missDistance, $earthRadius)
    {
        if ($missDistance < $earthRadius) {
            return 'IMPACT - Mission Failed';
        } elseif ($missDistance < $earthRadius * 2) {
            return 'Critical - Too Close';
        } elseif ($missDistance < $earthRadius * 5) {
            return 'Marginal - Needs Verification';
        } elseif ($missDistance < $earthRadius * 20) {
            return 'Safe - Low Risk';
        } else {
            return 'Excellent - High Confidence';
        }
    }
    
    /**
     * Compara múltiples estrategias
     */
    public function compareStrategies(Request $request)
    {
        try {
            $impactData = $request->input('impactData');
            $leadTime = $request->input('leadTime', 5);
            
            $strategies = ['kinetic', 'gravity-tractor', 'nuclear', 'laser'];
            $comparisons = [];
            
            $asteroidMass = $impactData['calculations']['mass_kg'] ?? 1e9;
            $asteroidVelocity = $impactData['calculations']['velocity_ms'] ?? 20000;
            $asteroidDiameter = $impactData['calculations']['diameter_m'] ?? 50;
            
            foreach ($strategies as $strategy) {
                $result = $this->calculateDeflection($strategy, $leadTime, $asteroidMass, $asteroidVelocity, $asteroidDiameter);
                $comparisons[$strategy] = $result;
            }
            
            // Encontrar la mejor estrategia
            $bestStrategy = $this->findBestStrategy($comparisons);
            
            return response()->json([
                'success' => true,
                'comparisons' => $comparisons,
                'best_strategy' => $bestStrategy,
                'lead_time_years' => $leadTime
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in strategy comparison: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error comparing strategies: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Encuentra la mejor estrategia basada en múltiples criterios
     */
    private function findBestStrategy($comparisons)
    {
        $bestScore = -1;
        $bestStrategy = null;
        
        foreach ($comparisons as $name => $result) {
            // Score basado en: éxito, probabilidad, costo (inverso), deltaV
            $score = 0;
            
            if ($result['earth_saved']) {
                $score += 100;
            }
            
            $score += $result['success_probability'] * 50;
            $score -= ($result['cost_billion_usd'] / 10) * 10; // penalizar costo
            $score += log10($result['deltaV_cms'] + 1) * 5; // bonus por deltaV
            
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestStrategy = [
                    'name' => $name,
                    'score' => round($score, 2),
                    'reasoning' => $this->getStrategyReasoning($name, $result)
                ];
            }
        }
        
        return $bestStrategy;
    }
    
    /**
     * Genera razonamiento para la estrategia
     */
    private function getStrategyReasoning($strategy, $result)
    {
        $reasoning = '';
        
        if ($result['earth_saved']) {
            $reasoning .= 'Successfully deflects asteroid. ';
        } else {
            $reasoning .= 'WARNING: May not provide sufficient deflection. ';
        }
        
        switch ($strategy) {
            case 'kinetic':
                $reasoning .= 'Cost-effective proven technology. Best for small to medium asteroids with moderate lead time.';
                break;
            case 'gravity-tractor':
                $reasoning .= 'Most precise and reliable, but requires longest lead time. Ideal for well-tracked threats.';
                break;
            case 'nuclear':
                $reasoning .= 'Highest deflection capability for large asteroids, but politically complex.';
                break;
            case 'laser':
                $reasoning .= 'Innovative continuous thrust approach, good balance of precision and power.';
                break;
        }
        
        return $reasoning;
    }
}
