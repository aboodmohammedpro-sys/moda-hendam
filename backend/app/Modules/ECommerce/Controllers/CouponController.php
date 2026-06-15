<?php

namespace App\Modules\ECommerce\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Validate a coupon code.
     */
    public function validateCoupon(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string'
        ]);

        $coupon = Coupon::where('code', $validated['code'])->first();

        if (!$coupon || !$coupon->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'الكوبون غير صالح أو منتهي الصلاحية.'
            ], 422);
        }

        return response()->json([
            'success' => true,
            'coupon' => [
                'code' => $coupon->code,
                'type' => $coupon->type,
                'value' => $coupon->value,
                'max_discount' => $coupon->max_discount
            ]
        ]);
    }

    /**
     * Create a new coupon (Admin only).
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only admins can create coupons.'], 403);
        }

        $validated = $request->validate([
            'code' => 'required|string|unique:coupons,code',
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'expires_at' => 'required|date|after:now',
            'active' => 'nullable|boolean'
        ]);

        $coupon = Coupon::create($validated);
        return response()->json($coupon, 201);
    }
}
