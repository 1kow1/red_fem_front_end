// src/utils/reportUtils.js
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

/**
 * Logo da Rede Feminina em base64
 * TODO: Substituir por logo real quando disponível
 * Para adicionar o logo:
 * 1. Converta o arquivo PNG/JPG para base64
 * 2. Substitua a string abaixo pelo resultado
 * 3. Ajuste as dimensões no addHeader() se necessário
 */
const LOGO_BASE64 = null; // Adicione aqui: 'data:image/png;base64,iVBORw0KGgoAAAANSU...'

/**
 * Gera relatório CSV das execuções de formulários do paciente
 */
export const generateCSVReport = (pacienteData, consultas = []) => {
  try {
    // Coletar todas as perguntas únicas de todos os formulários usando o enunciado das respostas
    const todasPerguntas = new Map();

    consultas.forEach(consulta => {
      const execucao = consulta.execucaoFormulario;
      if (execucao?.respostas && Array.isArray(execucao.respostas)) {
        execucao.respostas.forEach(resposta => {
          const perguntaId = String(resposta.perguntaId);
          if (!todasPerguntas.has(perguntaId)) {
            // Usar o enunciado que vem na resposta
            todasPerguntas.set(perguntaId, resposta.enunciado || `Pergunta ${perguntaId}`);
          }
        });
      }
    });

    // Criar cabeçalhos: dados básicos + perguntas como colunas
    const headers = [
      'Paciente',
      'Data Consulta',
      'Médico',
      'Tipo Consulta',
      'Status',
      'Formulário',
      ...Array.from(todasPerguntas.values())
    ];

    const rows = [];
    rows.push(headers);

    // Processar cada consulta
    consultas.forEach(consulta => {
      const execucao = consulta.execucaoFormulario;

      if (!execucao) {
        // Linha para consulta sem execução
        const row = [
          pacienteData.nome,
          consulta.dataHora ? format(new Date(consulta.dataHora), 'dd/MM/yyyy HH:mm') : 'N/A',
          consulta.usuarioDTO?.nome || 'N/A',
          consulta.tipoConsulta || 'N/A',
          consulta.status || 'N/A',
          'Sem formulário associado',
          ...Array.from(todasPerguntas.keys()).map(() => 'N/A')
        ];
        rows.push(row);
        return;
      }

      const formTitulo = execucao.formulario?.titulo || 'Formulário não identificado';

      // Criar mapa de respostas por pergunta ID
      const respostasPorPergunta = {};
      if (execucao.respostas && Array.isArray(execucao.respostas)) {
        execucao.respostas.forEach(resposta => {
          const perguntaId = String(resposta.perguntaId);
          if (!respostasPorPergunta[perguntaId]) {
            respostasPorPergunta[perguntaId] = [];
          }
          respostasPorPergunta[perguntaId].push(resposta.texto);
        });
      }

      // Criar linha com dados básicos + respostas nas colunas correspondentes
      const row = [
        pacienteData.nome,
        consulta.dataHora ? format(new Date(consulta.dataHora), 'dd/MM/yyyy HH:mm') : 'N/A',
        consulta.usuarioDTO?.nome || 'N/A',
        consulta.tipoConsulta || 'N/A',
        consulta.status || 'N/A',
        formTitulo
      ];

      // Adicionar respostas para cada pergunta na ordem dos headers
      Array.from(todasPerguntas.keys()).forEach(perguntaId => {
        const respostas = respostasPorPergunta[perguntaId];
        if (respostas && respostas.length > 0) {
          row.push(respostas.join('; '));
        } else {
          row.push('N/A');
        }
      });

      rows.push(row);
    });

    // Converter para string CSV
    const csvContent = rows.map(row =>
      row.map(field => `"${String(field).replace(/"/g, '""')}"`)
         .join(',')
    ).join('\n');

    // Criar e baixar arquivo
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${pacienteData.nome.replace(/\s+/g, '_')}_${format(new Date(), 'ddMMyyyy')}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;

  } catch (error) {
    throw new Error('Erro ao gerar relatório CSV: ' + error.message);
  }
};

