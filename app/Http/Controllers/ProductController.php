<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCreationPermission;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = trim((string) $request->string('q'));

        $products = Product::query()
            ->where('company_id', $user->company_id)
            ->with('creator:id,name')
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(function ($nested) use ($query) {
                    $nested->where('name', 'like', "%{$query}%")
                        ->orWhere('barcode', 'like', "%{$query}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Products/Index', [
            'filters' => ['q' => $query],
            'products' => $products,
            'employees' => $user->isTenantAdmin()
                ? User::query()->where('company_id', $user->company_id)->where('role', User::ROLE_EMPLOYEE)
                    ->orderBy('name')->get(['id', 'name', 'email'])
                : [],
            'activePermission' => $this->activePermission($user),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $activePermission = $this->activePermission($user);

        abort_unless($user->isTenantAdmin() || $activePermission['can_create'], 403, 'No tienes permiso para crear productos.');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:3000'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'barcode' => ['nullable', 'string', 'max:32', Rule::unique('products', 'barcode')->where(fn ($query) => $query->where('company_id', $user->company_id))],
            'auto_generate_barcode' => ['nullable', 'boolean'],
            'invoice_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $canSkipInvoice = $user->isTenantAdmin() || $activePermission['allow_without_invoice'];

        abort_if(! $canSkipInvoice && ! $request->hasFile('invoice_image'), 422, 'Debes subir la factura para registrar un producto.');

        $barcode = $validated['barcode'] ?? null;

        if (($validated['auto_generate_barcode'] ?? false) || ! $barcode) {
            $barcode = $this->generateUniqueBarcode($user->company_id);
        }

        $invoicePath = $request->hasFile('invoice_image')
            ? $request->file('invoice_image')->store('invoices', 'public')
            : null;

        Product::create([
            'company_id' => $user->company_id,
            'created_by' => $user->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'stock' => $validated['stock'],
            'barcode' => $barcode,
            'invoice_image_path' => $invoicePath,
        ]);

        return back();
    }

    public function grantPermission(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isTenantAdmin(), 403);

        $validated = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:users,id'],
            'permission_kind' => ['required', 'in:with_invoice,without_invoice_hours'],
            'type' => ['required_if:permission_kind,with_invoice', 'nullable', 'in:hours,days,always'],
            'duration' => ['nullable', 'integer', 'min:1', 'max:720'],
        ]);

        $employee = User::query()
            ->where('id', $validated['employee_id'])
            ->where('company_id', $user->company_id)
            ->where('role', User::ROLE_EMPLOYEE)
            ->firstOrFail();

        $isWithoutInvoiceOverride = $validated['permission_kind'] === 'without_invoice_hours';
        $start = now();

        if ($isWithoutInvoiceOverride) {
            $duration = max(1, (int) ($validated['duration'] ?? 1));

            ProductCreationPermission::query()
                ->where('company_id', $user->company_id)
                ->where('employee_id', $employee->id)
                ->where('is_active', true)
                ->where('allow_without_invoice', true)
                ->update(['is_active' => false]);

            ProductCreationPermission::create([
                'company_id' => $user->company_id,
                'employee_id' => $employee->id,
                'granted_by' => $user->id,
                'starts_at' => $start,
                'ends_at' => $start->copy()->addHours($duration),
                'is_always' => false,
                'allow_without_invoice' => true,
                'is_active' => true,
            ]);

            return back();
        }

        $type = $validated['type'] ?? 'hours';
        $always = $type === 'always';
        $end = null;

        if (! $always) {
            $duration = max(1, (int) ($validated['duration'] ?? 1));
            $end = $type === 'hours'
                ? $start->copy()->addHours($duration)
                : $start->copy()->addDays($duration);
        }

        ProductCreationPermission::query()
            ->where('company_id', $user->company_id)
            ->where('employee_id', $employee->id)
            ->where('is_active', true)
            ->where('allow_without_invoice', false)
            ->update(['is_active' => false]);

        ProductCreationPermission::create([
            'company_id' => $user->company_id,
            'employee_id' => $employee->id,
            'granted_by' => $user->id,
            'starts_at' => $start,
            'ends_at' => $end,
            'is_always' => $always,
            'allow_without_invoice' => false,
            'is_active' => true,
        ]);

        return back();
    }

    private function activePermission(User $user): array
    {
        if ($user->isTenantAdmin()) {
            return [
                'can_create' => true,
                'allow_without_invoice' => true,
                'expires_at' => null,
                'is_always' => true,
                'has_base_permission' => true,
                'override_without_invoice_expires_at' => null,
            ];
        }

        $basePermission = ProductCreationPermission::query()
            ->where('company_id', $user->company_id)
            ->where('employee_id', $user->id)
            ->where('is_active', true)
            ->where('allow_without_invoice', false)
            ->latest()
            ->get()
            ->first(fn (ProductCreationPermission $permission) => $permission->isValidNow());

        $withoutInvoiceOverride = ProductCreationPermission::query()
            ->where('company_id', $user->company_id)
            ->where('employee_id', $user->id)
            ->where('is_active', true)
            ->where('allow_without_invoice', true)
            ->latest()
            ->get()
            ->first(fn (ProductCreationPermission $permission) => $permission->isValidNow());

        return [
            'can_create' => (bool) ($basePermission || $withoutInvoiceOverride),
            'allow_without_invoice' => (bool) $withoutInvoiceOverride,
            'expires_at' => $basePermission?->ends_at?->toIso8601String(),
            'is_always' => (bool) $basePermission?->is_always,
            'has_base_permission' => (bool) $basePermission,
            'override_without_invoice_expires_at' => $withoutInvoiceOverride?->ends_at?->toIso8601String(),
        ];
    }

    private function generateUniqueBarcode(int $companyId): string
    {
        do {
            $barcode = str_pad((string) random_int(0, 9999999999999), 13, '0', STR_PAD_LEFT);
        } while (Product::query()->where('company_id', $companyId)->where('barcode', $barcode)->exists());

        return $barcode;
    }
}
