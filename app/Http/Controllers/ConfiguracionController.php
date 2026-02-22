<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\MailSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ConfiguracionController extends Controller
{
    private const DOCUMENT_TYPES = ['NIT', 'CC', 'CE', 'PASAPORTE'];

    private const TAX_REGIMES = [
        'Régimen Ordinario',
        'Régimen Simple de Tributación (SIMPLE)',
        'Gran Contribuyente',
        'No responsable de IVA',
        'Responsable de IVA',
        'Autorretenedor',
    ];

    private const MAILERS = ['smtp', 'sendmail', 'log', 'array', 'failover'];

    private const MAIL_ENCRYPTIONS = ['tls', 'ssl'];

    private const MAIL_PORTS = [25, 465, 587, 2525];

    public function edit(Request $request): Response
    {
        return Inertia::render('Configuracion', [
            'company' => Company::query()->find($request->user()->company_id),
            'mailSetting' => MailSetting::query()
                ->where('company_id', $request->user()->company_id)
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
            'documentTypes' => self::DOCUMENT_TYPES,
            'taxRegimes' => self::TAX_REGIMES,
            'mailers' => self::MAILERS,
            'mailEncryptions' => self::MAIL_ENCRYPTIONS,
            'mailPorts' => self::MAIL_PORTS,
        ]);
    }

    public function upsertCompany(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'business_name' => ['required', 'string', 'max:255'],
            'document_type' => ['required', Rule::in(self::DOCUMENT_TYPES)],
            'document_number' => ['required', 'string', 'max:100'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:120'],
            'department' => ['required', 'string', 'max:120'],
            'country' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:50'],
            'whatsapp' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'tax_regime' => ['required', Rule::in(self::TAX_REGIMES)],
            'logo_path' => ['nullable', 'string', 'max:255'],
        ]);

        $company = Company::query()->find($request->user()->company_id);

        if ($company) {
            $company->update($validated);
        } else {
            Company::create([...$validated, 'id' => $request->user()->company_id]);
        }

        return back();
    }

    public function upsertMail(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'mail_mailer' => ['required', Rule::in(self::MAILERS)],
            'mail_host' => ['required', 'string', 'max:255'],
            'mail_port' => ['required', Rule::in(self::MAIL_PORTS)],
            'mail_username' => ['required', 'string', 'max:255'],
            'mail_password' => ['nullable', 'string', 'max:255'],
            'mail_encryption' => ['nullable', Rule::in(self::MAIL_ENCRYPTIONS)],
            'mail_from_address' => ['required', 'email', 'max:255'],
            'mail_from_name' => ['required', 'string', 'max:255'],
        ]);

        $mailSetting = MailSetting::query()->where('company_id', $request->user()->company_id)->first();

        if (! empty($validated['mail_password'])) {
            $validated['mail_password'] = Crypt::encryptString($validated['mail_password']);
        } elseif ($mailSetting) {
            unset($validated['mail_password']);
        } else {
            return back()->withErrors([
                'mail_password' => 'La contraseña SMTP es obligatoria en la primera configuración.',
            ]);
        }

        if ($mailSetting) {
            $mailSetting->update($validated);
        } else {
            MailSetting::create([...$validated, 'company_id' => $request->user()->company_id]);
        }

        return back();
    }

    public function testMail(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'test_email' => ['required', 'email', 'max:255'],
        ]);

        $mailSetting = MailSetting::query()->where('company_id', $request->user()->company_id)->first();

        if (! $mailSetting) {
            return back()->withErrors([
                'test_email' => 'Primero debes guardar la configuración SMTP.',
            ]);
        }

        $this->applyCompanyMailer($mailSetting);

        Mail::mailer('company_smtp')->raw('Este es un correo de prueba para verificar la configuración SMTP.', function ($message) use ($validated, $mailSetting): void {
            $message->to($validated['test_email'])
                ->subject('Prueba SMTP - Gestión de servicios')
                ->from($mailSetting->mail_from_address, $mailSetting->mail_from_name);
        });

        return back();
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
