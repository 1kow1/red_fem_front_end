export const testData = {
  pacientes: [
    {
      id: 'pac001',
      nome: 'Maria Silva Santos',
      sexo: 'Feminino',
      email: 'maria.silva@email.com',
      telefone: '(11) 98765-4321',
      dataNasc: '1985-03-15',
      estadoCivil: 'Casada',
      profissao: 'Professora',
      endereco: 'Rua das Flores, 123 - Apto 45',
      cidade: 'São Paulo',
      uf: 'SP',
      cpf: '123.456.789-00'
    },
    {
      id: 'pac002', 
      nome: 'João Carlos Santos',
      sexo: 'Masculino',
      email: 'joao.santos@email.com',
      telefone: '(11) 91234-5678',
      dataNasc: '1978-07-22',
      estadoCivil: 'Solteiro',
      profissao: 'Engenheiro',
      endereco: 'Av. Paulista, 456 - Conj 12',
      cidade: 'São Paulo',
      uf: 'SP',
      cpf: '987.654.321-00'
    },
    {
      id: 'pac003',
      nome: 'Ana Costa Ferreira',
      sexo: 'Feminino',
      email: 'ana.costa@email.com',
      telefone: '(11) 95555-1234',
      dataNasc: '1992-11-08',
      estadoCivil: 'União Estável',
      profissao: 'Advogada',
      endereco: 'Rua Augusta, 789',
      cidade: 'São Paulo',
      uf: 'SP',
      cpf: '456.789.123-00'
    },
    {
      id: 'pac004',
      nome: 'Carlos Oliveira Lima',
      sexo: 'Masculino',
      email: 'carlos.oliveira@email.com',
      telefone: '(21) 97777-8888',
      dataNasc: '1965-12-30',
      estadoCivil: 'Divorciado',
      profissao: 'Contador',
      endereco: 'Rua Copacabana, 234',
      cidade: 'Rio de Janeiro',
      uf: 'RJ',
      cpf: '789.123.456-00'
    },
    {
      id: 'pac005',
      nome: 'Fernanda Ribeiro Costa',
      sexo: 'Feminino',
      email: 'fernanda.ribeiro@email.com',
      telefone: '(31) 96666-7777',
      dataNasc: '1988-05-17',
      estadoCivil: 'Casada',
      profissao: 'Médica',
      endereco: 'Av. Afonso Pena, 567',
      cidade: 'Belo Horizonte',
      uf: 'MG',
      cpf: '321.654.987-00'
    }
  ],

  consultas: [
    {
      id: 'con001',
      paciente: 'Maria Silva Santos',
      medico: 'Dr. Lima Barreto',
      dataConsulta: '2024-08-25T10:30:00',
      tipoConsulta: 'Primeira Consulta',
      status: 'Agendada',
      formularios: [
        {
          nome: 'Formulário Ginecológico',
          dataPreenchimento: '2024-08-25',
          status: 'Liberado'
        },
        {
          nome: 'Formulário Preventivo',
          dataPreenchimento: '2024-08-25',
          status: 'Salvo'
        },
        {
          nome: 'Exame Físico Geral',
          dataPreenchimento: null,
          status: 'Pendente'
        }
      ]
    },
    {
      id: 'con002',
      paciente: 'João Carlos Santos',
      medico: 'Dr. Carlos Mendes',
      dataConsulta: '2024-08-26T14:15:00',
      tipoConsulta: 'Retorno',
      status: 'Confirmada',
      formularios: [
        {
          nome: 'Formulário de Retorno',
          dataPreenchimento: '2024-08-26',
          status: 'Liberado'
        },
        {
          nome: 'Avaliação Cardiológica',
          dataPreenchimento: '2024-08-26',
          status: 'Salvo'
        }
      ]
    },
    {
      id: 'con003',
      paciente: 'Ana Costa Ferreira',
      medico: 'Dra. Fernanda Oliveira',
      dataConsulta: '2024-08-27T09:00:00',
      tipoConsulta: 'Consulta de Rotina',
      status: 'Concluída',
      formularios: [
        {
          nome: 'Check-up Anual',
          dataPreenchimento: '2024-08-27',
          status: 'Liberado'
        }
      ]
    },
    {
      id: 'con004',
      paciente: 'Carlos Oliveira Lima',
      medico: 'Dr. Roberto Silva',
      dataConsulta: '2024-08-28T16:30:00',
      tipoConsulta: 'Consulta Especializada',
      status: 'Agendada',
      formularios: [
        {
          nome: 'Avaliação Neurológica',
          dataPreenchimento: null,
          status: 'Pendente'
        },
        {
          nome: 'Histórico Médico',
          dataPreenchimento: '2024-08-23',
          status: 'Salvo'
        }
      ]
    },
    {
      id: 'con005',
      paciente: 'Fernanda Ribeiro Costa',
      medico: 'Dra. Patricia Lemos',
      dataConsulta: '2024-08-29T11:45:00',
      tipoConsulta: 'Consulta Pré-Natal',
      status: 'Cancelada',
      formularios: [
        {
          nome: 'Formulário Pré-Natal',
          dataPreenchimento: null,
          status: 'Pendente'
        }
      ]
    }
  ],

  usuarios: [
    {
      id: 'usr001',
      nome: 'Dr. Lima Barreto',
      email: 'lima.barreto@hospital.com',
      cargo: 'Médico',
      especialidade: 'Ginecologia e Obstetrícia',
      crm: 'CRM/SP 123456',
      ativo: 'Sim'
    },
    {
      id: 'usr002',
      nome: 'Dr. Carlos Mendes',
      email: 'carlos.mendes@hospital.com', 
      cargo: 'Médico',
      especialidade: 'Cardiologia',
      crm: 'CRM/SP 234567',
      ativo: 'Sim'
    },
    {
      id: 'usr003',
      nome: 'Dra. Fernanda Oliveira',
      email: 'fernanda.oliveira@hospital.com',
      cargo: 'Médica',
      especialidade: 'Clínica Geral',
      crm: 'CRM/SP 345678',
      ativo: 'Sim'
    },
    {
      id: 'usr004',
      nome: 'Dr. Roberto Silva',
      email: 'roberto.silva@hospital.com',
      cargo: 'Médico',
      especialidade: 'Neurologia',
      crm: 'CRM/SP 456789',
      ativo: 'Não'
    },
    {
      id: 'usr005',
      nome: 'Dra. Patricia Lemos',
      email: 'patricia.lemos@hospital.com',
      cargo: 'Médica',
      especialidade: 'Ginecologia e Obstetrícia',
      crm: 'CRM/RJ 567890',
      ativo: 'Sim'
    },
    {
      id: 'usr006',
      nome: 'Enfª. Ana Santos',
      email: 'ana.santos@hospital.com',
      cargo: 'Enfermeira',
      especialidade: 'Enfermagem Obstétrica',
      crm: 'COREN/SP 123456',
      ativo: 'Sim'
    },
    {
      id: 'usr007',
      nome: 'Admin Sistema',
      email: 'admin@hospital.com',
      cargo: 'Administrador',
      especialidade: 'Tecnologia da Informação',
      crm: '-',
      ativo: 'Sim'
    },
    {
      id: 'usr008',
      nome: 'Dr. Marcos Pereira',
      email: 'marcos.pereira@hospital.com',
      cargo: 'Médico',
      especialidade: 'Pediatria',
      crm: 'CRM/MG 789012',
      ativo: 'Não'
    }
  ],

  formularios: [
    {
      id: 'frm001',
      nome: 'Formulário Ginecológico',
      descricao: 'Coleta informações sobre histórico ginecológico e obstétrico.',
      dataCriacao: '2024-01-15',
      especialidade: 'Ginecologia'
    },
    {
      id: 'frm002',
      nome: 'Formulário Cardiológico',
      descricao: 'Avaliação de fatores de risco e sintomas relacionados ao coração.',
      dataCriacao: '2024-02-20',
      especialidade: 'Cardiologia'
    },
    {
      id: 'frm003',
      nome: 'Formulário Neurológico',
      descricao: 'Coleta dados sobre histórico neurológico e sintomas atuais.',
      dataCriacao: '2024-03-10',
      especialidade: 'Neurologia'
    },
    {
      id: 'frm004',
      nome: 'Formulário Pediátrico',
      descricao: 'Avaliação do desenvolvimento infantil e histórico de saúde da criança.',
      dataCriacao: '2024-04-05',
      especialidade: 'Pediatria'
    },
    {
      id: 'frm005',
      nome: 'Formulário Preventivo',
      descricao: 'Coleta informações para avaliação de saúde preventiva.',
      dataCriacao: '2024-05-12',
      especialidade: 'Clínica Geral'
    }
  ]
};