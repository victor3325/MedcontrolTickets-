import axios from 'axios';

export async function createTicket(ticketData) {
  const {
    JIRA_BASE_URL,
    JIRA_EMAIL,
    JIRA_API_TOKEN,
    JIRA_PROJECT_KEY
  } = process.env;

  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

  const issueData = {
    fields: {
      project: { key: JIRA_PROJECT_KEY },
      summary: ticketData.summary || 'Novo ticket do Medcontrol',
      description: ticketData.description || '',
      issuetype: { name: 'Task' },
    }
  };

  const response = await axios.post(
    `${JIRA_BASE_URL}/rest/api/3/issue`,
    issueData,
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
} 