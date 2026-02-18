<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ticket creado</title>
</head>
<body style="font-family: Arial, sans-serif; color: #111827;">
    <h2>Hola {{ $ticket->client->name }}, tu ticket fue creado.</h2>

    <p><strong>Título:</strong> {{ $ticket->title }}</p>
    <p><strong>Tipo:</strong> {{ $ticket->type }}</p>
    <p><strong>Estado:</strong> {{ $ticket->status }}</p>

    <p>
        Puedes ver el detalle público de tu ticket en este enlace:<br>
        <a href="{{ $publicUrl }}">{{ $publicUrl }}</a>
    </p>
</body>
</html>
