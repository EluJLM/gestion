<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mail_settings', function (Blueprint $table) {
            $table->id();
            $table->string('mail_mailer');
            $table->string('mail_host');
            $table->unsignedInteger('mail_port');
            $table->string('mail_username');
            $table->text('mail_password');
            $table->string('mail_encryption')->nullable();
            $table->string('mail_from_address');
            $table->string('mail_from_name');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mail_settings');
    }
};
