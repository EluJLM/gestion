<?php

namespace Tests\Feature\Auth;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }


    public function test_users_with_cancelled_subscription_can_not_authenticate(): void
    {
        $company = Company::create([
            'name' => 'Acme',
            'business_name' => 'Acme SAS',
            'document_type' => 'NIT',
            'document_number' => '900123456',
            'address' => 'Calle 1 # 2 - 3',
            'city' => 'Bogotá',
            'department' => 'Cundinamarca',
            'country' => 'Colombia',
            'phone' => '3000000000',
            'whatsapp' => '3000000000',
            'email' => 'empresa@example.com',
            'tax_regime' => 'Común',
            'subscription_status' => Company::STATUS_CANCELLED,
        ]);

        $user = User::factory()->create([
            'company_id' => $company->id,
            'role' => User::ROLE_TENANT_ADMIN,
        ]);

        $response = $this->from('/login')->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect('/login');
        $response->assertSessionHasErrors([
            'email' => 'Por favor comunícate con el asesor.',
        ]);
        $this->assertGuest();
    }

    public function test_users_with_cancelled_subscription_are_redirected_to_login_from_protected_routes(): void
    {
        $company = Company::create([
            'name' => 'Acme',
            'business_name' => 'Acme SAS',
            'document_type' => 'NIT',
            'document_number' => '900123456',
            'address' => 'Calle 1 # 2 - 3',
            'city' => 'Bogotá',
            'department' => 'Cundinamarca',
            'country' => 'Colombia',
            'phone' => '3000000000',
            'whatsapp' => '3000000000',
            'email' => 'empresa@example.com',
            'tax_regime' => 'Común',
            'subscription_status' => Company::STATUS_CANCELLED,
        ]);

        $user = User::factory()->create([
            'company_id' => $company->id,
            'role' => User::ROLE_TENANT_ADMIN,
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
