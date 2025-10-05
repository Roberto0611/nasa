<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Gemini;

class GeminiController extends Controller
{
    public static function getText(): JsonResponse
    {
        try {
            Carbon::setLocale('es');
            $fechaActual = Carbon::now();
            $dia = $fechaActual->day;
            $nombreMes = $fechaActual->monthName;
            
            $prompt = "";

            $apiKey = env('GEMINI_API_KEY');
            $client = Gemini::client($apiKey);
            
            // Intentar con diferentes modelos disponibles
            $modelsToTry = [
                'gemini-pro',
                'gemini-1.5-pro',
                'gemini-1.5-flash',
                'gemini-2.0-flash-exp',
                'text-bison-001'
            ];
            
            $lastError = null;
            
            foreach ($modelsToTry as $modelName) {
                try {
                    $result = $client->generativeModel($modelName)->generateContent($prompt);
                    
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'fecha' => "$dia de $nombreMes",
                            'efemeride' => $result->text(),
                            'model_used' => $modelName
                        ]
                    ], 200);
                    
                } catch (\Exception $e) {
                    $lastError = $e->getMessage();
                    continue; // Intentar con el siguiente modelo
                }
            }
            
            // Si ningún modelo funciona, devolver error
            throw new \Exception("No se pudo encontrar un modelo compatible. Último error: " . $lastError);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la efeméride',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public static function listAvailableModels(): JsonResponse
    {
        try {
            $apiKey = env('GEMINI_API_KEY');
            $client = Gemini::client($apiKey);
            
            // Intentar obtener la lista de modelos
            $models = $client->models()->list();
            
            return response()->json([
                'success' => true,
                'models' => $models->toArray()
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la lista de modelos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public static function analyzeImpactSimulation(Request $request): JsonResponse
    {
        try {
            // Obtener datos de la simulación
            $impactData = $request->input('impactData');
            
            if (empty($impactData)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Por favor proporciona los datos de la simulación'
                ], 400);
            }

            // Verificar que tenemos la API key
            $apiKey = env('GEMINI_API_KEY');
            if (empty($apiKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'API key de Gemini no configurada'
                ], 500);
            }
            
            // Extraer datos relevantes
            $name = $impactData['name'] ?? 'Meteorito desconocido';
            $diameter = $impactData['calculations']['diameter_m'] ?? 0;
            $mass = $impactData['calculations']['mass_kg'] ?? 0;
            $velocity = $impactData['calculations']['velocity_ms'] ?? 0;
            $energy = $impactData['calculations']['kinetic_energy_initial_megatons_tnt'] ?? 0;
            $craterDiameter = $impactData['atmospheric_impact']['crater_diameter_m'] ?? 0;
            $energyRemaining = ($impactData['atmospheric_impact']['f_atm'] ?? 0) * 100;
            $massRemaining = ($impactData['atmospheric_impact']['f_frag'] ?? 0) * 100;
            $fragmented = $impactData['atmospheric_impact']['broke'] ? 'SÍ' : 'NO';
            $breakupAlt = isset($impactData['atmospheric_impact']['breakup_altitude_m']) 
                ? round($impactData['atmospheric_impact']['breakup_altitude_m'] / 1000, 2) 
                : null;

            $analysisPrompt = "Eres un astrofísico experto de la NASA. Analiza el siguiente impacto de meteorito y proporciona SOLO el análisis científico. NO incluyas saludos, introducciones ni frases como 'Aquí tienes' o 'A continuación'. Empieza directamente con el contenido.

📊 DATOS DE LA SIMULACIÓN:

🌠 Meteorito: {$name}
• Diámetro: " . round($diameter, 2) . " metros
• Masa: " . number_format($mass, 0, '.', ',') . " kg (" . sprintf('%.2e', $mass) . " kg)
• Velocidad: " . round($velocity, 2) . " m/s (" . round($velocity/1000, 2) . " km/s)
• Energía inicial: {$energy} megatones de TNT

🌍 EFECTOS ATMOSFÉRICOS:
• Energía remanente después de atmósfera: {$energyRemaining}%
• Masa remanente después de atmósfera: {$massRemaining}%
• ¿Se fragmentó?: {$fragmented}" . ($breakupAlt ? "
• Altitud de fragmentación: {$breakupAlt} km" : "") . "

💥 IMPACTO EN SUPERFICIE:
• Diámetro del cráter: " . round($craterDiameter, 0) . " metros (" . round($craterDiameter/1000, 2) . " km)
• Radio del cráter: " . round($craterDiameter/2, 0) . " metros

Proporciona directamente estas 5 secciones:

1. **COMPARACIÓN HISTÓRICA** (2-3 líneas): Compara este impacto con eventos históricos reales (Tunguska, Chelyabinsk, Chicxulub, etc.). ¿Qué tan poderoso es en comparación?

2. **ANÁLISIS DE PELIGROSIDAD** (3-4 líneas): Evalúa el nivel de amenaza (bajo, moderado, alto, catastrófico) y explica las consecuencias específicas. ¿Qué áreas serían afectadas? ¿Cuántas personas en riesgo?

3. **EFECTOS DETALLADOS** (3-4 líneas): Describe los efectos específicos:
   - Onda expansiva y radio de destrucción
   - Efectos térmicos (incendios, flash)
   - Efectos sísmicos
   - Posibles tsunamis (si aplica)
   - Efectos atmosféricos (polvo, clima)

4. **MEDIDAS DE MITIGACIÓN** (2-3 líneas): Si se detectara con anticipación, ¿qué estrategias de deflexión serían más efectivas? (impactador cinético, bomba nuclear, tractor gravitacional, etc.)

5. **DATO CURIOSO** (1-2 líneas): Proporciona un dato interesante o comparación creativa que ayude a visualizar la magnitud del impacto.

RECUERDA: Empieza DIRECTAMENTE con '## COMPARACIÓN HISTÓRICA'. NO incluyas introducciones. USA FORMATO MARKDOWN CON EMOJIS.";

            $client = Gemini::client($apiKey);
            
            // Intentar con diferentes modelos disponibles
            $modelsToTry = [
                'gemini-2.0-flash-exp',
                'gemini-1.5-pro',
                'gemini-1.5-flash',
                'gemini-pro'
            ];
            
            $lastError = null;
            
            foreach ($modelsToTry as $modelName) {
                try {
                    $result = $client->generativeModel($modelName)->generateContent($analysisPrompt);
                    
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'analysis' => $result->text(),
                            'model_used' => $modelName,
                            'impact_summary' => [
                                'name' => $name,
                                'diameter' => round($diameter, 2),
                                'energy' => $energy,
                                'crater_diameter' => round($craterDiameter, 0),
                                'threat_level' => self::calculateThreatLevel($energy)
                            ]
                        ]
                    ], 200);
                    
                } catch (\Exception $e) {
                    $lastError = $e->getMessage();
                    continue;
                }
            }
            
            throw new \Exception("No se pudo encontrar un modelo compatible. Último error: " . $lastError);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al analizar la simulación',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    private static function calculateThreatLevel($energy): string
    {
        if ($energy < 0.01) return 'Insignificante';
        if ($energy < 1) return 'Bajo';
        if ($energy < 10) return 'Moderado';
        if ($energy < 100) return 'Alto';
        if ($energy < 1000) return 'Muy Alto';
        return 'Catastrófico';
    }

    public static function askNASAExpert(Request $request): JsonResponse
    {
        try {
            // Obtener la pregunta del request
            $userQuestion = $request->input('question', '');
            
            if (empty($userQuestion)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Por favor proporciona una pregunta'
                ], 400);
            }

            // Verificar que tenemos la API key
            $apiKey = env('GEMINI_API_KEY');
            if (empty($apiKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'API key de Gemini no configurada'
                ], 500);
            }
            
            $expertPrompt = "Eres un profesor de la NASA que es experto en astrofísica y se especializa en meteorología espacial. Tu tarea es ayudar al usuario a entender que esta pasando en la simulación, a su vez de también resolver cualquier duda que tenga en base a los siguientes cálculos, los cuales son los que usamos en nuestra simulación:

