<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'content',
        'category',
        'difficulty_level',
        'duration_minutes',
        'icon',
        'practical_task',
        'learning_objectives',
        'key_concepts',
        'is_published',
        'order'
    ];

    protected $casts = [
        'learning_objectives' => 'array',
        'key_concepts' => 'array',
        'is_published' => 'boolean'
    ];

    /**
     * Get difficulty level as text
     */
    public function getDifficultyTextAttribute(): string
    {
        return match($this->difficulty_level) {
            1 => 'Beginner',
            2 => 'Intermediate',
            3 => 'Advanced',
            default => 'Unknown'
        };
    }

    /**
     * Scope para lecciones publicadas
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope para ordenar por orden establecido
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc')->orderBy('created_at', 'asc');
    }
}
