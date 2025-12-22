<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lab extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'difficulty',
        'estimated_time',
        'steps',
        'is_active',
    ];

    protected $casts = [
        'steps' => 'array',
        'is_active' => 'boolean',
    ];

    public function userProgress(): HasMany
    {
        return $this->hasMany(UserProgress::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
