
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">Accede a tu espacio</h1>
        <p className="text-sm text-gray-600 mb-8 text-center">
          Sube tu documentación para el estudio hipotecario de forma segura.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement)?.value;
            const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement)?.value;
            signIn('credentials', { email, password, callbackUrl: '/dashboard' });
          }}
          className="space-y-6"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Iniciar sesión
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-500 text-center">
          ¿No tienes cuenta? Contacta con tu asesor hipotecario.
        </p>
      </div>
    </div>
  );
}
