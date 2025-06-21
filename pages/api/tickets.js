import { createTicket } from '../../src/services/jira';

export default async function handler(req, res) {
  // ===================== TESTE DE DEPLOY =====================
  // Se você vir esta mensagem no Postman, o novo código está no ar.
  res.status(418).json({ 
    deploy_status: "SUCESSO! O CÓDIGO MAIS RECENTE ESTÁ ATIVO.",
    message: "Pode remover este teste e fazer o deploy final.",
    timestamp: new Date().toISOString() 
  });
  return; // A execução para aqui para este teste.
  // =========================================================

  // O código antigo abaixo não será executado durante o teste.
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
      console.error('--- ERRO CAPTURADO NO HANDLER DA API ---');
      
      // Verifica se é o nosso erro customizado vindo do serviço do Jira
      if (error.jiraResponse) {
        console.error('Erro detalhado do Jira:', JSON.stringify(error.jiraResponse, null, 2));
        res.status(error.status || 400).json({
          message: 'Ocorreu um erro na comunicação com o Jira.',
          details: error.jiraResponse
        });
      } else {
        // Trata outros erros (rede, código, etc.)
        console.error('Erro genérico do servidor:', error.message);
        res.status(500).json({ 
          message: "Erro interno do servidor.",
          error: error.message 
        });
      }
    }
  } else {
    console.warn(`Método ${req.method} não é permitido.`);
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Método ${req.method} Não Permitido` });
  }
} 