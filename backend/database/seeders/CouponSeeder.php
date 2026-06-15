<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Coupon::create([
            'code' => 'EID2026',
            'type' => 'percentage',
            'value' => 20.00,
            'max_discount' => 100.00,
            'expires_at' => now()->addMonth(),
            'active' => true
        ]);

        \App\Models\Coupon::create([
            'code' => 'FREETALL',
            'type' => 'fixed',
            'value' => 50.00,
            'max_discount' => null,
            'expires_at' => now()->addMonth(),
            'active' => true
        ]);
    }
}
