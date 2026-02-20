<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Mail\TicketCreatedMail;
use App\Models\Ticket;
use App\Support\UsesCompanyMailer;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    use UsesCompanyMailer;

    public function index(): Response
    {
        return Inertia::render('Tickets/Index', [
            'tickets' => Ticket::query()
                ->with(['client', 'images'])
                ->latest()
                ->get(),
            'statuses' => Ticket::statuses(),
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
            'client_id' => $validated['client_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'observation' => $validated['observation'] ?? null,
            'estimated_price' => $validated['estimated_price'] ?? null,
            'status' => $validated['status'],
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

    private function buildWhatsappMessage(Ticket $ticket, string $publicUrl): string
    {
        return implode("\n", [
            'Hola '.$ticket->client->name.', tu servicio fue creado correctamente.',
            'Servicio: '.$ticket->title,
            'Dirección: '.$ticket->client->address,
            'Verificación y seguimiento: '.$publicUrl,
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
