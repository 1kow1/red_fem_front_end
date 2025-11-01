/* eslint-disable no-unused-vars */
import DataFrame from "../components/DataFrame";
import FormPopUp from "../components/FormPopUp";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { formConfigs } from "../config/formConfig";
import { adaptPacienteForView, adaptPacienteForApi } from "../adapters/pacienteAdapter";
import { getPacientes, createPaciente, editPaciente, togglePaciente } from "../services/pacienteAPI";
import { PaginationFooter } from "../components/PaginationFooter";
import { usePagination } from "../hooks/usePagination";
import { toast } from "react-toastify";
import ConfirmationPopUp from "../components/ConfirmationPopUp";
import ModalRelatorio from "../components/ModalRelatorio";
import { filterConfigs } from "../config/filterConfig";
import { useAuth } from "../contexts/auth/useAuth";
import { ButtonPrimaryDropdown } from "../components/Button";
import { generateCSVReport, generatePDFReport } from "../utils/reportUtils";

export default function Pacientes() {
  const navigate = useNavigate();
  const { user, userCargo } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    page,
    setPage,
    size,
    setSize,
    totalPages,
    setTotalPages,
    totalRecords,
    setTotalRecords,
    resetPagination,
  } = usePagination();

  // modal control
  const [row, setRow] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // create | edit
  const [editInitialData, setEditInitialData] = useState(null);

  // modal relatório
  const [isRelatorioModalOpen, setIsRelatorioModalOpen] = useState(false);
  const [pacienteRelatorio, setPacienteRelatorio] = useState(null);

  const avaiableFilters = filterConfigs['pacientes']  

  const fetchPacientes = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const filterWithPagination = {
        ...filters,
        page: filters.page ?? page,
        size: filters.size ?? size
      };

      const data = await getPacientes(filterWithPagination);
      const mapped = data.content.map(adaptPacienteForView);

      setPacientes(mapped);
      setTotalPages(data.totalPages);
      setTotalRecords(data.totalElements);
    } catch (err) {
      setError("Erro ao buscar pacientes: " + err.message);
      toast.error("Erro ao buscar pacientes: " + err.message)
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  // CREATE
  const handleCreatePaciente = async (formData) => {
    try {
      const payload = adaptPacienteForApi(formData);
      await createPaciente(payload);
      await fetchPacientes();
      setIsFormOpen(false);
      toast.success("Paciente criado com sucesso.");
    } catch (err) {
      // Se é erro de validação do Yup (client-side)
      if (err.inner && Array.isArray(err.inner)) {
        const errors = {};
        err.inner.forEach((e) => {
          errors[e.path] = e.message;
        });
        toast.error("Erros de validação:", Object.values(errors).join(", "));
        return;
      }

      // Se é erro do backend (HTTP)
      const errorMessage = err?.response?.data?.message ||
                          err?.response?.data?.error ||
                          err?.message ||
                          "Erro desconhecido ao criar paciente.";

      // Verificar se é erro de email duplicado
      if (errorMessage.toLowerCase().includes('email') &&
          (errorMessage.toLowerCase().includes('já existe') ||
           errorMessage.toLowerCase().includes('duplicado') ||
           errorMessage.toLowerCase().includes('unique'))) {
        toast.error("Este email já está cadastrado no sistema. Utilize um email diferente.");
        return;
      }

      // Verificar se é erro de CPF duplicado
      if (errorMessage.toLowerCase().includes('cpf') &&
          (errorMessage.toLowerCase().includes('já existe') ||
           errorMessage.toLowerCase().includes('duplicado') ||
           errorMessage.toLowerCase().includes('unique'))) {
        toast.error("Este CPF já está cadastrado no sistema. Utilize um CPF diferente.");
        return;
      }

      toast.error(errorMessage);
    }
  };

  // EDIT
  const handleEditPaciente = async (formData) => {
    const payload = adaptPacienteForApi({ ...(editInitialData || {}), ...formData });

    await editPaciente(payload.id, payload);
    await fetchPacientes();
    setIsFormOpen(false);
    setEditInitialData(null);
    toast.success("Paciente Atualizado!")
  };

  // REATIVAR / DESATIVAR
  const handleToggleActive = async (row) => {
    // Se está tentando desativar (ativo = "Sim"), verificar se tem consultas futuras
    if (row.ativo === "Sim") {
      try {
        // Buscar consultas futuras deste paciente (a partir de agora)
        const agora = new Date();
        // Ajustar para fuso horário local (UTC-3 no Brasil)
        agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
        const dataHoraISO = agora.toISOString().split('.')[0]; // Remove milissegundos
        const dataInicio = dataHoraISO.split('T')[0]; // Apenas a data para o filtro

        const url = `${import.meta.env.VITE_API_BASE_URL}/consultas/buscar?pacienteIds=${row.id}&dataInicio=${dataInicio}&status=PENDENTE&size=1`;

        const response = await fetch(url, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();

          if (data.totalElements > 0) {
            toast.error(`Não é possível desativar este paciente pois há ${data.totalElements} consulta(s) agendada(s).`);
            return;
          }
        }
      } catch (error) {
        // Continuar mesmo com erro na verificação
      }
    }

    setIsConfirmOpen(true);
    setRow(row);
  };

  const handleConfirmToggle = async () => {
    try {
      await togglePaciente(row.id);
      await fetchPacientes();
      toast.success("Paciente Atualizado!")
    } catch (err) {
      toast.error("Erro ao alternar status ativo:", err)
    } finally {
      setIsConfirmOpen(false);
      setRow({});
    }
  };

  // abrir criação
  const openCreateForm = () => {
    setFormMode("create");
    setEditInitialData(null);
    setIsFormOpen(true);
  };

  // abrir edição // DataFrame -> Table -> DetailsPopup -> chama onEditRow
  const openEditForm = (row) => {
    setFormMode("edit");
    setEditInitialData(row);
    setIsFormOpen(true);
  };

  // função para navegar para execução do formulário
  const handleAbrirExecucao = (execId, execData) => {
    navigate(`/execform/${execId}`, {
      state: {
        execData: execData,
        returnPath: '/pacientes'
      }
    });
  };

  // função para gerar relatório
  const handleGerarRelatorio = (pacienteData) => {
    setPacienteRelatorio(pacienteData);
    setIsRelatorioModalOpen(true);
  };

  // Função para exportar TODOS os pacientes (Admin apenas)
  const handleExportarTodosPacientesCSV = async () => {
    try {
      setLoading(true);
      // Buscar todos os pacientes sem paginação
      const allPacientesData = await getPacientes({ page: 0, size: 10000, ativo: [true, false] });
      const allPacientes = allPacientesData.content.map(adaptPacienteForView);

      if (allPacientes.length === 0) {
        toast.warning('Nenhum paciente encontrado para exportar');
        return;
      }

      // Criar CSV com dados de pacientes e formulários
      const rows = [];

      // Cabeçalho principal
      rows.push([
        'Nome Paciente', 'CPF', 'Email', 'Telefone', 'Data Nascimento', 'Ativo',
        'Data Consulta', 'Médico', 'Tipo Consulta', 'Status Consulta',
        'Formulário', 'Data Preenchimento', 'Liberado',
        'Pergunta', 'Resposta'
      ]);

      allPacientes.forEach(paciente => {
        const consultas = paciente.consultas || [];

        if (consultas.length === 0) {
          // Paciente sem consultas
          rows.push([
            paciente.nome || '',
            paciente.cpf || '',
            paciente.email || '',
            paciente.telefone || '',
            paciente._dataDeNascimento || '',
            paciente.ativo || '',
            '', '', '', '', '', '', '', '', ''
          ]);
        } else {
          consultas.forEach(consulta => {
            const exec = consulta.execucaoFormulario;
            const medicoNome = consulta.usuarioDTO?.nome || '';

            if (!exec) {
              // Consulta sem formulário
              rows.push([
                paciente.nome || '',
                paciente.cpf || '',
                paciente.email || '',
                paciente.telefone || '',
                paciente._dataDeNascimento || '',
                paciente.ativo || '',
                consulta.dataHora || '',
                medicoNome,
                consulta.tipoConsulta || '',
                consulta.status || '',
                '', '', '', '', ''
              ]);
            } else {
              const respostas = exec.respostas || [];
              const formularioTitulo = exec.formulario?.titulo || 'N/A';
              const dataPreenchimento = exec.dataHora || '';
              const liberado = exec.isLiberado ? 'Sim' : 'Não';

              if (respostas.length === 0) {
                // Formulário sem respostas
                rows.push([
                  paciente.nome || '',
                  paciente.cpf || '',
                  paciente.email || '',
                  paciente.telefone || '',
                  paciente._dataDeNascimento || '',
                  paciente.ativo || '',
                  consulta.dataHora || '',
                  medicoNome,
                  consulta.tipoConsulta || '',
                  consulta.status || '',
                  formularioTitulo,
                  dataPreenchimento,
                  liberado,
                  '', ''
                ]);
              } else {
                // Formulário com respostas
                respostas.forEach(resposta => {
                  const perguntaTexto = resposta.enunciado || '';
                  const respostaTexto = resposta.texto || '';

                  rows.push([
                    paciente.nome || '',
                    paciente.cpf || '',
                    paciente.email || '',
                    paciente.telefone || '',
                    paciente._dataDeNascimento || '',
                    paciente.ativo || '',
                    consulta.dataHora || '',
                    medicoNome,
                    consulta.tipoConsulta || '',
                    consulta.status || '',
                    formularioTitulo,
                    dataPreenchimento,
                    liberado,
                    perguntaTexto,
                    respostaTexto
                  ]);
                });
              }
            }
          });
        }
      });

      const csvContent = rows.map(row =>
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `Todos_Pacientes_Completo_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exportados ${allPacientes.length} pacientes com dados completos!`);
    } catch (error) {
      toast.error('Erro ao exportar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const handleExportarTodosPacientesPDF = async () => {
    try {
      setLoading(true);
      const { jsPDF } = await import('jspdf');
      const allPacientesData = await getPacientes({ page: 0, size: 10000, ativo: [true, false] });
      const allPacientes = allPacientesData.content.map(adaptPacienteForView);

      if (allPacientes.length === 0) {
        toast.warning('Nenhum paciente encontrado para exportar');
        return;
      }

      const doc = new jsPDF();
      let yPos = 20;
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);

      // Função auxiliar para adicionar cabeçalho em novas páginas
      const addHeader = () => {
        doc.setFillColor(219, 112, 147);
        doc.rect(0, 0, pageWidth, 8, 'F');
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(139, 0, 76);
        doc.text('Relatório Completo de Pacientes', pageWidth / 2, 18, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Rede Feminina de Combate ao Câncer', pageWidth / 2, 24, { align: 'center' });
        doc.setDrawColor(219, 112, 147);
        doc.setLineWidth(0.5);
        doc.line(margin, 28, pageWidth - margin, 28);
        return 35;
      };

      // Função auxiliar para verificar espaço e adicionar nova página
      const checkPageBreak = (requiredSpace) => {
        if (yPos + requiredSpace > pageHeight - 20) {
          doc.addPage();
          yPos = addHeader();
          yPos += 5;
        }
      };

      yPos = addHeader();

      // Info
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total de pacientes: ${allPacientes.length}`, margin, yPos);
      yPos += 6;
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPos);
      yPos += 12;

      // Listagem de pacientes com consultas e formulários
      allPacientes.forEach((paciente, index) => {
        checkPageBreak(15);

        // Nome do paciente
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.setTextColor(139, 0, 76);
        doc.text(`${index + 1}. ${paciente.nome}`, margin, yPos);
        yPos += 6;

        // Dados do paciente
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        const dadosPaciente = [
          paciente.cpf ? `CPF: ${paciente.cpf}` : null,
          paciente.telefone ? `Tel: ${paciente.telefone}` : null,
          paciente._dataDeNascimento ? `Nasc: ${paciente._dataDeNascimento}` : null,
          paciente.email ? `Email: ${paciente.email}` : null
        ].filter(Boolean);

        dadosPaciente.forEach(dado => {
          doc.text(dado, margin + 5, yPos);
          yPos += 4;
        });

        yPos += 2;

        // Consultas do paciente
        const consultas = paciente.consultas || [];
        if (consultas.length > 0) {
          checkPageBreak(10);
          doc.setFont(undefined, 'bold');
          doc.setFontSize(10);
          doc.setTextColor(70, 70, 70);
          doc.text(`Consultas (${consultas.length}):`, margin + 5, yPos);
          yPos += 5;

          consultas.forEach((consulta, consultaIndex) => {
            checkPageBreak(15);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);

            const medicoNome = consulta.usuarioDTO?.nome || '';
            doc.text(`${consultaIndex + 1}. Data: ${consulta.dataHora} | Médico: ${medicoNome}`, margin + 10, yPos);
            yPos += 4;
            doc.text(`   Tipo: ${consulta.tipoConsulta} | Status: ${consulta.status}`, margin + 10, yPos);
            yPos += 5;

            // Formulário da consulta
            const exec = consulta.execucaoFormulario;
            if (exec) {
              const formularioTitulo = exec.formulario?.titulo || 'N/A';
              const respostas = exec.respostas || [];
              const dataPreenchimento = exec.dataHora || '';
              const liberado = exec.isLiberado ? 'Sim' : 'Não';

              checkPageBreak(10);
              doc.setFont(undefined, 'bold');
              doc.setFontSize(9);
              doc.setTextColor(100, 100, 100);
              doc.text(`   Formulário: ${formularioTitulo}`, margin + 10, yPos);
              yPos += 4;
              doc.setFont(undefined, 'normal');
              doc.setFontSize(8);
              doc.text(`   Preenchido em: ${dataPreenchimento} | Liberado: ${liberado}`, margin + 10, yPos);
              yPos += 5;

              if (respostas.length > 0) {
                doc.setTextColor(80, 80, 80);
                doc.text(`   Respostas (${respostas.length}):`, margin + 10, yPos);
                yPos += 4;

                respostas.forEach(resposta => {
                  const perguntaTexto = resposta.enunciado || '';
                  const respostaTexto = resposta.texto || 'Sem resposta';

                  checkPageBreak(8);

                  doc.setFont(undefined, 'italic');
                  doc.setTextColor(60, 60, 60);

                  // Quebrar texto da pergunta se for muito longo
                  const perguntaLines = doc.splitTextToSize(`P: ${perguntaTexto}`, maxWidth - 25);
                  perguntaLines.forEach(line => {
                    doc.text(line, margin + 15, yPos);
                    yPos += 3.5;
                  });

                  doc.setFont(undefined, 'normal');
                  doc.setTextColor(0, 0, 0);

                  // Quebrar texto da resposta se for muito longo
                  const respostaLines = doc.splitTextToSize(`R: ${respostaTexto}`, maxWidth - 25);
                  respostaLines.forEach(line => {
                    checkPageBreak(4);
                    doc.text(line, margin + 15, yPos);
                    yPos += 3.5;
                  });

                  yPos += 2;
                });
              } else {
                doc.setTextColor(150, 150, 150);
                doc.text(`   (Formulário sem respostas)`, margin + 10, yPos);
                yPos += 4;
              }
            }

            yPos += 2;
          });
        } else {
          doc.setFont(undefined, 'italic');
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          doc.text('Nenhuma consulta registrada', margin + 5, yPos);
          yPos += 5;
        }

        yPos += 5;
      });

      doc.save(`Todos_Pacientes_Completo_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(`Exportados ${allPacientes.length} pacientes com dados completos!`);
    } catch (error) {
      toast.error('Erro ao exportar PDF');
    } finally {
      setLoading(false);
    }
  };

  // debounce search - quando busca muda, resetar página
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, setPage]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg">Pacientes</h1>

        {/* Botão de exportação geral - só para Admin */}
        {userCargo === 'ADMINISTRADOR' && (
          <ButtonPrimaryDropdown
            variant="secondary"
            options={[
              {
                label: 'Exportar Todos (CSV)',
                onClick: handleExportarTodosPacientesCSV
              },
              {
                label: 'Exportar Todos (PDF)',
                onClick: handleExportarTodosPacientesPDF
              }
            ]}
          >
            Exportar Todos os Pacientes
          </ButtonPrimaryDropdown>
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <DataFrame
        title="Paciente"
        data={pacientes}
        avaiableFilters={avaiableFilters}
        dataType="pacientes"
        formFields={formConfigs.pacientes.fields}
        onAddRow={openCreateForm}
        onEditRow={openEditForm}
        onToggleRow={handleToggleActive}
        fetchData={fetchPacientes}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        defaultFilters={{ ativo: [true] }}
        page={page}
        size={size}
        setPage={setPage}
        callbacks={{
          onEdit: openEditForm,
          onToggle: handleToggleActive,
          onAbrirExecucao: handleAbrirExecucao,
          onGerarRelatorio: handleGerarRelatorio
        }}
      />

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={setPage}
        size={size}
      />

      <FormPopUp
        key={formMode === "create" ? Date.now() : editInitialData?.id ?? "edit"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === "create" ? "Adicionar Paciente" : "Editar Paciente"}
        mode={formMode}
        fields={formConfigs.pacientes.fields}
        validationSchema={formConfigs.pacientes.validationSchema}
        initialData={editInitialData}
        onSubmit={formMode === "create" ? handleCreatePaciente : handleEditPaciente}
        columns={2}
      />

      <ConfirmationPopUp
        isOpen={isConfirmOpen}
        message={`Tem certeza que deseja ${row.ativo ? "desativar" : "reativar"} o paciente ${row.nome}?`}
        onConfirm={handleConfirmToggle}
        onCancel={() => { setIsConfirmOpen(false); setRow({}); }}
      />

      <ModalRelatorio
        isOpen={isRelatorioModalOpen}
        onClose={() => {
          setIsRelatorioModalOpen(false);
          setPacienteRelatorio(null);
        }}
        pacienteData={pacienteRelatorio}
        consultas={pacienteRelatorio?.consultas || []}
      />
    </div>
  );
}
