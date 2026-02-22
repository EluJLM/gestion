<?php

namespace App\Support;

use App\Models\MailSetting;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;

trait UsesCompanyMailer
{
    protected function sendCompanyAwareMail(string $to, Mailable $mailable): void
    {
        $companyId = auth()->user()?->company_id;

        $mailSetting = MailSetting::query()
            ->when($companyId, fn ($query) => $query->where('company_id', $companyId))
            ->first();

        if ($mailSetting) {
            $this->applyCompanyMailer($mailSetting);

            Mail::mailer('company_smtp')
                ->to($to)
                ->send($mailable->from($mailSetting->mail_from_address, $mailSetting->mail_from_name));

            return;
        }

        Mail::to($to)->send($mailable);
    }

    private function applyCompanyMailer(MailSetting $mailSetting): void
    {
        Config::set('mail.mailers.company_smtp.transport', $mailSetting->mail_mailer);
        Config::set('mail.mailers.company_smtp.host', $mailSetting->mail_host);
        Config::set('mail.mailers.company_smtp.port', $mailSetting->mail_port);
        Config::set('mail.mailers.company_smtp.username', $mailSetting->mail_username);
        Config::set('mail.mailers.company_smtp.password', Crypt::decryptString($mailSetting->mail_password));
        Config::set('mail.mailers.company_smtp.encryption', $mailSetting->mail_encryption ?: null);
    }
}
