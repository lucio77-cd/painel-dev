export default async function handler(req, res) {
  const token = req.headers['x-painel-token']
  if (!token || token !== process.env.PAINEL_SENHA) {
    return res.status(401).json({ erro: 'não autorizado' })
  }

  const { projeto } = req.query
  if (!projeto) return res.status(400).json({ erro: 'faltou o parâmetro projeto' })

  try {
    const resposta = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${projeto}&limit=1`,
      { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` } }
    )
    const dados = await resposta.json()
    const ultimo = dados.deployments?.[0]

    if (!ultimo) return res.status(404).json({ erro: 'nenhum deploy encontrado' })

    res.status(200).json({
      id: ultimo.uid,
      estado: ultimo.state,
      url: ultimo.url,
      criadoEm: ultimo.created,
    })
  } catch (e) {
    res.status(500).json({ erro: 'falha ao consultar a Vercel', detalhe: e.message })
  }
}
