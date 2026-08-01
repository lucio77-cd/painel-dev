import { useState } from 'react'
import { chamarApi } from '../servicos/api'
import { projetos } from '../config/projetos'

export default function Diagnostico() {
  const [projetoSelecionado, setProjetoSelecionado] = useState(projetos[0].nome)
  const [status, setStatus] = useState('')
  const [diagnostico, setDiagnostico] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const projeto = projetos.find((p) => p.nome === projetoSelecionado)

  async function rodarDiagnostico() {
    setCarregando(true)
    setDiagnostico(null)
    setMensagem('Buscando último deploy...')

    const statusDeploy = await chamarApi(`vercel-status?projeto=${projeto.vercelProjectId}`)
    if (statusDeploy.erro) {
      setMensagem(`Erro: ${statusDeploy.erro}`)
      setCarregando(false)
      return
    }

    setMensagem('Buscando log de build...')
    const logs = await chamarApi(`vercel-logs?deploymentId=${statusDeploy.id}`)

    setMensagem('Buscando arquivos de configuração...')
    const arquivosParaChecar = ['package.json', 'vercel.json']
    const arquivos = []
    for (const caminho of arquivosParaChecar) {
      const resultado = await chamarApi(
        `github-arquivo?repo=${encodeURIComponent(projeto.repo)}&caminho=${caminho}`
      )
      if (resultado.conteudo) arquivos.push({ caminho, conteudo: resultado.conteudo })
    }

    setMensagem('Diagnosticando com IA...')
    const resultado = await chamarApi('diagnosticar', {
      method: 'POST',
      body: JSON.stringify({ log: logs.log, arquivos }),
    })

    setDiagnostico(resultado)
    setMensagem('')
    setCarregando(false)
  }

  async function aplicarCorrecao() {
    setMensagem('Aplicando correção...')
    const resultado = await chamarApi('github-commit', {
      method: 'POST',
      body: JSON.stringify({
        repo: projeto.repo,
        caminho: diagnostico.caminho,
        conteudo: diagnostico.conteudoCorrigido,
        mensagem: `fix: ${diagnostico.diagnostico}`,
      }),
    })
    setMensagem(resultado.ok ? 'Correção aplicada! Aguarde o redeploy.' : `Erro: ${resultado.erro}`)
    setDiagnostico(null)
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Diagnóstico de build</h1>

      <select value={projetoSelecionado} onChange={(e) => setProjetoSelecionado(e.target.value)}>
        {projetos.map((p) => (
          <option key={p.nome} value={p.nome}>{p.nome}</option>
        ))}
      </select>

      <button onClick={rodarDiagnostico} disabled={carregando}>
        {carregando ? 'Rodando...' : 'Diagnosticar'}
      </button>

      {mensagem && <p>{mensagem}</p>}

      {diagnostico && !diagnostico.erro && (
        <div style={{ border: '1px solid #ccc', padding: 12, marginTop: 12 }}>
          <h3>Diagnóstico</h3>
          <p>{diagnostico.diagnostico}</p>
          <h4>Arquivo: {diagnostico.caminho}</h4>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#eee', padding: 8 }}>
            {diagnostico.conteudoCorrigido}
          </pre>
          <button onClick={aplicarCorrecao}>Aprovar e aplicar</button>
          <button onClick={() => setDiagnostico(null)}>Descartar</button>
        </div>
      )}
    </div>
  )
}
