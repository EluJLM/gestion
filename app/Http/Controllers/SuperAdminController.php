<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('SuperAdmin/Subscriptions', [
            'companies' => Company::query()->withCount('users')->latest()->get(),
        ]);
    }

    public function update(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'in:activate,cancel,extend_trial'],
        ]);

        if ($validated['action'] === 'cancel') {
            $company->update([
                'subscription_status' => Company::STATUS_CANCELLED,
                'cancelled_at' => now(),
            ]);
        }

        if ($validated['action'] === 'activate') {
            $company->update([
                'subscription_status' => Company::STATUS_ACTIVE,
                'cancelled_at' => null,
                'subscription_ends_at' => now()->addMonth(),
            ]);
        }

        if ($validated['action'] === 'extend_trial') {
            $company->update([
                'subscription_status' => Company::STATUS_TRIAL,
                'cancelled_at' => null,
                'trial_ends_at' => now()->addMonth(),
            ]);
        }

        return back();
    }
}
