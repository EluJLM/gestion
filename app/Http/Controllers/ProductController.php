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
        $query = trim((string) $request->query('query', ''));

        return Inertia::render('Products/Index', [
            'products' => Product::query()
                ->where('company_id', $request->user()->company_id)
                ->with('creator:id,name')
                ->when($query !== '', function ($builder) use ($query) {
                    $builder->where(function ($subQuery) use ($query) {
                        $subQuery->where('name', 'like', "%{$query}%")
                            ->orWhere('barcode', 'like', "%{$query}%");
                    });
                })
                ->latest()
                ->get(['id', 'name', 'sku', 'barcode', 'invoice_image_path', 'created_by', 'created_at']),
            'query' => $query,
            'canCreateWithoutInvoice' => $this->canCreateWithoutInvoice($request),
            'canCreateProducts' => $this->canCreateProducts($request),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($this->canCreateProducts($request), 403, 'No tienes permiso activo para crear productos.');

        $canCreateWithoutInvoice = $this->canCreateWithoutInvoice($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:255'],
            'barcode' => [
                'nullable',
                'string',
                'max:32',
                Rule::unique('products', 'barcode')->where(fn ($query) => $query->where('company_id', $request->user()->company_id)),
            ],
            'generate_barcode' => ['nullable', 'boolean'],
            'invoice_image' => [$canCreateWithoutInvoice ? 'nullable' : 'required', 'image', 'max:4096'],
        ]);

        $barcode = $validated['barcode'] ?? null;

        if (($validated['generate_barcode'] ?? false) || blank($barcode)) {
            $barcode = $this->generateCompanyBarcode($request->user()->company_id);
        }

        $invoicePath = null;

        if ($request->hasFile('invoice_image')) {
            $invoicePath = $request->file('invoice_image')->store('product-invoices', 'public');
        }

        Product::create([
            'company_id' => $request->user()->company_id,
            'created_by' => $request->user()->id,
            'name' => $validated['name'],
            'sku' => $validated['sku'] ?? null,
            'barcode' => $barcode,
            'invoice_image_path' => $invoicePath,
        ]);

        return back();
    }

    private function canCreateProducts(Request $request): bool
    {
        if ($request->user()->role === User::ROLE_TENANT_ADMIN) {
            return true;
        }

        if ($request->user()->role !== User::ROLE_EMPLOYEE) {
            return false;
        }

        return ProductCreationPermission::query()
            ->where('company_id', $request->user()->company_id)
            ->where('employee_id', $request->user()->id)
            ->where('starts_at', '<=', now())
            ->where(function ($query) {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->exists();
    }

    private function canCreateWithoutInvoice(Request $request): bool
    {
        if ($request->user()->role === User::ROLE_TENANT_ADMIN) {
            return true;
        }

        return ProductCreationPermission::query()
            ->where('company_id', $request->user()->company_id)
            ->where('employee_id', $request->user()->id)
            ->where('allow_without_invoice', true)
            ->where('starts_at', '<=', now())
            ->where(function ($query) {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->exists();
    }

    private function generateCompanyBarcode(int $companyId): string
    {
        do {
            $barcode = '77'.str_pad((string) $companyId, 4, '0', STR_PAD_LEFT).random_int(1000000, 9999999);
        } while (Product::query()->where('company_id', $companyId)->where('barcode', $barcode)->exists());

        return $barcode;
    }
}
