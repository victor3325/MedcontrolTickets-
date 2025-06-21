import axios from 'axios';

export async function createTicket(ticketData) {
  console.log('--- Serviço jira.js: Iniciando createTicket ---');
  
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraToken = process.env.JIRA_API_TOKEN;
  const jiraBaseUrl = process.env.JIRA_BASE_URL;
  const jiraProjectKey = process.env.JIRA_PROJECT_KEY;

  // ===================== LOGS DE DEPURAÇÃO FINAL =====================
  console.log(`DEBUG: JIRA_EMAIL = ${jiraEmail}`);
  console.log(`DEBUG: JIRA_PROJECT_KEY = ${jiraProjectKey}`);
  if (jiraToken) {
    console.log(`DEBUG: Comprimento do Token = ${jiraToken.length}`);
    console.log(`DEBUG: Token Começa Com = '${jiraToken.substring(0, 5)}...'`);
    console.log(`DEBUG: Token Termina Com = '...${jiraToken.substring(jiraToken.length - 5)}'`);
  } else {
    console.log('DEBUG: JIRA_API_TOKEN não foi definido!');
  }
  // =================================================================

  if (!jiraEmail || !jiraToken || !jiraBaseUrl || !jiraProjectKey) {
    console.error('ERRO CRÍTICO: Uma ou mais variáveis de ambiente do Jira não estão configuradas!');
    throw new Error('As credenciais ou configurações do Jira não foram encontradas nas variáveis de ambiente.');
  }

  console.log('Variáveis de ambiente do Jira carregadas. JIRA_PROJECT_KEY:', jiraProjectKey);

  const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');

  const issueData = {
    fields: {
      project: { key: jiraProjectKey },
      summary: ticketData.summary || 'Novo ticket do Medcontrol',
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: ticketData.description || 'Nenhuma descrição fornecida.',
              },
            ],
          },
        ],
      },
      issuetype: { name: 'Task' },
    },
  };

  console.log('Enviando para o Jira o seguinte payload:', JSON.stringify(issueData, null, 2));

  const endpoint = `${jiraBaseUrl}/rest/api/3/issue`;
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
    if (error.response) {
      console.error('Status do Erro:', error.response.status);
      console.error('Dados do Erro:', JSON.stringify(error.response.data, null, 2));
      // Cria um novo erro mais informativo para ser capturado pelo handler da API
      const JiraError = new Error('Erro retornado pela API do Jira.');
      JiraError.status = error.response.status;
      JiraError.jiraResponse = error.response.data;
      throw JiraError;
    } else {
      console.error('Erro de rede ou configuração do Axios:', error.message);
      // Mantém o erro original para problemas de rede
      throw error;
    }
  }
} 