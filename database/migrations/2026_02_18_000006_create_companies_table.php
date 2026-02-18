<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('business_name');
            $table->string('document_type');
            $table->string('document_number');
            $table->string('address');
            $table->string('city');
            $table->string('department');
            $table->string('country');
            $table->string('phone');
            $table->string('whatsapp');
            $table->string('email');
            $table->string('tax_regime');
            $table->string('logo_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
