<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

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
                'earth_orbiting_neos' => array_values($earthOrbitingNeos) // reindexa el array
            ]);
        }
        
        return response()->json(['error' => 'API request failed']);
    }
}
