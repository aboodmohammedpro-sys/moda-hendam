<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Design extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'title',
        'base_tailoring_price',
        'required_measurements_keys',
        'status'
    ];

    protected $casts = [
        'required_measurements_keys' => 'array',
        'base_tailoring_price' => 'decimal:2'
    ];
}
