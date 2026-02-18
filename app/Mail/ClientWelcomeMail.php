<?php

namespace App\Mail;

use App\Models\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClientWelcomeMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(public Client $client)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Bienvenido(a) a nuestro sistema de soporte',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.clients.welcome',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
