<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'code',
        'type',
        'value',
        'max_discount',
        'expires_at',
        'active'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'active' => 'boolean',
        'value' => 'decimal:2',
        'max_discount' => 'decimal:2'
    ];

    public function isValid()
    {
        return $this->active && $this->expires_at->isFuture();
    }
}
