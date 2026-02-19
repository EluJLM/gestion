import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const statusLabels = {
    pending: 'Pendiente',
    in_progress: 'En progreso',
    resolved: 'Resuelto',
    closed: 'Cerrado',
};

export default function TicketsCreate({ statuses }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        type: '',
        observation: '',
        estimated_price: '',
        status: 'pending',
        client_id: '',
        images: [],
    });

    const [clientQuery, setClientQuery] = useState('');
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            const response = await fetch(
                `${route('clients.search')}?query=${encodeURIComponent(clientQuery)}`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            const payload = await response.json();
            setClients(payload.clients ?? []);
        }, 250);

        return () => clearTimeout(timer);
    }, [clientQuery]);

    const submit = (e) => {
        e.preventDefault();
        post(route('tickets.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setSelectedClient(null);
                setClientQuery('');
            },
        });
    };

    const selectClient = (client) => {
        setSelectedClient(client);
        setData('client_id', client.id);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Crear servicio
                </h2>
            }
        >
            <Head title="Crear servicio" />

            <div className="py-10">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-end gap-2">
                        <Link
                            href={route('clients.index')}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 transition hover:bg-gray-50"
                        >
                            Gestionar clientes
                        </Link>
                        <Link
                            href={route('tickets.index')}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 transition hover:bg-gray-50"
                        >
                            Ver servicios registrados
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
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                                <InputError className="mt-1" message={errors.title} />
                            </div>
                            <div>
                                <InputLabel htmlFor="type" value="Tipo" />
                                <TextInput
                                    id="type"
                                    className="mt-1 block w-full"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                />
                                <InputError className="mt-1" message={errors.type} />
                            </div>
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="description" value="Descripción" />
                                <textarea
                                    id="description"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                <InputError className="mt-1" message={errors.description} />
                            </div>
                            <div>
                                <InputLabel htmlFor="observation" value="Observación" />
                                <TextInput
                                    id="observation"
                                    className="mt-1 block w-full"
                                    value={data.observation}
                                    onChange={(e) => setData('observation', e.target.value)}
                                />
                                <InputError className="mt-1" message={errors.observation} />
                            </div>
                            <div>
                                <InputLabel htmlFor="estimated_price" value="Precio estimado" />
                                <TextInput
                                    id="estimated_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={data.estimated_price}
                                    onChange={(e) => setData('estimated_price', e.target.value)}
                                />
                                <InputError className="mt-1" message={errors.estimated_price} />
                            </div>
                            <div>
                                <InputLabel htmlFor="status" value="Estado" />
                                <select
                                    id="status"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                >
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {statusLabels[status] ?? status}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-1" message={errors.status} />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="images" value="Imágenes del servicio (ImgBB)" />
                                <input
                                    id="images"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                                    onChange={(e) => setData('images', Array.from(e.target.files ?? []))}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Puedes subir varias imágenes. Se enviarán a ImgBB al guardar.
                                </p>
                                <InputError className="mt-1" message={errors.images} />
                                <InputError className="mt-1" message={errors['images.0']} />
                            </div>
                        </div>

                        <div className="space-y-3 rounded-md border border-gray-200 p-4">
                            <h3 className="text-lg font-semibold text-gray-800">Cliente</h3>

                            <div>
                                <InputLabel htmlFor="client_search" value="Buscar cliente" />
                                <TextInput
                                    id="client_search"
                                    className="mt-1 block w-full"
                                    placeholder="Nombre, correo, documento o teléfono"
                                    value={clientQuery}
                                    onChange={(e) => setClientQuery(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                {clients.map((client) => (
                                    <button
                                        type="button"
                                        key={client.id}
                                        onClick={() => selectClient(client)}
                                        className="rounded-md border border-gray-200 p-3 text-left hover:bg-gray-50"
                                    >
                                        <p className="font-medium text-gray-900">{client.name}</p>
                                        <p className="text-sm text-gray-600">{client.email}</p>
                                        <p className="text-xs text-gray-500">
                                            {client.document_type} {client.document_number}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            {selectedClient && (
                                <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                                    Cliente seleccionado: <strong>{selectedClient.name}</strong> ({selectedClient.email})
                                </div>
                            )}

                            <InputError className="mt-1" message={errors.client_id} />
                        </div>

                        <PrimaryButton disabled={processing}>Guardar servicio</PrimaryButton>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
