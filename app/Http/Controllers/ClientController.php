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

    public function index(Request $request): Response
    {
        return Inertia::render('Clients/Index', [
            'clients' => Client::query()
                ->where('company_id', $request->user()->company_id)
                ->latest()
                ->get(),
            'documentTypes' => ['CC', 'CE', 'NIT', 'PASAPORTE'],
            'countryIndicators' => [
                ['code' => '+57', 'label' => '🇨🇴 Colombia (+57)'],
                ['code' => '+1', 'label' => '🇺🇸/🇨🇦 USA/Canadá (+1)'],
                ['code' => '+34', 'label' => '🇪🇸 España (+34)'],
                ['code' => '+52', 'label' => '🇲🇽 México (+52)'],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules(companyId: $request->user()->company_id));
        $validated['phone'] = $this->buildFullPhone($validated['phone_country_code'], $validated['phone']);
        $validated['company_id'] = $request->user()->company_id;

        unset($validated['phone_country_code']);

        $client = Client::create($validated);

        $this->sendCompanyAwareMail($client->email, new ClientWelcomeMail($client));

        return to_route('clients.index');
    }

    public function update(Request $request, Client $client)
    {
        abort_unless($client->company_id === $request->user()->company_id, 403);

        $validated = $request->validate($this->rules($client->id, $request->user()->company_id));
        $validated['phone'] = $this->buildFullPhone($validated['phone_country_code'], $validated['phone']);
        unset($validated['phone_country_code']);

        $client->update($validated);

        return to_route('clients.index');
    }

    public function search(Request $request): JsonResponse
    {
        $query = trim((string) $request->query('query', ''));

        $clients = Client::query()
            ->where('company_id', $request->user()->company_id)
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
            ->get(['id', 'name', 'email', 'document_type', 'document_number', 'phone', 'address']);

        return response()->json(['clients' => $clients]);
    }

    private function rules(?int $clientId = null, ?int $companyId = null): array
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
                    ->where(fn ($query) => $query
                        ->where('company_id', $companyId)
                        ->where('document_type', request('document_type'))),
            ],
            'phone_country_code' => ['required', 'regex:/^\+[0-9]{1,4}$/'],
            'phone' => ['required', 'regex:/^[0-9]{7,15}$/'],
            'address' => ['required', 'string', 'max:255'],
        ];
    }

    private function buildFullPhone(string $countryCode, string $phone): string
    {
        return $countryCode.$phone;
    }
}
