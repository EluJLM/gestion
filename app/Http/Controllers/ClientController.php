<?php

namespace App\Http\Controllers;

use App\Mail\ClientWelcomeMail;
use App\Models\Client;
use App\Support\UsesCompanyMailer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    use UsesCompanyMailer;

    public function index(): Response
    {
        return Inertia::render('Clients/Index', [
            'clients' => Client::query()
                ->latest()
                ->get(),
            'documentTypes' => ['CC', 'CE', 'NIT', 'PASAPORTE'],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());

        $client = Client::create($validated);

        $this->sendCompanyAwareMail($client->email, new ClientWelcomeMail($client));

        return to_route('clients.index');
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate($this->rules($client->id));

        $client->update($validated);

        return to_route('clients.index');
    }

    public function search(Request $request): JsonResponse
    {
        $query = trim((string) $request->query('query', ''));

        $clients = Client::query()
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(function ($subQuery) use ($query) {
                    $subQuery->where('name', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%")
                        ->orWhere('document_number', 'like', "%{$query}%")
                        ->orWhere('phone', 'like', "%{$query}%");
                });
            })
            ->latest()
            ->limit(10)
            ->get([
                'id',
                'name',
                'email',
                'document_type',
                'document_number',
                'phone',
                'address',
            ]);

        return response()->json([
            'clients' => $clients,
        ]);
    }

    private function rules(?int $clientId = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'document_type' => ['required', 'string', 'max:40'],
            'document_number' => [
                'required',
                'string',
                'max:60',
                Rule::unique('clients', 'document_number')
                    ->ignore($clientId)
                    ->where(fn ($query) => $query->where('document_type', request('document_type'))),
            ],
            'phone' => ['required', 'string', 'max:50'],
            'address' => ['required', 'string', 'max:255'],
        ];
    }
}
