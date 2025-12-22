<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('control_plane_scenarios', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();        // e.g., "create-pod"
            $table->string('name');                  // Display name
            $table->string('category');              // e.g., "pods", "workloads", "cluster"
            $table->text('description')->nullable(); // Scenario description
            $table->string('icon')->nullable();      // Icon name for UI
            $table->json('config')->nullable();      // Additional scenario config
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('control_plane_scenarios');
    }
};
