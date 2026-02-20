import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const max = (values) => {
    if (values.length === 0) {
        return 1;
    }

    return Math.max(...values, 1);
};

export default function Dashboard({ pendingTickets, monthlyMetrics, closedServicesChart }) {
    const maxClosed = max(closedServicesChart.map((point) => point.closed));

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-10">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Servicios del mes</p>
                            <p className="mt-2 text-3xl font-bold text-indigo-900">{monthlyMetrics.total}</p>
                        </div>
                        <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Pendientes</p>
                            <p className="mt-2 text-3xl font-bold text-red-700">{monthlyMetrics.pending}</p>
                        </div>
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Cerrados</p>
                            <p className="mt-2 text-3xl font-bold text-emerald-800">{monthlyMetrics.closed}</p>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <h3 className="text-lg font-semibold text-gray-900">Servicios cerrados por día (mes actual)</h3>
                        <div className="mt-4 overflow-x-auto">
                            <div className="flex min-w-[780px] items-end gap-2 rounded-md border border-gray-100 bg-gray-50 p-4">
                                {closedServicesChart.map((point) => (
                                    <div key={point.day} className="flex w-6 flex-col items-center gap-2">
                                        <div
                                            className="w-full rounded-t bg-emerald-500"
                                            style={{
                                                height: `${Math.max((point.closed / maxClosed) * 180, point.closed > 0 ? 10 : 2)}px`,
                                            }}
                                            title={`Día ${point.day}: ${point.closed} cerrados`}
                                        />
                                        <span className="text-[10px] text-gray-500">{point.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Eje X: días del mes · Eje Y: cantidad de servicios cerrados.</p>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Servicios pendientes</h3>
                            <Link
                                href={route('tickets.index')}
                                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-red-700"
                            >
                                Ver servicios
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {pendingTickets.length === 0 && (
                                <p className="rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                                    No hay servicios pendientes para este mes.
                                </p>
                            )}

                            {pendingTickets.map((ticket) => (
                                <div key={ticket.id} className="rounded-md border border-red-100 bg-red-50/40 p-3">
                                    <p className="font-medium text-gray-900">{ticket.title}</p>
                                    <p className="text-sm text-gray-600">Cliente: {ticket.client?.name} · CC: {ticket.client?.document_number}</p>
                                    <p className="text-xs font-semibold uppercase text-red-700">
                                        Programado: {new Date(ticket.service_date).toLocaleDateString('es-CO')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
