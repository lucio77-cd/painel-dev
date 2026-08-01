export default async function handler(req, res) {
  const token = req.headers['x-painel-token']
  if (!token || token !== process.env.PAINEL_SENHA) {
    return res.status(401).json({ erro: 'não autorizado' })
  }
  if (req.method !== 'POST') return res.status(405).end()

  const { repo, caminho, conteudo, mensagem } = req.body || {}
  if (!repo || !caminho || !conteudo) {
    return res.status(400).json({ erro: 'faltou repo, caminho ou conteudo' })
  }

  try {
    // Precisa do sha atual do arquivo pra poder sobrescrever
    const atual = await fetch(
      `https://api.github.com/repos/${repo}/contents/${caminho}`,
      { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
    )
    const dadosAtuais = await atual.json()
    const sha = dadosAtuais.sha

    const resposta = await fetch(
      `https://api.github.com/repos/${repo}/contents/${caminho}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: mensagem || `fix: correção via painel-dev em ${caminho}`,
          content: Buffer.from(conteudo, 'utf-8').toString('base64'),
          sha,
        }),
      }
    )
    const resultado = await resposta.json()
    if (!resposta.ok) {
      return res.status(resposta.status).json({ erro: 'falha ao commitar', detalhe: resultado })
    }
    res.status(200).json({ ok: true, commit: resultado.commit?.sha })
  } catch (e) {
    res.status(500).json({ erro: 'falha ao aplicar commit', detalhe: e.message })
  }
}
