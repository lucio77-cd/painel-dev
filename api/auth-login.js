export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { senha } = req.body || {}
  if (senha && senha === process.env.PAINEL_SENHA) {
    return res.status(200).json({ ok: true })
  }
  return res.status(401).json({ ok: false })
}
