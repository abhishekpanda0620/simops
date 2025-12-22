<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ControlPlaneScenario;

class ScenarioController extends Controller
{
    /**
     * List available control plane scenarios
     */
    public function index()
    {
        $scenarios = ControlPlaneScenario::where('is_active', true)
            ->orderBy('sort_order')
            ->select('id', 'slug', 'name', 'category', 'description', 'icon')
            ->get()
            ->map(fn($s) => [
                'id' => $s->slug,
                'name' => $s->name,
                'category' => $s->category,
                'description' => $s->description,
                'icon' => $s->icon,
            ]);

        return response()->json(['scenarios' => $scenarios]);
    }

    /**
     * Get scenario details
     */
    public function show(ControlPlaneScenario $scenario)
    {
        return response()->json([
            'scenario' => [
                'id' => $scenario->slug,
                'name' => $scenario->name,
                'category' => $scenario->category,
                'description' => $scenario->description,
                'icon' => $scenario->icon,
                'config' => $scenario->config,
            ],
        ]);
    }

    /**
     * Get scenario status (for polling)
     */
    public function status(string $scenario)
    {
        return response()->json([
            'scenario' => $scenario,
            'status' => 'idle',
            'phase' => null,
            'message' => null,
            'timestamp' => now(),
        ]);
    }
}
