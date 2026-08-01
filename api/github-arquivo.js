export default async function handler(req, res) {
  const token = req.headers['x-painel-token']
  if (!token || token !== process.env.PAINEL_SENHA) {
    return res.status(401).json({ erro: 'não autorizado' })
  }

  const { repo, caminho } = req.query
  if (!repo || !caminho) return res.status(400).json({ erro: 'faltou repo ou caminho' })

  try {
    const resposta = await fetch(
      `https://api.github.com/repos/${repo}/contents/${caminho}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.raw+json',
        },
      }
    )
    if (!resposta.ok) {
      return res.status(resposta.status).json({ erro: 'arquivo não encontrado' })
    }
    const conteudo = await resposta.text()
    res.status(200).json({ conteudo })
  } catch (e) {
    res.status(500).json({ erro: 'falha ao buscar arquivo', detalhe: e.message })
  }
}
