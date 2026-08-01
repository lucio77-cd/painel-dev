export function verificarToken(req) {
  const token = req.headers['x-painel-token']
  return token && token === process.env.PAINEL_SENHA
}
