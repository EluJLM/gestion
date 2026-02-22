<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $isFirstUser = User::query()->count() === 0;

        $company = null;

        if (! $isFirstUser) {
            $company = Company::create([
                'name' => $request->name,
                'business_name' => $request->name,
                'document_type' => 'NIT',
                'document_number' => 'PENDIENTE-'.strtoupper((string) str($request->email)->before('@')),
                'address' => 'Por definir',
                'city' => 'Por definir',
                'department' => 'Por definir',
                'country' => 'Por definir',
                'phone' => '0000000000',
                'whatsapp' => '0000000000',
                'email' => $request->email,
                'tax_regime' => 'No responsable de IVA',
                'subscription_status' => Company::STATUS_TRIAL,
                'trial_ends_at' => now()->addMonth(),
            ]);
        }

        $user = User::create([
            'company_id' => $company?->id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $isFirstUser ? User::ROLE_SUPER_ADMIN : User::ROLE_TENANT_ADMIN,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
