export default async function handler(req, res) {
  const token = req.headers['x-painel-token']
  if (!token || token !== process.env.PAINEL_SENHA) {
    return res.status(401).json({ erro: 'não autorizado' })
  }

  const { deploymentId } = req.query
  if (!deploymentId) return res.status(400).json({ erro: 'faltou deploymentId' })

  try {
    const resposta = await fetch(
      `https://api.vercel.com/v3/deployments/${deploymentId}/events`,
      { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` } }
    )
    const eventos = await resposta.json()
    // DEBUG: devolve os 3 primeiros eventos crus, sem filtrar
    res.status(200).json({ amostra: eventos.slice ? eventos.slice(0, 3) : eventos })
  } catch (e) {
    res.status(500).json({ erro: 'falha ao buscar logs', detalhe: e.message })
  }
}
