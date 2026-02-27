import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

export default function ProductsIndex({ products, filters, employees, activePermission }) {
    const productForm = useForm({
        name: '',
        description: '',
        price: '',
        stock: 0,
        barcode: '',
        auto_generate_barcode: true,
        invoice_image: null,
    });

    const permissionForm = useForm({
        employee_id: '',
        permission_kind: 'with_invoice',
        type: 'always',
        duration: 8,
    });

    const canCreateProduct = Boolean(activePermission?.can_create);
    const canSkipInvoice = Boolean(activePermission?.allow_without_invoice);

    const submitProduct = (e) => {
        e.preventDefault();
        productForm.post(route('products.store'), {
            forceFormData: true,
            onSuccess: () => productForm.reset('name', 'description', 'price', 'stock', 'barcode', 'invoice_image'),
        });
    };

    const submitPermission = (e) => {
        e.preventDefault();
        permissionForm.post(route('products.permissions.grant'), {
            onSuccess: () => permissionForm.reset('employee_id'),
        });
    };

    const doSearch = (e) => {
        e.preventDefault();
        const q = e.target.elements.q.value;
        router.get(route('products.index'), { q }, { preserveState: true });
    };

    const isWithoutInvoiceMode = permissionForm.data.permission_kind === 'without_invoice_hours';

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Productos</h2>}>
            <Head title="Productos" />
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                <div className="rounded-lg border bg-white p-4">
                    <p className="text-sm font-semibold text-gray-700">Estado de permisos de creación</p>
                    {!canCreateProduct ? (
                        <p className="mt-2 text-sm text-amber-700">No tienes permiso activo para crear productos. Solicítalo al jefe.</p>
                    ) : (
                        <div className="mt-2 space-y-1 text-sm text-emerald-700">
                            <p>
                                Permiso base activo{' '}
                                {activePermission?.is_always
                                    ? '(permanente)'
                                    : activePermission?.expires_at
                                      ? `(vence: ${new Date(activePermission.expires_at).toLocaleString()})`
                                      : '(temporal)'}.
                            </p>
                            {canSkipInvoice ? (
                                <p>Permiso temporal SIN factura activo hasta {new Date(activePermission.override_without_invoice_expires_at).toLocaleString()}.</p>
                            ) : (
                                <p>Actualmente la creación exige factura.</p>
                            )}
                        </div>
                    )}
                </div>

                {employees.length > 0 && (
                    <form onSubmit={submitPermission} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-5">
                        <select className="rounded border" value={permissionForm.data.employee_id} onChange={(e) => permissionForm.setData('employee_id', e.target.value)}>
                            <option value="">Selecciona empleado</option>
                            {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                        </select>
                        <select className="rounded border" value={permissionForm.data.permission_kind} onChange={(e) => permissionForm.setData('permission_kind', e.target.value)}>
                            <option value="with_invoice">Permiso base (con factura)</option>
                            <option value="without_invoice_hours">Permiso extra sin factura (solo horas)</option>
                        </select>
                        <select className="rounded border" disabled={isWithoutInvoiceMode} value={permissionForm.data.type} onChange={(e) => permissionForm.setData('type', e.target.value)}>
                            <option value="hours">Por horas</option>
                            <option value="days">Por días</option>
                            <option value="always">Siempre</option>
                        </select>
                        <input type="number" min="1" className="rounded border" value={permissionForm.data.duration} onChange={(e) => permissionForm.setData('duration', e.target.value)} />
                        <button className="rounded bg-indigo-600 px-3 py-2 text-sm text-white">Conceder permiso</button>
                    </form>
                )}

                <form onSubmit={submitProduct} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
                    <input className="rounded border" placeholder="Nombre" value={productForm.data.name} onChange={(e) => productForm.setData('name', e.target.value)} disabled={!canCreateProduct} />
                    <input className="rounded border" placeholder="Precio" type="number" step="0.01" value={productForm.data.price} onChange={(e) => productForm.setData('price', e.target.value)} disabled={!canCreateProduct} />
                    <input className="rounded border" placeholder="Stock" type="number" min="0" value={productForm.data.stock} onChange={(e) => productForm.setData('stock', e.target.value)} disabled={!canCreateProduct} />
                    <input className="rounded border" placeholder="Código de barras (opcional)" value={productForm.data.barcode} onChange={(e) => productForm.setData('barcode', e.target.value)} disabled={!canCreateProduct || productForm.data.auto_generate_barcode} />
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={productForm.data.auto_generate_barcode} onChange={(e) => productForm.setData('auto_generate_barcode', e.target.checked)} disabled={!canCreateProduct} />Generar código automáticamente</label>
                    <input type="file" accept="image/*" className="rounded border" onChange={(e) => productForm.setData('invoice_image', e.target.files[0])} disabled={!canCreateProduct} required={!canSkipInvoice} />
                    <textarea className="rounded border md:col-span-2" placeholder="Descripción" value={productForm.data.description} onChange={(e) => productForm.setData('description', e.target.value)} disabled={!canCreateProduct} />
                    <button className="rounded bg-emerald-600 px-3 py-2 text-sm text-white md:col-span-2" disabled={!canCreateProduct}>Guardar producto</button>
                </form>

                <div className="rounded-lg border bg-white p-4">
                    <form onSubmit={doSearch} className="mb-3 flex gap-2">
                        <input name="q" defaultValue={filters.q} className="w-full rounded border" placeholder="Buscar por nombre o código de barras" />
                        <button className="rounded bg-gray-800 px-3 py-2 text-xs text-white">Buscar</button>
                    </form>
                    <div className="space-y-2">
                        {products.data.map((product) => (
                            <div key={product.id} className="rounded border p-3">
                                <p className="font-semibold text-gray-800">{product.name}</p>
                                <p className="text-xs text-gray-500">Código: {product.barcode ?? 'N/A'} · Stock: {product.stock} · Precio: ${product.price}</p>
                                <p className="text-xs text-gray-500">Creado por: {product.creator?.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
