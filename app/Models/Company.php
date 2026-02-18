<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

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
    ];
}
