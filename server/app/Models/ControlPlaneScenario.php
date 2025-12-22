<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ControlPlaneScenario extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'category',
        'description',
        'icon',
        'config',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'config' => 'array',
        'is_active' => 'boolean',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
