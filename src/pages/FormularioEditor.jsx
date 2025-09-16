/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import rosaLogo from '../assets/logos/rosa-rfcc.png';
import { ButtonPrimary, ButtonPrimaryDropdown, IconButton, ButtonSecondary } from "../components/Button";
import SaveReleaseDropdown from "../components/SaveReleaseDropdown";
import { XIcon, MoveUpIcon, MoveDownIcon, AddIcon, DeleteIcon } from "../components/Icons";
import { Undo2, Redo2 } from "lucide-react";
import Input from "../components/Input";
import { createForm, releaseFormForUse } from "../services/formAPI";
import Card from "../components/Card";
import ConfirmationPopUp from "../components/ConfirmationPopUp";
import { useAuth } from '../contexts/auth/useAuth';
import { canUseComponent } from '../utils/permissions';

export default function FormularioEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const formDataToEdit = location.state?.formData;
  const isEditMode = Boolean(formDataToEdit);
  const isViewOnly = isEditMode && formDataToEdit?.ativo === false;

  const [isConfirmOpenFormulario, setIsConfirmOpenFormulario] = useState(false);
  const [isConfirmOpenPergunta, setIsConfirmOpenPergunta] = useState(false);
  const [perguntaIdToDelete, setPerguntaIdToDelete] = useState(null);

  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState({});
  const [errosGeral, setErrosGeral] = useState([]);
  const [formulario, setFormulario] = useState({
    titulo: "",
    descricao: "",
    perguntas: []
  });

  // Snapshot das perguntas originais (id -> normalized JSON)
  const originalPerguntasRef = useRef({});

  // Estados para Undo/Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoOperation = useRef(false);

  const tiposPergunta = [
    { value: 'TEXTUAL', label: 'Texto' },
    { value: 'DICOTOMICA', label: 'Sim/Não' },
    { value: 'MULTIPLA_ESCOLHA', label: 'Múltipla Escolha' },
    { value: 'SELECAO_UNICA', label: 'Seleção Única' }
  ];

  // --- Helpers para normalizar/compare ---
  function normalizePerguntaForCompare(pergunta) {
    const enunciado = (pergunta.enunciado || '').trim();
    const tipo = pergunta.tipo || '';
    const alternativas = (pergunta.alternativas || [])
      .map(a => ({ texto: (a.texto || '').trim() }));
    return JSON.stringify({ enunciado, tipo, alternativas });
  }

  function isPerguntaEdited(pergunta) {
    // New IDs start with 'new-' => considered edited
    if (String(pergunta.id).startsWith('new-')) return true;
    const orig = originalPerguntasRef.current[pergunta.id];
    if (!orig) return true; // não existe snapshot -> é nova ou mudou id
    const atual = normalizePerguntaForCompare(pergunta);
    return atual !== orig;
  }

  // --- Funções de Undo/Redo ---
  const saveStateToHistory = useCallback((newFormulario) => {
    if (isUndoRedoOperation.current) return; // Não salvar durante undo/redo

    // Usar setTimeout para garantir que a operação seja executada após o state update
    setTimeout(() => {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        const serializedState = JSON.parse(JSON.stringify(newFormulario));

        // Evitar duplicatas - verificar se o último estado é igual ao novo
        if (newHistory.length > 0) {
          const lastState = newHistory[newHistory.length - 1];
          if (JSON.stringify(lastState) === JSON.stringify(serializedState)) {
            return prev; // Não adicionar se for igual ao último
          }
        }

        newHistory.push(serializedState);

        // Limitar o histórico a 50 estados
        if (newHistory.length > 50) {
          newHistory.shift();
          return newHistory;
        }
        return newHistory;
      });

      setHistoryIndex(prev => Math.min(prev + 1, 49));
    }, 0);
  }, [historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (!canUndo) return;

    isUndoRedoOperation.current = true;
    const previousState = history[historyIndex - 1];
    setFormulario(previousState);
    setHistoryIndex(prev => prev - 1);

    setTimeout(() => {
      isUndoRedoOperation.current = false;
    }, 100);
  }, [canUndo, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;

    isUndoRedoOperation.current = true;
    const nextState = history[historyIndex + 1];
    setFormulario(nextState);
    setHistoryIndex(prev => prev + 1);

    setTimeout(() => {
      isUndoRedoOperation.current = false;
    }, 100);
  }, [canRedo, history, historyIndex]);

  // --- Inicializa formulário em modo edição ---
  useEffect(() => {
    if (formDataToEdit) {
      // Validação de segurança dos dados recebidos
      if (!formDataToEdit.id) {
        toast.error('Erro: formulário inválido para edição.');
        navigate('/formularios');
        return;
      }

      const perguntasOriginais = (formDataToEdit.perguntas || []).map(p => {
        return {
          id: p.id ?? `orig-${Date.now()}-${Math.random()}`,
          enunciado: p.enunciado ?? '',
          tipo: p.tipo ?? 'TEXTUAL',
          alternativas: (p.alternativas || []).map(a => ({ ...a })),
          // usaremos isNova:false pois são versões salvas
          isNova: false
        };
      });

      // Preencher snapshot (id -> normalized)
      const map = {};
      perguntasOriginais.forEach(p => {
        map[p.id] = normalizePerguntaForCompare(p);
      });
      originalPerguntasRef.current = map;

      const initialFormulario = {
        titulo: formDataToEdit.titulo || "",
        descricao: formDataToEdit.descricao || "",
        especialidade: formDataToEdit.especialidade,
        perguntas: perguntasOriginais
      };

      setFormulario(initialFormulario);

      // Salvar estado inicial no histórico
      setHistory([JSON.parse(JSON.stringify(initialFormulario))]);
      setHistoryIndex(0);
    }
  }, [formDataToEdit, navigate]);

  // Salvar estado inicial para novos formulários
  useEffect(() => {
    if (!isEditMode && formulario.titulo === "" && formulario.descricao === "" && formulario.perguntas.length === 0 && history.length === 0) {
      const initialFormulario = {
        titulo: "",
        descricao: "",
        perguntas: []
      };
      setHistory([JSON.parse(JSON.stringify(initialFormulario))]);
      setHistoryIndex(0);
    }
  }, [isEditMode, formulario.titulo, formulario.descricao, formulario.perguntas.length, history.length]);

  // --- campos simples ---
  const setTitulo = useCallback((value) => {
    const newFormulario = {
      ...formulario,
      titulo: value
    };
    setFormulario(newFormulario);
    saveStateToHistory(newFormulario);

    if (value.trim() && errosGeral.some(erro => erro.includes('Título'))) {
      setErrosGeral(prev => prev.filter(erro => !erro.includes('Título')));
    }
  }, [formulario, errosGeral, saveStateToHistory]);

  const setDescricao = useCallback((value) => {
    const newFormulario = {
      ...formulario,
      descricao: value
    };
    setFormulario(newFormulario);
    saveStateToHistory(newFormulario);
  }, [formulario, saveStateToHistory]);

  // --- adicionar pergunta (nova) ---
  const onAddPergunta = useCallback(() => {
    const novaPergunta = {
      id: `new-${Date.now()}-${Math.random()}`,
      enunciado: '',
      tipo: 'TEXTUAL',
      alternativas: [],
      isNova: true
    };

    const newFormulario = {
      ...formulario,
      perguntas: [...formulario.perguntas, novaPergunta]
    };

    setFormulario(newFormulario);
    saveStateToHistory(newFormulario);

    if (errosGeral.some(erro => erro.includes('pelo menos uma pergunta'))) {
      setErrosGeral(prev => prev.filter(erro => !erro.includes('pelo menos uma pergunta')));
    }
  }, [formulario, errosGeral, saveStateToHistory]);

  // --- deletar pergunta ---
  const onDeletePergunta = useCallback((perguntaId) => {
    setIsConfirmOpenPergunta(true);
    setPerguntaIdToDelete(perguntaId);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    const newFormulario = {
      ...formulario,
      perguntas: formulario.perguntas.filter(pergunta => pergunta.id !== perguntaIdToDelete)
    };

    setFormulario(newFormulario);
    saveStateToHistory(newFormulario);

    setErros(prevErros => {
      const novosErros = { ...prevErros };
      delete novosErros[perguntaIdToDelete];
      return novosErros;
    });

    // também remover snapshot caso exista
    if (originalPerguntasRef.current[perguntaIdToDelete]) {
      const copy = { ...originalPerguntasRef.current };
      delete copy[perguntaIdToDelete];
      originalPerguntasRef.current = copy;
    }

    setIsConfirmOpenPergunta(false);
    setPerguntaIdToDelete(null);
  }, [formulario, perguntaIdToDelete, saveStateToHistory]);

  // --- mudanças em uma pergunta ---
  const onChangePergunta = useCallback((perguntaId, campo, valor) => {
    setErros(prevErros => {
      const novosErros = { ...prevErros };
      delete novosErros[perguntaId];
      return novosErros;
    });

    setFormulario(prev => {
      const novas = prev.perguntas.map(pergunta => {
        if (pergunta.id !== perguntaId) return pergunta;
        const updated = { ...pergunta, [campo]: valor };
        // recalcula isNova: se já era nova mantém true, senão compara com snapshot
        const edited = isPerguntaEdited(updated);
        return { ...updated, isNova: pergunta.isNova || edited };
      });
      return { ...prev, perguntas: novas };
    });
  }, []);

  // --- mover para cima ---
  const onMoveUp = useCallback((index) => {
    setFormulario(prev => {
      const novasPerguntas = [...prev.perguntas];
      const novoIndex = index - 1;
      if (novoIndex >= 0) {
        [novasPerguntas[index], novasPerguntas[novoIndex]] = [novasPerguntas[novoIndex], novasPerguntas[index]];
      }
      return { ...prev, perguntas: novasPerguntas };
    });
  }, []);

  // --- mover para baixo ---
  const onMoveDown = useCallback((index) => {
    setFormulario(prev => {
      const novasPerguntas = [...prev.perguntas];
      const novoIndex = index + 1;
      if (novoIndex < novasPerguntas.length) {
        [novasPerguntas[index], novasPerguntas[novoIndex]] = [novasPerguntas[novoIndex], novasPerguntas[index]];
      }
      return { ...prev, perguntas: novasPerguntas };
    });
  }, []);

  // --- alternativas ---
  const onAddAlternativa = useCallback((perguntaId) => {
    setFormulario(prev => ({
      ...prev,
      perguntas: prev.perguntas.map(pergunta =>
        pergunta.id === perguntaId
          ? {
            ...pergunta,
            alternativas: [...(pergunta.alternativas || []), { id: `alt-${Date.now()}-${Math.random()}`, texto: '' }],
            isNova: pergunta.isNova || true // se já era editada mantém, senão marca como editada (adicionar alternativa = mudança)
          }
          : pergunta
      )
    }));
  }, []);

  const onDeleteAlternativa = useCallback((perguntaId, alternativaId) => {
    setFormulario(prev => ({
      ...prev,
      perguntas: prev.perguntas.map(pergunta =>
        pergunta.id === perguntaId
          ? {
            ...pergunta,
            alternativas: (pergunta.alternativas || []).filter(alt => alt.id !== alternativaId),
            isNova: pergunta.isNova || true
          }
          : pergunta
      )
    }));
  }, []);

  const onChangeAlternativa = useCallback((perguntaId, alternativaId, texto) => {
    setErros(prevErros => {
      const novosErros = { ...prevErros };
      delete novosErros[perguntaId];
      return novosErros;
    });

    setFormulario(prev => {
      const novas = prev.perguntas.map(pergunta => {
        if (pergunta.id !== perguntaId) return pergunta;
        const alternativasAtualizadas = (pergunta.alternativas || []).map(alt =>
          alt.id === alternativaId ? { ...alt, texto } : alt
        );
        const updated = { ...pergunta, alternativas: alternativasAtualizadas };
        const edited = isPerguntaEdited(updated);
        return { ...updated, isNova: pergunta.isNova || edited };
      });
      return { ...prev, perguntas: novas };
    });
  }, []);

  // --- validação antes do envio ---
  const checkFormulario = useCallback(() => {
    const novosErros = {};
    const novosErrosGeral = [];

    formulario.perguntas.forEach((pergunta, index) => {
      const errosPergunta = [];

      if (!pergunta.enunciado || pergunta.enunciado.trim() === '') {
        errosPergunta.push('Enunciado é obrigatório.');
      }

      if (!pergunta.tipo) {
        errosPergunta.push('Tipo da pergunta é obrigatório.');
      }

      if (pergunta.tipo === 'MULTIPLA_ESCOLHA' || pergunta.tipo === 'SELECAO_UNICA') {
        const alternativasValidas = (pergunta.alternativas || []).filter(alt => alt.texto && alt.texto.trim() !== '');
        if (alternativasValidas.length < 2) {
          errosPergunta.push('Adicione pelo menos 2 alternativas válidas.');
        }
      }

      if (errosPergunta.length > 0) {
        novosErros[pergunta.id] = errosPergunta;
      }
    });

    if (!formulario.titulo || formulario.titulo.trim() === '') {
      novosErrosGeral.push('Título do formulário é obrigatório.');
    }

    if (formulario.perguntas.length === 0) {
      novosErrosGeral.push('Adicione pelo menos uma pergunta ao formulário.');
    }

    setErros(novosErros);
    setErrosGeral(novosErrosGeral);

    return Object.keys(novosErros).length === 0 && novosErrosGeral.length === 0;
  }, [formulario]);

  // --- monta payload sem mutar state e com posições/isNova corretos ---
  const setPerguntasPosicao = useCallback(() => {
    return (formulario.perguntas || []).map((pergunta, index) => {
      const base = {
        enunciado: pergunta.enunciado,
        tipo: pergunta.tipo,
        posicao: index,
        isNova: Boolean(pergunta.isNova)
      };

      if (pergunta.tipo === 'TEXTUAL') {
        // manter apenas enunciado/tipo/posicao/isNova
      } else if (pergunta.tipo === 'DICOTOMICA') {
        base.alternativas = [
          { texto: 'Sim', posicao: 0 },
          { texto: 'Não', posicao: 1 }
        ];
      } else if (pergunta.tipo === 'MULTIPLA_ESCOLHA' || pergunta.tipo === 'SELECAO_UNICA') {
        base.alternativas = (pergunta.alternativas || [])
          .filter(alt => alt.texto && alt.texto.trim() !== '')
          .map((alt, altIndex) => ({
            texto: alt.texto,
            posicao: altIndex
          }));
      }

      return base;
    });
  }, [formulario.perguntas]);

  // --- função para detectar mudanças reais no formulário ---
  const detectFormChanges = useCallback(() => {
    if (!isEditMode || !formDataToEdit) {
      return true; // Para formulários novos, sempre considerar como mudança
    }

    // Verificar título e descrição
    const titleChanged = formulario.titulo !== (formDataToEdit.titulo || '');
    const descChanged = formulario.descricao !== (formDataToEdit.descricao || '');

    // Verificar se número de perguntas mudou
    const originalQuestionsCount = formDataToEdit.perguntas?.length || 0;
    const currentQuestionsCount = formulario.perguntas.length;
    const questionsCountChanged = currentQuestionsCount !== originalQuestionsCount;

    // Verificar se alguma pergunta foi editada
    const hasEditedQuestions = formulario.perguntas.some(pergunta => isPerguntaEdited(pergunta));

    const hasChanges = titleChanged || descChanged || questionsCountChanged || hasEditedQuestions;


    return hasChanges;
  }, [formulario, formDataToEdit, isEditMode, isPerguntaEdited]);

  // --- função unificada para salvar ---
  const handleSaveForm = useCallback(async (shouldRelease = false) => {
    // Prevenir múltiplas execuções simultâneas
    if (loading) {
      return;
    }

    setErros({});
    setErrosGeral([]);

    if (!checkFormulario()) {
      toast.error(`Corrija os erros antes de ${shouldRelease ? 'salvar e liberar' : 'salvar'}.`);
      return;
    }

    try {
      setLoading(true);

      // Detectar se houve mudanças reais no formulário
      const hasRealChanges = detectFormChanges();

      if (isEditMode) {
        // Em modo de edição, tomar decisão baseada nas mudanças
        if (hasRealChanges) {
          // Há mudanças: criar nova versão
          await createNewVersion(shouldRelease);
        } else if (shouldRelease && !formDataToEdit.liberadoParaUso) {
          // Sem mudanças, mas quer liberar: fazer PATCH
          await releaseExistingForm();
        } else if (shouldRelease && formDataToEdit.liberadoParaUso) {
          // Sem mudanças e já liberado
          toast.info('O formulário já está liberado para uso e não houve alterações.');
          navigate('/formularios');
          return;
        } else {
          // Sem mudanças e só quer salvar
          toast.info('Nenhuma alteração detectada no formulário.');
          navigate('/formularios');
          return;
        }
      } else {
        // Formulário novo: sempre criar
        await createNewVersion(shouldRelease);
      }

    } catch (error) {
      const actionText = shouldRelease ? 'salvar e liberar' : 'salvar';
      const message = error?.response?.data?.message ||
        error?.message ||
        `Erro ao ${actionText} formulário`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [formulario, isEditMode, checkFormulario, formDataToEdit, detectFormChanges, navigate, loading]);

  // --- função para criar nova versão ---
  const createNewVersion = useCallback(async (shouldRelease = false) => {
    const newPerguntas = setPerguntasPosicao();

    const formularioFinal = {
      titulo: formulario.titulo,
      descricao: formulario.descricao,
      perguntas: newPerguntas,
      liberadoParaUso: shouldRelease,
      editavel: true,
      especialidade: formulario.especialidade || user?.especialidade || 'GINECOLOGIA',
      versao: isEditMode ? (formDataToEdit?.versao || 1) : 1,
    };

    // Debug: dados do formulário original
    console.log('🔍 Debug formulário original:', {
      isEditMode,
      formDataToEdit: formDataToEdit,
      liberadoParaUso: formDataToEdit?.liberadoParaUso,
      versaoOriginal: formDataToEdit?.versao
    });

    // Lógica para decidir se atualiza o mesmo ou cria novo:
    if (isEditMode && formDataToEdit?.id) {
      if (!formDataToEdit?.liberadoParaUso) {
        // Formulário ainda não foi liberado -> ATUALIZAR o mesmo
        formularioFinal.id = formDataToEdit.id;
        console.log('📝 ATUALIZANDO formulário existente (não liberado)');
      } else {
        // Formulário já foi liberado -> CRIAR nova versão
        formularioFinal.idFormularioVersaoAntiga = formDataToEdit.id;
        // Enviar versão atual, backend vai incrementar
        formularioFinal.versao = formDataToEdit?.versao || 1;
        console.log('🆕 CRIANDO nova versão:', {
          versaoOriginal: formDataToEdit?.versao,
          versaoEnviada: formularioFinal.versao,
          nota: 'Backend vai incrementar +1'
        });
      }
    }

    console.log('📤 Payload final sendo enviado:', formularioFinal);

    const response = await createForm(formularioFinal);

    // Atualizar formulário local com ID retornado
    if (response && response.id) {
      setFormulario(prev => ({
        ...prev,
        id: response.id,
        liberadoParaUso: shouldRelease
      }));
    }

    // Mensagem de sucesso
    const actionText = shouldRelease ? 'criado e liberado' : 'criado';
    const successMessage = isEditMode
      ? `Nova versão do formulário ${actionText} com sucesso!`
      : `Formulário ${actionText} com sucesso!`;

    toast.success(successMessage);
    navigate('/formularios');
  }, [formulario, isEditMode, formDataToEdit, setPerguntasPosicao, user?.especialidade, navigate]);

  // --- função para liberar formulário existente ---
  const releaseExistingForm = useCallback(async () => {
    await releaseFormForUse(formDataToEdit.id, true);

    toast.success('Formulário liberado para uso com sucesso!');
    navigate('/formularios');
  }, [formDataToEdit, navigate]);

  // --- salvar ---
  const onSave = useCallback(async () => {
    await handleSaveForm(false);
  }, [handleSaveForm]);


  // --- cancelar ---
  const onCancel = useCallback(() => {
    const hasChanges = formulario.titulo || formulario.descricao || formulario.perguntas.length > 0;

    if (hasChanges) {
      setIsConfirmOpenFormulario(true);
    }
  }, [formulario, navigate]);

  const handleConfirmCancel = useCallback(() => {
    setIsConfirmOpenFormulario(false);
    navigate('/formularios');
  }, [formulario, navigate]);



  // --- salvar e liberar ---
  const onSaveAndRelease = useCallback(async () => {
    await handleSaveForm(true);
  }, [handleSaveForm]);

  const getTipoLabel = (tipoValue) => {
    const tipo = tiposPergunta.find(t => t.value === tipoValue);
    return tipo ? tipo.label : tipoValue;
  };

  // --- Inicializar histórico quando formulário mudar ---
  useEffect(() => {
    if (formulario.titulo || formulario.descricao || formulario.perguntas.length > 0) {
      if (history.length === 0) {
        // Inicializar histórico com estado atual
        const initialState = JSON.parse(JSON.stringify(formulario));
        setHistory([initialState]);
        setHistoryIndex(0);
      }
    }
  }, [formulario, history.length]);

  // Adicionar atalhos de teclado
  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          handleUndo();
        } else if ((event.key === 'y') || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault();
          handleRedo();
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [handleUndo, handleRedo]);

  // --- UI render ---
  return (
    <div>
      <ConfirmationPopUp
        isOpen={isConfirmOpenFormulario}
        message={`Tem certeza que deseja descartar todas as alterações?`}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsConfirmOpenFormulario(false)}
      />

      <ConfirmationPopUp
        isOpen={isConfirmOpenPergunta}
        message={`Tem certeza que deseja excluir esta pergunta?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpenPergunta(false)}
      />

      <div
        className="
          flex flex-row justify-between items-center p-4
          border-b border-gray-300 shadow-md fixed bg-white w-full z-10"
      >
        <div className="flex flex-row gap-2">
          <img src={rosaLogo} alt="Logo Rosa RFCC" className="h-8 mr-4 self-center" />

          {/* Botões de Undo/Redo - TEMPORARIAMENTE OCULTOS */}
          {false && !isViewOnly && (
            <div className="flex flex-row gap-2 ml-4">
              <button
                onClick={handleUndo}
                disabled={!canUndo || loading}
                aria-label="Desfazer - Ctrl+Z ou Cmd+Z"
                title="Desfazer - Ctrl+Z ou Cmd+Z"
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200
                  border border-gray-300 bg-white shadow-sm
                  ${!canUndo || loading
                    ? 'cursor-not-allowed opacity-50 text-gray-400'
                    : 'hover:bg-redfemHoverPink hover:border-redfemActionPink text-redfemActionPink hover:shadow-md'
                  }
                `}
              >
                <Undo2 size={16} />
                <span className="text-sm font-medium hidden sm:inline">Desfazer</span>
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo || loading}
                aria-label="Refazer - Ctrl+Y, Cmd+Y ou Ctrl+Shift+Z"
                title="Refazer - Ctrl+Y, Cmd+Y ou Ctrl+Shift+Z"
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200
                  border border-gray-300 bg-white shadow-sm
                  ${!canRedo || loading
                    ? 'cursor-not-allowed opacity-50 text-gray-400'
                    : 'hover:bg-redfemHoverPink hover:border-redfemActionPink text-redfemActionPink hover:shadow-md'
                  }
                `}
              >
                <Redo2 size={16} />
                <span className="text-sm font-medium hidden sm:inline">Refazer</span>
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-row gap-2">
          {isViewOnly ? (
            <>
              <ButtonSecondary
                onClick={() => navigate('/formularios')}
              >
                Voltar
              </ButtonSecondary>
              <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-sm">
                Modo Somente Leitura - Formulário Inativo
              </div>
            </>
          ) : (
            <>
              <ButtonSecondary
                onClick={onCancel}
                disabled={loading}
              >
                Descartar
              </ButtonSecondary>
              <SaveReleaseDropdown
                onSave={onSave}
                onSaveAndRelease={onSaveAndRelease}
                disabled={loading}
                loading={loading}
                isReleased={false} // Sempre permitir ambas as opções no editor
                releasePermissionKey="formularios"
              />
            </>
          )}
        </div>
      </div>

      <div className="pt-24 pb-4 px-80 max-[1200px]:px-20 bg-redfemVariantPink bg-opacity-10 min-h-screen">
        <div className="flex flex-col gap-4">
          <Card
            className={`${errosGeral.length > 0 ? 'border border-red-500' : ''}`}
          >
            <div className="bg-redfemDarkPink w-full h-2 rounded-t-lg"></div>
            <div className="py-4 px-8">
              {errosGeral.length > 0 && (
                <ul className="w-full flex flex-col mb-4">
                  {errosGeral.map((erro, index) => (
                    <li key={index} className="text-red-500 text-sm">
                      • {erro}
                    </li>
                  ))}
                </ul>
              )}

              <Input
                type="text"
                className="text-2xl"
                placeholder="Nome do formulário"
                value={formulario.titulo}
                onChange={(e) => !isViewOnly && setTitulo(e.target.value)}
                disabled={isViewOnly}
                aria-label="Nome do formulário"
              />
              <Input
                type="text"
                placeholder="Descrição do formulário"
                value={formulario.descricao}
                onChange={(e) => !isViewOnly && setDescricao(e.target.value)}
                disabled={isViewOnly}
                aria-label="Descrição do formulário"
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
                  <ul className="w-full flex flex-col mb-4">
                    {erros[pergunta.id].map((erro, erroIndex) => (
                      <li key={erroIndex} className="text-red-500 text-sm">
                        • {erro}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Move Up */}
                {!isViewOnly && (
                  <IconButton
                    onClick={() => onMoveUp(index)}
                    disabled={index === 0}
                    aria-label="Mover pergunta para cima"
                  >
                    <MoveUpIcon className={`${index === 0 ? 'text-gray-300' : 'text-redfemActionPink hover:text-redfemDarkPink'}`} />
                  </IconButton>
                )}

                {/* Enunciado e Select */}
                <div className="w-full mb-4">
                  <div className="flex flex-row gap-5">

                    <Input
                      type="text"
                      placeholder="Pergunta"
                      value={pergunta.enunciado}
                      onChange={(e) => !isViewOnly && onChangePergunta(pergunta.id, 'enunciado', e.target.value)}
                      disabled={isViewOnly}
                      aria-label={`Enunciado da pergunta ${index + 1}`}
                    />

                    <select
                      className={`p-1 w-96 mb-4
                            border-b border-b-gray-950
                            focus:border-b-redfemActionPink focus:border-b-2
                            outline-none cursor-pointer custom-select
                            ${isViewOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      value={pergunta.tipo}
                      onChange={(e) => !isViewOnly && onChangePergunta(pergunta.id, 'tipo', e.target.value)}
                      disabled={isViewOnly}
                      aria-label={`Tipo da pergunta ${index + 1}`}
                    >
                      {tiposPergunta.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>

                  </div>

                  {pergunta.tipo === "TEXTUAL" && (
                    <Input
                      type="text"
                      className={`placeholder:text-gray-400 border-b-gray-400`}
                      placeholder="Resposta"
                      disabled
                      aria-label="Preview de resposta textual"
                    />
                  )}

                  {pergunta.tipo === "DICOTOMICA" && (
                    <div className={`flex flex-row gap-4 mb-2`}>
                      <ButtonPrimary disabled className="w-full justify-center">Sim</ButtonPrimary>
                      <ButtonPrimary disabled className="w-full justify-center">Não</ButtonPrimary>
                    </div>
                  )}

                  {(pergunta.tipo === "MULTIPLA_ESCOLHA" ||
                    pergunta.tipo === "SELECAO_UNICA") && (
                      <div className={`flex flex-col gap-2`}>
                        <div className="mb-2 pl-4">

                          {pergunta.alternativas.map((alternativa, altIndex) => (
                            <div className="flex flex-row gap-2 items-center" key={alternativa.id}>
                              <div>
                                <Input
                                  type={
                                    pergunta.tipo === "MULTIPLA_ESCOLHA" ?
                                      "checkbox" : "radio"
                                  }
                                  disabled
                                  aria-label={`Preview de ${pergunta.tipo === "MULTIPLA_ESCOLHA" ? 'checkbox' : 'radio'}`}
                                />
                              </div>
                              <Input
                                type="text"
                                placeholder="Opção"
                                value={alternativa.texto}
                                onChange={(e) => !isViewOnly && onChangeAlternativa(pergunta.id, alternativa.id, e.target.value)}
                                disabled={isViewOnly}
                                aria-label={`Alternativa ${altIndex + 1} da pergunta ${index + 1}`}
                              />
                              {!isViewOnly && (
                                <IconButton
                                  onClick={() => onDeleteAlternativa(pergunta.id, alternativa.id)}
                                  aria-label={`Excluir alternativa ${altIndex + 1}`}
                                >
                                  <XIcon className="text-gray-600 hover:text-redfemActionPink" />
                                </IconButton>
                              )}
                            </div>
                          ))}

                        </div>
                        {!isViewOnly && (
                          <ButtonPrimary
                            className="justify-center w-fit mx-auto mb-4"
                            onClick={() => onAddAlternativa(pergunta.id)}
                            aria-label={`Adicionar opção à pergunta ${index + 1}`}
                          >
                            Adicionar Opção
                          </ButtonPrimary>
                        )}
                      </div>
                    )}
                </div>

                {/* Delete */}
                {!isViewOnly && (
                  <div className="w-full h-0 flex justify-end">
                    <IconButton
                      onClick={() => onDeletePergunta(pergunta.id)}
                      aria-label={`Excluir pergunta ${index + 1}`}
                    >
                      <DeleteIcon className="hover:text-redfemActionPink text-gray-800" />
                    </IconButton>
                  </div>
                )}

                {/* Move Down */}
                {!isViewOnly && (
                  <IconButton
                    onClick={() => onMoveDown(index)}
                    disabled={index === formulario.perguntas.length - 1}
                    aria-label="Mover pergunta para baixo"
                  >
                    <MoveDownIcon className={`${index === formulario.perguntas.length - 1 ? 'text-gray-300' : 'text-redfemActionPink hover:text-redfemDarkPink'}`} />
                  </IconButton>
                )}

              </Card>
            ))}
          </div>

          {!isViewOnly && (
            <ButtonPrimary
              className="justify-center w-fit m-auto mt-4"
              onClick={onAddPergunta}
              aria-label="Adicionar nova pergunta"
            >
              <AddIcon />
              Adicionar Pergunta
            </ButtonPrimary>
          )}
        </div>
      </div>
    </div>
  )
}
