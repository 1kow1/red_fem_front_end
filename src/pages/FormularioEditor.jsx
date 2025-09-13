/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import rosaLogo from '../assets/logos/rosa-rfcc.png';
import { ButtonPrimary, ButtonPrimaryDropdown, IconButton, ButtonSecondary } from "../components/Button";
import { XIcon, MoveUpIcon, MoveDownIcon, AddIcon, DeleteIcon } from "../components/Icons";
import Input from "../components/Input";
import { createForm } from "../services/formAPI";
import Card from "../components/Card";

export default function FormularioEditor() {
  const location = useLocation();
  const navigate = useNavigate();

  const formDataToEdit = location.state?.formData;
  const isEditMode = Boolean(formDataToEdit);

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

  // --- Inicializa formulário em modo edição ---
  useEffect(() => {
    if (formDataToEdit) {
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

      setFormulario({
        titulo: formDataToEdit.titulo || "",
        descricao: formDataToEdit.descricao || "",
        versao: formDataToEdit.versao,
        medicoId: formDataToEdit.medicoId,
        especialidade: formDataToEdit.especialidade,
        liberadoParaUso: formDataToEdit.liberadoParaUso,
        editavel: formDataToEdit.editavel,
        idFormularioVersaoAntiga: formDataToEdit.id,
        perguntas: perguntasOriginais
      });
    }
  }, [formDataToEdit]);

  // --- campos simples ---
  const setTitulo = useCallback((value) => {
    setFormulario(prev => ({
      ...prev,
      titulo: value
    }));
    if (value.trim() && errosGeral.some(erro => erro.includes('Título'))) {
      setErrosGeral(prev => prev.filter(erro => !erro.includes('Título')));
    }
  }, [errosGeral]);

  const setDescricao = useCallback((value) => {
    setFormulario(prev => ({
      ...prev,
      descricao: value
    }));
  }, []);

  // --- adicionar pergunta (nova) ---
  const onAddPergunta = useCallback(() => {
    const novaPergunta = {
      id: `new-${Date.now()}-${Math.random()}`,
      enunciado: '',
      tipo: 'TEXTUAL',
      alternativas: [],
      isNova: true
    };

    setFormulario(prev => ({
      ...prev,
      perguntas: [...prev.perguntas, novaPergunta]
    }));

    if (errosGeral.some(erro => erro.includes('pelo menos uma pergunta'))) {
      setErrosGeral(prev => prev.filter(erro => !erro.includes('pelo menos uma pergunta')));
    }
  }, [errosGeral]);

  // --- deletar pergunta ---
  const onDeletePergunta = useCallback((perguntaId) => {
    const confirmar = window.confirm('Tem certeza que deseja excluir esta pergunta?');
    if (!confirmar) return;

    setFormulario(prev => ({
      ...prev,
      perguntas: prev.perguntas.filter(pergunta => pergunta.id !== perguntaId)
    }));

    setErros(prevErros => {
      const novosErros = { ...prevErros };
      delete novosErros[perguntaId];
      return novosErros;
    });

    // também remover snapshot caso exista
    if (originalPerguntasRef.current[perguntaId]) {
      const copy = { ...originalPerguntasRef.current };
      delete copy[perguntaId];
      originalPerguntasRef.current = copy;
    }
  }, []);

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

  // --- salvar ---
  const onSave = useCallback(async () => {
    setErros({});
    setErrosGeral([]);

    if (!checkFormulario()) {
      toast.error('Corrija os erros antes de salvar.');
      return;
    }

    const newPerguntas = setPerguntasPosicao();

    const formularioFinal = {
      ...formulario,
      perguntas: newPerguntas,
      versao: formulario.versao,
      liberadoParaUso: isEditMode ? formulario.liberadoParaUso : false,
      editavel: true,
      especialidade: formulario.especialidade || 'GINECOLOGIA',
    };

    if (isEditMode && formulario.id) {
      formularioFinal.idFormularioVersaoAntiga = formulario.id;
    }

    await handleSaveForm(formularioFinal);
  }, [formulario, isEditMode, checkFormulario, setPerguntasPosicao]);

  const handleSaveForm = async (formularioFinal) => {
    try {
      setLoading(true);

      console.log('Dados enviados:', {
        isEditMode,
        formularioId: formulario.id,
        idFormularioVersaoAntiga: formularioFinal.idFormularioVersaoAntiga,
        formularioCompleto: formularioFinal
      });

      await createForm(formularioFinal);
      toast.success(isEditMode ? 'Formulário atualizado com sucesso!' : 'Formulário criado com sucesso!');

      // Após salvar, você pode atualizar snapshot: se quiser continuar editando, atualize originalPerguntasRef
      // Exemplo: rebuild snapshot a partir do payload salvo (assumindo que backend retornou dados)
      // Aqui apenas navegamos
      navigate('/formularios');

    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      const message = error?.response?.data?.message ||
        error?.message ||
        `Erro ao ${isEditMode ? 'atualizar' : 'criar'} formulário`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // --- cancelar ---
  const onCancel = useCallback(() => {
    const hasChanges = formulario.titulo || formulario.descricao || formulario.perguntas.length > 0;

    if (hasChanges) {
      const confirmar = window.confirm('Tem certeza que deseja cancelar? Todas as alterações serão perdidas.');
      if (!confirmar) return;
    }

    navigate('/formularios');
  }, [formulario, navigate]);

  const getTipoLabel = (tipoValue) => {
    const tipo = tiposPergunta.find(t => t.value === tipoValue);
    return tipo ? tipo.label : tipoValue;
  };

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
          <ButtonPrimaryDropdown>Exportar Dados</ButtonPrimaryDropdown>
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
            {loading ? 'Salvando...' : (isEditMode ? 'Atualizar' : 'Salvar')}
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
                onChange={(e) => setTitulo(e.target.value)}
                aria-label="Nome do formulário"
              />
              <Input
                type="text"
                placeholder="Descrição do formulário"
                value={formulario.descricao}
                onChange={(e) => setDescricao(e.target.value)}
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
                <IconButton
                  onClick={() => onMoveUp(index)}
                  disabled={index === 0}
                  aria-label="Mover pergunta para cima"
                >
                  <MoveUpIcon className={`${index === 0 ? 'text-gray-300' : 'text-redfemActionPink hover:text-redfemDarkPink'}`} />
                </IconButton>

                {/* Enunciado e Select */}
                <div className="w-full mb-4">
                  <div className="flex flex-row gap-5">

                    <Input
                      type="text"
                      placeholder="Pergunta"
                      value={pergunta.enunciado}
                      onChange={(e) => onChangePergunta(pergunta.id, 'enunciado', e.target.value)}
                      aria-label={`Enunciado da pergunta ${index + 1}`}
                    />

                    <select
                      className="p-1 w-96 mb-4
                            border-b border-b-gray-950
                            focus:border-b-redfemActionPink focus:border-b-2
                            outline-none cursor-pointer custom-select"
                      value={pergunta.tipo}
                      onChange={(e) => onChangePergunta(pergunta.id, 'tipo', e.target.value)}
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
                                onChange={(e) => onChangeAlternativa(pergunta.id, alternativa.id, e.target.value)}
                                aria-label={`Alternativa ${altIndex + 1} da pergunta ${index + 1}`}
                              />
                              <IconButton
                                onClick={() => onDeleteAlternativa(pergunta.id, alternativa.id)}
                                aria-label={`Excluir alternativa ${altIndex + 1}`}
                              >
                                <XIcon className="text-gray-600 hover:text-redfemActionPink" />
                              </IconButton>
                            </div>
                          ))}

                        </div>
                        <ButtonPrimary
                          className="justify-center w-fit mx-auto mb-4"
                          onClick={() => onAddAlternativa(pergunta.id)}
                          aria-label={`Adicionar opção à pergunta ${index + 1}`}
                        >
                          Adicionar Opção
                        </ButtonPrimary>
                      </div>
                    )}
                </div>

                {/* Delete */}
                <div className="w-full h-0 flex justify-end">
                  <IconButton
                    onClick={() => onDeletePergunta(pergunta.id)}
                    aria-label={`Excluir pergunta ${index + 1}`}
                  >
                    <DeleteIcon className="hover:text-redfemActionPink text-gray-800" />
                  </IconButton>
                </div>

                {/* Move Down */}
                <IconButton
                  onClick={() => onMoveDown(index)}
                  disabled={index === formulario.perguntas.length - 1}
                  aria-label="Mover pergunta para baixo"
                >
                  <MoveDownIcon className={`${index === formulario.perguntas.length - 1 ? 'text-gray-300' : 'text-redfemActionPink hover:text-redfemDarkPink'}`} />
                </IconButton>

              </Card>
            ))}
          </div>

          <ButtonPrimary
            className="justify-center w-fit m-auto mt-4"
            onClick={onAddPergunta}
            aria-label="Adicionar nova pergunta"
          >
            <AddIcon />
            Adicionar Pergunta
          </ButtonPrimary>
        </div>
      </div>
    </div>
  )
}
