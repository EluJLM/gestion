import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const statusLabels = {
    pending: 'Pendiente',
    in_progress: 'En progreso',
    resolved: 'Resuelto',
    closed: 'Cerrado',
};

const formatDate = (value) => {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString('es-CO');
};

export default function TicketsIndex({ tickets, statuses, filters, stats }) {
    const [documentFilter, setDocumentFilter] = useState(filters?.document ?? '');
    const [dateFilter, setDateFilter] = useState(filters?.date ?? '');

    const searchTickets = (e) => {
        e.preventDefault();

        router.get(
            route('tickets.index'),
            {
                document: documentFilter,
                date: dateFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const resetFilters = () => {
        const today = new Date().toISOString().slice(0, 10);
        setDocumentFilter('');
        setDateFilter(today);

        router.get(
            route('tickets.index'),
            {
                date: today,
                document: '',
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Servicios registrados
                </h2>
            }
        >
            <Head title="Servicios registrados" />

            <div className="py-10">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-end">
                        <Link
                            href={route('tickets.create')}
                            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-indigo-500"
                        >
                            Crear servicio
                        </Link>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Servicios hoy</p>
                            <p className="mt-2 text-3xl font-bold text-indigo-900">{stats.total}</p>
                        </div>
                        <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Pendientes</p>
                            <p className="mt-2 text-3xl font-bold text-amber-900">{stats.pending}</p>
                        </div>
                        <div className="rounded-lg border border-sky-100 bg-sky-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">En proceso</p>
                            <p className="mt-2 text-3xl font-bold text-sky-900">{stats.in_progress}</p>
                        </div>
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Cerrados</p>
                            <p className="mt-2 text-3xl font-bold text-emerald-900">{stats.closed}</p>
                        </div>
                    </div>

                    <form onSubmit={searchTickets} className="grid gap-3 rounded-lg bg-white p-4 shadow md:grid-cols-[1fr_220px_auto_auto] md:items-end">
                        <div>
                            <label htmlFor="document_filter" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Buscar por cédula del cliente
                            </label>
                            <input
                                id="document_filter"
                                type="text"
                                className="block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                value={documentFilter}
                                onChange={(e) => setDocumentFilter(e.target.value)}
                                placeholder="Ej: 10203040"
                            />
                        </div>
                        <div>
                            <label htmlFor="date_filter" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Fecha
                            </label>
                            <input
                                id="date_filter"
                                type="date"
                                className="block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-indigo-500"
                        >
                            Buscar
                        </button>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 transition hover:bg-gray-50"
                        >
                            Hoy
                        </button>
                    </form>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                            Listado de servicios
                        </h3>

                        <div className="space-y-3 md:hidden">
                            {tickets.length === 0 && (
                                <p className="rounded-md border border-dashed border-gray-300 px-3 py-4 text-center text-sm text-gray-500">
                                    No hay servicios registrados para los filtros seleccionados.
                                </p>
                            )}

                            {tickets.map((ticket) => (
                                <details key={ticket.id} className="rounded-md border border-gray-200">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3">
                                        <p className="font-medium text-gray-900">{ticket.title}</p>
                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                                            {statusLabels[ticket.status] ?? ticket.status}
                                        </span>
                                    </summary>
                                    <div className="space-y-2 border-t border-gray-100 px-3 py-3 text-sm text-gray-700">
                                        <p><strong>Descripción:</strong> {ticket.description}</p>
                                        <p><strong>Cliente:</strong> {ticket.client.name}</p>
                                        <p><strong>Cédula:</strong> {ticket.client.document_number}</p>
                                        <p><strong>Tipo:</strong> {ticket.type}</p>
                                        <p><strong>Precio:</strong> {ticket.estimated_price ?? 'N/A'}</p>
                                        <p><strong>Creación:</strong> {formatDate(ticket.created_at)}</p>
                                        <p><strong>Cierre:</strong> {formatDate(ticket.closed_at)}</p>
                                        <p><strong>Imágenes:</strong> {ticket.images?.length ?? 0}</p>
                                        <div>
                                            <label htmlFor={`mobile-status-${ticket.id}`} className="mb-1 block text-xs text-gray-500">Estado</label>
                                            <select
                                                id={`mobile-status-${ticket.id}`}
                                                className="w-full rounded-md border-gray-300 text-sm"
                                                value={ticket.status}
                                                onChange={(e) =>
                                                    router.patch(
                                                        route('tickets.status.update', ticket.id),
                                                        { status: e.target.value },
                                                        { preserveScroll: true },
                                                    )
                                                }
                                            >
                                                {statuses.map((status) => (
                                                    <option key={status} value={status}>
                                                        {statusLabels[status] ?? status}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <a
                                            href={ticket.whatsapp_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex w-full items-center justify-center rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-green-700"
                                        >
                                            Reenviar WhatsApp
                                        </a>
                                    </div>
                                </details>
                            ))}
                        </div>

                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase text-gray-500">
                                        <th className="px-2 py-3">Título</th>
                                        <th className="px-2 py-3">Cliente</th>
                                        <th className="px-2 py-3">Tipo</th>
                                        <th className="px-2 py-3">Creación</th>
                                        <th className="px-2 py-3">Cierre</th>
                                        <th className="px-2 py-3">Imágenes</th>
                                        <th className="px-2 py-3">Estado</th>
                                        <th className="px-2 py-3">WhatsApp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {tickets.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-2 py-4 text-center text-gray-500"
                                            >
                                                No hay servicios registrados para los filtros seleccionados.
                                            </td>
                                        </tr>
                                    )}
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
                                                <p className="text-gray-500">{ticket.client.document_number}</p>
                                            </td>
                                            <td className="px-2 py-3 text-gray-700">{ticket.type}</td>
                                            <td className="px-2 py-3 text-gray-700">{formatDate(ticket.created_at)}</td>
                                            <td className="px-2 py-3 text-gray-700">{formatDate(ticket.closed_at)}</td>
                                            <td className="px-2 py-3 text-gray-700">{ticket.images?.length ?? 0}</td>
                                            <td className="px-2 py-3">
                                                <select
                                                    className="rounded-md border-gray-300 text-sm"
                                                    value={ticket.status}
                                                    onChange={(e) =>
                                                        router.patch(
                                                            route('tickets.status.update', ticket.id),
                                                            { status: e.target.value },
                                                            { preserveScroll: true },
                                                        )
                                                    }
                                                >
                                                    {statuses.map((status) => (
                                                        <option key={status} value={status}>
                                                            {statusLabels[status] ?? status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-2 py-3">
                                                <a
                                                    href={ticket.whatsapp_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-green-700"
                                                >
                                                    Reenviar
                                                </a>
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
