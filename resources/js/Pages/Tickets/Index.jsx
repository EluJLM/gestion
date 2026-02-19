import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

const statusLabels = {
    pending: 'Pendiente',
    in_progress: 'En progreso',
    resolved: 'Resuelto',
    closed: 'Cerrado',
};

export default function TicketsIndex({ tickets, statuses }) {
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

                    <div className="rounded-lg bg-white p-6 shadow">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                            Listado de servicios
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
                                    {tickets.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-2 py-4 text-center text-gray-500"
                                            >
                                                No hay servicios registrados todavía.
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
