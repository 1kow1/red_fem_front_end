/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import rosaLogo from '../assets/logos/rosa-rfcc.png';
import { ButtonPrimary, ButtonPrimaryDropdown, IconButton, ButtonSecondary } from "../components/Button";
import SaveReleaseDropdown from "../components/SaveReleaseDropdown";
import Input from "../components/Input";
import Card from "../components/Card";
import { createExec, getExecById, updateExec, releaseExec } from "../services/execAPI";
import { getFormById } from "../services/formAPI";
import ModalRelatorio from "../components/ModalRelatorio";
import ConfirmationPopUp from "../components/ConfirmationPopUp";
import { generateCSVReport, generatePDFReport } from "../utils/reportUtils";
import HelpTooltip from "../components/HelpTooltip";
import ContextualHelpModal from "../components/ContextualHelpModal";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
export default function ExecucaoFormulario() {
  const navigate = useNavigate();
  const location = useLocation();
  const { execId } = useParams(); // ID da execução da URL
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState({});
  const [respostas, setRespostas] = useState([]);
  const [formulario, setFormulario] = useState({});
  const [execucaoData, setExecucaoData] = useState(null);
  const [isLiberado, setIsLiberado] = useState(false);

  // Estados para o modal de relatório
  const [isRelatorioModalOpen, setIsRelatorioModalOpen] = useState(false);
  const [pacienteData, setPacienteData] = useState(null);

  // Estados para o modal de confirmação de cancelamento
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  // Estado para o modal de ajuda
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const fetchExecucaoData = async () => {
    if (!execId) {
      toast.error("ID da execução não fornecido");
      navigate('/consultas');
      return;
    }
    setLoading(true);
    try {
      // Tentar obter especialidade dos dados do state como fallback
      const stateData = location.state?.execData;
      const especialidade = stateData?._exec?.usuarioDTO?.especialidade || stateData?.usuarioDTO?.especialidade;
      // Buscar dados da execução pela API
      const execResponse = await getExecById(execId);
      setExecucaoData(execResponse);
      // Verificar se a execução pode ser editada
      const execucaoLiberada = execResponse.isLiberado === true;

      // Verificar se a consulta está cancelada
      const consulta = execResponse.consultaDTO || execResponse.consulta;
      const consultaCancelada = consulta && (
        consulta.status === "CANCELADA" ||
        consulta.ativo === false
      );

      // A execução só pode ser editada se não estiver liberada E a consulta não estiver cancelada
      const podeEditar = !execucaoLiberada && !consultaCancelada;
      setIsLiberado(!podeEditar);

      // Mostrar mensagem se a consulta estiver cancelada
      if (consultaCancelada) {
        toast.warning("Esta execução está vinculada a uma consulta cancelada e não pode ser editada.");
      }
      // Buscar dados do formulário usando formularioId ou formulario.id
      const formularioId = execResponse.formularioId || execResponse.formulario?.id;
      if (formularioId) {
        try {
          const formResponse = await getFormById(formularioId);
          setFormulario(formResponse);
        } catch (formError) {
          console.error("Erro ao carregar formulário:", formError);
          toast.error(`Formulário não encontrado (ID: ${formularioId})`);
          // Não redirecionar, apenas mostrar mensagem
        }
      } else {
        console.warn("⚠️ Execução sem formulário associado");
        toast.warning("Esta execução não possui formulário associado");
        // Não redirecionar, mostrar estado vazio
      }
      // Carregar respostas existentes se houver
      if (execResponse.respostas && Array.isArray(execResponse.respostas)) {
        setRespostas(execResponse.respostas);
      }

      // Extrair dados do paciente para relatórios
      if (execResponse.consultaDTO || execResponse.consulta) {
        const consulta = execResponse.consultaDTO || execResponse.consulta;
        const paciente = consulta.pacienteDTO || consulta.paciente;
        if (paciente) {
          setPacienteData({
            ...paciente,
            consultas: [consulta] // Consulta atual
          });
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados da execução:", error);
      toast.error("Erro ao carregar execução do formulário");
      // Tentar usar dados do state como fallback
      const stateData = location.state?.execData;
      if (stateData) {
        setExecucaoData(stateData);
        if (stateData.formulario?.id) {
          try {
            const formResponse = await getFormById(stateData.formulario.id);
            setFormulario(formResponse);
          } catch (formError) {
            console.error("Erro ao buscar formulário:", formError);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchExecucaoData();
  }, [execId]);
  // --- cancelar ---
  const onCancel = useCallback(() => {
    // Se a execução está liberada, não há alterações possíveis, navegar diretamente
    if (isLiberado) {
      const returnPath = location.state?.returnPath || '/consultas';
      navigate(returnPath);
      return;
    }

    // Para execuções não liberadas, verificar se há alterações
    const hasChanges = respostas.length > 0;
    if (hasChanges) {
      setIsConfirmCancelOpen(true);
    } else {
      // Se não há alterações, navegar diretamente
      const returnPath = location.state?.returnPath || '/consultas';
      navigate(returnPath);
    }
  }, [respostas, location.state, navigate, isLiberado]);

  // Função para confirmar o cancelamento
  const handleConfirmCancel = useCallback(() => {
    const returnPath = location.state?.returnPath || '/consultas';
    navigate(returnPath);
    setIsConfirmCancelOpen(false);
  }, [location.state, navigate]);
  const onChangeInput = (value, perguntaId) => {
    setRespostas((prev) => {
      const novasRespostas = [
        ...prev.filter(r => r.perguntaId !== perguntaId),
        { perguntaId: perguntaId, texto: value }
      ];
      return novasRespostas;
    });
  }
  const onChangeComAlternativas = (value, perguntaId, isMultiple = false) => {
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
      // Só valida campos obrigatórios
      // Se o campo obrigatorio não estiver definido, assume que é obrigatório (padrão seguro)
      if (pergunta.obrigatorio === false) {
        return; // Pula campos explicitamente marcados como não obrigatórios
      }
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
    const resultado = Object.keys(newErros).length === 0;
    return resultado;
  }
  // Função para verificar se o formulário está completamente preenchido
  // Esta função verifica se TODOS os campos obrigatórios estão preenchidos
  const isFormularioCompleto = () => {
    if (!formulario.perguntas || formulario.perguntas.length === 0) {
      return false;
    }
    const resultado = formulario.perguntas.every((pergunta) => {
      // Só valida campos obrigatórios
      // Se o campo obrigatorio não estiver definido, assume que é obrigatório (padrão seguro)
      if (pergunta.obrigatorio === false) {
        return true; // Campos explicitamente marcados como não obrigatórios passam
      }
      const respostasParaPergunta = respostas.filter(r => r.perguntaId === pergunta.id);
      if (pergunta.tipo === "MULTIPLA_ESCOLHA") {
        const temResposta = respostasParaPergunta.length > 0;
        return temResposta;
      } else {
        const resposta = respostasParaPergunta[0];
        const temRespostaValida = resposta && resposta.texto && resposta.texto.trim() !== '';
        return temRespostaValida;
      }
    });
    return resultado;
  }
  // Função para verificar se há algum progresso no formulário
  const hasFormProgress = () => {
    return respostas.length > 0 && respostas.some(r => r.texto && r.texto.trim() !== '');
  }
  const onSave = useCallback(async () => {
    setErros({});
    // Validações antes de salvar
    if (!formulario.id) {
      toast.error('Formulário não carregado. Tente recarregar a página.');
      return;
    }
    if (!execucaoData) {
      toast.error('Dados da execução não carregados. Tente recarregar a página.');
      return;
    }
    // Validation: All mandatory fields must be filled before saving
    const checkResult = checkFormulario();
    if (!checkResult) {
      toast.error('Todos os campos obrigatórios devem ser preenchidos antes de salvar.');
      return;
    }
    // Construir dados com formulário completo e dados dinâmicos da execução
    // Tentar obter idConsulta de várias fontes
    const idConsulta = execucaoData.idConsulta ||
                       execucaoData.consulta?.id ||
                       location.state?.execData?.idConsulta ||
                       location.state?.execData?.consulta?.id ||
                       location.state?.idConsulta;
    if (!idConsulta) {
      console.error("❌ ID da consulta não encontrado em nenhuma fonte");
      toast.error('ID da consulta não encontrado. Não é possível salvar.');
      return;
    }
    let data = {
      formularioId: formulario.id,
      formulario: formulario, // Incluir objeto completo do formulário
      idConsulta: idConsulta,
      paciente: execucaoData.paciente || (execucaoData.pacienteId ? {
        id: execucaoData.pacienteId
      } : null),
      usuarioDTO: execucaoData.usuarioDTO || (execucaoData.usuarioId ? {
        id: execucaoData.usuarioId
      } : null),
      respostas: respostas,
      preenchimentoCompleto: isFormularioCompleto() // Baseado no preenchimento real
    }
    // Remover campos null/undefined
    Object.keys(data).forEach(key => {
      if (data[key] === null || data[key] === undefined) {
        delete data[key];
      }
    });
    setLoading(true);
    try {
      await updateExec(execId, data);
      // Feedback diferenciado baseado no progresso
      if (isFormularioCompleto()) {
        toast.success('Formulário salvo com todos os campos preenchidos!');
      } else {
        toast.success('Progresso salvo com sucesso! Você pode continuar preenchendo depois.');
      }
      navigate('/consultas');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar formulário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [formulario, execucaoData, respostas, execId, navigate]);
  const onSaveAndRelease = useCallback(async () => {
    setErros({});
    // Validações antes de salvar e liberar
    if (!formulario.id) {
      toast.error('Formulário não carregado. Tente recarregar a página.');
      return;
    }
    if (!execucaoData) {
      toast.error('Dados da execução não carregados. Tente recarregar a página.');
      return;
    }
    // Para salvar e liberar, todos os campos obrigatórios devem estar preenchidos
    const checkResult = checkFormulario();
    if (!checkResult) {
      toast.error('Todos os campos obrigatórios devem ser preenchidos antes de liberar.');
      return;
    }
    // Construir dados com preenchimentoCompleto = true para liberação
    const idConsulta = execucaoData.idConsulta ||
                       execucaoData.consulta?.id ||
                       location.state?.execData?.idConsulta ||
                       location.state?.execData?.consulta?.id ||
                       location.state?.idConsulta;
    if (!idConsulta) {
      console.error("❌ ID da consulta não encontrado em nenhuma fonte");
      toast.error('ID da consulta não encontrado. Não é possível salvar.');
      return;
    }
    // Verificar se o formulário está realmente completo antes de tentar liberar
    const formularioCompleto = isFormularioCompleto();
    if (!formularioCompleto) {
      toast.error('Todos os campos obrigatórios devem ser preenchidos antes de liberar o formulário');
      return;
    }
    let data = {
      formularioId: formulario.id,
      formulario: formulario,
      idConsulta: idConsulta,
      paciente: execucaoData.paciente || (execucaoData.pacienteId ? {
        id: execucaoData.pacienteId
      } : null),
      usuarioDTO: execucaoData.usuarioDTO || (execucaoData.usuarioId ? {
        id: execucaoData.usuarioId
      } : null),
      respostas: respostas,
      preenchimentoCompleto: formularioCompleto // IMPORTANTE: Baseado na validação real
    }
    // Remover campos null/undefined
    Object.keys(data).forEach(key => {
      if (data[key] === null || data[key] === undefined) {
        delete data[key];
      }
    });
    setLoading(true);
    try {
      // Primeiro, atualizar a execução marcando como completa
      const updateResponse = await updateExec(execId, data);
      // Adicionar delay para garantir que o backend processou a atualização
      await new Promise(resolve => setTimeout(resolve, 500));
      // Verificar se a atualização foi realmente processada
      const verifyResponse = await getExecById(execId);
      if (!verifyResponse.preenchimentoCompleto) {
        // Não fazemos throw, vamos tentar o releaseExec mesmo assim
      }
      // Agora, liberar a execução (isso deve definir liberadoPeloSistema: true)
      const releaseResponse = await releaseExec(execId);
      // Verificar novamente o estado após liberação
      const finalState = await getExecById(execId);
      // Verificar se a resposta indica que foi liberado com sucesso
      if (releaseResponse && (releaseResponse.liberadoPeloSistema === true || releaseResponse.isLiberado === true)) {
      } else {
        // Recarregar dados da execução para verificar o estado final
        try {
          const finalState = await getExecById(execId);
        } catch (checkError) {
          console.error("❌ Erro ao verificar estado final:", checkError);
        }
      }
      toast.success('Formulário salvo e liberado com sucesso!');
      navigate('/consultas');
    } catch (error) {
      console.error('❌ Erro ao salvar e liberar:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      // Tratamento de erros específicos baseado na documentação
      if (error.message.includes('not completely filled')) {
        toast.error('Todos os campos obrigatórios devem ser preenchidos antes de liberar o formulário');
      } else if (error.message.includes('permission') || error.message.includes('especialidade')) {
        toast.error('Você não tem permissão para liberar este formulário');
      } else if (error.message.includes('not found')) {
        toast.error('Execução de formulário não encontrada');
      } else {
        toast.error('Erro ao salvar e liberar formulário. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }, [formulario, execucaoData, respostas, execId, navigate, location.state, checkFormulario]);

  // Função para gerar relatório CSV
  const handleGerarCSV = useCallback(async () => {
    if (!pacienteData) {
      toast.error('Dados do paciente não disponíveis para gerar relatório');
      return;
    }

    try {
      await generateCSVReport(pacienteData, pacienteData.consultas || []);
      toast.success('Relatório CSV gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relatório CSV');
    }
  }, [pacienteData]);

  // Função para gerar relatório PDF
  const handleGerarPDF = useCallback(async () => {
    if (!pacienteData) {
      toast.error('Dados do paciente não disponíveis para gerar relatório');
      return;
    }

    try {
      await generatePDFReport(pacienteData, pacienteData.consultas || []);
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relatório PDF');
    }
  }, [pacienteData]);

  // Atalho F1 para ajuda contextual
  useKeyboardShortcut('F1', () => {
    setIsHelpModalOpen(true);
  });

  // --- UI render ---
  return (
    <div>
      <ContextualHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        context="execucao-formulario"
      />

      <div
        className="
          flex flex-row justify-between items-center p-4
          border-b border-gray-300 shadow-md fixed bg-white w-full z-10"
      >
        <div className="flex flex-row gap-2 items-center">
          <img src={rosaLogo} alt="Logo Rosa RFCC" className="h-8 mr-4 self-center" />

          <div className="flex items-center gap-3 ml-2">
            <HelpTooltip
              title="Ajuda Rápida"
              content="<strong>Salvar:</strong> Mantém progresso (editável)<br/><strong>Liberar:</strong> Finaliza formulário (permanente)<br/><strong>F1:</strong> Abrir ajuda completa<br/><br/>⚠️ Formulários são liberados automaticamente à meia-noite"
              position="bottom"
              maxWidth={380}
            />
            {isLiberado && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-300 rounded-md text-sm text-blue-800">
                <span className="font-semibold">🔒 Somente Leitura:</span>
                <span>Formulário liberado</span>
              </div>
            )}
          </div>

          {/* Botão de relatório - só aparece quando formulário está liberado */}
          {isLiberado && pacienteData && (
            <ButtonPrimaryDropdown
              options={[
                {
                  label: 'Exportar CSV',
                  onClick: handleGerarCSV
                },
                {
                  label: 'Exportar PDF',
                  onClick: handleGerarPDF
                }
              ]}
            >
              Gerar Relatório
            </ButtonPrimaryDropdown>
          )}
        </div>
        <div className="flex flex-row gap-2">
          <ButtonSecondary
            onClick={onCancel}
            disabled={loading}
          >
            Voltar
          </ButtonSecondary>
          <SaveReleaseDropdown
            onSave={onSave}
            onSaveAndRelease={onSaveAndRelease}
            disabled={loading || !isFormularioCompleto()}
            loading={loading}
            isReleased={isLiberado}
          />
        </div>
      </div>
      <div className="pt-24 pb-4 px-80 max-[1200px]:px-20 bg-redfemVariantPink bg-opacity-10 min-h-screen">
        <div className="flex flex-col gap-4">
          {/* Card com dados do paciente */}
          {pacienteData && (
            <Card className="bg-white border-l-4 border-l-redfemPink">
              <div className="py-3 px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-redfemDarkPink">👤</span>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Dados do Paciente</h3>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3">
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Nome:</span>
                    <p className="text-sm font-medium text-gray-900">{pacienteData.nome}</p>
                  </div>
                  {pacienteData.cpf && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">CPF:</span>
                      <p className="text-sm font-medium text-gray-900">{pacienteData.cpf}</p>
                    </div>
                  )}
                  {pacienteData._dataDeNascimento && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Data de Nascimento:</span>
                      <p className="text-sm font-medium text-gray-900">{pacienteData._dataDeNascimento}</p>
                    </div>
                  )}
                  {pacienteData.telefone && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Telefone:</span>
                      <p className="text-sm font-medium text-gray-900">{pacienteData.telefone}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

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
                {formulario.titulo || "Formulário não associado"}
              </p>
              <p>
                {formulario.descricao || ""}
              </p>
              {!formulario.titulo && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Esta execução foi criada sem um formulário associado.
                    Não é possível responder perguntas neste estado.
                  </p>
                </div>
              )}
              {isLiberado && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-blue-800 text-sm">
                    Este formulário foi liberado e não pode mais ser editado.
                    Você pode visualizar as respostas, mas não fazer alterações.
                  </p>
                </div>
              )}
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
                        disabled:bg-gray-50 disabled:cursor-not-allowed`}
                      placeholder={isLiberado ? "Não editável" : "Resposta..."}
                      rows={1}
                      disabled={isLiberado}
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
                          ${isLiberado ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        disabled={isLiberado}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!isLiberado) onChangeInput("Sim", pergunta.id);
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
                          ${isLiberado ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        disabled={isLiberado}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!isLiberado) onChangeInput("Não", pergunta.id);
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
                              <label className={isLiberado ? 'opacity-50 cursor-not-allowed' : ''}>
                                <input
                                  className="focus:outline-2 focus:outline-red-500 mb-4"
                                  name={`pergunta_${pergunta.id}`}
                                  type={
                                    pergunta.tipo === "MULTIPLA_ESCOLHA" ?
                                      "checkbox" : "radio"
                                  }
                                  value={alternativa.texto}
                                  disabled={isLiberado}
                                  checked={
                                    pergunta.tipo === "MULTIPLA_ESCOLHA"
                                      ? isAlternativaSelecionada(pergunta.id, alternativa.texto)
                                      : respostas.find(r => r.perguntaId === pergunta.id)?.texto === alternativa.texto
                                  }
                                  onChange={(e) => {
                                    if (!isLiberado) {
                                      if (pergunta.tipo === "MULTIPLA_ESCOLHA") {
                                        onChangeComAlternativas(alternativa.texto, pergunta.id, true);
                                      } else {
                                        onChangeComAlternativas(alternativa.texto, pergunta.id);
                                      }
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

      {/* Modal de confirmação para cancelar/descartar alterações */}
      <ConfirmationPopUp
        isOpen={isConfirmCancelOpen}
        message="Tem certeza que deseja sair? Todas as alterações não salvas serão perdidas."
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsConfirmCancelOpen(false)}
      />
    </div>
  )
}