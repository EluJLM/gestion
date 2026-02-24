<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        DB::statement('ALTER TABLE companies MODIFY email VARCHAR(255) NULL');

        Schema::table('companies', function (Blueprint $table) {
            $table->boolean('allow_system_mail_fallback')->default(true)->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('allow_system_mail_fallback');
        });

        DB::statement("ALTER TABLE companies MODIFY email VARCHAR(255) NOT NULL DEFAULT ''");
    }
};
