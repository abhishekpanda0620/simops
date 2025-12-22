<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LabController;
use App\Http\Controllers\Api\ScenarioController;
use App\Http\Controllers\Api\K8sScenarioController;
use App\Http\Controllers\Api\PipelineController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});

// Public auth routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Public data routes (for frontend when not authenticated)
Route::get('/k8s-scenarios', [K8sScenarioController::class, 'index']);
Route::get('/k8s-scenarios/{scenario}', [K8sScenarioController::class, 'show']);
Route::get('/pipelines', [PipelineController::class, 'index']);
Route::get('/pipelines/{pipeline}', [PipelineController::class, 'show']);
Route::get('/scenarios', [ScenarioController::class, 'index']);
Route::get('/scenarios/{scenario}', [ScenarioController::class, 'show']);
Route::get('/scenarios/{scenario}/status', [ScenarioController::class, 'status']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Labs
    Route::get('/labs', [LabController::class, 'index']);
    Route::get('/labs/{lab}', [LabController::class, 'show']);
    Route::post('/labs/{lab}/progress', [LabController::class, 'updateProgress']);
    Route::get('/labs/{lab}/progress', [LabController::class, 'getProgress']);
});
