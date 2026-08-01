import { useState } from 'react'
import { chamarApi } from '../servicos/api'

export default function Teste() {
  const [resultado, setResultado] = useState('')
  const [projeto, setProjeto] = useState('busabateria')
  const [deploymentId, setDeploymentId] = useState('')
  const [repo, setRepo] = useState('lucio77-cd/painel-dev')
  const [caminho, setCaminho] = useState('package.json')

  async function testarVercelStatus() {
    const r = await chamarApi(`vercel-status?projeto=${projeto}`)
    setResultado(JSON.stringify(r, null, 2))
  }

  async function testarVercelLogs() {
    const r = await chamarApi(`vercel-logs?deploymentId=${deploymentId}`)
    setResultado(JSON.stringify(r, null, 2))
  }

  async function testarGithubArquivo() {
    const r = await chamarApi(`github-arquivo?repo=${encodeURIComponent(repo)}&caminho=${encodeURIComponent(caminho)}`)
    setResultado(JSON.stringify(r, null, 2))
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Teste de endpoints</h1>

      <h3>vercel-status</h3>
      <input value={projeto} onChange={(e) => setProjeto(e.target.value)} placeholder="nome/id do projeto na Vercel" />
      <button onClick={testarVercelStatus}>Testar</button>

      <h3>vercel-logs</h3>
      <input value={deploymentId} onChange={(e) => setDeploymentId(e.target.value)} placeholder="deploymentId (pegue no resultado do teste acima)" />
      <button onClick={testarVercelLogs}>Testar</button>

      <h3>github-arquivo</h3>
      <input value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="dono/repo" />
      <input value={caminho} onChange={(e) => setCaminho(e.target.value)} placeholder="caminho/do/arquivo" />
      <button onClick={testarGithubArquivo}>Testar</button>

      <h3>Resultado</h3>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#eee', padding: 8 }}>{resultado}</pre>
    </div>
  )
}
