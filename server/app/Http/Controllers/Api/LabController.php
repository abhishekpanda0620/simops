<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lab;
use App\Models\UserProgress;
use Illuminate\Http\Request;

class LabController extends Controller
{
    /**
     * List all active labs
     */
    public function index()
    {
        $labs = Lab::where('is_active', true)
            ->select('id', 'title', 'slug', 'description', 'difficulty', 'estimated_time')
            ->get();

        return response()->json(['labs' => $labs]);
    }

    /**
     * Show a specific lab with user progress
     */
    public function show(Lab $lab)
    {
        $progress = null;
        
        if (auth()->check()) {
            $progress = UserProgress::where('user_id', auth()->id())
                ->where('lab_id', $lab->id)
                ->first();
        }

        return response()->json([
            'lab' => $lab,
            'progress' => $progress,
        ]);
    }

    /**
     * Get user's progress for a lab
     */
    public function getProgress(Lab $lab)
    {
        $progress = UserProgress::firstOrCreate(
            ['user_id' => auth()->id(), 'lab_id' => $lab->id],
            ['status' => 'not_started', 'completed_steps' => []]
        );

        return response()->json(['progress' => $progress]);
    }

    /**
     * Update user's progress for a lab
     */
    public function updateProgress(Request $request, Lab $lab)
    {
        $validated = $request->validate([
            'completed_steps' => 'nullable|array',
            'status' => 'nullable|in:not_started,in_progress,completed',
        ]);

        $progress = UserProgress::updateOrCreate(
            ['user_id' => auth()->id(), 'lab_id' => $lab->id],
            [
                'completed_steps' => $validated['completed_steps'] ?? [],
                'status' => $validated['status'] ?? 'in_progress',
                'started_at' => now(),
            ]
        );

        // Mark completed if status is completed
        if (($validated['status'] ?? null) === 'completed') {
            $progress->completed_at = now();
            $progress->save();
        }

        return response()->json(['progress' => $progress]);
    }
}
