<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    public const STATUS_TRIAL = 'trial';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'name',
        'business_name',
        'document_type',
        'document_number',
        'address',
        'city',
        'department',
        'country',
        'phone',
        'whatsapp',
        'email',
        'tax_regime',
        'logo_path',
        'subscription_status',
        'trial_ends_at',
        'subscription_ends_at',
        'cancelled_at',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function hasActiveSubscription(): bool
    {
        if ($this->subscription_status === self::STATUS_CANCELLED) {
            return false;
        }

        if ($this->trial_ends_at && now()->lessThanOrEqualTo($this->trial_ends_at)) {
            return true;
        }

        return $this->subscription_status === self::STATUS_ACTIVE
            && (! $this->subscription_ends_at || now()->lessThanOrEqualTo($this->subscription_ends_at));
    }
}
