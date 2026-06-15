<?php

namespace App\Modules\ECommerce\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role === 'admin') {
            return response()->json(Order::with('items')->get());
        }
        return response()->json($request->user()->orders()->with('items')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:tailoring,ready_made',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|uuid', // fabric_id for tailoring, or product_id for ready_made
            'items.*.design_id' => 'nullable|uuid',
            'items.*.measurement_id' => 'nullable|uuid',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.custom_details' => 'nullable|array',
            'shipping_address' => 'required|string',
            'notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $order = $request->user()->orders()->create([
                'type' => $validated['type'],
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'shipping_address' => $validated['shipping_address'],
                'notes' => $validated['notes'] ?? null
            ]);

            foreach ($validated['items'] as $item) {
                $order->items()->create([
                    'product_id' => $item['product_id'] ?? null,
                    'design_id' => $item['design_id'] ?? null,
                    'measurement_id' => $item['measurement_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'custom_details' => isset($item['custom_details']) ? json_encode($item['custom_details']) : null
                ]);
            }

            DB::commit();
            return response()->json($order->load('items'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Order creation failed: ' . $e->getMessage()], 500);
        }
    }

    public function show(Request $request, Order $order)
    {
        if ($request->user()->role !== 'admin' && $order->customer_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($order->load('items'));
    }
}
