<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detalle público del servicio</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 24px; }
        .card { max-width: 820px; margin: 0 auto; background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,.08); }
        h1 { margin-top: 0; }
        .label { color: #6b7280; font-size: 13px; }
        .value { margin-bottom: 14px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Servicio #{{ $ticket->id }}</h1>

        <div class="label">Título</div>
        <div class="value">{{ $ticket->title }}</div>

        <div class="label">Descripción</div>
        <div class="value">{{ $ticket->description }}</div>

        <div class="label">Tipo</div>
        <div class="value">{{ $ticket->type }}</div>

        <div class="label">Estado</div>
        <div class="value">{{ $ticket->status }}</div>

        <div class="label">Observación</div>
        <div class="value">{{ $ticket->observation ?? 'Sin observación' }}</div>

        <div class="label">Precio estimado</div>
        <div class="value">{{ $ticket->estimated_price ?? 'No definido' }}</div>


        <div class="label">Fecha de creación</div>
        <div class="value">{{ optional($ticket->created_at)->format('Y-m-d H:i') }}</div>

        <div class="label">Fecha de cierre</div>
        <div class="value">{{ optional($ticket->closed_at)->format('Y-m-d H:i') ?? 'No cerrado' }}</div>

        <hr>

        <h3>Datos del cliente</h3>
        <div class="label">Nombre</div>
        <div class="value">{{ $ticket->client->name }}</div>

        <div class="label">Email</div>
        <div class="value">{{ $ticket->client->email }}</div>

        <div class="label">Documento</div>
        <div class="value">{{ $ticket->client->document_type }} - {{ $ticket->client->document_number }}</div>

        <div class="label">Teléfono</div>
        <div class="value">{{ $ticket->client->phone }}</div>

        <div class="label">Dirección</div>
        <div class="value">{{ $ticket->client->address }}</div>

        <div class="label">Imágenes</div>
        <div class="value">
            @forelse ($ticket->images as $image)
                <a href="{{ $image->url }}" target="_blank" rel="noopener noreferrer">Ver imagen {{ $loop->iteration }}</a><br>
            @empty
                Sin imágenes
            @endforelse
        </div>
    </div>
</body>
</html>
