import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const statusLabels = {
    pending: 'Pendiente',
    in_progress: 'En progreso',
    resolved: 'Resuelto',
    closed: 'Cerrado',
};

export default function TicketsCreate({ statuses, documentTypes }) {
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
                    Crear ticket
                </h2>
            }
        >
            <Head title="Crear ticket" />

            <div className="py-10">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-end">
                        <Link
                            href={route('tickets.index')}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 transition hover:bg-gray-50"
                        >
                            Ver tickets registrados
                        </Link>
                    </div>

                    <form
                        onSubmit={submit}
                        className="space-y-4 rounded-lg bg-white p-6 shadow"
                    >
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
