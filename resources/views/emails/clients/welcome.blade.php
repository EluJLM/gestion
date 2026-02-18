<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Bienvenida</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
    <h2 style="margin-bottom: 8px;">¡Hola, {{ $client->name }}!</h2>

    <p>Te damos la bienvenida. Tu información como cliente fue registrada correctamente en nuestro sistema.</p>

    <p>
        <strong>Documento:</strong>
        {{ $client->document_type }} {{ $client->document_number }}
    </p>

    <p>Desde ahora podremos gestionar tus tickets de soporte de manera más ágil.</p>

    <p style="margin-top: 24px;">Gracias por confiar en nosotros.</p>
</body>
</html>
