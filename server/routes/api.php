<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LabController;
use App\Http\Controllers\Api\ScenarioController;

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
    
    // Scenarios (for polling simulation state)
    Route::get('/scenarios', [ScenarioController::class, 'index']);
    Route::get('/scenarios/{scenario}/status', [ScenarioController::class, 'status']);
});
