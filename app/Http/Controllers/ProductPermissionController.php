<?php

namespace App\Http\Controllers;

use App\Models\ProductCreationPermission;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProductPermissionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'integer'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'allow_without_invoice' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $employee = User::query()
            ->where('company_id', $request->user()->company_id)
            ->where('role', User::ROLE_EMPLOYEE)
            ->findOrFail($validated['employee_id']);

        ProductCreationPermission::create([
            'company_id' => $request->user()->company_id,
            'employee_id' => $employee->id,
            'granted_by' => $request->user()->id,
            'starts_at' => $validated['starts_at'],
            'ends_at' => $validated['ends_at'] ?? null,
            'allow_without_invoice' => (bool) ($validated['allow_without_invoice'] ?? false),
            'notes' => $validated['notes'] ?? null,
        ]);

        return back();
    }
}
