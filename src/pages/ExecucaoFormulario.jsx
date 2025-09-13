/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import rosaLogo from '../assets/logos/rosa-rfcc.png';
import { ButtonPrimary, ButtonPrimaryDropdown, IconButton, ButtonSecondary } from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";

export default function ExecucaoFormulario() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState({});

  const [respostas, setRespostas] = useState([]);
  const [formulario, setFormulario] = useState({
    titulo: "Anamnese Ginecológica",
    descricao: "Formulário padrão de anamnese ginecológica.",
    perguntas: [
      { id: 1, posicao: 0, enunciado: "Você já teve alguma infecção sexualmente transmissível?", tipo: "DICOTOMICA", alternativas: ["Sim", "Não"] },
      { id: 2, posicao: 1, enunciado: "Você já teve alguma infecção sexualmente transmissível?", tipo: "DICOTOMICA", alternativas: ["Sim", "Não"] },
      { id: 3, posicao: 2, enunciado: "Quantos parceiros sexuais você teve nos últimos 12 meses?", tipo: "TEXTUAL" },
      {
        id: 4, posicao: 3, enunciado: "Quais métodos contraceptivos você utiliza?", tipo: "MULTIPLA_ESCOLHA", alternativas: [
          { id: 1, texto: "Preservativo", posicao: 0 },
          { id: 2, texto: "Pílula", posicao: 1 },
          { id: 3, texto: "DIU", posicao: 2 },
          { id: 4, texto: "Implante", posicao: 3 },
          { id: 5, texto: "Outro", posicao: 4 }
        ]
      },
      {
        id: 5, posicao: 4, enunciado: "Com que frequência você realiza o exame preventivo?", tipo: "SELECAO_UNICA", alternativas: [
          { id: 1, texto: "Anualmente", posicao: 0 },
          { id: 2, texto: "A cada 2 anos", posicao: 1 },
          { id: 3, texto: "Nunca fiz", posicao: 2 }
        ]
      },
      {
        id: 6, posicao: 5, enunciado: "Quais métodos contraceptivos você utiliza?", tipo: "MULTIPLA_ESCOLHA", alternativas: [
          { id: 1, texto: "Preservativo", posicao: 0 },
          { id: 2, texto: "Pílula", posicao: 1 },
          { id: 3, texto: "DIU", posicao: 2 },
          { id: 4, texto: "Implante", posicao: 3 },
          { id: 5, texto: "Outro", posicao: 4 }
        ]
      },
      {
        id: 7, posicao: 6, enunciado: "Com que frequência você realiza o exame preventivo?", tipo: "SELECAO_UNICA", alternativas: [
          { id: 1, texto: "Anualmente", posicao: 0 },
          { id: 2, texto: "A cada 2 anos", posicao: 1 },
          { id: 3, texto: "Nunca fiz", posicao: 2 }
        ]
      },
    ]
  });

  // --- cancelar ---
  const onCancel = useCallback(() => {
    const hasChanges = formulario.titulo || formulario.descricao || formulario.perguntas.length > 0;

    if (hasChanges) {
      const confirmar = window.confirm('Tem certeza que deseja cancelar? Todas as alterações serão perdidas.');
      if (!confirmar) return;
    }

    navigate('/consultas');
  }, [formulario, navigate]);

  const onChangeInput = (e) => {
    const { perguntaId, texto } = e.target;
    setRespostas((prev) => ([
      ...prev.filter(r => r.perguntaId !== perguntaId),
      { perguntaId: perguntaId, texto: texto }
    ]));
  }

  const checkFormulario = () => {
    const newErros = {};

    formulario.perguntas.forEach((pergunta) => {
      const resposta = respostas.find(r => r.perguntaId === pergunta.id);
      if (!resposta || !resposta.texto || resposta.texto.trim() === '') {
        newErros[pergunta.id] = ['Este campo é obrigatório.'];
      }
    });

    setErros(newErros);
    return Object.keys(newErros).length === 0;
  }

  const onSave = useCallback(async () => {
    setErros({});

    if (!checkFormulario()) {
      toast.error('Corrija os erros antes de salvar.');
      return;
    }

    setLoading(true);

    try {
      // Simulação de chamada à API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Formulário salvo com sucesso!');
      navigate('/consultas');
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      toast.error('Erro ao salvar formulário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [formulario, navigate]);


  // --- UI render ---
  return (
    <div>
      <div
        className="
          flex flex-row justify-between items-center p-4
          border-b border-gray-300 shadow-md fixed bg-white w-full z-10"
      >
        <div className="flex flex-row gap-2">
          <img src={rosaLogo} alt="Logo Rosa RFCC" className="h-8 mr-4 self-center" />
        </div>
        <div className="flex flex-row gap-2">
          <ButtonSecondary
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </ButtonSecondary>
          <ButtonPrimary
            onClick={onSave}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </ButtonPrimary>
        </div>
      </div>

      <div className="pt-24 pb-4 px-80 bg-redfemVariantPink bg-opacity-10 min-h-screen">
        <div className="flex flex-col gap-4">
          <Card
            className={`${erros.length > 0 ? 'border border-red-500' : ''}`}
          >
            <div className="bg-redfemDarkPink w-full h-2 rounded-t-lg"></div>
            <div className="py-4 px-8">
              {erros.length > 0 && (
                <ul className="w-full flex flex-col mb-4">
                  {erros.map((erro, index) => (
                    <li key={index} className="text-red-500 text-sm">
                      • {erro}
                    </li>
                  ))}
                </ul>
              )}

              <p
                className="text-2xl mb-2"
              >
                {formulario.titulo}
              </p>
              <p>
                {formulario.descricao}
              </p>
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
                  <ul className="w-full flex flex-col mb-4">
                    {erros[pergunta.id].map((erro, erroIndex) => (
                      <li key={erroIndex} className="text-red-500 text-sm">
                        • {erro}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Enunciado e Select */}
                <div className="w-full">
                  <p
                    className="mb-4"
                  >
                    {pergunta.enunciado}
                  </p>

                  {pergunta.tipo === "TEXTUAL" && (
                    <textarea
                      className={`
                        border-b border-b-gray-950 placeholder:text-gray-500
                        p-1 w-full mb-4 outline-none
                        focus:border-b-redfemActionPink focus:border-b-2 focus:bg-redfemOffWhite
                        disabled:bg-gray-50`}
                      placeholder="Resposta..."
                      rows={1}
                      onChange={(e) => {
                        e.preventDefault();
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight + 8}px`;
                      }}
                    />
                  )}

                  {pergunta.tipo === "DICOTOMICA" && (
                    <div className={`flex flex-row gap-4 mb-2`}>
                      <div
                        className="hidden"
                      >
                        <input
                          type="radio"
                          name={`pergunta_${pergunta.id}`}
                          id={`pergunta_${pergunta.id}_sim`} />

                        <input
                          type="radio"
                          name={`pergunta_${pergunta.id}`}
                          id={`pergunta_${pergunta.id}_nao`} />
                      </div>

                      <button
                        className={`
                          w-full justify-center
                          px-4 py-2 h-fit rounded-md
                          text-white bg-redfemGray
                          flex gap-2 items-center`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.target.style.backgroundColor = '#ff2194';
                          document.getElementById(`pergunta_${pergunta.id}_sim`).checked = true;
                          document.getElementById(`pergunta_${pergunta.id}_nao_button`).style.backgroundColor = '#a3a3a3';
                        }}
                        id={`pergunta_${pergunta.id}_sim_button`}
                      >
                        Sim
                      </button>

                      <button
                        className={`
                          w-full justify-center
                          px-4 py-2 h-fit rounded-md
                          text-white bg-redfemGray
                          flex gap-2 items-center`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.target.style.backgroundColor = '#ff2194';
                          document.getElementById(`pergunta_${pergunta.id}_nao`).checked = true;
                          document.getElementById(`pergunta_${pergunta.id}_sim_button`).style.backgroundColor = '#a3a3a3';
                        }}
                        id={`pergunta_${pergunta.id}_nao_button`}
                      >
                        Não
                      </button>
                    </div>
                  )}

                  {(pergunta.tipo === "MULTIPLA_ESCOLHA" ||
                    pergunta.tipo === "SELECAO_UNICA") && (
                      <div className={`flex flex-col gap-2`}>
                        <div className="mb-2 pl-4">

                          {pergunta.alternativas.map((alternativa, altIndex) => (
                            <div className="flex flex-row gap-2" key={alternativa.id}>
                              <label>
                                <input
                                  className="focus:outline-2 focus:outline-red-500 mb-4"
                                  name={`pergunta_${pergunta.id}`}
                                  type={
                                    pergunta.tipo === "MULTIPLA_ESCOLHA" ?
                                      "checkbox" : "radio"
                                  }
                                />
                                <p className="inline ml-2">
                                  {alternativa.texto}
                                </p>
                              </label>
                            </div>
                          ))}

                        </div>
                      </div>
                    )}
                </div>

              </Card>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