/**
 * Gera relatório PDF das execuções de formulários do paciente
 */
export const generatePDFReport = async (pacienteData, consultas = []) => {
  try {
    const doc = new jsPDF();
    let yPosition = 20;
    const lineHeight = 6;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    // Função para adicionar cabeçalho em cada página
    const addHeader = () => {
      let titleY = 18;
      let subtitleY = 24;
      let lineY = 28;
      let returnY = 35;

      // Adicionar logo se disponível
      if (LOGO_BASE64) {
        try {
          const logoWidth = 25;
          const logoHeight = 25;
          const logoX = 15;
          const logoY = 8;

          doc.addImage(LOGO_BASE64, 'PNG', logoX, logoY, logoWidth, logoHeight);

          // Ajustar posições do texto para acomodar o logo
          titleY = 18;
          subtitleY = 24;
          lineY = 33;
          returnY = 40;
        } catch (error) {
          console.error('Erro ao adicionar logo ao PDF:', error);
          // Continua sem o logo
        }
      }

      // Título principal
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0); // Preto
      doc.text('Ficha Clínica de Ginecologia', pageWidth / 2, titleY, { align: 'center' });

      // Subtítulo
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Rede Feminina de Combate ao Câncer', pageWidth / 2, subtitleY, { align: 'center' });

      // Linha decorativa preta
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(20, lineY, pageWidth - 20, lineY);

      return returnY; // Retorna posição Y após o cabeçalho
    };

    // Função para adicionar rodapé
    const addFooter = (pageNum) => {
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.setFont(undefined, 'italic');
      doc.text(
        `Relatório gerado em ${format(new Date(), 'dd/MM/yyyy')} às ${format(new Date(), 'HH:mm')}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(`Página ${pageNum}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
    };

    // Função para adicionar nova página se necessário
    let currentPage = 1;
    const checkPageBreak = (neededSpace = 20) => {
      if (yPosition + neededSpace > pageHeight - 20) {
        addFooter(currentPage);
        doc.addPage();
        currentPage++;
        yPosition = addHeader();
        return true;
      }
      return false;
    };

    // Adicionar cabeçalho da primeira página
    yPosition = addHeader();
    yPosition += 5;

    // Seção 1: Identificação do Paciente
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0); // Preto
    doc.text('1. Identificação', 20, yPosition);
    yPosition += 8;

    // Dados do paciente em formato de tabela
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);

    const drawField = (label, value, x, y, width = 85) => {
      doc.setFont(undefined, 'bold');
      doc.text(label + ':', x, y);
      doc.setFont(undefined, 'normal');
      doc.text(value || 'N/A', x + 25, y);
      // Linha inferior do campo
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(x, y + 1, x + width, y + 1);
    };

    drawField('Nome', pacienteData.nome, 25, yPosition, 165);
    yPosition += 8;

    drawField('CPF', pacienteData.cpf, 25, yPosition, 80);
    drawField('Data Nasc', pacienteData._dataDeNascimento, 110, yPosition, 80);
    yPosition += 8;

    drawField('Email', pacienteData.email, 25, yPosition, 80);
    drawField('Telefone', pacienteData.telefone, 110, yPosition, 80);
    yPosition += 8;

    if (pacienteData.endereco) {
      drawField('Endereço', pacienteData.endereco, 25, yPosition, 165);
      yPosition += 8;
    }

    yPosition += 5;

    // Seção 2: Histórico de Consultas
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0); // Preto
    doc.text('2. Histórico de Consultas e Anamneses', 20, yPosition);
    yPosition += 8;

    if (!consultas || consultas.length === 0) {
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Nenhuma consulta registrada.', 25, yPosition);
    } else {
      consultas.forEach((consulta, index) => {
        checkPageBreak(50);

        // Box da consulta
        doc.setDrawColor(0, 0, 0); // Borda preta
        doc.setLineWidth(0.5);
        const boxStartY = yPosition - 3;

        // Cabeçalho da consulta com fundo cinza claro
        doc.setFillColor(245, 245, 245); // Cinza claro
        doc.rect(20, boxStartY, pageWidth - 40, 10, 'F');
        doc.rect(20, boxStartY, pageWidth - 40, 10, 'S');

        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0); // Preto
        doc.text(`Consulta ${index + 1} - ${consulta.dataHora ? format(new Date(consulta.dataHora), 'dd/MM/yyyy HH:mm') : 'Data não informada'}`, 25, yPosition + 4);
        yPosition += 13;

        // Dados da consulta
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        drawField('Profissional', consulta.usuarioDTO?.nome, 25, yPosition, 80);
        drawField('Tipo', consulta.tipoConsulta, 110, yPosition, 80);
        yPosition += 8;

        drawField('Status', consulta.status, 25, yPosition, 165);
        yPosition += 8;

        // Execução do formulário
        const execucao = consulta.execucaoFormulario;
        if (!execucao) {
          doc.setFont(undefined, 'italic');
          doc.setTextColor(128, 128, 128);
          doc.text('Sem anamnese associada a esta consulta', 25, yPosition);
          yPosition += lineHeight + 2;
        } else {
          // Nome do formulário
          doc.setFont(undefined, 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('Anamnese:', 25, yPosition);
          doc.setFont(undefined, 'normal');
          doc.text(execucao.formulario?.titulo || 'Não identificado', 50, yPosition);
          yPosition += lineHeight + 2;

          // Respostas
          if (!execucao.respostas || execucao.respostas.length === 0) {
            doc.setFont(undefined, 'italic');
            doc.setTextColor(128, 128, 128);
            doc.text('Formulário sem respostas preenchidas', 25, yPosition);
            yPosition += lineHeight + 2;
          } else {
            // Agrupar respostas por pergunta
            const respostasPorPergunta = {};
            execucao.respostas.forEach(resposta => {
              const perguntaId = String(resposta.perguntaId);
              if (!respostasPorPergunta[perguntaId]) {
                respostasPorPergunta[perguntaId] = {
                  enunciado: resposta.enunciado || `Pergunta ${perguntaId}`,
                  textos: []
                };
              }
              respostasPorPergunta[perguntaId].textos.push(resposta.texto);
            });

            // Renderizar cada pergunta e resposta
            Object.entries(respostasPorPergunta).forEach(([perguntaId, dadosPergunta], idx) => {
              checkPageBreak(15);

              // Pergunta em negrito
              doc.setFont(undefined, 'bold');
              doc.setTextColor(0, 0, 0);
              const maxWidthPergunta = 160;
              const perguntaLines = doc.splitTextToSize(`${idx + 1}. ${dadosPergunta.enunciado}`, maxWidthPergunta);

              perguntaLines.forEach(line => {
                checkPageBreak();
                doc.text(line, 25, yPosition);
                yPosition += lineHeight;
              });

              // Resposta normal
              doc.setFont(undefined, 'normal');
              doc.setTextColor(60, 60, 60);
              const respostaTexto = dadosPergunta.textos.join('; ');
              const maxWidthResposta = 155;
              const respostaLines = doc.splitTextToSize(`R: ${respostaTexto}`, maxWidthResposta);

              respostaLines.forEach(line => {
                checkPageBreak();
                doc.text(line, 30, yPosition);
                yPosition += lineHeight;
              });

              yPosition += 2; // Espaço entre perguntas
            });
          }
        }

        // Fechar box da consulta
        const boxEndY = yPosition + 2;
        doc.setDrawColor(0, 0, 0); // Borda preta
        doc.setLineWidth(0.5);
        doc.rect(20, boxStartY, pageWidth - 40, boxEndY - boxStartY, 'S');

        yPosition += 10; // Espaço entre consultas
      });
    }

    // Adicionar rodapé na última página
    addFooter(currentPage);

    // Salvar PDF
    const fileName = `Ficha_Clinica_${pacienteData.nome.replace(/\s+/g, '_')}_${format(new Date(), 'ddMMyyyy')}.pdf`;
    doc.save(fileName);

    return true;

  } catch (error) {
    throw new Error('Erro ao gerar relatório PDF: ' + error.message);
  }
};