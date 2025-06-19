import { createTicket } from '../src/services/jira.js';

export default async function handler(req, res) {
  console.log('Requisição recebida:', req.method);
  if (req.method === 'POST') {
    try {
      let ticketData = req.body;
      if (!ticketData || Object.keys(ticketData).length === 0) {
        ticketData = await new Promise((resolve, reject) => {
          let data = '';
          req.on('data', chunk => { data += chunk; });
          req.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              console.error('Erro ao fazer parse do body:', e);
              reject(e);
            }
          });
        });
      }
      console.log('Dados do ticket:', ticketData);
      const jiraResponse = await createTicket(ticketData);
      console.log('Resposta do Jira:', jiraResponse);
      res.status(201).json({ message: 'Ticket criado no Jira', jira: jiraResponse });
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
} 