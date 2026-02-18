<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Mail\TicketCreatedMail;
use App\Models\Client;
use App\Models\Ticket;
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
            'documentTypes' => ['CC', 'CE', 'NIT', 'PASAPORTE'],
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

        Mail::to($client->email)->send(new TicketCreatedMail($ticket));

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
}
