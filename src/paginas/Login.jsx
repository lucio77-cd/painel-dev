import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { salvarToken } from '../servicos/api'

export default function Login() {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const navegar = useNavigate()

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    const resposta = await fetch('/api/auth-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha }),
    })
    const dados = await resposta.json()
    if (dados.ok) {
      salvarToken(senha)
      navegar('/projetos')
    } else {
      setErro('Senha incorreta')
    }
  }

  return (
    <form onSubmit={entrar}>
      <h1>Painel Dev</h1>
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      <button type="submit">Entrar</button>
      {erro && <p>{erro}</p>}
    </form>
  )
}
