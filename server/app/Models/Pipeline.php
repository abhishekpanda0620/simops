<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pipeline extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'status',
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
