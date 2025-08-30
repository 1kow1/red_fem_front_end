import Input from "./Input"
import { ButtonPrimary } from "./Button"

export function AnswerTexto({ className }) {
  return <>
    <Input
      type="text"
      className={`placeholder:text-gray-400 border-b-gray-400 ${className}`}
      placeholder="Resposta"
      disabled
    />
  </>
}

export function AnswerSimNao({ className }) {
  return <>
    <div className={`flex flex-row gap-4 mb-2 ${className}`}>
      <ButtonPrimary disabled className="w-full justify-center">Sim</ButtonPrimary>
      <ButtonPrimary disabled className="w-full justify-center">Não</ButtonPrimary>
    </div>
  </>
}

export function AnswerMultipla({ className, name }) {
  return <>
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="mb-2 pl-4">
        <div className="flex flex-row gap-2 items-center">
          <div><Input type="checkbox" name={name} disabled /></div>
          <Input type="text" placeholder="Opção 1" />
        </div>

        <div className="flex flex-row gap-2 items-center">
          <div><Input type="checkbox" name={name} disabled /></div>
          <Input type="text" placeholder="Opção 2" />
        </div>
      </div>
      <ButtonPrimary className="justify-center w-fit mx-auto mb-4">Adicionar Opção</ButtonPrimary>
    </div>
  </>
}

export function AnswerUnica({ className, name }) {
  return <>
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="mb-2 pl-4">
        <div className="flex flex-row gap-2 items-center">
          <div><Input type="radio" name={name} disabled /></div>
          <Input type="text" placeholder="Opção 1" />
        </div>

        <div className="flex flex-row gap-2 items-center">
          <div><Input type="radio" name={name} disabled /></div>
          <Input type="text" placeholder="Opção 2" />
        </div>
      </div>
      <ButtonPrimary className="justify-center w-fit mx-auto mb-4">Adicionar Opção</ButtonPrimary>
    </div>
  </>
}