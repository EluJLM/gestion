<?php

namespace Tests\Feature;

use App\Mail\TicketCreatedMail;
use App\Models\Client;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class TicketManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_ticket_with_existing_client(): void
    {
        $user = User::factory()->create();
        $client = Client::factory()->create();

        Mail::fake();
        config(['services.imgbb.key' => 'test-key']);

        Http::fake([
            'api.imgbb.com/1/upload' => Http::response([
                'success' => true,
                'data' => [
                    'url' => 'https://i.ibb.co/example/image.jpg',
                    'delete_url' => 'https://ibb.co/delete/example',
                ],
            ]),
        ]);

        $response = $this->actingAs($user)->post(route('tickets.store'), [
            'title' => 'No enciende impresora',
            'description' => 'La impresora no responde al botón de encendido.',
            'type' => 'Soporte técnico',
            'observation' => 'Revisar cable de corriente',
            'estimated_price' => '120.50',
            'status' => Ticket::STATUS_CLOSED,
            'service_date' => now()->toDateString(),
            'client_id' => $client->id,
            'images' => [
                UploadedFile::fake()->image('equipo.jpg'),
            ],
        ]);

        $response->assertRedirect(route('tickets.create'));

        $response->assertSessionHas('ticketCreated.whatsapp_url', function (string $whatsappUrl): bool {
            return str_contains($whatsappUrl, 'api.whatsapp.com/send')
                && str_contains($whatsappUrl, rawurlencode('/servicio/'));
        });

        Mail::assertSent(TicketCreatedMail::class);

        $this->assertDatabaseHas('tickets', [
            'title' => 'No enciende impresora',
            'status' => Ticket::STATUS_CLOSED,
            'service_date' => now()->toDateString(),
            'client_id' => $client->id,
        ]);

        $this->assertDatabaseCount('ticket_images', 1);

        $this->assertNotNull(Ticket::first()?->closed_at);
    }

    public function test_authenticated_user_can_update_ticket_status_and_set_closed_at(): void
    {
        $user = User::factory()->create();

        $ticket = Ticket::factory()->create([
            'status' => Ticket::STATUS_PENDING,
            'closed_at' => null,
        ]);

        $response = $this->actingAs($user)->patch(
            route('tickets.status.update', $ticket),
            ['status' => Ticket::STATUS_CLOSED],
        );

        $response->assertRedirect(route('tickets.index'));

        $ticket->refresh();

        $this->assertSame(Ticket::STATUS_CLOSED, $ticket->status);
        $this->assertNotNull($ticket->closed_at);
    }



    public function test_index_shows_today_tickets_by_default_and_allows_filtering(): void
    {
        $user = User::factory()->create();
        $todayTicket = Ticket::factory()->create([
            'service_date' => now()->toDateString(),
        ]);
        $oldTicket = Ticket::factory()->create([
            'service_date' => now()->subDay()->toDateString(),
        ]);

        $response = $this->actingAs($user)->get(route('tickets.index'));

        $response->assertOk();
        $response->assertSee($todayTicket->title);
        $response->assertDontSee($oldTicket->title);

        $filteredResponse = $this->actingAs($user)->get(route('tickets.index', [
            'date' => now()->subDay()->toDateString(),
            'document' => $oldTicket->client->document_number,
        ]));

        $filteredResponse->assertOk();
        $filteredResponse->assertSee($oldTicket->title);
        $filteredResponse->assertDontSee($todayTicket->title);
    }



    public function test_index_can_filter_by_multiple_statuses(): void
    {
        $user = User::factory()->create();
        $pendingTicket = Ticket::factory()->create([
            'service_date' => now()->toDateString(),
            'status' => Ticket::STATUS_PENDING,
        ]);
        $closedTicket = Ticket::factory()->create([
            'service_date' => now()->toDateString(),
            'status' => Ticket::STATUS_CLOSED,
        ]);

        $response = $this->actingAs($user)->get(route('tickets.index', [
            'date' => now()->toDateString(),
            'statuses' => [Ticket::STATUS_PENDING],
        ]));

        $response->assertOk();
        $response->assertSee($pendingTicket->title);
        $response->assertDontSee($closedTicket->title);
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
