<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Mail\TicketCreatedMail;
use App\Models\Ticket;
use App\Support\UsesCompanyMailer;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    use UsesCompanyMailer;

    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'document' => ['nullable', 'string', 'max:60'],
            'date' => ['nullable', 'date'],
            'period' => ['nullable', 'string', Rule::in(['day', 'week', 'month', 'year'])],
            'statuses' => ['nullable', 'array'],
            'statuses.*' => ['string', Rule::in(Ticket::statuses())],
        ]);

        $selectedDate = $validated['date'] ?? now()->toDateString();
        $period = $validated['period'] ?? 'day';
        $document = trim((string) ($validated['document'] ?? ''));
        $statusFilters = collect($validated['statuses'] ?? Ticket::statuses())
            ->filter(fn (mixed $status): bool => in_array($status, Ticket::statuses(), true))
            ->values()
            ->all();

        if ($statusFilters === []) {
            $statusFilters = Ticket::statuses();
        }

        $baseDate = Carbon::parse($selectedDate);

        [$startDate, $endDate] = match ($period) {
            'week' => [$baseDate->copy()->startOfWeek(), $baseDate->copy()->endOfWeek()],
            'month' => [$baseDate->copy()->startOfMonth(), $baseDate->copy()->endOfMonth()],
            'year' => [$baseDate->copy()->startOfYear(), $baseDate->copy()->endOfYear()],
            default => [$baseDate->copy()->startOfDay(), $baseDate->copy()->endOfDay()],
        };

        $tickets = Ticket::query()
            ->where('company_id', $request->user()->company_id)
            ->with(['client', 'images'])
            ->whereBetween('service_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->whereIn('status', $statusFilters)
            ->when($document !== '', function ($query) use ($document) {
                $query->whereHas('client', function ($clientQuery) use ($document) {
                    $clientQuery->where('document_number', 'like', "%{$document}%");
                });
            })
            ->latest()
            ->get()
            ->map(function (Ticket $ticket) {
                $token = $this->ensurePublicToken($ticket);
                $publicUrl = route('tickets.public.show', $token);
                $whatsappMessage = $this->buildWhatsappMessage($ticket, $publicUrl);

                return [
                    ...$ticket->toArray(),
                    'public_token' => $token,
                    'whatsapp_url' => $this->buildWhatsappUrl($ticket->client->phone, $whatsappMessage),
                ];
            });

        return Inertia::render('Tickets/Index', [
            'tickets' => $tickets,
            'statuses' => Ticket::statuses(),
            'filters' => [
                'document' => $document,
                'date' => $selectedDate,
                'period' => $period,
                'statuses' => $statusFilters,
            ],
            'stats' => [
                'total' => $tickets->count(),
                'pending' => $tickets->where('status', Ticket::STATUS_PENDING)->count(),
                'in_progress' => $tickets->where('status', Ticket::STATUS_IN_PROGRESS)->count(),
                'resolved' => $tickets->where('status', Ticket::STATUS_RESOLVED)->count(),
                'closed' => $tickets->where('status', Ticket::STATUS_CLOSED)->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Tickets/Create', [
            'statuses' => Ticket::statuses(),
        ]);
    }

    public function store(StoreTicketRequest $request)
    {
        $validated = $request->validated();

        $ticket = Ticket::create([
            'company_id' => $request->user()->company_id,
            'client_id' => $validated['client_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'observation' => $validated['observation'] ?? null,
            'estimated_price' => $validated['estimated_price'] ?? null,
            'status' => $validated['status'],
            'service_date' => $validated['service_date'],
            'closed_at' => $validated['status'] === Ticket::STATUS_CLOSED ? now() : null,
        ])->load('client');

        foreach ($request->file('images', []) as $imageFile) {
            $uploaded = $this->uploadToImgbb($imageFile);

            $ticket->images()->create([
                'url' => $uploaded['url'],
                'delete_url' => $uploaded['delete_url'] ?? null,
            ]);
        }

        $publicUrl = route('tickets.public.show', $ticket->public_token);
        $whatsappMessage = $this->buildWhatsappMessage($ticket, $publicUrl);

        $this->sendCompanyAwareMail($ticket->client->email, new TicketCreatedMail($ticket));

        return to_route('tickets.create')->with('ticketCreated', [
            'message' => 'Servicio creado correctamente.',
            'whatsapp_message' => $whatsappMessage,
            'whatsapp_url' => $this->buildWhatsappUrl($ticket->client->phone, $whatsappMessage),
        ]);
    }

    public function updateStatus(UpdateTicketStatusRequest $request, Ticket $ticket)
    {
        $newStatus = $request->validated('status');

        abort_unless($ticket->company_id === $request->user()->company_id, 403);

        $ticket->update([
            'status' => $newStatus,
            'closed_at' => $newStatus === Ticket::STATUS_CLOSED ? now() : null,
        ]);

        return to_route('tickets.index');
    }

    public function publicShow(string $token)
    {
        $ticket = Ticket::query()
            ->with(['client', 'images'])
            ->where('public_token', $token)
            ->firstOrFail();

        return view('tickets.public', [
            'ticket' => $ticket,
        ]);
    }


    private function ensurePublicToken(Ticket $ticket): string
    {
        if (filled($ticket->public_token)) {
            return $ticket->public_token;
        }

        $ticket->forceFill([
            'public_token' => (string) Str::uuid(),
        ])->save();

        return $ticket->public_token;
    }

    private function buildWhatsappMessage(Ticket $ticket, string $publicUrl): string
    {
        return implode("\n", [
            'Hola '.$ticket->client->name.', tu servicio fue creado correctamente.',
            '',
            '• Servicio: '.$ticket->title,
            '• Dirección: '.$ticket->client->address,
            '• Fecha del servicio: '.$ticket->service_date?->format('d/m/Y'),
            '',
            '• Verificación y seguimiento:',
            $publicUrl,
            '',
            'Gracias por confiar en nosotros.',
        ]);
    }

    private function buildWhatsappUrl(string $phone, string $message): string
    {
        $normalizedPhone = Str::of($phone)->replaceMatches('/\D+/', '')->value();

        return 'https://api.whatsapp.com/send?phone='.$normalizedPhone.'&text='.rawurlencode($message);
    }

    private function uploadToImgbb(UploadedFile $imageFile): array
    {
        $apiKey = config('services.imgbb.key');

        if (! $apiKey) {
            throw ValidationException::withMessages([
                'images' => 'Debes configurar IMGBB_API_KEY para subir imágenes.',
            ]);
        }

        $response = Http::asMultipart()
            ->post('https://api.imgbb.com/1/upload', [
                ['name' => 'key', 'contents' => $apiKey],
                ['name' => 'image', 'contents' => base64_encode($imageFile->get())],
                ['name' => 'name', 'contents' => pathinfo($imageFile->getClientOriginalName(), PATHINFO_FILENAME)],
            ]);

        if (! $response->successful() || ! data_get($response->json(), 'success')) {
            throw ValidationException::withMessages([
                'images' => 'No fue posible subir una imagen a ImgBB.',
            ]);
        }

        return [
            'url' => data_get($response->json(), 'data.url'),
            'delete_url' => data_get($response->json(), 'data.delete_url'),
        ];
    }
}
