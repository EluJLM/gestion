<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\ConfiguracionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TicketController;
use App\Models\Ticket;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function (Request $request) {
    $monthStart = now()->startOfMonth();
    $monthEnd = now()->endOfMonth();

    $pendingTickets = Ticket::query()
        ->with('client:id,name,document_number')
        ->where('status', Ticket::STATUS_PENDING)
        ->whereBetween('service_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
        ->orderBy('service_date')
        ->limit(8)
        ->get(['id', 'client_id', 'title', 'service_date', 'status']);

    $closedByDay = Ticket::query()
        ->where('status', Ticket::STATUS_CLOSED)
        ->whereBetween('service_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
        ->selectRaw('DAY(service_date) as day, COUNT(*) as total')
        ->groupBy('day')
        ->orderBy('day')
        ->get()
        ->keyBy('day');

    $chart = collect(range(1, $monthEnd->day))
        ->map(fn (int $day) => [
            'day' => $day,
            'closed' => (int) ($closedByDay->get($day)->total ?? 0),
        ]);

    return Inertia::render('Dashboard', [
        'pendingTickets' => $pendingTickets,
        'monthlyMetrics' => [
            'total' => Ticket::query()
                ->whereBetween('service_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                ->count(),
            'pending' => Ticket::query()
                ->where('status', Ticket::STATUS_PENDING)
                ->whereBetween('service_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                ->count(),
            'closed' => Ticket::query()
                ->where('status', Ticket::STATUS_CLOSED)
                ->whereBetween('service_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                ->count(),
        ],
        'closedServicesChart' => $chart,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/servicio/{token}', [TicketController::class, 'publicShow'])->name('tickets.public.show');

Route::middleware('auth')->group(function () {

    Route::get('/tickets', [TicketController::class, 'index'])->name('tickets.index');
    Route::get('/tickets/create', [TicketController::class, 'create'])->name('tickets.create');
    Route::post('/tickets', [TicketController::class, 'store'])->name('tickets.store');
    Route::patch('/tickets/{ticket}/status', [TicketController::class, 'updateStatus'])->name('tickets.status.update');

    Route::get('/clientes', [ClientController::class, 'index'])->name('clients.index');
    Route::post('/clientes', [ClientController::class, 'store'])->name('clients.store');
    Route::patch('/clientes/{client}', [ClientController::class, 'update'])->name('clients.update');
    Route::get('/clientes/buscar', [ClientController::class, 'search'])->name('clients.search');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/configuracion', [ConfiguracionController::class, 'edit'])->name('configuracion.edit');
    Route::post('/configuracion/empresa', [ConfiguracionController::class, 'upsertCompany'])->name('configuracion.company.upsert');
    Route::post('/configuracion/correo', [ConfiguracionController::class, 'upsertMail'])->name('configuracion.mail.upsert');
    Route::post('/configuracion/correo/test', [ConfiguracionController::class, 'testMail'])->name('configuracion.mail.test');
});

require __DIR__.'/auth.php';
