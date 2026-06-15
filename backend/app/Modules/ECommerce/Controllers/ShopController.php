<?php

namespace App\Modules\ECommerce\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        // Admin sees all, others see active
        if ($request->user() && $request->user()->role === 'admin') {
            return response()->json(Shop::with('owner')->get());
        }
        return response()->json(Shop::where('status', 'active')->with('owner')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:fabric,ready_made',
        ]);

        $shop = $request->user()->shops()->create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'status' => 'pending' // requires admin approval
        ]);

        return response()->json($shop, 201);
    }

    public function show(Shop $shop)
    {
        return response()->json($shop->load(['owner', 'fabrics']));
    }
}
