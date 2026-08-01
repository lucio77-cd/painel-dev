const TOKEN_KEY = 'painel_token'

export function salvarToken(senha) {
  localStorage.setItem(TOKEN_KEY, senha)
}

export function limparToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function temToken() {
  return !!localStorage.getItem(TOKEN_KEY)
}

export async function chamarApi(rota, opcoes = {}) {
  const token = localStorage.getItem(TOKEN_KEY)
  const resposta = await fetch(`/api/${rota}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      'x-painel-token': token || '',
      ...(opcoes.headers || {}),
    },
  })
  if (resposta.status === 401) {
    limparToken()
    window.location.href = '/login'
  }
  return resposta.json()
}
