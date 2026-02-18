<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\ConfiguracionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TicketController;
use Illuminate\Foundation\Application;
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/tickets/public/{token}', [TicketController::class, 'publicShow'])->name('tickets.public.show');

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
