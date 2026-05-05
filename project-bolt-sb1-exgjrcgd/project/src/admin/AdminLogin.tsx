import { useState } from 'react';
import { Lock, User, PawPrint, Eye, EyeOff } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [petName, setPetName] = useState('');
  const [recoveredPassword, setRecoveredPassword] = useState('');
  const [forgotError, setForgotError] = useState('');

  const ADMIN_USER = 'nilo';
  const ADMIN_PASS = 'nilo2026';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const user = username.trim().toLowerCase();
    const pass = password.trim();

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem('nilo_admin', 'true');
      onLogin();
    } else {
      setError('Login ou senha incorretos.');
      setLoading(false);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setRecoveredPassword('');

    if (petName.trim().toLowerCase() === 'nilo') {
      setRecoveredPassword(ADMIN_PASS);
    } else {
      setForgotError('Nome do pet não encontrado.');
    }
  };

  if (showForgot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <PawPrint className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Recuperar Senha</h1>
            <p className="text-gray-500 mt-1">Digite o nome do pet para recuperar a senha</p>
          </div>

          <form onSubmit={handleForgot} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Pet</label>
              <input
                type="text"
                value={petName}
                onChange={e => setPetName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Ex: Nilo"
                required
              />
            </div>

            {forgotError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {forgotError}
              </div>
            )}

            {recoveredPassword && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                <strong>Sua senha é:</strong> {recoveredPassword}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Recuperar Senha
            </button>

            <button
              type="button"
              onClick={() => { setShowForgot(false); setRecoveredPassword(''); setForgotError(''); setPetName(''); }}
              className="w-full border border-gray-300 text-gray-600 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Voltar ao Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <PawPrint className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Nilo Pet</h1>
          <p className="text-gray-500 mt-1">Banho e Tosa — Painel Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Login</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="nilo"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="w-full text-amber-600 hover:text-amber-700 text-sm font-medium py-1"
          >
            Esqueci minha senha
          </button>
        </form>
      </div>
    </div>
  );
}
