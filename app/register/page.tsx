"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/layout/Logo";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      toast.error("As senhas não coincidem");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      toast.error("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      toast.error("Erro ao criar conta. Tente novamente.");
      setLoading(false);
    } else {
      setError(null);
      setSuccess(true);
      setLoading(false);
      toast.success("Conta criada com sucesso!", {
        duration: 6000,
      });
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>

        {/* Register Card */}
        <div className="bg-slate-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-slate-100 mb-6 text-center">
            Criar Conta
          </h1>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                placeholder="seu@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Confirmar Senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-900/50 border border-green-500 rounded-lg">
                <p className="text-sm font-medium text-green-200 mb-2">
                  Conta criada com sucesso!
                </p>
                <p className="text-xs text-green-300">
                  Enviamos um email de confirmação para <strong>{email}</strong>
                </p>
                <p className="text-xs text-green-300 mt-2">
                  Verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.
                </p>
                <p className="text-xs text-slate-400 mt-3">
                  Não recebeu o email? Verifique sua pasta de spam.
                </p>
              </div>
            )}

            {/* Submit Button */}
            {!success && (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? "Criando conta..." : "Criar Conta"}
              </button>
            )}

            {/* Login Button after success */}
            {success && (
              <Link
                href="/login"
                className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ir para Login
              </Link>
            )}
          </form>

          {/* Login Link */}
          {!success && (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Entrar
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
