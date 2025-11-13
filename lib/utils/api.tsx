/**
 * Wrapper para fetch que trata erros 401 automaticamente
 * e redireciona para a tela de login após fazer logout
 */
export async function fetchWithAuth(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, options);

  // Se retornar 401, fazer logout e redirecionar
  if (response.status === 401) {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      window.location.href = "/login";
    }
  }

  return response;
}

/**
 * Hook para mostrar mensagem de sessão expirada
 * Retorna um estado e uma função para renderizar a tela de erro
 */
export function useUnauthorizedHandler() {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      window.location.href = "/login";
    }
  };

  const UnauthorizedScreen = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6 text-center">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            Sessão Expirada
          </h2>
          <p className="text-slate-400 mb-6">
            Sua sessão expirou ou você não está autenticado. Por favor, faça login novamente.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar ao Login
        </button>
      </div>
    </div>
  );

  return { handleLogout, UnauthorizedScreen };
}
