<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateTicketSenderEmailRequest;
use App\Models\SystemSetting;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function show()
    {
        return Inertia::render('Dashboard', [
            'ticketSenderEmail' => SystemSetting::query()
                ->where('key', 'ticket_sender_email')
                ->value('value') ?? config('mail.from.address'),
        ]);
    }

    public function updateTicketSenderEmail(UpdateTicketSenderEmailRequest $request)
    {
        SystemSetting::query()->updateOrCreate(
            ['key' => 'ticket_sender_email'],
            ['value' => $request->validated('ticket_sender_email')],
        );

        return to_route('dashboard');
    }
}
