<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Tailoring\Controllers\MeasurementController;
use App\Modules\Tailoring\Controllers\FabricController;
use App\Modules\ECommerce\Controllers\ShopController;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('measurements', MeasurementController::class);
    Route::apiResource('fabrics', FabricController::class);
    Route::apiResource('shops', ShopController::class)->except(['destroy']);
});
