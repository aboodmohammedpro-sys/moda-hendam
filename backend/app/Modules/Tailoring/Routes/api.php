<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Tailoring\Controllers\MeasurementController;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('measurements', MeasurementController::class);
});
