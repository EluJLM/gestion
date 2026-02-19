import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function HomeIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 9.8V21h14V9.8" />
        </svg>
    );
}

function ListIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h12M8 12h12M8 18h12" />
            <circle cx="4" cy="6" r="1" />
            <circle cx="4" cy="12" r="1" />
            <circle cx="4" cy="18" r="1" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 20a7 7 0 0114 0" />
            <circle cx="12" cy="9" r="3.5" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1 1 0 00.2 1.1l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1 1 0 00-1.1-.2 1 1 0 00-.6.9V20a2 2 0 01-4 0v-.2a1 1 0 00-.6-.9 1 1 0 00-1.1.2l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1 1 0 00.2-1.1 1 1 0 00-.9-.6H4a2 2 0 010-4h.2a1 1 0 00.9-.6 1 1 0 00-.2-1.1l-.1-.1a2 2 0 012.8-2.8l.1.1a1 1 0 001.1.2 1 1 0 00.6-.9V4a2 2 0 014 0v.2a1 1 0 00.6.9 1 1 0 001.1-.2l.1-.1a2 2 0 012.8 2.8l-.1.1a1 1 0 00-.2 1.1 1 1 0 00.9.6H20a2 2 0 010 4h-.2a1 1 0 00-.9.6z" />
        </svg>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = useMemo(
        () => [
            { label: 'Dashboard', href: route('dashboard'), active: route().current('dashboard'), icon: <HomeIcon /> },
            { label: 'Servicios registrados', href: route('tickets.index'), active: route().current('tickets.index'), icon: <ListIcon /> },
            { label: 'Crear servicio', href: route('tickets.create'), active: route().current('tickets.create'), icon: <PlusIcon /> },
            { label: 'Clientes', href: route('clients.index'), active: route().current('clients.*'), icon: <UserIcon /> },
            { label: 'Configuración', href: route('configuracion.edit'), active: route().current('configuracion.*'), icon: <SettingsIcon /> },
        ],
        [],
    );

    const SidebarContent = (
        <div className="flex h-full flex-col">
            <div className="border-b border-gray-200 px-5 py-5">
                <Link href="/" className="flex items-center gap-3 text-gray-800">
                    <ApplicationLogo className="h-9 w-auto fill-current text-gray-800" />
                    <span className="text-2xl font-semibold">Panel</span>
                </Link>
            </div>

            <div className="flex-1 space-y-2 px-3 py-5">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                            item.active
                                ? 'bg-indigo-600 text-white shadow'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>

            <div className="border-t border-gray-200 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="mb-3 text-xs text-gray-500">{user.email}</p>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-50"
                >
                    Cerrar sesión
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-gray-200 bg-white md:block">
                {SidebarContent}
            </div>

            <div className="md:pl-72">
                <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-md border border-gray-300 px-2 py-1.5 text-gray-700"
                        aria-label="Abrir menú"
                    >
                        ☰
                    </button>
                    {header && (
                        <div className="min-w-0 flex-1 truncate text-gray-800 [&>h2]:truncate [&>h2]:text-base [&>h2]:font-semibold [&>h2]:leading-tight">
                            {header}
                        </div>
                    )}
                </div>

                <div
                    className={`fixed inset-0 z-50 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
                    role="dialog"
                    aria-modal="true"
                >
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="relative h-full w-72 bg-white shadow-xl">{SidebarContent}</aside>
                </div>

                {header && (
                    <header className="hidden border-b border-gray-200 bg-white shadow-sm md:block">
                        <div className="px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                    </header>
                )}

                <main className="p-0">{children}</main>
            </div>
        </div>
    );
}
