<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Employees/Index', [
            'employees' => User::query()
                ->where('company_id', $request->user()->company_id)
                ->where('role', User::ROLE_EMPLOYEE)
                ->latest()
                ->get(['id', 'name', 'email', 'created_at']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email'),
            ],
            'password' => ['required', 'string', 'min:8'],
        ]);

        User::create([
            'company_id' => $request->user()->company_id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => User::ROLE_EMPLOYEE,
        ]);

        return back();
    }

    public function destroy(Request $request, User $employee): RedirectResponse
    {
        abort_unless(
            $employee->company_id === $request->user()->company_id && $employee->role === User::ROLE_EMPLOYEE,
            403,
        );

        $employee->delete();

        return back();
    }
}
