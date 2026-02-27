import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

export default function ProductsIndex({ products, query, canCreateProducts, canCreateWithoutInvoice }) {
    const form = useForm({
        name: '',
        sku: '',
        barcode: '',
        generate_barcode: true,
        invoice_image: null,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('products.store'), {
            forceFormData: true,
            onSuccess: () => form.reset('name', 'sku', 'barcode', 'invoice_image'),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Productos</h2>}>
            <Head title="Productos" />

            <div className="mx-auto max-w-7xl space-y-6 p-6">
                <div className="rounded-lg border bg-white p-4">
                    <input
                        defaultValue={query}
                        placeholder="Buscar por nombre o código de barras"
                        className="w-full rounded border"
                        onChange={(e) => router.get(route('products.index'), { query: e.target.value }, { preserveState: true, replace: true })}
                    />
                </div>

                {canCreateProducts ? (
                    <form onSubmit={submit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
                        <h3 className="md:col-span-2 text-sm font-semibold">Crear producto</h3>
                        <input className="rounded border" placeholder="Nombre" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                        <input className="rounded border" placeholder="SKU interno" value={form.data.sku} onChange={(e) => form.setData('sku', e.target.value)} />
                        <input className="rounded border" placeholder="Código de barras (opcional)" value={form.data.barcode} onChange={(e) => form.setData('barcode', e.target.value)} />
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.data.generate_barcode} onChange={(e) => form.setData('generate_barcode', e.target.checked)} />
                            Generar código automáticamente
                        </label>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-xs text-gray-600">Factura (imagen)</label>
                            <input type="file" accept="image/*" onChange={(e) => form.setData('invoice_image', e.target.files?.[0] ?? null)} />
                            {canCreateWithoutInvoice && <p className="text-xs text-emerald-700">Tienes permiso para crear productos sin factura.</p>}
                        </div>
                        <button className="md:col-span-2 rounded bg-indigo-600 px-3 py-2 text-sm text-white">Guardar producto</button>
                    </form>
                ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                        No tienes un permiso activo para crear productos. Pide autorización a tu administrador.
                    </div>
                )}

                <div className="space-y-2 rounded-lg border bg-white p-4">
                    {products.map((product) => (
                        <div key={product.id} className="rounded border p-3 text-sm">
                            <p className="font-semibold">{product.name}</p>
                            <p>SKU: {product.sku || 'N/A'}</p>
                            <p>Código de barras: {product.barcode || 'Sin código'}</p>
                            <p>Creado por: {product.creator?.name}</p>
                            <p>Fecha: {new Date(product.created_at).toLocaleString()}</p>
                            <p>{product.invoice_image_path ? 'Con factura adjunta' : 'Sin factura adjunta'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
