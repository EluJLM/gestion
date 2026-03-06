<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\ProductCreationPermission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_cannot_create_products_without_active_permission(): void
    {
        $company = Company::factory()->create();

        $employee = User::factory()->create([
            'company_id' => $company->id,
            'role' => User::ROLE_EMPLOYEE,
        ]);

        $response = $this->actingAs($employee)->post(route('products.store'), [
            'name' => 'Aceite 10W40',
            'cost_price' => 10,
            'sale_price' => 12,
            'generate_barcode' => true,
        ]);

        $response->assertForbidden();
    }

    public function test_employee_with_permission_can_create_product_without_invoice_image(): void
    {
        $company = Company::factory()->create();

        $admin = User::factory()->create([
            'company_id' => $company->id,
            'role' => User::ROLE_TENANT_ADMIN,
        ]);

        $employee = User::factory()->create([
            'company_id' => $company->id,
            'role' => User::ROLE_EMPLOYEE,
        ]);

        ProductCreationPermission::create([
            'company_id' => $company->id,
            'employee_id' => $employee->id,
            'granted_by' => $admin->id,
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addHour(),
            'allow_without_invoice' => false,
        ]);

        $response = $this->actingAs($employee)->from(route('products.index'))->post(route('products.store'), [
            'name' => 'Filtro de aire',
            'cost_price' => 20,
            'sale_price' => 30,
            'generate_barcode' => true,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('products', [
            'company_id' => $company->id,
            'name' => 'Filtro de aire',
            'cost_price' => 20,
            'sale_price' => 30,
        ]);
    }

    public function test_employee_can_create_product_when_admin_grants_permission(): void
    {
        $company = Company::factory()->create();

        $admin = User::factory()->create([
            'company_id' => $company->id,
            'role' => User::ROLE_TENANT_ADMIN,
        ]);

        $employee = User::factory()->create([
            'company_id' => $company->id,
            'role' => User::ROLE_EMPLOYEE,
        ]);

        ProductCreationPermission::create([
            'company_id' => $company->id,
            'employee_id' => $employee->id,
            'granted_by' => $admin->id,
            'starts_at' => now()->subDay(),
            'ends_at' => null,
            'allow_without_invoice' => true,
        ]);

        $response = $this->actingAs($employee)->post(route('products.store'), [
            'name' => 'Bujía',
            'cost_price' => 5,
            'sale_price' => 8,
            'generate_barcode' => true,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('products', [
            'company_id' => $company->id,
            'name' => 'Bujía',
            'cost_price' => 5,
            'sale_price' => 8,
        ]);
    }

    public function test_employee_with_active_permission_can_edit_product(): void
    {
        $company = Company::factory()->create();

        $admin = User::factory()->create([
            'company_id' => $company->id,
            'role' => User::ROLE_TENANT_ADMIN,
        ]);

        $employee = User::factory()->create([
            'company_id' => $company->id,
            'role' => User::ROLE_EMPLOYEE,
        ]);

        ProductCreationPermission::create([
            'company_id' => $company->id,
            'employee_id' => $employee->id,
            'granted_by' => $admin->id,
            'starts_at' => now()->subDay(),
            'ends_at' => null,
            'allow_without_invoice' => true,
        ]);

        $product = \App\Models\Product::create([
            'company_id' => $company->id,
            'created_by' => $admin->id,
            'name' => 'Aceite mineral',
            'cost_price' => 20,
            'sale_price' => 30,
        ]);

        $response = $this->actingAs($employee)->patch(route('products.update', $product), [
            'name' => 'Aceite sintético',
            'cost_price' => 25,
            'sale_price' => 40,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Aceite sintético',
            'cost_price' => 25,
            'sale_price' => 40,
        ]);
    }
}
