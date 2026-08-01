export default async function handler(req, res) {
  const token = req.headers['x-painel-token']
  if (!token || token !== process.env.PAINEL_SENHA) {
    return res.status(401).json({ erro: 'não autorizado' })
  }
  if (req.method !== 'POST') return res.status(405).end()

  const { log, arquivos } = req.body || {}
  if (!log || !arquivos?.length) {
    return res.status(400).json({ erro: 'faltou log ou arquivos' })
  }

  const listaArquivos = arquivos
    .map((a) => `--- ${a.caminho} ---\n${a.conteudo}`)
    .join('\n\n')

  const prompt = `Você é um assistente de diagnóstico de build quebrado (Vite + Vercel).

LOG DE ERRO:
${log}

ARQUIVOS RELEVANTES DO REPOSITÓRIO:
${listaArquivos}

Analise o erro e proponha uma correção. Responda APENAS com um JSON válido, sem markdown, no formato exato:
{"diagnostico": "explicação curta da causa", "caminho": "caminho/do/arquivo/a/corrigir", "conteudoCorrigido": "conteúdo completo do arquivo já corrigido"}`

  try {
    const resposta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )
    const dados = await resposta.json()
    const texto = dados.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const limpo = texto.replace(/```json|```/g, '').trim()
    const resultado = JSON.parse(limpo)

    res.status(200).json(resultado)
  } catch (e) {
    res.status(500).json({ erro: 'falha ao diagnosticar', detalhe: e.message })
  }
}
