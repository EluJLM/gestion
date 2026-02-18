<?php

namespace Tests\Feature;

use App\Mail\TicketCreatedMail;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class TicketManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_ticket_with_client_data(): void
    {
        $user = User::factory()->create();

        Mail::fake();

        $response = $this->actingAs($user)->post(route('tickets.store'), [
            'title' => 'No enciende impresora',
            'description' => 'La impresora no responde al botón de encendido.',
            'type' => 'Soporte técnico',
            'observation' => 'Revisar cable de corriente',
            'estimated_price' => '120.50',
            'status' => Ticket::STATUS_PENDING,
            'client' => [
                'name' => 'Juan Pérez',
                'email' => 'juan@example.com',
                'document_type' => 'CC',
                'document_number' => '100200300',
                'phone' => '3001234567',
                'address' => 'Calle 123 #45-67',
            ],
        ]);

        $response->assertRedirect(route('tickets.index'));

        $this->assertDatabaseHas('clients', [
            'document_type' => 'CC',
            'document_number' => '100200300',
            'email' => 'juan@example.com',
        ]);

        Mail::assertSent(TicketCreatedMail::class);

        $this->assertDatabaseHas('tickets', [
            'title' => 'No enciende impresora',
            'status' => Ticket::STATUS_PENDING,
        ]);
    }

    public function test_authenticated_user_can_update_ticket_status(): void
    {
        $user = User::factory()->create();

        $ticket = Ticket::factory()->create([
            'status' => Ticket::STATUS_PENDING,
        ]);

        $response = $this->actingAs($user)->patch(
            route('tickets.status.update', $ticket),
            ['status' => Ticket::STATUS_RESOLVED],
        );

        $response->assertRedirect(route('tickets.index'));

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => Ticket::STATUS_RESOLVED,
        ]);
    }

    public function test_public_ticket_link_displays_ticket_without_authentication(): void
    {
        $ticket = Ticket::factory()->create();

        $response = $this->get(route('tickets.public.show', $ticket->public_token));

        $response->assertOk();
        $response->assertSee((string) $ticket->id);
        $response->assertSee($ticket->title);
    }
}
