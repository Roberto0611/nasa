<?php

use App\Http\Controllers\MeteoriteController;
use App\Http\Controllers\GeminiController;
use App\Http\Controllers\LessonController;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use function Pest\Laravel\json;

Route::get('/', function () {
    return Inertia::render('public/landingPage');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/sim', function () {
    return Inertia::render('public/SimulationPage');
})->name('sim');

Route::get('home', function () {
    return Inertia::render('public/HomePage');
})->name('homepages');

Route::get('meteorites', function () {
    return Inertia::render('public/MeteoritesPage');
})->name('meteorites');

Route::get('nasabot', function () {
    return Inertia::render('public/NasaBot');
})->name('nasabot');

// NASA Academy Routes
Route::get('academy', [LessonController::class, 'index'])->name('academy');
Route::get('academy/{slug}', [LessonController::class, 'show'])->name('lesson.show');
Route::get('api/lessons', [LessonController::class, 'api'])->name('lessons.api');

// apis de NASA
Route::get('getAllMeteorites', action: [MeteoriteController::class, 'getAllMeteorites']);
Route::get('getMeteoriteById/{id}', [MeteoriteController::class, 'getMeteoriteById']);
Route::get('getMeteoritesNames', action: [MeteoriteController::class, 'getMeteoritesNames']);

// API de Gemini
Route::get('getEfemeride', [GeminiController::class, 'getText']);
Route::get('listGeminiModels', [GeminiController::class, 'listAvailableModels']);
Route::post('askNASAExpert', [GeminiController::class, 'askNASAExpert']);

// Endpoint de prueba para debugging
Route::get('testGemini', function() {
    try {
        $apiKey = env('GEMINI_API_KEY');
        return response()->json([
            'api_key_exists' => !empty($apiKey),
            'api_key_length' => $apiKey ? strlen($apiKey) : 0,
            'gemini_class_exists' => class_exists('Gemini')
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()]);
    }
});

// meteoritos user
Route::post('meteorites/store', [MeteoriteController::class, 'store'])->name('meteorites.store');
Route::get('getAllUserMeteorites', [MeteoriteController::class, 'getAllUserMeteorites']);
Route::get('getUserMeteoriteById/{id}', [MeteoriteController::class, 'getUserMeteoriteById']);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
