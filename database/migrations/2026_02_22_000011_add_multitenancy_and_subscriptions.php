<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('subscription_status')->default('trial')->after('logo_path');
            $table->timestamp('trial_ends_at')->nullable()->after('subscription_status');
            $table->timestamp('subscription_ends_at')->nullable()->after('trial_ends_at');
            $table->timestamp('cancelled_at')->nullable()->after('subscription_ends_at');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->string('role')->default('tenant_admin')->after('password');
        });

        $this->dropIndexIfExists('clients', 'clients_document_number_unique');
        $this->dropIndexIfExists('clients', 'clients_document_type_document_number_unique');

        Schema::table('clients', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->index(['company_id', 'created_at']);
            $table->unique(['company_id', 'document_type', 'document_number'], 'clients_company_document_unique');
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->index(['company_id', 'service_date']);
        });

        Schema::table('mail_settings', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->unique('company_id');
        });
    }

    public function down(): void
    {
        Schema::table('mail_settings', function (Blueprint $table) {
            $table->dropUnique(['company_id']);
            $table->dropConstrainedForeignId('company_id');
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex(['company_id', 'service_date']);
            $table->dropConstrainedForeignId('company_id');
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->dropUnique('clients_company_document_unique');
            $table->dropIndex(['company_id', 'created_at']);
            $table->dropConstrainedForeignId('company_id');
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->unique(['document_type', 'document_number']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('company_id');
            $table->dropColumn('role');
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'subscription_status',
                'trial_ends_at',
                'subscription_ends_at',
                'cancelled_at',
            ]);
        });
    }

    private function dropIndexIfExists(string $table, string $indexName): void
    {
        $databaseName = DB::getDatabaseName();

        $exists = DB::table('information_schema.statistics')
            ->where('table_schema', $databaseName)
            ->where('table_name', $table)
            ->where('index_name', $indexName)
            ->exists();

        if ($exists) {
            DB::statement(sprintf('ALTER TABLE `%s` DROP INDEX `%s`', $table, $indexName));
        }
    }
};
