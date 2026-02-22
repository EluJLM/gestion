<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'company' => $request->user()?->company,
                'subscriptionActive' => $request->user()?->isSuperAdmin()
                    ? true
                    : (bool) $request->user()?->company?->hasActiveSubscription(),
            ],
            'flash' => [
                'ticketCreated' => fn () => $request->session()->get('ticketCreated'),
            ],
        ];
    }
}
