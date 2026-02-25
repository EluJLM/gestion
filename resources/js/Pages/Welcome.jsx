import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Bienvenido" />

            <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
                <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-10">
                    <header className="mb-16 flex items-center justify-end">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                            >
                                Ir al panel
                            </Link>
                        ) : (
                            <nav className="flex items-center gap-3">
                                <Link
                                    href={route('login')}
                                    className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                                >
                                    Crear cuenta
                                </Link>
                            </nav>
                        )}
                    </header>

                    <main className="grid gap-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 md:p-12">
                        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                            Bienvenido a nuestro sistema
                        </p>

                        <h1 className="text-3xl font-bold md:text-4xl">
                            Gestiona tus procesos de forma simple y en un solo
                            lugar
                        </h1>

                        <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                            Este sistema te permite organizar información clave,
                            dar seguimiento a tus tareas y mantener el control
                            de tus operaciones diarias desde una interfaz clara
                            y práctica.
                        </p>

                        <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                            Si creas tu cuenta ahora, tu primer mes es
                            completamente gratis para que puedas probar todas
                            las funciones sin compromiso.
                        </p>
                    </main>
                </div>
            </div>
        </>
    );
}
