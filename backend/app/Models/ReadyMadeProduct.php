<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReadyMadeProduct extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'shop_id',
        'name',
        'description',
        'price',
        'stock',
        'category',
        'image_url',
        'status',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
