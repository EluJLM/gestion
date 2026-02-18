import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Dashboard({ ticketSenderEmail }) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        ticket_sender_email: ticketSenderEmail ?? '',
    });

    const submit = (e) => {
        e.preventDefault();

        put(route('dashboard.ticket-sender-email.update'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-medium">
                                Configuración de correo para tickets
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Este correo se usará como remitente para el envío de tickets.
                            </p>

                            <form onSubmit={submit} className="mt-6 space-y-4">
                                <div>
                                    <InputLabel
                                        htmlFor="ticket_sender_email"
                                        value="Correo remitente"
                                    />
                                    <TextInput
                                        id="ticket_sender_email"
                                        type="email"
                                        value={data.ticket_sender_email}
                                        className="mt-1 block w-full"
                                        onChange={(e) =>
                                            setData(
                                                'ticket_sender_email',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.ticket_sender_email}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing}>
                                        Guardar configuración
                                    </PrimaryButton>
                                    {recentlySuccessful && (
                                        <p className="text-sm text-green-600">
                                            Configuración guardada.
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
