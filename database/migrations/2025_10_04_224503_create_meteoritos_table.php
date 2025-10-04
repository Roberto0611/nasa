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
        Schema::create('meteoritos', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('radius');
            $table->integer('velocity');
            $table->integer('entry_angle');
            $table->string('material');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meteoritos');
    }
};
