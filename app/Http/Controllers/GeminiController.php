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

            $apiKey = getenv('GEMINI_API_KEY');
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
            $apiKey = getenv('GEMINI_API_KEY');
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
    
    public static function askNASAExpert(Request $request): JsonResponse
    {
        try {
            // AQUI AGREGAR EL INPUT QUE OBTENEMOS DEL CHAT
            $userQuestion = "Que puedo hacer en el simulador?";
            
            if (empty($userQuestion)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Por favor proporciona una pregunta'
                ], 400);
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

            $apiKey = getenv('GEMINI_API_KEY');
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
                'error' => $e->getMessage()
            ], 500);
        }
    } 
}
