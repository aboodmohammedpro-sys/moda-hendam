<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DesignSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Design::create([
            'title' => 'ثوب رجالي كلاسيكي',
            'base_tailoring_price' => 150.00,
            'required_measurements_keys' => ['chest', 'shoulders', 'length', 'sleeve_length', 'neck'],
            'status' => 'active'
        ]);

        \App\Models\Design::create([
            'title' => 'عباءة نسائية كلاسيكية',
            'base_tailoring_price' => 200.00,
            'required_measurements_keys' => ['chest', 'waist', 'length', 'sleeve_length'],
            'status' => 'active'
        ]);

        \App\Models\Design::create([
            'title' => 'بشت ملكي فاخر',
            'base_tailoring_price' => 500.00,
            'required_measurements_keys' => ['shoulders', 'length', 'sleeve_length'],
            'status' => 'active'
        ]);
    }
}
