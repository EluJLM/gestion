import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function EmployeesIndex({ employees }) {
    const form = useForm({ name: '', email: '', password: '' });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('employees.store'), { onSuccess: () => form.reset('name', 'email', 'password') });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Empleados</h2>}>
            <Head title="Empleados" />
            <div className="mx-auto grid max-w-7xl gap-6 p-6 md:grid-cols-2">
                <form onSubmit={submit} className="space-y-3 rounded-lg border bg-white p-4">
                    <input className="w-full rounded border" placeholder="Nombre" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                    <input className="w-full rounded border" placeholder="Correo" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                    <input type="password" className="w-full rounded border" placeholder="Contraseña" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                    <button className="rounded bg-indigo-600 px-3 py-2 text-sm text-white">Crear empleado</button>
                </form>

                <div className="space-y-2 rounded-lg border bg-white p-4">
                    {employees.map((employee) => (
                        <div key={employee.id} className="flex items-center justify-between rounded border p-2">
                            <div>
                                <p className="text-sm font-semibold">{employee.name}</p>
                                <p className="text-xs text-gray-500">{employee.email}</p>
                            </div>
                            <form method="post" onSubmit={(e) => { e.preventDefault(); form.delete(route('employees.destroy', employee.id)); }}>
                                <button className="text-xs text-red-600">Eliminar</button>
                            </form>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
