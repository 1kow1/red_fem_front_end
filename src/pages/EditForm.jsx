import { ButtonPrimary, ButtonPrimaryDropdown, IconButton, ButtonSecondary } from "../components/Button";
import rosaLogo from '../assets/logos/rosa-rfcc.png';
import { MoveUpIcon, MoveDownIcon, AddIcon, DeleteIcon } from "../components/Icons";
import Input from "../components/Input";
import { useState } from "react";
import { AnswerTexto, AnswerSimNao, AnswerMultipla, AnswerUnica } from "../components/Answer";

function Headbar() {
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
        <ButtonPrimary>Salvar</ButtonPrimary>
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

function Question({ className }) {
  const [questionType, setQuestionType] = useState("texto");
  return <>
    <Card className={`py-4 px-8 flex flex-col items-center ${className}`}>
      <IconButton>
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
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <option value="texto">Texto</option>
            <option value="sim_nao">Sim ou Não</option>
            <option value="multipla_escolha">Múltipla Escolha</option>
            <option value="selecao_unica">Seleção Única</option>
          </select>
        </div>

        {questionType === "texto" && <AnswerTexto />}
        {questionType === "sim_nao" && <AnswerSimNao />}
        {questionType === "multipla_escolha" && <AnswerMultipla name="multipla" />}
        {questionType === "selecao_unica" && <AnswerUnica name="unica" />}
      </div>

      <div className="w-full h-0 flex justify-end">
        <IconButton>
          <DeleteIcon className="hover:text-redfemActionPink text-gray-800" />
        </IconButton>
      </div>

      <IconButton>
        <MoveDownIcon className="text-redfemActionPink hover:text-redfemDarkPink" />
      </IconButton>
    </Card>
  </>
}

export default function EditForm() {
  return (
    <div>
      <Headbar className="min-h-screen" />
      <div className="pt-24 pb-4 px-80 bg-redfemVariantPink bg-opacity-10 min-h-screen">
        <div className="flex flex-col gap-4">
          <Card>
            <div className="bg-redfemDarkPink w-full h-2 rounded-t-lg"></div>
            <div className="py-4 px-8">
              <Input
                type="text"
                className="text-2xl"
                placeholder="Nome do formulário"
              />
              <Input
                type="text"
                placeholder="Descrição do formulário"
              />
            </div>
          </Card>

          <Question>sasfds</Question>
          <Question>dsadas</Question>

          <ButtonPrimary className={"justify-center w-fit m-auto mt-4"}>
            <AddIcon />
            Adicionar Pergunta
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
