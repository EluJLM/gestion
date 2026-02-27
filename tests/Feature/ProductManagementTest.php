<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\ProductCreationPermission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
            'generate_barcode' => true,
        ]);

        $response->assertForbidden();
    }

    public function test_employee_with_permission_must_upload_invoice_if_not_explicitly_allowed(): void
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
            'generate_barcode' => true,
        ]);

        $response->assertRedirect(route('products.index'));
        $response->assertSessionHasErrors('invoice_image');
    }

    public function test_employee_can_create_without_invoice_when_admin_grants_that_permission(): void
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

        Storage::fake('public');

        $response = $this->actingAs($employee)->post(route('products.store'), [
            'name' => 'Bujía',
            'generate_barcode' => true,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('products', [
            'company_id' => $company->id,
            'name' => 'Bujía',
            'invoice_image_path' => null,
        ]);
    }

    public function test_employee_with_invoice_requirement_can_create_product_when_uploading_receipt_image(): void
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
            'allow_without_invoice' => false,
        ]);

        Storage::fake('public');

        $response = $this->actingAs($employee)->post(route('products.store'), [
            'name' => 'Pastillas de freno',
            'generate_barcode' => true,
            'invoice_image' => UploadedFile::fake()->image('factura.jpg'),
        ]);

        $response->assertRedirect();

        $this->assertDatabaseCount('products', 1);
        Storage::disk('public')->assertExists(
            \App\Models\Product::query()->firstOrFail()->invoice_image_path,
        );
    }
}
