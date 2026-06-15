<?php

namespace App\Modules\ECommerce\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ReadyMadeProduct;
use Illuminate\Http\Request;

class ReadyMadeProductController extends Controller
{
    public function index(Request $request)
    {
        // Publicly viewable active products
        return response()->json(ReadyMadeProduct::with('shop')->where('status', 'active')->get());
    }

    public function store(Request $request)
    {
        if (!in_array($request->user()->role, ['merchant', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'shop_id' => 'required|exists:shops,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'nullable|string|max:100',
            'image_url' => 'nullable|url',
        ]);

        $validated['status'] = $validated['stock'] > 0 ? 'active' : 'out_of_stock';

        $product = ReadyMadeProduct::create($validated);
        return response()->json($product, 201);
    }

    public function show(ReadyMadeProduct $product)
    {
        return response()->json($product->load('shop'));
    }
}
