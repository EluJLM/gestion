import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

export default function EmployeesIndex({ employees, productPermissions }) {
    const form = useForm({ name: '', email: '', password: '' });
    const permissionForm = useForm({
        employee_id: '',
        starts_at: '',
        ends_at: '',
        allow_without_invoice: false,
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('employees.store'), { onSuccess: () => form.reset('name', 'email', 'password') });
    };

    const submitPermission = (e) => {
        e.preventDefault();
        permissionForm.post(route('employees.product-permissions.store'), {
            onSuccess: () => permissionForm.reset('employee_id', 'starts_at', 'ends_at', 'allow_without_invoice', 'notes'),
        });
    };

    const toggleEmployeeStatus = (employee) => {
        router.patch(route('employees.status.update', employee.id), {
            is_active: !employee.is_active,
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Empleados</h2>}>
            <Head title="Empleados" />
            <div className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-3">
                <form onSubmit={submit} className="space-y-3 rounded-lg border bg-white p-4">
                    <h3 className="text-sm font-semibold">Crear empleado</h3>
                    <input className="w-full rounded border" placeholder="Nombre" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                    <input className="w-full rounded border" placeholder="Correo" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                    <input type="password" className="w-full rounded border" placeholder="Contraseña" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                    <button className="rounded bg-indigo-600 px-3 py-2 text-sm text-white">Crear empleado</button>
                </form>

                <form onSubmit={submitPermission} className="space-y-3 rounded-lg border bg-white p-4">
                    <h3 className="text-sm font-semibold">Permitir creación de productos</h3>
                    <select className="w-full rounded border" value={permissionForm.data.employee_id} onChange={(e) => permissionForm.setData('employee_id', e.target.value)}>
                        <option value="">Selecciona un empleado</option>
                        {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>{employee.name}</option>
                        ))}
                    </select>
                    <label className="block text-xs text-gray-600">Desde</label>
                    <input type="datetime-local" className="w-full rounded border" value={permissionForm.data.starts_at} onChange={(e) => permissionForm.setData('starts_at', e.target.value)} />
                    <label className="block text-xs text-gray-600">Hasta (vacío = siempre)</label>
                    <input type="datetime-local" className="w-full rounded border" value={permissionForm.data.ends_at} onChange={(e) => permissionForm.setData('ends_at', e.target.value)} />
                    <label className="flex items-center gap-2 text-xs">
                        <input type="checkbox" checked={permissionForm.data.allow_without_invoice} onChange={(e) => permissionForm.setData('allow_without_invoice', e.target.checked)} />
                        Puede crear productos sin factura
                    </label>
                    <textarea className="w-full rounded border" placeholder="Notas" value={permissionForm.data.notes} onChange={(e) => permissionForm.setData('notes', e.target.value)} />
                    <button className="rounded bg-emerald-600 px-3 py-2 text-sm text-white">Guardar permiso</button>
                </form>

                <div className="space-y-2 rounded-lg border bg-white p-4">
                    <h3 className="text-sm font-semibold">Empleados</h3>
                    {employees.map((employee) => (
                        <div key={employee.id} className="flex items-center justify-between rounded border p-2">
                            <div>
                                <p className="text-sm font-semibold">{employee.name}</p>
                                <p className="text-xs text-gray-500">{employee.email}</p>
                                <p className={`text-xs ${employee.is_active ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {employee.is_active ? 'Activo' : 'Inactivo'}
                                </p>
                            </div>
                            <button type="button" onClick={() => toggleEmployeeStatus(employee)} className="text-xs text-indigo-600">
                                {employee.is_active ? 'Desactivar' : 'Activar'}
                            </button>
                        </div>
                    ))}
                    <h3 className="pt-3 text-sm font-semibold">Permisos registrados</h3>
                    {productPermissions.map((permission) => (
                        <div key={permission.id} className="rounded border p-2 text-xs">
                            <p className="font-semibold">{permission.employee?.name}</p>
                            <p>Desde: {new Date(permission.starts_at).toLocaleString()}</p>
                            <p>Hasta: {permission.ends_at ? new Date(permission.ends_at).toLocaleString() : 'Sin fecha final (siempre)'}</p>
                            <p>{permission.allow_without_invoice ? 'Puede crear sin factura' : 'Factura obligatoria'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
