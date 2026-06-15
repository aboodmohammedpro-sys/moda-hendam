<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'owner_id',
        'name',
        'type',
        'status',
        'commission_rate'
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function fabrics()
    {
        return $this->hasMany(Fabric::class);
    }

    public function readyMadeProducts()
    {
        return $this->hasMany(ReadyMadeProduct::class);
    }
}
