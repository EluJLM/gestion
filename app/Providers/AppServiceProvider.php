<?php

namespace App\Providers;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        if (Schema::hasTable('system_settings')) {
            $ticketSenderEmail = SystemSetting::query()
                ->where('key', 'ticket_sender_email')
                ->value('value');

            if ($ticketSenderEmail) {
                Config::set('mail.from.address', $ticketSenderEmail);
            }
        }
    }
}
