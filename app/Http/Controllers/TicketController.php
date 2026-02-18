<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Mail\TicketCreatedMail;
use App\Models\Client;
use App\Models\MailSetting;
use App\Models\Ticket;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Tickets/Index', [
            'tickets' => Ticket::query()
                ->with('client')
                ->latest()
                ->get(),
            'statuses' => Ticket::statuses(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Tickets/Create', [
            'statuses' => Ticket::statuses(),
            'documentTypes' => ['CC', 'CE', 'NIT', 'PASAPORTE'],
            'previousClients' => Client::query()
                ->latest()
                ->limit(100)
                ->get([
                    'id',
                    'name',
                    'email',
                    'document_type',
                    'document_number',
                    'phone',
                    'address',
                ]),
        ]);
    }

    public function store(StoreTicketRequest $request)
    {
        $validated = $request->validated();

        $client = Client::updateOrCreate(
            [
                'document_type' => $validated['client']['document_type'],
                'document_number' => $validated['client']['document_number'],
            ],
            $validated['client'],
        );

        $ticket = Ticket::create([
            'client_id' => $client->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'observation' => $validated['observation'] ?? null,
            'estimated_price' => $validated['estimated_price'] ?? null,
            'status' => $validated['status'],
        ])->load('client');

        $mailSetting = MailSetting::query()->first();

        if ($mailSetting) {
            $this->applyCompanyMailer($mailSetting);

            Mail::mailer('company_smtp')
                ->to($client->email)
                ->send((new TicketCreatedMail($ticket))
                    ->from($mailSetting->mail_from_address, $mailSetting->mail_from_name));
        } else {
            Mail::to($client->email)->send(new TicketCreatedMail($ticket));
        }

        return to_route('tickets.index');
    }

    public function updateStatus(UpdateTicketStatusRequest $request, Ticket $ticket)
    {
        $ticket->update([
            'status' => $request->validated('status'),
        ]);

        return to_route('tickets.index');
    }

    public function publicShow(string $token)
    {
        $ticket = Ticket::query()
            ->with('client')
            ->where('public_token', $token)
            ->firstOrFail();

        return view('tickets.public', [
            'ticket' => $ticket,
        ]);
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
