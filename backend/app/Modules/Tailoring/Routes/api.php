<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Tailoring\Controllers\MeasurementController;
use App\Modules\Tailoring\Controllers\FabricController;
use App\Modules\Tailoring\Controllers\DesignController;
use App\Modules\ECommerce\Controllers\ShopController;
use App\Modules\ECommerce\Controllers\ReadyMadeProductController;
use App\Modules\ECommerce\Controllers\OrderController;

// Public routes
Route::apiResource('products', ReadyMadeProductController::class)->only(['index', 'show']);
Route::apiResource('designs', DesignController::class)->only(['index', 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('measurements', MeasurementController::class);
    Route::apiResource('fabrics', FabricController::class);
    Route::apiResource('shops', ShopController::class)->except(['destroy']);
    Route::apiResource('products', ReadyMadeProductController::class)->except(['index', 'show']);
    Route::apiResource('designs', DesignController::class)->except(['index', 'show']);
    Route::apiResource('orders', OrderController::class)->only(['index', 'store', 'show']);
});
