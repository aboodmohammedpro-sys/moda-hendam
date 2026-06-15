<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Chat\Controllers\ChatController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/orders/{order}/chat', [ChatController::class, 'getOrCreateChat']);
    Route::post('/chats/{chat}/messages', [ChatController::class, 'sendMessage']);
});
