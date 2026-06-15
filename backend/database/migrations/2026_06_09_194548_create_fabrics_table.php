<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fabrics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('shop_id')->constrained('shops')->onDelete('cascade');
            $table->string('name');
            $table->string('color', 100);
            $table->string('pattern', 100)->nullable();
            $table->decimal('price_per_meter', 10, 2);
            $table->integer('stock_meters')->default(0);
            $table->enum('status', ['active', 'out_of_stock'])->default('active');
            $table->timestamps();

            $table->index(['status', 'price_per_meter']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fabrics');
    }
};
