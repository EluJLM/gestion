import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Configuracion({ company, mailSetting }) {
    const companyForm = useForm({
        name: company?.name ?? '',
        business_name: company?.business_name ?? '',
        document_type: company?.document_type ?? '',
        document_number: company?.document_number ?? '',
        address: company?.address ?? '',
        city: company?.city ?? '',
        department: company?.department ?? '',
        country: company?.country ?? '',
        phone: company?.phone ?? '',
        whatsapp: company?.whatsapp ?? '',
        email: company?.email ?? '',
        tax_regime: company?.tax_regime ?? '',
        logo_path: company?.logo_path ?? '',
    });

    const mailForm = useForm({
        mail_mailer: mailSetting?.mail_mailer ?? 'smtp',
        mail_host: mailSetting?.mail_host ?? '',
        mail_port: mailSetting?.mail_port ?? '',
        mail_username: mailSetting?.mail_username ?? '',
        mail_password: '',
        mail_encryption: mailSetting?.mail_encryption ?? '',
        mail_from_address: mailSetting?.mail_from_address ?? '',
        mail_from_name: mailSetting?.mail_from_name ?? '',
    });

    const testMailForm = useForm({
        test_email: '',
    });

    const submitCompany = (e) => {
        e.preventDefault();
        companyForm.post(route('configuracion.company.upsert'));
    };

    const submitMail = (e) => {
        e.preventDefault();
        mailForm.post(route('configuracion.mail.upsert'), {
            preserveScroll: true,
        });
    };

    const submitTestMail = (e) => {
        e.preventDefault();
        testMailForm.post(route('configuracion.mail.test'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Configuración
                </h2>
            }
        >
            <Head title="Configuración" />

            <div className="py-10">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <form
                        onSubmit={submitCompany}
                        className="space-y-4 rounded-lg bg-white p-6 shadow"
                    >
                        <h3 className="text-lg font-semibold text-gray-900">
                            Configuración de Empresa
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            {[
                                ['name', 'Nombre comercial'],
                                ['business_name', 'Razón social'],
                                ['document_type', 'Tipo de documento'],
                                ['document_number', 'Número de documento'],
                                ['address', 'Dirección'],
                                ['city', 'Ciudad'],
                                ['department', 'Departamento'],
                                ['country', 'País'],
                                ['phone', 'Teléfono'],
                                ['whatsapp', 'WhatsApp'],
                                ['email', 'Email'],
                                ['tax_regime', 'Régimen tributario'],
                                ['logo_path', 'Ruta del logo (opcional)'],
                            ].map(([field, label]) => (
                                <div key={field} className={field === 'logo_path' ? 'md:col-span-2' : ''}>
                                    <InputLabel htmlFor={field} value={label} />
                                    <TextInput
                                        id={field}
                                        type={field === 'email' ? 'email' : 'text'}
                                        className="mt-1 block w-full"
                                        value={companyForm.data[field]}
                                        onChange={(e) =>
                                            companyForm.setData(field, e.target.value)
                                        }
                                    />
                                    <InputError
                                        className="mt-1"
                                        message={companyForm.errors[field]}
                                    />
                                </div>
                            ))}
                        </div>

                        <PrimaryButton disabled={companyForm.processing}>
                            Guardar empresa
                        </PrimaryButton>
                    </form>

                    <form
                        onSubmit={submitMail}
                        className="space-y-4 rounded-lg bg-white p-6 shadow"
                    >
                        <h3 className="text-lg font-semibold text-gray-900">
                            Configuración de Correo
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            {[
                                ['mail_mailer', 'Mailer'],
                                ['mail_host', 'Servidor SMTP'],
                                ['mail_port', 'Puerto SMTP'],
                                ['mail_username', 'Usuario SMTP'],
                                ['mail_encryption', 'Encriptación (tls/ssl)'],
                                ['mail_from_address', 'Correo remitente'],
                                ['mail_from_name', 'Nombre remitente'],
                            ].map(([field, label]) => (
                                <div key={field}>
                                    <InputLabel htmlFor={field} value={label} />
                                    <TextInput
                                        id={field}
                                        className="mt-1 block w-full"
                                        type={
                                            field === 'mail_port'
                                                ? 'number'
                                                : field === 'mail_from_address'
                                                  ? 'email'
                                                  : 'text'
                                        }
                                        value={mailForm.data[field]}
                                        onChange={(e) =>
                                            mailForm.setData(field, e.target.value)
                                        }
                                    />
                                    <InputError
                                        className="mt-1"
                                        message={mailForm.errors[field]}
                                    />
                                </div>
                            ))}
                            <div className="md:col-span-2">
                                <InputLabel
                                    htmlFor="mail_password"
                                    value="Contraseña SMTP"
                                />
                                <TextInput
                                    id="mail_password"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={mailForm.data.mail_password}
                                    onChange={(e) =>
                                        mailForm.setData(
                                            'mail_password',
                                            e.target.value,
                                        )
                                    }
                                    autoComplete="new-password"
                                    placeholder={
                                        mailSetting
                                            ? 'Déjalo vacío para conservar la actual'
                                            : ''
                                    }
                                />
                                <InputError
                                    className="mt-1"
                                    message={mailForm.errors.mail_password}
                                />
                            </div>
                        </div>

                        <PrimaryButton disabled={mailForm.processing}>
                            Guardar configuración SMTP
                        </PrimaryButton>
                    </form>

                    <form
                        onSubmit={submitTestMail}
                        className="space-y-4 rounded-lg bg-white p-6 shadow"
                    >
                        <h3 className="text-lg font-semibold text-gray-900">
                            Probar envío de correo
                        </h3>
                        <div className="max-w-lg">
                            <InputLabel htmlFor="test_email" value="Email destino" />
                            <TextInput
                                id="test_email"
                                type="email"
                                className="mt-1 block w-full"
                                value={testMailForm.data.test_email}
                                onChange={(e) =>
                                    testMailForm.setData('test_email', e.target.value)
                                }
                            />
                            <InputError
                                className="mt-1"
                                message={testMailForm.errors.test_email}
                            />
                        </div>

                        <PrimaryButton disabled={testMailForm.processing}>
                            Enviar correo de prueba
                        </PrimaryButton>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
