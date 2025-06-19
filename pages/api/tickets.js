import { createTicket } from '../../src/services/jira';

export default async function handler(req, res) {
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
              reject(e);
            }
          });
        });
      }
      const jiraResponse = await createTicket(ticketData);
      res.status(201).json({ message: 'Ticket criado no Jira', jira: jiraResponse });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
} 