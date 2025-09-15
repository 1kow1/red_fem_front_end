// src/utils/reportUtils.js
import { format } from 'date-fns';

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
    console.error('❌ Erro ao gerar relatório CSV:', error);
    throw new Error('Erro ao gerar relatório CSV: ' + error.message);
  }
};

/**
 * Gera relatório PDF das execuções de formulários do paciente
 */
export const generatePDFReport = async (pacienteData, consultas = []) => {
  try {
    // Importação dinâmica do jsPDF
    const { jsPDF } = await import('jspdf');


    const doc = new jsPDF();
    let yPosition = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;

    // Função para adicionar nova página se necessário
    const checkPageBreak = (neededSpace = 20) => {
      if (yPosition + neededSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Cabeçalho do relatório
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Relatório de Execuções de Formulários', 20, yPosition);
    yPosition += 15;

    // Dados do paciente
    doc.setFontSize(12);
    doc.text('Dados do Paciente:', 20, yPosition);
    yPosition += 10;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Nome: ${pacienteData.nome}`, 25, yPosition);
    yPosition += lineHeight;
    doc.text(`CPF: ${pacienteData.cpf || 'N/A'}`, 25, yPosition);
    yPosition += lineHeight;
    doc.text(`Email: ${pacienteData.email || 'N/A'}`, 25, yPosition);
    yPosition += lineHeight;
    doc.text(`Data de Nascimento: ${pacienteData._dataDeNascimento || 'N/A'}`, 25, yPosition);
    yPosition += lineHeight;

    yPosition += 10; // Espaço

    // Data de geração
    doc.text(`Relatório gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 25, yPosition);
    yPosition += 15;

    // Processar consultas
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Histórico de Consultas e Execuções:', 20, yPosition);
    yPosition += 10;

    if (!consultas || consultas.length === 0) {
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text('Nenhuma consulta encontrada.', 25, yPosition);
    } else {
      consultas.forEach((consulta, index) => {
        checkPageBreak(40);

        // Dados da consulta
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Consulta ${index + 1}`, 25, yPosition);
        yPosition += 8;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(`Data: ${consulta.dataHora ? format(new Date(consulta.dataHora), 'dd/MM/yyyy HH:mm') : 'N/A'}`, 30, yPosition);
        yPosition += lineHeight;
        doc.text(`Médico: ${consulta.usuarioDTO?.nome || 'N/A'}`, 30, yPosition);
        yPosition += lineHeight;
        doc.text(`Tipo: ${consulta.tipoConsulta || 'N/A'}`, 30, yPosition);
        yPosition += lineHeight;
        doc.text(`Status: ${consulta.status || 'N/A'}`, 30, yPosition);
        yPosition += lineHeight;

        // Execução do formulário
        const execucao = consulta.execucaoFormulario;
        if (!execucao) {
          doc.text('• Sem formulário associado', 30, yPosition);
          yPosition += lineHeight;
        } else {
          doc.text(`• Formulário: ${execucao.formulario?.titulo || 'Não identificado'}`, 30, yPosition);
          yPosition += lineHeight;
          doc.text(`• Liberado: ${execucao.isLiberado ? 'Sim' : 'Não'}`, 30, yPosition);
          yPosition += lineHeight;

          // Respostas
          if (!execucao.respostas || execucao.respostas.length === 0) {
            doc.text('• Sem respostas registradas', 30, yPosition);
            yPosition += lineHeight;
          } else {
            doc.text('• Respostas:', 30, yPosition);
            yPosition += lineHeight;

            // Agrupar respostas por pergunta, mantendo o enunciado
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

            Object.entries(respostasPorPergunta).forEach(([perguntaId, dadosPergunta]) => {
              checkPageBreak(15);

              // Usar o enunciado que vem na resposta
              const enunciadoPergunta = dadosPergunta.enunciado;

              // Quebra texto longo
              const respostaTexto = dadosPergunta.textos.join('; ');
              const maxWidth = 150;
              const splitText = doc.splitTextToSize(`  - ${enunciadoPergunta}: ${respostaTexto}`, maxWidth);

              splitText.forEach(line => {
                checkPageBreak();
                doc.text(line, 35, yPosition);
                yPosition += lineHeight;
              });
            });
          }
        }

        yPosition += 8; // Espaço entre consultas
      });
    }

    // Salvar PDF
    const fileName = `relatorio_${pacienteData.nome.replace(/\s+/g, '_')}_${format(new Date(), 'ddMMyyyy')}.pdf`;
    doc.save(fileName);

    return true;

  } catch (error) {
    console.error('❌ Erro ao gerar relatório PDF:', error);
    throw new Error('Erro ao gerar relatório PDF: ' + error.message);
  }
};