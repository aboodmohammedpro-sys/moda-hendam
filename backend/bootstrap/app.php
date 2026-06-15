<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            $modules = ['Tailoring', 'ECommerce', 'Payment', 'Chat', 'Notifications'];
            foreach ($modules as $module) {
                $path = base_path("app/Modules/{$module}/Routes/api.php");
                if (file_exists($path)) {
                    Route::middleware('api')
                        ->prefix('api/v1/' . strtolower($module))
                        ->name(strtolower($module) . '.')
                        ->group($path);
                }
            }
        }
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
