<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LessonController extends Controller
{
    /**
     * Display a listing of all lessons (Academy page)
     */
    public function index()
    {
        $lessons = Lesson::published()
            ->ordered()
            ->get()
            ->map(function($lesson) {
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'slug' => $lesson->slug,
                    'description' => $lesson->description,
                    'category' => $lesson->category,
                    'difficulty_level' => $lesson->difficulty_level,
                    'difficulty_text' => $lesson->difficulty_text,
                    'duration_minutes' => $lesson->duration_minutes,
                    'icon' => $lesson->icon,
                    'learning_objectives' => $lesson->learning_objectives,
                ];
            });

        return Inertia::render('public/Academy', [
            'lessons' => $lessons
        ]);
    }

    /**
     * Display a specific lesson
     */
    public function show($slug)
    {
        $lesson = Lesson::where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return Inertia::render('public/LessonDetail', [
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'slug' => $lesson->slug,
                'description' => $lesson->description,
                'content' => $lesson->content,
                'category' => $lesson->category,
                'difficulty_level' => $lesson->difficulty_level,
                'difficulty_text' => $lesson->difficulty_text,
                'duration_minutes' => $lesson->duration_minutes,
                'icon' => $lesson->icon,
                'practical_task' => $lesson->practical_task,
                'learning_objectives' => $lesson->learning_objectives,
                'key_concepts' => $lesson->key_concepts,
            ]
        ]);
    }

    /**
     * Get all lessons as JSON (for API)
     */
    public function api()
    {
        $lessons = Lesson::published()->ordered()->get();
        return response()->json($lessons);
    }
}
