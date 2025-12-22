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
        Schema::create('k8s_scenarios', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // e.g., "healthy", "crash-loop-back-off"
            $table->string('name');           // Display name
            $table->text('description');      // Scenario description
            $table->json('data');             // Full ClusterSnapshot JSON
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('k8s_scenarios');
    }
};
