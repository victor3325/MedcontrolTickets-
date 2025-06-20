import { createTicket } from '../../src/services/jira';

export default async function handler(req, res) {
  console.log(`[${new Date().toISOString()}] - Handler iniciado. Método: ${req.method}`);

  if (req.method === 'POST') {
    try {
      console.log('Requisição POST recebida.');
      let ticketData = req.body;

      if (!ticketData || Object.keys(ticketData).length === 0) {
        console.log('req.body está vazio. Tentando ler o stream de dados...');
        ticketData = await new Promise((resolve, reject) => {
          let data = '';
          req.on('data', chunk => { data += chunk; });
          req.on('end', () => {
            try {
              console.log('Stream de dados lido com sucesso.');
              resolve(JSON.parse(data));
            } catch (e) {
              console.error('Erro no parse do stream de dados:', e);
              reject(e);
            }
          });
        });
      }
      
      console.log('Dados do ticket recebidos:', JSON.stringify(ticketData, null, 2));
      console.log('Iniciando processo de criação de ticket no Jira...');
      const jiraResponse = await createTicket(ticketData);
      
      console.log('Ticket criado no Jira com sucesso:', jiraResponse);
      res.status(201).json({ message: 'Ticket criado no Jira', jira: jiraResponse });
    } catch (error) {
      console.error('--- ERRO CAPTURADO NO HANDLER ---');
      if (error.response) {
        // Erro vindo do Axios (provavelmente do Jira)
        console.error('Erro de resposta da API externa (Jira). Status:', error.response.status);
        console.error('Corpo do Erro (Jira):', JSON.stringify(error.response.data, null, 2));
        res.status(400).json({ 
          error: "O Jira retornou um erro.",
          jira_status: error.response.status,
          jira_response: error.response.data 
        });
      } else {
        // Outro tipo de erro (ex: falha de rede, erro no nosso código)
        console.error('Erro inesperado:', error.message);
        res.status(500).json({ error: "Erro interno do servidor.", message: error.message });
      }
    }
  } else {
    console.warn(`Método ${req.method} não é permitido.`);
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Método ${req.method} Não Permitido` });
  }
} 