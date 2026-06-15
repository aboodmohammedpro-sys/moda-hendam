<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fabric extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'shop_id',
        'name',
        'color',
        'pattern',
        'price_per_meter',
        'stock_meters',
        'status'
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
