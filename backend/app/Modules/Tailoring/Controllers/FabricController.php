<?php

namespace App\Modules\Tailoring\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Fabric;
use Illuminate\Http\Request;

class FabricController extends Controller
{
    public function index(Request $request)
    {
        // Traders see their own fabrics, users see active ones
        $query = Fabric::with('shop');
        if ($request->user() && $request->user()->role === 'fabric_trader') {
            $shopIds = $request->user()->shops()->pluck('id');
            $query->whereIn('shop_id', $shopIds);
        } else {
            $query->where('status', 'active');
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'fabric_trader' && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'shop_id' => 'required|exists:shops,id',
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:100',
            'pattern' => 'nullable|string|max:100',
            'price_per_meter' => 'required|numeric|min:0',
            'stock_meters' => 'required|integer|min:0',
            'status' => 'nullable|in:active,out_of_stock'
        ]);

        $fabric = Fabric::create($validated);
        return response()->json($fabric, 201);
    }

    public function update(Request $request, Fabric $fabric)
    {
        if ($request->user()->role !== 'admin' && $fabric->shop->owner_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'color' => 'sometimes|string|max:100',
            'pattern' => 'nullable|string|max:100',
            'price_per_meter' => 'sometimes|numeric|min:0',
            'stock_meters' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:active,out_of_stock'
        ]);

        $fabric->update($validated);
        return response()->json($fabric);
    }
}