CÁLCULOS DE LA SIMULACIÓN:
- Diámetro: Usamos media geométrica entre min y max para evitar sesgos
- Densidad: Por defecto 2700 kg/m³ (roca: 2500-3000, hierro: 7800, níquel: 8900)
- Volumen y masa: Calculamos como esfera equivalente
- Velocidad: Convertimos de km/s a m/s, con mínimo físico de 11000 m/s
- Energía cinética inicial: E = 0.5 * m * v²

EFECTOS ATMOSFÉRICOS:
- Ablación por fricción: dm/dt = -(Lambda * A * rho_air * v³)/(2 * Q)
- Ruptura por presión dinámica: q = 0.5 * rho * v² > resistencia material
- Fuerza de arrastre: Fd = 0.5 * Cd * rho_air * v² * A
- Integración semi-implícita con dt adaptativo

RESULTADOS:
- f_atm: Fracción de energía que sobrevive la atmósfera
- f_frag: Fracción de masa tras fragmentación
- Diámetro de cráter: Estimación empírica usando modelo Melosh/Holsapple

Da respuestas cortas y concisas pero que ayuden a resolver todas las dudas del usuario de manera clara.

PREGUNTA DEL USUARIO: {$userQuestion}";

            $client = Gemini::client($apiKey);
            
            // Intentar con diferentes modelos disponibles
            $modelsToTry = [
                'gemini-pro',
                'gemini-1.5-pro', 
                'gemini-1.5-flash',
                'gemini-2.0-flash-exp',
                'text-bison-001'
            ];
            
            $lastError = null;
            
            foreach ($modelsToTry as $modelName) {
                try {
                    $result = $client->generativeModel($modelName)->generateContent($expertPrompt);
                    
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'question' => $userQuestion,
                            'expert_response' => $result->text(),
                            'model_used' => $modelName
                        ]
                    ], 200);
                    
                } catch (\Exception $e) {
                    $lastError = $e->getMessage();
                    continue;
                }
            }
            
            throw new \Exception("No se pudo encontrar un modelo compatible. Último error: " . $lastError);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al consultar al experto de la NASA',
                'error' => $e->getMessage(),
                'debug' => [
                    'request_data' => $request->all(),
                    'api_key_exists' => !empty(getenv('GEMINI_API_KEY'))
                ]
            ], 500);
        }
    } 
}
