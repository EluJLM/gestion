import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

const smtpProviders = {
    gmail: { host: 'smtp.gmail.com', port: 587, encryption: 'tls' },
    outlook: { host: 'smtp.office365.com', port: 587, encryption: 'tls' },
    zoho: { host: 'smtp.zoho.com', port: 587, encryption: 'tls' },
    sendgrid: { host: 'smtp.sendgrid.net', port: 587, encryption: 'tls' },
    mailgun: { host: 'smtp.mailgun.org', port: 587, encryption: 'tls' },
    hostinger: { host: 'smtp.hostinger.com', port: 465, encryption: 'ssl' },
    brevo: { host: 'smtp-relay.brevo.com', port: 587, encryption: 'tls' },
    amazonSes: { host: 'email-smtp.us-east-1.amazonaws.com', port: 587, encryption: 'tls' },
    protonMail: { host: 'smtp.protonmail.ch', port: 587, encryption: 'tls' },
};

export default function Configuracion({
    company,
    mailSetting,
    documentTypes,
    taxRegimes,
    mailers,
    mailEncryptions,
    mailPorts,
}) {
    const [providerHint, setProviderHint] = useState('');

    const companyForm = useForm({
        name: company?.name ?? '',
        business_name: company?.business_name ?? '',
        document_type: company?.document_type ?? documentTypes[0] ?? 'NIT',
        document_number: company?.document_number ?? '',
        address: company?.address ?? '',
        city: company?.city ?? '',
        department: company?.department ?? '',
        country: company?.country ?? 'Colombia',
        phone: company?.phone ?? '',
        whatsapp: company?.whatsapp ?? '',
        email: company?.email ?? '',
        tax_regime: company?.tax_regime ?? taxRegimes[0] ?? '',
        logo_path: company?.logo_path ?? '',
    });

    const mailForm = useForm({
        mail_mailer: mailSetting?.mail_mailer ?? 'smtp',
        mail_host: mailSetting?.mail_host ?? '',
        mail_port: mailSetting?.mail_port ?? 587,
        mail_username: mailSetting?.mail_username ?? '',
        mail_password: '',
        mail_encryption: mailSetting?.mail_encryption ?? 'tls',
        mail_from_address: mailSetting?.mail_from_address ?? '',
        mail_from_name: mailSetting?.mail_from_name ?? '',
    });

    const testMailForm = useForm({
        test_email: '',
    });

    const applyProvider = (providerKey) => {
        setProviderHint(providerKey);

        const providerConfig = smtpProviders[providerKey];

        if (!providerConfig) {
            return;
        }

        mailForm.setData((currentData) => ({
            ...currentData,
            mail_mailer: 'smtp',
            mail_host: providerConfig.host,
            mail_port: providerConfig.port,
            mail_encryption: providerConfig.encryption,
        }));
    };

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
                            <div>
                                <InputLabel htmlFor="name" value="Nombre comercial" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={companyForm.data.name}
                                    onChange={(e) =>
                                        companyForm.setData('name', e.target.value)
                                    }
                                />
                                <InputError className="mt-1" message={companyForm.errors.name} />
                            </div>
                            <div>
                                <InputLabel htmlFor="business_name" value="Razón social" />
                                <TextInput
                                    id="business_name"
                                    className="mt-1 block w-full"
                                    value={companyForm.data.business_name}
                                    onChange={(e) =>
                                        companyForm.setData('business_name', e.target.value)
                                    }
                                />
                                <InputError className="mt-1" message={companyForm.errors.business_name} />
                            </div>
                            <div>
                                <InputLabel htmlFor="document_type" value="Tipo de documento" />
                                <select
                                    id="document_type"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={companyForm.data.document_type}
                                    onChange={(e) =>
                                        companyForm.setData('document_type', e.target.value)
                                    }
                                >
                                    {documentTypes.map((documentType) => (
                                        <option key={documentType} value={documentType}>
                                            {documentType}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-1" message={companyForm.errors.document_type} />
                            </div>
                            <div>
                                <InputLabel htmlFor="document_number" value="Número de documento" />
                                <TextInput
                                    id="document_number"
                                    className="mt-1 block w-full"
                                    value={companyForm.data.document_number}
                                    onChange={(e) =>
                                        companyForm.setData('document_number', e.target.value)
                                    }
                                />
                                <InputError className="mt-1" message={companyForm.errors.document_number} />
                            </div>
                            <div>
                                <InputLabel htmlFor="tax_regime" value="Régimen tributario" />
                                <select
                                    id="tax_regime"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={companyForm.data.tax_regime}
                                    onChange={(e) =>
                                        companyForm.setData('tax_regime', e.target.value)
                                    }
                                >
                                    {taxRegimes.map((taxRegime) => (
                                        <option key={taxRegime} value={taxRegime}>
                                            {taxRegime}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-1" message={companyForm.errors.tax_regime} />
                            </div>
                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={companyForm.data.email}
                                    onChange={(e) =>
                                        companyForm.setData('email', e.target.value)
                                    }
                                />
                                <InputError className="mt-1" message={companyForm.errors.email} />
                            </div>
                            <div>
                                <InputLabel htmlFor="phone" value="Teléfono" />
                                <TextInput
                                    id="phone"
                                    className="mt-1 block w-full"
                                    value={companyForm.data.phone}
                                    onChange={(e) =>
                                        companyForm.setData('phone', e.target.value)
                                    }
                                />
                                <InputError className="mt-1" message={companyForm.errors.phone} />
                            </div>
                            <div>
                                <InputLabel htmlFor="whatsapp" value="WhatsApp" />
                                <TextInput
                                    id="whatsapp"
                                    className="mt-1 block w-full"
                                    value={companyForm.data.whatsapp}
                                    onChange={(e) =>
                                        companyForm.setData('whatsapp', e.target.value)
                                    }
                                />
                                <InputError className="mt-1" message={companyForm.errors.whatsapp} />
                            </div>
                            <div>
                                <InputLabel htmlFor="city" value="Ciudad" />
                                <TextInput
                                    id="city"
                                    className="mt-1 block w-full"
                                    value={companyForm.data.city}
                                    onChange={(e) =>
                                        companyForm.setData('city', e.target.value)
                                    }
                                />
                                <InputError className="mt-1" message={companyForm.errors.city} />
                            </div>
                            <div>
                                <InputLabel htmlFor="department" value="Departamento" />
                                <TextInput
                                    id="department"
                                    className="mt-1 block w-full"
                                    value={companyForm.data.department}
                                    onChange={(e) =>
                                        companyForm.setData('department', e.target.value)
                                    }
                                />
                                <InputError className="mt-1" message={companyForm.errors.department} />
                            </div>
                            <div>
                                <InputLabel htmlFor="country" value="País" />
                                <TextInput
                                    id="country"
                                    className="mt-1 block w-full"
                                    value={companyForm.data.country}
                                    onChange={(e) =>
                                        companyForm.setData('country', e.target.value)
                                    }
                                />
                                <InputError className="mt-1" message={companyForm.errors.country} />
                            </div>
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="address" value="Dirección" />
                                <TextInput
                                    id="address"
                                    className="mt-1 block w-full"
                                    value={companyForm.data.address}
                                    onChange={(e) =>
                                        companyForm.setData('address', e.target.value)
                                    }
                                />
                                <InputError className="mt-1" message={companyForm.errors.address} />
                            </div>
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="logo_path" value="Ruta del logo (opcional)" />
                                <TextInput
                                    id="logo_path"
                                    className="mt-1 block w-full"
                                    value={companyForm.data.logo_path}
                                    onChange={(e) =>
                                        companyForm.setData('logo_path', e.target.value)
                                    }
                                />
                                <InputError className="mt-1" message={companyForm.errors.logo_path} />
                            </div>
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
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="provider_hint" value="Proveedor sugerido (autocompletar)" />
                                <select
                                    id="provider_hint"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={providerHint}
                                    onChange={(e) => applyProvider(e.target.value)}
                                >
                                    <option value="">Selecciona un proveedor</option>
                                    <option value="gmail">Gmail / Google Workspace</option>
                                    <option value="outlook">Outlook / Microsoft 365</option>
                                    <option value="zoho">Zoho Mail</option>
                                    <option value="sendgrid">SendGrid</option>
                                    <option value="mailgun">Mailgun</option>
                                    <option value="hostinger">Hostinger Email</option>
                                    <option value="brevo">Brevo (Sendinblue)</option>
                                    <option value="amazonSes">Amazon SES</option>
                                    <option value="protonMail">Proton Mail</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="mail_mailer" value="Mailer" />
                                <select
                                    id="mail_mailer"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={mailForm.data.mail_mailer}
                                    onChange={(e) =>
                                        mailForm.setData('mail_mailer', e.target.value)
                                    }
                                >
                                    {mailers.map((mailer) => (
                                        <option key={mailer} value={mailer}>
                                            {mailer}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-1" message={mailForm.errors.mail_mailer} />
                            </div>
                            <div>
                                <InputLabel htmlFor="mail_host" value="Servidor SMTP" />
                                <TextInput
                                    id="mail_host"
                                    className="mt-1 block w-full"
                                    value={mailForm.data.mail_host}
                                    onChange={(e) =>
                                        mailForm.setData('mail_host', e.target.value)
                                    }
                                />
                                <InputError className="mt-1" message={mailForm.errors.mail_host} />
                            </div>
                            <div>
                                <InputLabel htmlFor="mail_port" value="Puerto SMTP" />
                                <select
                                    id="mail_port"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={mailForm.data.mail_port}
                                    onChange={(e) =>
                                        mailForm.setData('mail_port', Number(e.target.value))
                                    }
                                >
                                    {mailPorts.map((port) => (
                                        <option key={port} value={port}>
                                            {port}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-1" message={mailForm.errors.mail_port} />
                            </div>
                            <div>
                                <InputLabel htmlFor="mail_encryption" value="Encriptación" />
                                <select
                                    id="mail_encryption"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={mailForm.data.mail_encryption ?? ''}
                                    onChange={(e) =>
                                        mailForm.setData('mail_encryption', e.target.value)
                                    }
                                >
                                    <option value="">Sin encriptación</option>
                                    {mailEncryptions.map((encryption) => (
                                        <option key={encryption} value={encryption}>
                                            {encryption.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-1" message={mailForm.errors.mail_encryption} />
                            </div>
                            <div>
                                <InputLabel htmlFor="mail_username" value="Usuario SMTP" />
                                <TextInput
                                    id="mail_username"
                                    className="mt-1 block w-full"
                                    value={mailForm.data.mail_username}
                                    onChange={(e) =>
                                        mailForm.setData('mail_username', e.target.value)
                                    }
                                />
                                <InputError className="mt-1" message={mailForm.errors.mail_username} />
                            </div>
                            <div>
                                <InputLabel htmlFor="mail_from_address" value="Correo remitente" />
                                <TextInput
                                    id="mail_from_address"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={mailForm.data.mail_from_address}
                                    onChange={(e) =>
                                        mailForm.setData('mail_from_address', e.target.value)
                                    }
                                />
                                <InputError className="mt-1" message={mailForm.errors.mail_from_address} />
                            </div>
                            <div>
                                <InputLabel htmlFor="mail_from_name" value="Nombre remitente" />
                                <TextInput
                                    id="mail_from_name"
                                    className="mt-1 block w-full"
                                    value={mailForm.data.mail_from_name}
                                    onChange={(e) =>
                                        mailForm.setData('mail_from_name', e.target.value)
                                    }
                                />
                                <InputError className="mt-1" message={mailForm.errors.mail_from_name} />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="mail_password" value="Contraseña SMTP" />
                                <TextInput
                                    id="mail_password"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={mailForm.data.mail_password}
                                    onChange={(e) =>
                                        mailForm.setData('mail_password', e.target.value)
                                    }
                                    autoComplete="new-password"
                                    placeholder={
                                        mailSetting
                                            ? 'Déjalo vacío para conservar la actual'
                                            : ''
                                    }
                                />
                                <InputError className="mt-1" message={mailForm.errors.mail_password} />
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
