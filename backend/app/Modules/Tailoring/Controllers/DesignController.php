<?php

namespace App\Modules\Tailoring\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Design;
use Illuminate\Http\Request;

class DesignController extends Controller
{
    public function index()
    {
        $designs = Design::where('status', 'active')->get();
        return response()->json($designs);
    }

    public function show(Design $design)
    {
        return response()->json($design);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only admins can manage designs.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'base_tailoring_price' => 'required|numeric|min:0',
            'required_measurements_keys' => 'required|array',
            'required_measurements_keys.*' => 'required|string',
            'status' => 'nullable|in:active,archived'
        ]);

        $design = Design::create($validated);
        return response()->json($design, 201);
    }

    public function update(Request $request, Design $design)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only admins can manage designs.'], 403);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'base_tailoring_price' => 'nullable|numeric|min:0',
            'required_measurements_keys' => 'nullable|array',
            'required_measurements_keys.*' => 'required|string',
            'status' => 'nullable|in:active,archived'
        ]);

        $design->update($validated);
        return response()->json($design);
    }

    public function destroy(Request $request, Design $design)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only admins can manage designs.'], 403);
        }

        // We archive instead of deleting completely to preserve order integrity
        $design->update(['status' => 'archived']);
        return response()->json(['message' => 'Design archived successfully']);
    }
}
