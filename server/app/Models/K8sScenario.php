<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class K8sScenario extends Model
{
    protected $table = 'k8s_scenarios';

    protected $fillable = [
        'slug',
        'name',
        'description',
        'data',
        'is_active',
    ];

    protected $casts = [
        'data' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Route model binding by slug
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
