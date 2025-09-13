/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import rosaLogo from '../assets/logos/rosa-rfcc.png';
import { ButtonPrimary, ButtonPrimaryDropdown, IconButton, ButtonSecondary } from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import { createExec, getExecById } from "../services/execAPI";
import { getFormById } from "../services/formAPI";

export default function ExecucaoFormulario() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState({});

  const [respostas, setRespostas] = useState([]);
  const [formulario, setFormulario] = useState({});

  const fetchFormulario = async () => {
    try {
      const response = await getFormById("68c0c499c53f79425367bf24");
      setFormulario(response);
      console.log(response);
    }
    catch (error) {
      console.error("Erro ao buscar formulário:", error);
      toast.error("Erro ao buscar formulário");
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('ExecucaoFormulario montado');
    fetchFormulario();
  }, []);

  // --- cancelar ---
  const onCancel = useCallback(() => {
    const hasChanges = formulario.titulo || formulario.descricao || formulario.perguntas.length > 0;

    if (hasChanges) {
      const confirmar = window.confirm('Tem certeza que deseja cancelar? Todas as alterações serão perdidas.');
      if (!confirmar) return;
    }

    navigate('/consultas');
  }, [formulario, navigate]);

  const onChangeInput = (value, perguntaId) => {
    console.log('onChangeInput chamado:', { value, perguntaId });
    console.log('Respostas antes:', respostas);

    setRespostas((prev) => {
      const novasRespostas = [
        ...prev.filter(r => r.perguntaId !== perguntaId),
        { perguntaId: perguntaId, texto: value }
      ];

      console.log('Novas respostas:', novasRespostas);
      return novasRespostas;
    });
  }

  const onChangeComAlternativas = (value, perguntaId, isMultiple = false) => {
    console.log('onChangeComAlternativas:', { value, perguntaId, isMultiple });

    setRespostas((prev) => {
      if (isMultiple) {
        // Para múltipla escolha, verifica se já existe uma resposta com o mesmo perguntaId e texto
        const existeResposta = prev.find(r => r.perguntaId === perguntaId && r.texto === value);

        if (existeResposta) {
          // Se existe, remove (desmarca)
          return prev.filter(r => !(r.perguntaId === perguntaId && r.texto === value));
        } else {
          // Se não existe, adiciona (marca)
          return [...prev, { perguntaId: perguntaId, texto: value }];
        }
      } else {
        // Para seleção única, remove todas as respostas da pergunta e adiciona a nova
        const filtered = prev.filter(r => r.perguntaId !== perguntaId);
        return [...filtered, { perguntaId: perguntaId, texto: value }];
      }
    });
  }

  // Função auxiliar para verificar se uma alternativa está selecionada
  const isAlternativaSelecionada = (perguntaId, textoAlternativa) => {
    return respostas.some(r => r.perguntaId === perguntaId && r.texto === textoAlternativa);
  }

  const checkFormulario = () => {
    const newErros = {};

    formulario.perguntas.forEach((pergunta) => {
      const respostasParaPergunta = respostas.filter(r => r.perguntaId === pergunta.id);

      if (pergunta.tipo === "MULTIPLA_ESCOLHA") {
        // Para múltipla escolha, verifica se há pelo menos uma resposta
        if (respostasParaPergunta.length === 0) {
          newErros[pergunta.id] = ['Este campo é obrigatório.'];
        }
      } else {
        // Para outros tipos, verifica se existe resposta e se não está vazia
        const resposta = respostasParaPergunta[0];
        if (!resposta || !resposta.texto || resposta.texto.trim() === '') {
          newErros[pergunta.id] = ['Este campo é obrigatório.'];
        }
      }
    });

    setErros(newErros);
    return Object.keys(newErros).length === 0;
  }

  const onSave = useCallback(async () => {
    setErros({});

    let data = {
      formularioId: formulario.id,
      idConsulta: "68c5b99ddd8cb9861815b698",
      paciente: {
        id: "68c0a50127da4c6557d60c7e"
      },
      usuarioDTO: {
        id: "68bf66718e169da24cd793df"
      },
      respostas: respostas
    }

    console.log('Dados enviados:', data);

    if (!checkFormulario()) {
      toast.error('Corrija os erros antes de salvar.');
      return;
    }

    setLoading(true);

    try {
      // Simulação de chamada à API
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      await createExec(data);
      toast.success('Formulário salvo com sucesso!');
      navigate('/consultas');
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      toast.error('Erro ao salvar formulário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [respostas, navigate]);


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

      <div className="pt-24 pb-4 px-80 max-[1200px]:px-20 bg-redfemVariantPink bg-opacity-10 min-h-screen">
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
            {formulario.perguntas && formulario.perguntas.map((pergunta, index) => (
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
                      value={respostas.find(r => r.perguntaId === pergunta.id)?.texto || ''}
                      onChange={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight + 8}px`;
                        onChangeInput(e.target.value, pergunta.id);
                      }}
                    />
                  )}

                  {pergunta.tipo === "DICOTOMICA" && (
                    <div className={`flex flex-row gap-4 mb-2`}>
                      <button
                        className={`
                          w-full justify-center px-4 py-2 h-fit rounded-md
                          text-white flex gap-2 items-center
                          ${respostas.find(r => r.perguntaId === pergunta.id)?.texto === "Sim"
                            ? 'bg-redfemActionPink' : 'bg-redfemGray'}
                          `}
                        onClick={(e) => {
                          e.preventDefault();
                          onChangeInput("Sim", pergunta.id);
                        }}
                      >
                        Sim
                      </button>

                      <button
                        className={`
                          w-full justify-center px-4 py-2 h-fit rounded-md
                          text-white flex gap-2 items-center
                          ${respostas.find(r => r.perguntaId === pergunta.id)?.texto === "Não"
                            ? 'bg-redfemActionPink' : 'bg-redfemGray'}
                        `}
                        onClick={(e) => {
                          e.preventDefault();
                          onChangeInput("Não", pergunta.id);
                        }}
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
                                  value={alternativa.texto}
                                  checked={
                                    pergunta.tipo === "MULTIPLA_ESCOLHA"
                                      ? isAlternativaSelecionada(pergunta.id, alternativa.texto)
                                      : respostas.find(r => r.perguntaId === pergunta.id)?.texto === alternativa.texto
                                  }
                                  onChange={(e) => {
                                    if (pergunta.tipo === "MULTIPLA_ESCOLHA") {
                                      onChangeComAlternativas(alternativa.texto, pergunta.id, true);
                                    } else {
                                      onChangeComAlternativas(alternativa.texto, pergunta.id);
                                    }
                                  }}
                                />
                                <p className="inline ml-2">
                                  {alternativa.texto}
                                </p>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }

                </div>

              </Card>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}