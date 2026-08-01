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
    const textoLog = (Array.isArray(eventos) ? eventos : [])
      .filter((e) => e.type === 'stdout' || e.type === 'stderr')
      .map((e) => e.text || '')
      .join('\n')

    res.status(200).json({ log: textoLog })
  } catch (e) {
    res.status(500).json({ erro: 'falha ao buscar logs', detalhe: e.message })
  }
}
