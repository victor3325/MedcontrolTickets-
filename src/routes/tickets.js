import express from 'express';
import { createTicket } from '../services/jira.js';

const router = express.Router();

// Recebe informações do app Medcontrol e cria um ticket no Jira
router.post('/', async (req, res) => {
  try {
    const ticketData = req.body;
    const jiraResponse = await createTicket(ticketData);
    res.status(201).json({ message: 'Ticket criado no Jira', jira: jiraResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 