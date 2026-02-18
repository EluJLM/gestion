<?php

namespace Tests\Feature;

use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTicketSenderEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_update_ticket_sender_email_from_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->put(route('dashboard.ticket-sender-email.update'), [
            'ticket_sender_email' => 'soporte@example.com',
        ]);

        $response->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('system_settings', [
            'key' => 'ticket_sender_email',
            'value' => 'soporte@example.com',
        ]);
    }

    public function test_dashboard_shows_saved_ticket_sender_email(): void
    {
        $user = User::factory()->create();

        SystemSetting::query()->create([
            'key' => 'ticket_sender_email',
            'value' => 'tickets@example.com',
        ]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
        $response->assertSee('tickets@example.com');
    }
}
