<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\K8sScenario;

class K8sScenarioController extends Controller
{
    /**
     * List all K8s scenarios (without full data)
     */
    public function index()
    {
        $scenarios = K8sScenario::where('is_active', true)
            ->select('id', 'slug', 'name', 'description')
            ->get();

        return response()->json(['scenarios' => $scenarios]);
    }

    /**
     * Get a specific scenario with full data
     */
    public function show(K8sScenario $scenario)
    {
        return response()->json([
            'scenario' => [
                'id' => $scenario->id,
                'slug' => $scenario->slug,
                'name' => $scenario->name,
                'description' => $scenario->description,
                'data' => $scenario->data,
            ],
        ]);
    }
}
