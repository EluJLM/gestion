import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Subscriptions({ companies }) {
    const update = (companyId, action) => {
        router.patch(route('super-admin.subscriptions.update', companyId), { action });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Suscripciones de inquilinos</h2>}>
            <Head title="Suscripciones" />
            <div className="mx-auto max-w-7xl p-6">
                <div className="space-y-4">
                    {companies.map((company) => (
                        <div key={company.id} className="rounded-lg border bg-white p-4 shadow-sm">
                            <p className="font-semibold">{company.name}</p>
                            <p className="text-sm text-gray-600">Estado: {company.subscription_status} · Usuarios: {company.users_count}</p>
                            <p className="text-xs text-gray-500">Prueba hasta: {company.trial_ends_at ? new Date(company.trial_ends_at).toLocaleDateString('es-CO') : '—'}</p>
                            <div className="mt-3 flex gap-2">
                                <button className="rounded bg-emerald-600 px-3 py-1 text-xs text-white" onClick={() => update(company.id, 'activate')}>Activar 1 mes</button>
                                <button className="rounded bg-amber-500 px-3 py-1 text-xs text-white" onClick={() => update(company.id, 'extend_trial')}>Extender prueba</button>
                                <button className="rounded bg-red-600 px-3 py-1 text-xs text-white" onClick={() => update(company.id, 'cancel')}>Cancelar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
