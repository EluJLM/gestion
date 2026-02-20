<?php

namespace Tests\Feature;

use App\Mail\ClientWelcomeMail;
use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ClientManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_client_and_send_welcome_mail(): void
    {
        $user = User::factory()->create();

        Mail::fake();

        $response = $this->actingAs($user)->post(route('clients.store'), [
            'name' => 'María López',
            'email' => 'maria@example.com',
            'document_type' => 'CC',
            'document_number' => '10203040',
            'phone_country_code' => '+57',
            'phone' => '3001112233',
            'address' => 'Carrera 10 #20-30',
        ]);

        $response->assertRedirect(route('clients.index'));

        $this->assertDatabaseHas('clients', [
            'email' => 'maria@example.com',
            'document_type' => 'CC',
            'document_number' => '10203040',
            'phone' => '+573001112233',
        ]);

        Mail::assertSent(ClientWelcomeMail::class);
    }

    public function test_authenticated_user_can_update_client(): void
    {
        $user = User::factory()->create();
        $client = Client::factory()->create();

        $response = $this->actingAs($user)->patch(route('clients.update', $client), [
            'name' => 'Cliente Actualizado',
            'email' => $client->email,
            'document_type' => $client->document_type,
            'document_number' => $client->document_number,
            'phone_country_code' => '+57',
            'phone' => '3004445566',
            'address' => 'Dirección nueva',
        ]);

        $response->assertRedirect(route('clients.index'));

        $this->assertDatabaseHas('clients', [
            'id' => $client->id,
            'name' => 'Cliente Actualizado',
            'phone' => '+573004445566',
        ]);
    }
}
