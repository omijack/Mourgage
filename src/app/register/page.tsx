'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const nom = (form.elements.namedItem('nom') as HTMLInputElement).value;
    const telefon = (form.elements.namedItem('telefon') as HTMLInputElement).value;

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nom, telefon }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || 'Error inesperat');
    } else {
      setMessage('Usuari registrat correctament!');
      setTimeout(() => router.push('/'), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">Registra’t</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input name="nom" placeholder="Nom" required className="w-full px-4 py-2 border rounded" />
          <input name="telefon" placeholder="Telèfon" required className="w-full px-4 py-2 border rounded" />
          <input name="email" placeholder="Email" type="email" required className="w-full px-4 py-2 border rounded" />
          <input name="password" placeholder="Contrasenya" type="password" required className="w-full px-4 py-2 border rounded" />
          <button type="submit" className="w-full bg-primary text-white font-semibold py-2 rounded">
            Registrar
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
