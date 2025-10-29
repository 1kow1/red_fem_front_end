/**
 * Script para popular base de dados via console do navegador
 *
 * INSTRUÇÕES:
 * 1. Faça LOGIN na aplicação
 * 2. Abra o console do navegador (F12 → Console)
 * 3. Cole TODO este arquivo e pressione Enter
 * 4. Aguarde a conclusão!
 */

(async function() {
  const API_URL = 'http://localhost:8003';
  const NUM_USERS = 20;
  const NUM_PACIENTES = 50;
  const NUM_CONSULTAS = 30;

  // ============ Dados fictícios ============

  const nomesFemininos = [
    'Maria', 'Ana', 'Juliana', 'Fernanda', 'Patricia', 'Carla', 'Gabriela',
    'Camila', 'Beatriz', 'Larissa', 'Mariana', 'Carolina', 'Bruna', 'Amanda',
    'Leticia', 'Tatiana', 'Rafaela', 'Luiza', 'Aline', 'Daniela', 'Vanessa',
    'Priscila', 'Renata', 'Cristina', 'Sandra', 'Claudia', 'Adriana', 'Paula',
    'Silvia', 'Helena', 'Julia', 'Isabela', 'Melissa', 'Natalia', 'Bianca'
  ];

  const sobrenomes = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Pereira', 'Alves',
    'Ferreira', 'Rodrigues', 'Lima', 'Martins', 'Carvalho', 'Araújo', 'Gomes',
    'Ribeiro', 'Rocha', 'Mendes', 'Dias', 'Castro', 'Barbosa', 'Campos',
    'Cardoso', 'Monteiro', 'Moreira', 'Cavalcanti', 'Teixeira', 'Nascimento'
  ];

  const cidadesParana = [
    'Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel',
    'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá', 'Toledo'
  ];

  const profissoes = [
    'Professora', 'Enfermeira', 'Comerciante', 'Estudante', 'Administradora',
    'Contadora', 'Advogada', 'Médica', 'Engenheira', 'Arquiteta', 'Designer',
    'Jornalista', 'Psicóloga', 'Fisioterapeuta', 'Nutricionista', 'Do lar'
  ];

  const cargos = ['MEDICO', 'RESIDENTE', 'ACADEMICO', 'RECEPCIONISTA'];
  const especialidades = ['GINECOLOGIA', 'ONCOLOGIA'];
  const estadosCivilF = ['SOLTEIRA', 'CASADA', 'DIVORCIADA', 'VIUVA'];
  const tiposConsulta = ['CONSULTA', 'RETORNO'];

  // ============ Funções auxiliares ============

  function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  function generateCPF() {
    const num = Math.floor(Math.random() * 100000000000);
    return num.toString().padStart(11, '0');
  }

  function generatePhone() {
    const ddd = '42';
    const prefix = '9';
    const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `${ddd}${prefix}${number}`;
  }

  function generateCRM() {
    const number = Math.floor(Math.random() * 100000).toString().padStart(6, '0');
    return `CRM/PR ${number}`;
  }

  function generateEmail(nome, sobrenome) {
    const clean = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return `${clean(nome)}.${clean(sobrenome)}${Math.floor(Math.random() * 1000)}@email.com`;
  }

  // ============ Funções de criação ============

  async function createUser() {
    const nome = randomItem(nomesFemininos);
    const sobrenome = randomItem(sobrenomes);
    const cargo = randomItem(cargos);
    const needsEspecialidade = ['MEDICO', 'RESIDENTE'].includes(cargo);

    const userData = {
      nome: `${nome} ${sobrenome}`,
      email: generateEmail(nome, sobrenome),
      telefone: generatePhone(),
      cargo: cargo,
      senha: 'senha123'
    };

    if (needsEspecialidade) {
      userData.especialidade = randomItem(especialidades);
      userData.crm = generateCRM();
    }

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        return { success: true };
      } else {
        const error = await response.text();
        return { success: false, error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function createPaciente() {
    const nome = randomItem(nomesFemininos);
    const sobrenome = randomItem(sobrenomes);

    const hoje = new Date();
    const minDate = new Date(hoje.getFullYear() - 80, hoje.getMonth(), hoje.getDate());
    const maxDate = new Date(hoje.getFullYear() - 18, hoje.getMonth(), hoje.getDate());

    const pacienteData = {
      nome: `${nome} ${sobrenome}`,
      cpf: generateCPF(),
      dataDeNascimento: formatDate(randomDate(minDate, maxDate)),
      telefone: generatePhone(),
      email: generateEmail(nome, sobrenome),
      profissao: randomItem(profissoes),
      sexo: 'F',
      estadoCivil: randomItem(estadosCivilF),
      cidade: randomItem(cidadesParana),
      uf: 'PR'
    };

    try {
      const response = await fetch(`${API_URL}/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(pacienteData)
      });

      if (response.ok) {
        const data = await response.json();
        return data.id;
      } else {
        const errorText = await response.text();
        console.error(`❌ Erro ao criar paciente ${pacienteData.nome}: ${response.status} - ${errorText}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Exceção ao criar paciente ${pacienteData.nome}:`, error);
      return null;
    }
  }

  async function getMedicos() {
    try {
      const response = await fetch(`${API_URL}/users/buscar?cargos=MEDICO&cargos=RESIDENTE&size=100`, {
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('❌ Erro ao buscar médicos:', response.status);
        return [];
      }

      const data = await response.json();
      console.log('📋 Resposta da API de médicos:', data);

      if (data.content && Array.isArray(data.content)) {
        return data.content.map(user => user.id);
      }

      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar médicos:', error);
      return [];
    }
  }

  async function getPacientes() {
    try {
      const response = await fetch(`${API_URL}/pacientes/buscar?size=100&ativo=true`, {
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('❌ Erro ao buscar pacientes:', response.status);
        return [];
      }

      const data = await response.json();
      console.log('📋 Resposta da API de pacientes:', data);

      if (data.content && Array.isArray(data.content)) {
        return data.content.map(p => p.id);
      }

      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar pacientes:', error);
      return [];
    }
  }

  async function createConsulta(pacienteId, medicoIds) {
    if (medicoIds.length === 0) {
      console.error('❌ Nenhum médico disponível para criar consulta');
      return false;
    }

    const hoje = new Date();
    const minDate = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    const maxDate = new Date(hoje.getTime() + 90 * 24 * 60 * 60 * 1000);

    const dataConsulta = randomDate(minDate, maxDate);
    const hora = Math.floor(Math.random() * 9) + 8;
    const minuto = Math.random() < 0.5 ? '00' : '30';

    // Ajustar data para incluir hora
    dataConsulta.setHours(hora, minuto === '00' ? 0 : 30, 0, 0);

    const consultaData = {
      patientId: pacienteId,
      medicoId: randomItem(medicoIds),
      dataHora: dataConsulta.toISOString(),
      tipoConsulta: randomItem(tiposConsulta)
    };

    try {
      const response = await fetch(`${API_URL}/consultas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(consultaData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro ao criar consulta: ${response.status} - ${errorText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao criar consulta:', error);
      return false;
    }
  }

  // ============ Execução ============

  console.log('🚀 Iniciando população da base de dados...\n');

  // Opção 1: Criar novos usuários
  let usersCreated = 0;
  const criarUsuarios = confirm('Deseja CRIAR novos usuários? (OK = Sim, Cancelar = Não, apenas usar existentes)');

  if (criarUsuarios) {
    console.log(`👥 Criando ${NUM_USERS} usuários...`);
    for (let i = 0; i < NUM_USERS; i++) {
      const result = await createUser();
      if (result.success) usersCreated++;
    }
    console.log(`✅ ${usersCreated}/${NUM_USERS} usuários criados!\n`);
  } else {
    console.log('⏭️  Pulando criação de usuários (usando existentes)\n');
  }

  // Opção 2: Criar novos pacientes
  let pacientesCreated = 0;
  const criarPacientes = confirm('Deseja CRIAR novos pacientes? (OK = Sim, Cancelar = Não, apenas usar existentes)');

  if (criarPacientes) {
    console.log(`🏥 Criando ${NUM_PACIENTES} pacientes...`);
    for (let i = 0; i < NUM_PACIENTES; i++) {
      const pacienteId = await createPaciente();
      if (pacienteId) {
        pacientesCreated++;
        if ((i + 1) % 10 === 0) {
          console.log(`   Progresso: ${pacientesCreated} criados de ${i + 1} tentativas...`);
        }
      }
    }
    console.log(`✅ ${pacientesCreated}/${NUM_PACIENTES} pacientes criados!\n`);
  } else {
    console.log('⏭️  Pulando criação de pacientes (usando existentes)\n');
  }

  // Buscar médicos existentes
  console.log('🔍 Buscando médicos cadastrados...');
  const medicoIds = await getMedicos();
  console.log(`✅ Encontrados ${medicoIds.length} médicos`);
  if (medicoIds.length > 0) {
    console.log(`   Primeiros 5 IDs: ${medicoIds.slice(0, 5).join(', ')}...\n`);
  } else {
    console.log('   ⚠️ ATENÇÃO: Nenhum médico encontrado!\n');
  }

  // Buscar pacientes existentes
  console.log('🔍 Buscando pacientes cadastrados...');
  const pacienteIds = await getPacientes();
  console.log(`✅ Encontrados ${pacienteIds.length} pacientes`);
  if (pacienteIds.length > 0) {
    console.log(`   Primeiros 5 IDs: ${pacienteIds.slice(0, 5).join(', ')}...\n`);
  } else {
    console.log('   ⚠️ ATENÇÃO: Nenhum paciente encontrado!\n');
  }

  // Criar consultas
  let consultasCreated = 0;
  if (medicoIds.length === 0) {
    console.log('⚠️  Pulando criação de consultas - NENHUM MÉDICO encontrado');
    console.log('   Certifique-se de que os usuários com cargo MEDICO ou RESIDENTE foram criados corretamente.');
  } else if (pacienteIds.length === 0) {
    console.log('⚠️  Pulando criação de consultas - NENHUM PACIENTE encontrado');
  } else {
    console.log(`📅 Criando ${NUM_CONSULTAS} consultas...`);
    console.log(`   Usando ${pacienteIds.length} pacientes e ${medicoIds.length} médicos\n`);

    for (let i = 0; i < NUM_CONSULTAS; i++) {
      const pacienteId = randomItem(pacienteIds);
      const success = await createConsulta(pacienteId, medicoIds);
      if (success) {
        consultasCreated++;
        if ((i + 1) % 10 === 0) {
          console.log(`   Progresso: ${i + 1}/${NUM_CONSULTAS}...`);
        }
      }
    }
    console.log(`✅ ${consultasCreated}/${NUM_CONSULTAS} consultas criadas!\n`);
  }

  // Resumo
  console.log('🎉 População concluída!');
  console.log('═'.repeat(50));
  console.log(`✓ Usuários criados: ${usersCreated}`);
  console.log(`✓ Pacientes criados: ${pacientesCreated}`);
  console.log(`✓ Médicos encontrados: ${medicoIds.length}`);
  console.log(`✓ Pacientes encontrados: ${pacienteIds.length}`);
  console.log(`✓ Consultas criadas: ${consultasCreated}/${NUM_CONSULTAS}`);
  console.log('═'.repeat(50));

})();
