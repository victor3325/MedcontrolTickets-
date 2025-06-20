import axios from 'axios';

export async function createTicket(ticketData) {
  console.log('--- Serviço jira.js: Iniciando createTicket ---');
  
  if (!process.env.JIRA_EMAIL || !process.env.JIRA_API_TOKEN || !process.env.JIRA_BASE_URL || !process.env.JIRA_PROJECT_KEY) {
    console.error('ERRO CRÍTICO: Uma ou mais variáveis de ambiente do Jira não estão configuradas!');
    throw new Error('As credenciais ou configurações do Jira não foram encontradas nas variáveis de ambiente.');
  }

  console.log('Variáveis de ambiente do Jira carregadas. JIRA_PROJECT_KEY:', process.env.JIRA_PROJECT_KEY);

  const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');

  const issueData = {
    fields: {
      project: { key: process.env.JIRA_PROJECT_KEY },
      summary: ticketData.summary || 'Novo ticket do Medcontrol',
      description: ticketData.description || 'Nenhuma descrição fornecida.',
      issuetype: { name: 'Task' },
    },
  };

  const endpoint = `${process.env.JIRA_BASE_URL}/rest/api/3/issue`;
  console.log(`Enviando requisição POST para o endpoint do Jira: ${endpoint}`);

  try {
    const response = await axios.post(endpoint, issueData, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    console.log('Resposta do Jira recebida com sucesso. Status:', response.status);
    return response.data;
  } catch (error) {
    console.error('--- ERRO NA COMUNICAÇÃO COM O JIRA ---');
    console.error('Mensagem:', error.message);
    if (error.response) {
      console.error('Status do Erro:', error.response.status);
      console.error('Dados do Erro:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('O erro não possui um objeto de resposta. Pode ser um problema de rede ou configuração do Axios.');
    }
    console.error('------------------------------------');
    throw error;
  }
} 