import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

const statusLabels = {
    pending: 'Pendiente',
    in_progress: 'En progreso',
    resolved: 'Resuelto',
    closed: 'Cerrado',
};

export default function TicketsIndex({ tickets, statuses, documentTypes }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        type: '',
        observation: '',
        estimated_price: '',
        status: 'pending',
        client: {
            name: '',
            email: '',
            document_type: 'CC',
            document_number: '',
            phone: '',
            address: '',
        },
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('tickets.store'), {
            onSuccess: () => reset(),
        });
    };

    const updateClient = (field, value) => {
        setData('client', {
            ...data.client,
            [field]: value,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Gestión de tickets
                </h2>
            }
        >
            <Head title="Tickets" />

            <div className="py-10">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <form
                        onSubmit={submit}
                        className="space-y-4 rounded-lg bg-white p-6 shadow"
                    >
                        <h3 className="text-lg font-semibold text-gray-900">
                            Crear ticket
                        </h3>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="title" value="Título" />
                                <TextInput
                                    id="title"
                                    className="mt-1 block w-full"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-1"
                                    message={errors.title}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="type" value="Tipo" />
                                <TextInput
                                    id="type"
                                    className="mt-1 block w-full"
                                    value={data.type}
                                    onChange={(e) =>
                                        setData('type', e.target.value)
                                    }
                                />
                                <InputError className="mt-1" message={errors.type} />
                            </div>
                            <div className="md:col-span-2">
                                <InputLabel
                                    htmlFor="description"
                                    value="Descripción"
                                />
                                <textarea
                                    id="description"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-1"
                                    message={errors.description}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <InputLabel
                                    htmlFor="observation"
                                    value="Observación"
                                />
                                <textarea
                                    id="observation"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.observation}
                                    onChange={(e) =>
                                        setData('observation', e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <InputLabel
                                    htmlFor="estimated_price"
                                    value="Precio estimado"
                                />
                                <TextInput
                                    id="estimated_price"
                                    type="number"
                                    step="0.01"
                                    className="mt-1 block w-full"
                                    value={data.estimated_price}
                                    onChange={(e) =>
                                        setData('estimated_price', e.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-1"
                                    message={errors.estimated_price}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="status" value="Estado" />
                                <select
                                    id="status"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.status}
                                    onChange={(e) =>
                                        setData('status', e.target.value)
                                    }
                                >
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {statusLabels[status] ?? status}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-1" message={errors.status} />
                            </div>
                        </div>

                        <h4 className="pt-2 text-md font-semibold text-gray-900">
                            Datos del cliente
                        </h4>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="client_name" value="Nombre" />
                                <TextInput
                                    id="client_name"
                                    className="mt-1 block w-full"
                                    value={data.client.name}
                                    onChange={(e) =>
                                        updateClient('name', e.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-1"
                                    message={errors['client.name']}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="client_email" value="Email" />
                                <TextInput
                                    id="client_email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={data.client.email}
                                    onChange={(e) =>
                                        updateClient('email', e.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-1"
                                    message={errors['client.email']}
                                />
                            </div>
                            <div>
                                <InputLabel
                                    htmlFor="client_document_type"
                                    value="Tipo de documento"
                                />
                                <select
                                    id="client_document_type"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.client.document_type}
                                    onChange={(e) =>
                                        updateClient('document_type', e.target.value)
                                    }
                                >
                                    {documentTypes.map((documentType) => (
                                        <option key={documentType} value={documentType}>
                                            {documentType}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    className="mt-1"
                                    message={errors['client.document_type']}
                                />
                            </div>
                            <div>
                                <InputLabel
                                    htmlFor="client_document"
                                    value="Número de documento"
                                />
                                <TextInput
                                    id="client_document"
                                    className="mt-1 block w-full"
                                    value={data.client.document_number}
                                    onChange={(e) =>
                                        updateClient(
                                            'document_number',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    className="mt-1"
                                    message={errors['client.document_number']}
                                />
                            </div>
                            <div>
                                <InputLabel
                                    htmlFor="client_phone"
                                    value="Teléfono"
                                />
                                <TextInput
                                    id="client_phone"
                                    className="mt-1 block w-full"
                                    value={data.client.phone}
                                    onChange={(e) =>
                                        updateClient('phone', e.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-1"
                                    message={errors['client.phone']}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <InputLabel
                                    htmlFor="client_address"
                                    value="Dirección"
                                />
                                <TextInput
                                    id="client_address"
                                    className="mt-1 block w-full"
                                    value={data.client.address}
                                    onChange={(e) =>
                                        updateClient('address', e.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-1"
                                    message={errors['client.address']}
                                />
                            </div>
                        </div>

                        <PrimaryButton disabled={processing}>
                            Guardar ticket
                        </PrimaryButton>
                    </form>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                            Tickets registrados
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase text-gray-500">
                                        <th className="px-2 py-3">Título</th>
                                        <th className="px-2 py-3">Cliente</th>
                                        <th className="px-2 py-3">Tipo</th>
                                        <th className="px-2 py-3">Precio</th>
                                        <th className="px-2 py-3">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id}>
                                            <td className="px-2 py-3">
                                                <p className="font-medium text-gray-900">
                                                    {ticket.title}
                                                </p>
                                                <p className="text-gray-500">
                                                    {ticket.description}
                                                </p>
                                            </td>
                                            <td className="px-2 py-3 text-gray-700">
                                                <p>{ticket.client.name}</p>
                                                <p className="text-gray-500">
                                                    {ticket.client.email}
                                                </p>
                                            </td>
                                            <td className="px-2 py-3 text-gray-700">
                                                {ticket.type}
                                            </td>
                                            <td className="px-2 py-3 text-gray-700">
                                                {ticket.estimated_price ?? 'N/A'}
                                            </td>
                                            <td className="px-2 py-3">
                                                <select
                                                    className="rounded-md border-gray-300 text-sm"
                                                    value={ticket.status}
                                                    onChange={(e) =>
                                                        router.patch(
                                                            route(
                                                                'tickets.status.update',
                                                                ticket.id,
                                                            ),
                                                            {
                                                                status:
                                                                    e.target
                                                                        .value,
                                                            },
                                                            {
                                                                preserveScroll:
                                                                    true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    {statuses.map((status) => (
                                                        <option
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {statusLabels[
                                                                status
                                                            ] ?? status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
