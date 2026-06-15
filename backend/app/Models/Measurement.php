<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Measurement extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'label',
        'values',
    ];

    protected $casts = [
        'values' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
