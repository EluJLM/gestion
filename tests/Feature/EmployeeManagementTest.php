<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_admin_can_deactivate_employee_without_deleting_it(): void
    {
        $company = Company::factory()->create();

        $admin = User::factory()->create([
            'company_id' => $company->id,
            'role' => User::ROLE_TENANT_ADMIN,
        ]);

        $employee = User::factory()->create([
            'company_id' => $company->id,
            'role' => User::ROLE_EMPLOYEE,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->patch(route('employees.status.update', $employee), [
            'is_active' => false,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $employee->id,
            'is_active' => false,
        ]);
    }
}
