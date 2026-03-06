<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'created_by',
        'name',
        'sku',
        'barcode',
        'cost_price',
        'sale_price',
        'invoice_image_path',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
