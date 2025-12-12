import { Router, Request, Response } from "express";

const router = Router();

// URL base da API do Pluggy (sandbox é determinado pelas credenciais)
const PLUGGY_API_URL = "https://api.pluggy.ai";

// Gerar Connect Token do Pluggy
router.post("/connect-token", async (req: Request, res: Response) => {
  try {
    const { clientId, clientSecret } = req.body;

    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: "Client ID e Client Secret são obrigatórios" });
    }

    console.log("🔐 Tentando autenticar no Pluggy com Client ID:", clientId.substring(0, 8) + "...");

    // 1. Primeiro, obter o Access Token (API Key)
    const authResponse = await fetch(`${PLUGGY_API_URL}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        clientId,
        clientSecret,
      }),
    });

    const authText = await authResponse.text();
    console.log("📡 Resposta auth Pluggy:", authResponse.status, authText.substring(0, 200));

    if (!authResponse.ok) {
      console.error("❌ Erro ao autenticar no Pluggy:", authText);
      return res.status(401).json({ 
        error: "Falha na autenticação com Pluggy. Verifique suas credenciais.",
        details: authText
      });
    }

    const authData = JSON.parse(authText);
    const accessToken = authData.apiKey;

    if (!accessToken) {
      console.error("❌ API Key não retornada:", authData);
      return res.status(500).json({ error: "API Key não retornada pelo Pluggy" });
    }

    console.log("✅ Autenticado no Pluggy! Gerando Connect Token...");

    // 2. Agora, gerar o Connect Token
    const connectResponse = await fetch(`${PLUGGY_API_URL}/connect_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-API-KEY": accessToken,
      },
      body: JSON.stringify({}),
    });

    const connectText = await connectResponse.text();
    console.log("📡 Resposta connect_token Pluggy:", connectResponse.status);

    if (!connectResponse.ok) {
      console.error("❌ Erro ao gerar Connect Token:", connectText);
      return res.status(500).json({ error: "Falha ao gerar Connect Token", details: connectText });
    }

    const connectData = JSON.parse(connectText);

    console.log("✅ Connect Token gerado com sucesso!");

    res.json({
      success: true,
      connectToken: connectData.accessToken,
    });
  } catch (error) {
    console.error("❌ Erro no endpoint Pluggy:", error);
    res.status(500).json({ error: "Erro interno ao conectar com Pluggy", details: String(error) });
  }
});

// Buscar todos os Items (conexões) do usuário
router.post("/items", async (req: Request, res: Response) => {
  try {
    const { clientId, clientSecret } = req.body;

    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: "Client ID e Client Secret são obrigatórios" });
    }

    console.log("🔍 Buscando items conectados no Pluggy...");

    // Autenticar
    const authResponse = await fetch(`${PLUGGY_API_URL}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, clientSecret }),
    });

    if (!authResponse.ok) {
      return res.status(401).json({ error: "Falha na autenticação" });
    }

    const authData = await authResponse.json();
    const accessToken = authData.apiKey;

    // Buscar todos os items
    const itemsResponse = await fetch(`${PLUGGY_API_URL}/items`, {
      headers: { 
        "X-API-KEY": accessToken,
        "Accept": "application/json"
      },
    });

    if (!itemsResponse.ok) {
      const errorText = await itemsResponse.text();
      console.error("❌ Erro ao buscar items:", errorText);
      return res.status(500).json({ error: "Falha ao buscar conexões" });
    }

    const itemsData = await itemsResponse.json();
    console.log("✅ Items encontrados:", itemsData.results?.length || 0);

    // Para cada item, buscar as contas
    const allAccounts: any[] = [];
    
    for (const item of (itemsData.results || [])) {
      console.log(`📊 Buscando contas do item ${item.id} (${item.connector?.name || 'Banco'})...`);
      
      const accountsResponse = await fetch(`${PLUGGY_API_URL}/accounts?itemId=${item.id}`, {
        headers: { "X-API-KEY": accessToken },
      });

      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        for (const account of (accountsData.results || [])) {
          allAccounts.push({
            ...account,
            bankName: item.connector?.name || 'Banco',
            itemId: item.id,
            status: item.status,
          });
        }
      }
    }

    console.log("✅ Total de contas encontradas:", allAccounts.length);

    res.json({ 
      success: true, 
      items: itemsData.results || [],
      accounts: allAccounts 
    });
  } catch (error) {
    console.error("❌ Erro ao buscar items:", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Obter contas conectadas de um Item
router.post("/accounts", async (req: Request, res: Response) => {
  try {
    const { clientId, clientSecret, itemId } = req.body;

    if (!clientId || !clientSecret || !itemId) {
      return res.status(400).json({ error: "Parâmetros obrigatórios faltando" });
    }

    // Autenticar
    const authResponse = await fetch(`${PLUGGY_API_URL}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, clientSecret }),
    });

    if (!authResponse.ok) {
      return res.status(401).json({ error: "Falha na autenticação" });
    }

    const authData = await authResponse.json();
    const accessToken = authData.apiKey;

    // Buscar contas do item
    const accountsResponse = await fetch(`${PLUGGY_API_URL}/accounts?itemId=${itemId}`, {
      headers: { "X-API-KEY": accessToken },
    });

    if (!accountsResponse.ok) {
      return res.status(500).json({ error: "Falha ao buscar contas" });
    }

    const accountsData = await accountsResponse.json();
    res.json({ success: true, accounts: accountsData.results });
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Obter transações de uma conta
router.post("/transactions", async (req: Request, res: Response) => {
  try {
    const { clientId, clientSecret, accountId, from, to } = req.body;

    if (!clientId || !clientSecret || !accountId) {
      return res.status(400).json({ error: "Parâmetros obrigatórios faltando" });
    }

    // Autenticar
    const authResponse = await fetch(`${PLUGGY_API_URL}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, clientSecret }),
    });

    if (!authResponse.ok) {
      return res.status(401).json({ error: "Falha na autenticação" });
    }

    const authData = await authResponse.json();
    const accessToken = authData.apiKey;

    // Buscar transações
    let url = `${PLUGGY_API_URL}/transactions?accountId=${accountId}`;
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;

    const transactionsResponse = await fetch(url, {
      headers: { "X-API-KEY": accessToken },
    });

    if (!transactionsResponse.ok) {
      return res.status(500).json({ error: "Falha ao buscar transações" });
    }

    const transactionsData = await transactionsResponse.json();
    res.json({ success: true, transactions: transactionsData.results });
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
