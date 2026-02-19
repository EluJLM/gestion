import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

const emptyClient = {
    name: '',
    email: '',
    document_type: 'CC',
    document_number: '',
    phone: '',
    address: '',
};

export default function ClientsIndex({ clients, documentTypes }) {
    const [editingClient, setEditingClient] = useState(null);

    const createForm = useForm(emptyClient);
    const editForm = useForm(emptyClient);

    const createClient = (e) => {
        e.preventDefault();
        createForm.post(route('clients.store'), {
            onSuccess: () => createForm.reset(),
        });
    };

    const startEditing = (client) => {
        setEditingClient(client);
        editForm.setData({
            name: client.name ?? '',
            email: client.email ?? '',
            document_type: client.document_type ?? 'CC',
            document_number: client.document_number ?? '',
            phone: client.phone ?? '',
            address: client.address ?? '',
        });
    };

    const updateClient = (e) => {
        e.preventDefault();

        if (!editingClient) {
            return;
        }

        editForm.patch(route('clients.update', editingClient.id), {
            onSuccess: () => setEditingClient(null),
        });
    };

    const renderForm = ({ title, form, submit, buttonText, isEditing = false }) => (
        <form onSubmit={submit} className="space-y-4 rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <InputLabel htmlFor={`${buttonText}_name`} value="Nombre" />
                    <TextInput
                        id={`${buttonText}_name`}
                        className="mt-1 block w-full"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                    />
                    <InputError className="mt-1" message={form.errors.name} />
                </div>
                <div>
                    <InputLabel htmlFor={`${buttonText}_email`} value="Correo" />
                    <TextInput
                        id={`${buttonText}_email`}
                        type="email"
                        className="mt-1 block w-full"
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                    />
                    <InputError className="mt-1" message={form.errors.email} />
                </div>
                <div>
                    <InputLabel htmlFor={`${buttonText}_document_type`} value="Tipo de documento" />
                    <select
                        id={`${buttonText}_document_type`}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        value={form.data.document_type}
                        onChange={(e) => form.setData('document_type', e.target.value)}
                    >
                        {documentTypes.map((documentType) => (
                            <option key={documentType} value={documentType}>
                                {documentType}
                            </option>
                        ))}
                    </select>
                    <InputError className="mt-1" message={form.errors.document_type} />
                </div>
                <div>
                    <InputLabel htmlFor={`${buttonText}_document_number`} value="Número de documento" />
                    <TextInput
                        id={`${buttonText}_document_number`}
                        className="mt-1 block w-full"
                        value={form.data.document_number}
                        onChange={(e) => form.setData('document_number', e.target.value)}
                    />
                    <InputError className="mt-1" message={form.errors.document_number} />
                </div>
                <div>
                    <InputLabel htmlFor={`${buttonText}_phone`} value="Teléfono" />
                    <TextInput
                        id={`${buttonText}_phone`}
                        className="mt-1 block w-full"
                        value={form.data.phone}
                        onChange={(e) => form.setData('phone', e.target.value)}
                    />
                    <InputError className="mt-1" message={form.errors.phone} />
                </div>
                <div>
                    <InputLabel htmlFor={`${buttonText}_address`} value="Dirección" />
                    <TextInput
                        id={`${buttonText}_address`}
                        className="mt-1 block w-full"
                        value={form.data.address}
                        onChange={(e) => form.setData('address', e.target.value)}
                    />
                    <InputError className="mt-1" message={form.errors.address} />
                </div>
            </div>

            <div className="flex gap-2">
                <PrimaryButton disabled={form.processing}>{buttonText}</PrimaryButton>
                {isEditing && (
                    <button
                        type="button"
                        className="rounded-md border border-gray-300 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700"
                        onClick={() => setEditingClient(null)}
                    >
                        Cancelar edición
                    </button>
                )}
            </div>
        </form>
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Clientes
                </h2>
            }
        >
            <Head title="Clientes" />

            <div className="py-10">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-end">
                        <Link
                            href={route('tickets.create')}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 transition hover:bg-gray-50"
                        >
                            Ir a crear servicio
                        </Link>
                    </div>

                    {renderForm({
                        title: 'Crear cliente',
                        form: createForm,
                        submit: createClient,
                        buttonText: 'Guardar cliente',
                    })}

                    {editingClient &&
                        renderForm({
                            title: `Editar cliente: ${editingClient.name}`,
                            form: editForm,
                            submit: updateClient,
                            buttonText: 'Actualizar cliente',
                            isEditing: true,
                        })}

                    <div className="rounded-lg bg-white p-6 shadow">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">Clientes registrados</h3>
                        <div className="space-y-3">
                            {clients.map((client) => (
                                <div
                                    key={client.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 p-4"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{client.name}</p>
                                        <p className="text-sm text-gray-600">{client.email}</p>
                                        <p className="text-xs text-gray-500">
                                            {client.document_type} {client.document_number} · {client.phone}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="rounded-md border border-indigo-200 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-indigo-700"
                                        onClick={() => startEditing(client)}
                                    >
                                        Editar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
