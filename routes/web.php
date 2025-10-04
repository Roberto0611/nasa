<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/sim', function () {
    return Inertia::render('SimulationPage');
})->name('sim');

Route::get('home', function () {
    return Inertia::render('public/HomePage');
})->name('homepages');

Route::get('/simulation', function () {
    return Inertia::render('simulation/index');
})->name('simulation');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
