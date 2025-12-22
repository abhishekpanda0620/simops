<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pipeline;

class PipelineController extends Controller
{
    /**
     * List all pipelines (without full data)
     */
    public function index()
    {
        $pipelines = Pipeline::where('is_active', true)
            ->select('id', 'slug', 'name', 'status')
            ->get();

        return response()->json(['pipelines' => $pipelines]);
    }

    /**
     * Get a specific pipeline with full data
     */
    public function show(Pipeline $pipeline)
    {
        return response()->json([
            'pipeline' => [
                'id' => $pipeline->id,
                'slug' => $pipeline->slug,
                'name' => $pipeline->name,
                'status' => $pipeline->status,
                'data' => $pipeline->data,
            ],
        ]);
    }
}
