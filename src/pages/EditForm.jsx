/* eslint-disable no-unused-vars */
import { ButtonPrimary, ButtonPrimaryDropdown, IconButton, ButtonSecondary } from "../components/Button";
import rosaLogo from '../assets/logos/rosa-rfcc.png';
import { MoveUpIcon, MoveDownIcon, AddIcon, DeleteIcon } from "../components/Icons";
import Input from "../components/Input";
import { useState } from "react";
import { AnswerTexto, AnswerSimNao, AnswerMultipla, AnswerUnica } from "../components/Answer";

function Headbar({ onSave }) {
  return <>
    <div className="flex flex-row justify-between items-center p-4 border-b border-gray-300
      shadow-md fixed bg-white w-full"
    >
      <div className="flex flex-row gap-2">
        <img src={rosaLogo} alt="" className="h-8 mr-4 self-center" />
        <ButtonPrimaryDropdown>Exportar Dados</ButtonPrimaryDropdown>
        {/* <IconButton>Desfazer</IconButton>
        <IconButton>Refazer</IconButton> */}
      </div>
      <div className="flex flex-row gap-2">
        <ButtonSecondary>Cancelar</ButtonSecondary>
        <ButtonPrimary onClick={onSave}>Salvar</ButtonPrimary>
      </div>
    </div>
  </>
}

function Card({ children, className }) {
  return <>
    <div className={`border bg-white border-gray-300 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  </>
}

function Question({ className, tipo, onDelete, onMoveUp, onMoveDown }) {
  const [questionType, setQuestionType] = useState(tipo || "Textual");

  return <>
    <Card className={`py-4 px-8 flex flex-col items-center ${className}`}>
      <IconButton onClick={onMoveUp}>
        <MoveUpIcon className="text-redfemActionPink hover:text-redfemDarkPink" />
      </IconButton>

      <div className="w-full mb-4">
        <div className="flex flex-row gap-5">
          <Input type="text" placeholder="Pergunta" />
          <select
            className="
              p-1 w-96 mb-4
              border-b border-b-gray-950
              focus:border-b-redfemActionPink focus:border-b-2
              outline-none cursor-pointer custom-select"
            value={questionType || "Textual"}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <option value="Textual">Texto</option>
            <option value="Dicotomica">Sim ou Não</option>
            <option value="Multipla_Escolha">Múltipla Escolha</option>
            <option value="Selecao_Unica">Seleção Única</option>
          </select>
        </div>

        {questionType === "Textual" && <AnswerTexto />}
        {questionType === "Dicotomica" && <AnswerSimNao />}
        {questionType === "Multipla_Escolha" && <AnswerMultipla name="multipla" />}
        {questionType === "Selecao_Unica" && <AnswerUnica name="unica" />}
      </div>

      <div className="w-full h-0 flex justify-end">
        <IconButton onClick={onDelete}>
          <DeleteIcon className="hover:text-redfemActionPink text-gray-800" />
        </IconButton>
      </div>

      <IconButton onClick={onMoveDown}>
        <MoveDownIcon className="text-redfemActionPink hover:text-redfemDarkPink" />
      </IconButton>
    </Card>
  </>
}

export default function EditForm() {
  const [formulario, setFormulario] = useState({ perguntas: [] })
  const [formularioVersaoAnteriorId, setFormularioVersaoAnteriorId] = useState(null)
  const [numQuestions, setNumQuestions] = useState(0)
  const [titulo, setTitulo] = useState(formulario.titulo || "")
  const [descricao, setDescricao] = useState(formulario.descricao || "")

  const onSave = () => {
    console.log(formulario)


  }

  const reorderPerguntas = (newPerguntas) => {
    const sortedIds = Object.keys(newPerguntas).sort((a, b) => newPerguntas[a].posicao - newPerguntas[b].posicao);
    sortedIds.forEach((id, idx) => {
      newPerguntas[id].posicao = idx;
    });

    setFormulario({
      ...formulario,
      perguntas: newPerguntas
    });
  };

  const onDelete = (id) => {
    const newPerguntas = { ...formulario.perguntas }
    delete newPerguntas[id]

    reorderPerguntas(newPerguntas)

    setNumQuestions(numQuestions - 1)
  }

  const onMoveUp = (id) => {
    const newPerguntas = { ...formulario.perguntas }
    const currentPos = newPerguntas[id].posicao

    if (currentPos > 0) {
      const previousPos = Object.keys(newPerguntas).find(key => newPerguntas[key].posicao === currentPos - 1)

      newPerguntas[id].posicao = currentPos - 1
      newPerguntas[previousPos].posicao = currentPos

      reorderPerguntas(newPerguntas)
    }
  }

  const onMoveDown = (id) => {
    const newPerguntas = { ...formulario.perguntas }
    const currentPos = newPerguntas[id].posicao

    const nextPos = Object.keys(newPerguntas).find(key => newPerguntas[key].posicao === currentPos + 1)

    if (nextPos) {
      newPerguntas[id].posicao = currentPos + 1
      newPerguntas[nextPos].posicao = currentPos

      reorderPerguntas(newPerguntas)
    }
  }

  return (
    <div>
      <Headbar className="min-h-screen" onSave={onSave} />
      <div className="pt-24 pb-4 px-80 bg-redfemVariantPink bg-opacity-10 min-h-screen">
        <div className="flex flex-col gap-4">
          <Card>
            <div className="bg-redfemDarkPink w-full h-2 rounded-t-lg"></div>
            <div className="py-4 px-8">
              <Input
                type="text"
                className="text-2xl"
                placeholder="Nome do formulário"
                onChange={(e) => setTitulo(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Descrição do formulário"
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            {Object.entries(formulario.perguntas)
              .sort(([, a], [, b]) => a.posicao - b.posicao)
              .map(([id]) => (
                <Question
                  key={id}
                  type={formulario.perguntas[id].tipo}
                  onDelete={() => onDelete(id)}
                  onMoveUp={() => onMoveUp(id)}
                  onMoveDown={() => onMoveDown(id)}
                />
              ))}
          </div>

          <ButtonPrimary
            className={"justify-center w-fit m-auto mt-4"}
            onClick={() => {
              setFormulario({
                ...formulario,
                perguntas: {
                  ...formulario.perguntas,
                  [Date.now()]: {
                    tipo: "Textual",
                    posicao: numQuestions
                  }
                }
              })
              setNumQuestions(numQuestions + 1)
            }
            }
          >
            <AddIcon />
            Adicionar Pergunta
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
