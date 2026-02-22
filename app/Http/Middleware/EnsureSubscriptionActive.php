<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSubscriptionActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->isSuperAdmin()) {
            return $next($request);
        }

        abort_unless($user->company && $user->company->hasActiveSubscription(), 402, 'Tu suscripción está vencida o cancelada.');

        return $next($request);
    }
}
