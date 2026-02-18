<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\MailSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ConfiguracionController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Configuracion', [
            'company' => Company::query()->first(),
            'mailSetting' => MailSetting::query()
                ->first([
                    'id',
                    'mail_mailer',
                    'mail_host',
                    'mail_port',
                    'mail_username',
                    'mail_encryption',
                    'mail_from_address',
                    'mail_from_name',
                ]),
        ]);
    }

    public function upsertCompany(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'business_name' => ['required', 'string', 'max:255'],
            'document_type' => ['required', 'string', 'max:50'],
            'document_number' => ['required', 'string', 'max:100'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:120'],
            'department' => ['required', 'string', 'max:120'],
            'country' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:50'],
            'whatsapp' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'tax_regime' => ['required', 'string', 'max:255'],
            'logo_path' => ['nullable', 'string', 'max:255'],
        ]);

        $company = Company::query()->first();

        if ($company) {
            $company->update($validated);
        } else {
            Company::create($validated);
        }

        return back();
    }

    public function upsertMail(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'mail_mailer' => ['required', 'string', 'max:50'],
            'mail_host' => ['required', 'string', 'max:255'],
            'mail_port' => ['required', 'integer', 'min:1', 'max:65535'],
            'mail_username' => ['required', 'string', 'max:255'],
            'mail_password' => ['nullable', 'string', 'max:255'],
            'mail_encryption' => ['nullable', 'string', 'max:50'],
            'mail_from_address' => ['required', 'email', 'max:255'],
            'mail_from_name' => ['required', 'string', 'max:255'],
        ]);

        $mailSetting = MailSetting::query()->first();

        if (! empty($validated['mail_password'])) {
            $validated['mail_password'] = Crypt::encryptString($validated['mail_password']);
        } elseif ($mailSetting) {
            unset($validated['mail_password']);
        } else {
            return back()->withErrors([
                'mail_password' => 'La contraseña SMTP es obligatoria en la primera configuración.',
            ], 'mailSettings');
        }

        if ($mailSetting) {
            $mailSetting->update($validated);
        } else {
            MailSetting::create($validated);
        }

        return back();
    }

    public function testMail(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'test_email' => ['required', 'email', 'max:255'],
        ]);

        $mailSetting = MailSetting::query()->first();

        if (! $mailSetting) {
            return back()->withErrors([
                'test_email' => 'Primero debes guardar la configuración SMTP.',
            ], 'mailTest');
        }

        Config::set('mail.default', $mailSetting->mail_mailer);
        Config::set('mail.mailers.smtp.host', $mailSetting->mail_host);
        Config::set('mail.mailers.smtp.port', $mailSetting->mail_port);
        Config::set('mail.mailers.smtp.username', $mailSetting->mail_username);
        Config::set('mail.mailers.smtp.password', Crypt::decryptString($mailSetting->mail_password));
        Config::set('mail.mailers.smtp.encryption', $mailSetting->mail_encryption ?: null);
        Config::set('mail.from.address', $mailSetting->mail_from_address);
        Config::set('mail.from.name', $mailSetting->mail_from_name);

        Mail::raw('Este es un correo de prueba para verificar la configuración SMTP.', function ($message) use ($validated): void {
            $message->to($validated['test_email'])
                ->subject('Prueba SMTP - Gestión de tickets');
        });

        return back();
    }
}
