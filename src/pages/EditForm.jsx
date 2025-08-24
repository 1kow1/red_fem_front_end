import { ButtonPrimary, ButtonPrimaryDropdown, ButtonPrimaryIcon, ButtonSecondary } from "../components/Button";
import rosaLogo from '../assets/logos/rosa-rfcc.png';
import { MoveUpIcon, MoveDownIcon } from "../components/Icons";

function Headbar() {
  return <>
    <div className="flex flex-row justify-between items-center p-4 border-b border-gray-300
      shadow-md fixed bg-white w-full"
    >
      <div className="flex flex-row gap-2">
        <img src={rosaLogo} alt="" className="h-8 mr-4 self-center"/>
        <ButtonPrimaryDropdown>Exportar Dados</ButtonPrimaryDropdown>
        {/* <ButtonPrimaryIcon>Desfazer</ButtonPrimaryIcon>
        <ButtonPrimaryIcon>Refazer</ButtonPrimaryIcon> */}
      </div>
      <div className="flex flex-row gap-2">
        <ButtonSecondary>Cancelar</ButtonSecondary>
        <ButtonPrimary>Salvar</ButtonPrimary>
      </div>
    </div>
  </>
}

function Card({children, className}){
  return <>
    <div className={`border bg-white border-gray-300 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  </>
}

// Here the user will create a new form, just like Google Forms
export default function EditForm() {
  return (
    <div>
      <Headbar className="min-h-screen" />
      <div className="pt-24 pb-4 px-80 bg-redfemDarkWhite min-h-screen">
        <div className="flex flex-col gap-4">
          <Card>
            <div className="bg-redfemDarkPink w-full h-2 rounded-t-lg"></div>
            <div className="py-4 px-8">
              <input
                type="text"
                className="border-b border-b-gray-950 text-2xl
                placeholder:text-gray-500 p-1 w-full mb-4 outline-none"
                placeholder="Nome do formulário"
              />
              <input
                type="text"
                className="border-b border-b-gray-950
                placeholder:text-gray-400 p-1 w-full mb-4 outline-none"
                placeholder="Descrição do formulário"
              />
            </div>
          </Card>
          <Card className="py-4 px-8 flex flex-col items-center">
            <MoveUpIcon />
            <div className="w-full">adkasdsalçdasklças</div>
            <MoveDownIcon />
          </Card>
          <Card className="py-4 px-8">saldjksda</Card>
        </div>
      </div>
    </div>
  );
}
