<?php

namespace App\Modules\Tailoring\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Measurement;
use Illuminate\Http\Request;

class MeasurementController extends Controller
{
    public function index(Request $request)
    {
        $measurements = $request->user()->measurements;
        return response()->json($measurements);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:100',
            'values' => 'required|array',
        ]);

        $measurement = $request->user()->measurements()->create($validated);

        return response()->json($measurement, 201);
    }

    public function update(Request $request, Measurement $measurement)
    {
        if ($measurement->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'label' => 'sometimes|required|string|max:100',
            'values' => 'sometimes|required|array',
        ]);

        $measurement->update($validated);

        return response()->json($measurement);
    }

    public function destroy(Request $request, Measurement $measurement)
    {
        if ($measurement->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $measurement->delete();

        return response()->json(['message' => 'Measurement deleted successfully']);
    }
}
