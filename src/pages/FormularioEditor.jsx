/* eslint-disable no-unused-vars */
import { useState } from "react";
import rosaLogo from '../assets/logos/rosa-rfcc.png';
import { ButtonPrimary, ButtonPrimaryDropdown, IconButton, ButtonSecondary } from "../components/Button";
import { XIcon, MoveUpIcon, MoveDownIcon, AddIcon, DeleteIcon } from "../components/Icons";
import Input from "../components/Input";
import { createForm } from "../services/formAPI";

function Card({ children, className }) {
  return (
    <div className={`border bg-white border-gray-300 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  )
}

export default function FormularioEditor() {
  const [erros, setErros] = useState({})
  const [errosGeral, setErrosGeral] = useState([])
  const [formulario, setFormulario] = useState({
    titulo: "",
    descricao: "",
    perguntas: []
  })

  const tiposPergunta = [
    { value: 'Textual', label: 'Texto' },
    { value: 'Dicotomica', label: 'Sim/Não' },
    { value: 'Multipla Escolha', label: 'Múltipla Escolha' },
    { value: 'Selecao Unica', label: 'Seleção Única' }
  ]

  const setTitulo = (value) => {
    setFormulario(prev => ({
      ...prev,
      titulo: value
    }))
  }

  const setDescricao = (value) => {
    setFormulario(prev => ({
      ...prev,
      descricao: value
    }))
  }

  const onAddPergunta = () => {
    const novaPergunta = {
      id: Date.now(),
      enunciado: '',
      tipo: 'Textual',
      alternativas: []
    }

    setFormulario(prev => ({
      ...prev,
      perguntas: [...prev.perguntas, novaPergunta]
    }))
  }

  const onDeletePergunta = (perguntaId) => {
    setFormulario(prev => ({
      ...prev,
      perguntas: prev.perguntas.filter(pergunta => pergunta.id !== perguntaId)
    }))
  }

  const onChangePergunta = (perguntaId, campo, valor) => {
    setErros(prevErros => {
      const novosErros = { ...prevErros }
      delete novosErros[perguntaId]
      return novosErros
    })

    setFormulario(prev => ({
      ...prev,
      perguntas: prev.perguntas.map(pergunta =>
        pergunta.id === perguntaId ? { ...pergunta, [campo]: valor } : pergunta
      )
    }))
  }

  const onMoveUp = (index) => {
    const novasPerguntas = [...formulario.perguntas]
    const novoIndex = index - 1

    if (novoIndex >= 0) {
      [novasPerguntas[index], novasPerguntas[novoIndex]] = [novasPerguntas[novoIndex], novasPerguntas[index]]
      setFormulario(prev => ({ ...prev, perguntas: novasPerguntas }))
    }
  }

  const onMoveDown = (index) => {
    const novasPerguntas = [...formulario.perguntas]
    const novoIndex = index + 1

    if (novoIndex < novasPerguntas.length) {
      [novasPerguntas[index], novasPerguntas[novoIndex]] = [novasPerguntas[novoIndex], novasPerguntas[index]]
      setFormulario(prev => ({ ...prev, perguntas: novasPerguntas }))
    }
  }

  const onAddAlternativa = (perguntaId) => {
    setFormulario(prev => ({
      ...prev,
      perguntas: prev.perguntas.map(pergunta =>
        pergunta.id === perguntaId
          ? {
            ...pergunta,
            alternativas: [...pergunta.alternativas, { id: Date.now(), texto: '' }]
          }
          : pergunta
      )
    }))
  }

  const onDeleteAlternativa = (perguntaId, alternativaId) => {
    setFormulario(prev => ({
      ...prev,
      perguntas: prev.perguntas.map(pergunta =>
        pergunta.id === perguntaId
          ? {
            ...pergunta,
            alternativas: pergunta.alternativas.filter(alt => alt.id !== alternativaId)
          }
          : pergunta
      )
    }))
  }

  const onChangeAlternativa = (perguntaId, alternativaId, texto) => {
    setErros(prevErros => {
      const novosErros = { ...prevErros }
      delete novosErros[perguntaId]
      return novosErros
    })

    setFormulario(prev => ({
      ...prev,
      perguntas: prev.perguntas.map(pergunta =>
        pergunta.id === perguntaId
          ? {
            ...pergunta,
            alternativas: pergunta.alternativas.map(alt =>
              alt.id === alternativaId ? { ...alt, texto } : alt
            )
          }
          : pergunta
      )
    }))
  }

  const checkFormulario = () => {
    const novosErros = {}
    const novosErrosGeral = []

    formulario.perguntas.forEach((pergunta, index) => {
      const errosPergunta = []

      if (!pergunta.enunciado || pergunta.enunciado.trim() === '') {
        errosPergunta.push('Enunciado é obrigatório.')
      }

      if (!pergunta.tipo) {
        errosPergunta.push('Tipo da pergunta é obrigatório.')
      }

      if (pergunta.tipo === 'Multipla Escolha' || pergunta.tipo === 'Selecao Unica') {
        const alternativasValidas = pergunta.alternativas.filter(alt => alt.texto && alt.texto.trim() !== '')
        if (alternativasValidas.length < 2) {
          errosPergunta.push('Adicione pelo menos 2 alternativas válidas.')
        }
      }

      if (errosPergunta.length > 0) {
        novosErros[pergunta.id] = errosPergunta
      }
    })

    if (!formulario.titulo || formulario.titulo.trim() === '') {
      novosErrosGeral.push('Título do formulário é obrigatório.')
    }

    if (formulario.perguntas.length === 0) {
      novosErrosGeral.push('Adicione pelo menos uma pergunta ao formulário.')
    }

    setErros(novosErros)
    setErrosGeral(novosErrosGeral)

    return Object.keys(novosErros).length === 0 && novosErrosGeral.length === 0
  }

  const setPerguntasPosicao = () => {
    return formulario.perguntas.map((pergunta, index) => {
      const perguntaProcessada = {
        ...pergunta,
        posicao: index,
        isNova: true
      }

      if (pergunta.tipo === 'Textual') {
        delete perguntaProcessada.alternativas
      }
      else if (pergunta.tipo === 'Dicotomica') {
        perguntaProcessada.alternativas = [
          { id: 'Sim', texto: 'Sim' },
          { id: 'Não', texto: 'Não' }
        ]
      }
      else if (pergunta.tipo === 'Multipla Escolha' || pergunta.tipo === 'Selecao Unica') {
        perguntaProcessada.alternativas = pergunta.alternativas.filter(alt =>
          alt.texto && alt.texto.trim() !== ''
        )
      }

      if (perguntaProcessada.alternativas) {
        perguntaProcessada.alternativas = perguntaProcessada.alternativas.map(
          (alt, altIndex) => ({
            ...alt,
            posicao: altIndex
          })
        )
      }

      return perguntaProcessada
    })
  }

  const onSave = () => {
    setErros({})
    setErrosGeral([])

    if (!checkFormulario()) {
      alert('Corrija os erros antes de salvar.')
      return
    }

    const newPerguntas = setPerguntasPosicao()

    const formularioFinal = {
      ...formulario,
      perguntas: newPerguntas,
      versao: 1,
      liberadoParaUso: true,
      editavel: true,
      especialidade: 'Ginecologia',
      medicoId: 'string'
    }

    handleCreateForm(formularioFinal)
  }

  const handleCreateForm = async (formularioFinal) => {
    await createForm(formularioFinal, null)
      .then(response => {
        alert('Formulário salvo com sucesso!')
      })
      .catch(error => {
        console.error('Erro ao salvar formulário:', error.response.data.message)
        alert('Erro ao salvar formulário. Tente novamente.')
      })
  }

  return (
    <div>
      <div
        className="
          flex flex-row justify-between items-center p-4
          border-b border-gray-300 shadow-md fixed bg-white w-full"
      >
        <div className="flex flex-row gap-2">
          <img src={rosaLogo} alt="" className="h-8 mr-4 self-center" />
          <ButtonPrimaryDropdown>Exportar Dados</ButtonPrimaryDropdown>
        </div>
        <div className="flex flex-row gap-2">
          <ButtonSecondary>Cancelar</ButtonSecondary>
          <ButtonPrimary
            onClick={onSave}
          >
            Salvar
          </ButtonPrimary>
        </div>
      </div>
      <div className="pt-24 pb-4 px-80 bg-redfemVariantPink bg-opacity-10 min-h-screen">
        <div className="flex flex-col gap-4">
          <Card
            className={`${errosGeral.length > 0 ? 'border border-red-500' : ''}`}
          >
            <div className="bg-redfemDarkPink w-full h-2 rounded-t-lg"></div>
            <div className="py-4 px-8">
              {errosGeral.length > 0 && (
                <ul className="w-full flex flex-col">
                  {errosGeral.map((erro, index) => (
                    <li key={index} className="text-red-500">
                      {erro}
                    </li>
                  ))}
                </ul>
              )}

              <Input
                type="text"
                className="text-2xl"
                placeholder="Nome do formulário"
                onChange={(e) => {
                  setTitulo(e.target.value)
                  if (errosGeral.length > 0) setErrosGeral([])
                }}
              />
              <Input
                type="text"
                placeholder="Descrição do formulário"
                onChange={(e) => {
                  setDescricao(e.target.value)
                  if (errosGeral.length > 0) setErrosGeral([])
                }}
              />
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            {formulario.perguntas.map((pergunta, index) => (

              <Card
                key={pergunta.id}
                className={`
                  py-4 px-8 flex flex-col items-center
                  ${erros[pergunta.id] ? 'border border-red-500' : ''}
                `}
              >

                {erros[pergunta.id] && (
                  <ul className="w-full flex flex-col">
                    {erros[pergunta.id].map((erro, index) => (
                      <li key={index} className="text-red-500">
                        {erro}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Move Up */}
                <IconButton onClick={() => onMoveUp(index)}>
                  <MoveUpIcon className="text-redfemActionPink hover:text-redfemDarkPink" />
                </IconButton>

                {/* Enunciado e Select */}
                <div className="w-full mb-4">
                  <div className="flex flex-row gap-5">

                    <Input
                      type="text"
                      placeholder="Pergunta"
                      onChange={(e) => onChangePergunta(pergunta.id, 'enunciado', e.target.value)}
                    />

                    <select
                      className="p-1 w-96 mb-4
                            border-b border-b-gray-950
                            focus:border-b-redfemActionPink focus:border-b-2
                            outline-none cursor-pointer custom-select"
                      value={pergunta.tipo}
                      onChange={(e) => onChangePergunta(pergunta.id, 'tipo', e.target.value)}
                    >
                      {tiposPergunta.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>

                  </div>

                  {pergunta.tipo === "Textual" && (
                    <Input
                      type="text"
                      className={`placeholder:text-gray-400 border-b-gray-400`}
                      placeholder="Resposta"
                      disabled
                    />
                  )}

                  {pergunta.tipo === "Dicotomica" && (
                    <div className={`flex flex-row gap-4 mb-2`}>
                      <ButtonPrimary disabled className="w-full justify-center">Sim</ButtonPrimary>
                      <ButtonPrimary disabled className="w-full justify-center">Não</ButtonPrimary>
                    </div>
                  )}

                  {(pergunta.tipo === "Multipla Escolha" ||
                    pergunta.tipo === "Selecao Unica") && (
                      <div className={`flex flex-col gap-2`}>
                        <div className="mb-2 pl-4">

                          {pergunta.alternativas.map((alternativa, index) => (
                            <div className="flex flex-row gap-2 items-center" key={index}>
                              <div>
                                <Input
                                  type={
                                    pergunta.tipo === "Multipla Escolha" ?
                                      "checkbox" : "radio"
                                  }
                                  disabled
                                />
                              </div>
                              <Input
                                type="text"
                                placeholder="Opção"
                                value={alternativa.texto}
                                onChange={(e) => onChangeAlternativa(pergunta.id, alternativa.id, e.target.value)}
                              />
                              <IconButton onClick={() => onDeleteAlternativa(pergunta.id, alternativa.id)}>
                                <XIcon className="text-gray-600 hover:text-redfemActionPink" />
                              </IconButton>
                            </div>
                          ))}

                        </div>
                        <ButtonPrimary
                          className="justify-center w-fit mx-auto mb-4"
                          onClick={() => onAddAlternativa(pergunta.id)}
                        >
                          Adicionar Opção
                        </ButtonPrimary>
                      </div>
                    )}
                </div>

                {/* Delete */}
                <div className="w-full h-0 flex justify-end">
                  <IconButton onClick={() => onDeletePergunta(pergunta.id)}>
                    <DeleteIcon className="hover:text-redfemActionPink text-gray-800" />
                  </IconButton>
                </div>

                {/* Move Down */}
                <IconButton onClick={() => onMoveDown(index)}>
                  <MoveDownIcon className="text-redfemActionPink hover:text-redfemDarkPink" />
                </IconButton>

              </Card>
            ))}
          </div>

          <ButtonPrimary
            className="justify-center w-fit m-auto mt-4"
            onClick={onAddPergunta}
          >
            <AddIcon />
            Adicionar Pergunta
          </ButtonPrimary>
        </div>
      </div>
    </div>
  )
}