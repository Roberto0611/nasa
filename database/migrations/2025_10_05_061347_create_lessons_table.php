<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Título de la lección
            $table->string('slug')->unique(); // URL-friendly identifier
            $table->text('description'); // Descripción breve
            $table->longText('content'); // Contenido completo de la lección
            $table->string('category'); // Categoría: physics, mathematics, astronomy
            $table->integer('difficulty_level')->default(1); // 1=Beginner, 2=Intermediate, 3=Advanced
            $table->integer('duration_minutes')->default(15); // Duración estimada
            $table->string('icon')->default('📚'); // Emoji o icono
            $table->text('practical_task')->nullable(); // Tarea práctica
            $table->json('learning_objectives')->nullable(); // Objetivos de aprendizaje
            $table->json('key_concepts')->nullable(); // Conceptos clave
            $table->boolean('is_published')->default(true); // Estado de publicación
            $table->integer('order')->default(0); // Orden de visualización
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
