<?php

namespace App\Http\Controllers;

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

    public function getMeteoriteById($id)
    {
        $apiKey = env('NASA_API_KEY');
        
        $response = Http::get("https://api.nasa.gov/neo/rest/v1/neo/{$id}", [
            'api_key' => $apiKey
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $radius = ($data['estimated_diameter']['meters']['estimated_diameter_min'] / 2)*100;
            $density = 3.5;
            
            # Masa = (4/3)πR³ × d. 
            $mass = (4/3) * pi() * pow($radius, 3) * $density;

            # energia cinetica = 1/2 mv^2
            $velocity = $data['close_approach_data'][0]['relative_velocity']['kilometers_per_second'] ?? 0;
            $velocity = $velocity * 1000; // convertir a m/s
            $kineticEnergy = 0.5 * $mass * pow($velocity, 2);

            return response()->json([
                'data' => $data,
                'mass' => $mass,
                'kinetic_energy' => $kineticEnergy
            ]);
        }
        
        return response()->json(['error' => 'API request failed']);
    }
}
