<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Mail\TicketCreatedMail;
use App\Models\Ticket;
use App\Support\UsesCompanyMailer;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    use UsesCompanyMailer;

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
        ]);
    }

    public function store(StoreTicketRequest $request)
    {
        $validated = $request->validated();

        $ticket = Ticket::create([
            'client_id' => $validated['client_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'observation' => $validated['observation'] ?? null,
            'estimated_price' => $validated['estimated_price'] ?? null,
            'status' => $validated['status'],
        ])->load('client');

        $this->sendCompanyAwareMail($ticket->client->email, new TicketCreatedMail($ticket));

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
