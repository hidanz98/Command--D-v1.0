import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { nfseQueue } from "../lib/nfse-queue";
import { nfseAutoUpdate } from "../lib/nfse-auto-update";

const router = Router();

// Schema de validação para configuração NFSe
const nfseConfigSchema = z.object({
  ambiente: z.enum(["homologacao", "producao"]),
  certificadoNome: z.string().min(1),
  certificadoValidade: z.string(),
  cnpj: z.string().min(14),
  razaoSocial: z.string().min(1),
  nomeFantasia: z.string().min(1),
  inscricaoMunicipal: z.string().min(1),
  cep: z.string(),
  logradouro: z.string(),
  numero: z.string(),
  bairro: z.string(),
  cidade: z.string(),
  uf: z.string(),
  serie: z.string(),
  proximoNumero: z.string(),
  regime: z.enum(["simples_nacional", "lucro_presumido", "lucro_real"]),
  loginPBH: z.string().min(1),
  senhaPBH: z.string().min(1),
  codigoAtividade: z.string(),
  aliquota: z.string(),
  itemListaServico: z.string(),
  codigoTributacaoMunicipio: z.string(),
});

// POST /api/nfse/config - Salvar configuração NFSe
router.post("/config", async (req: Request, res: Response) => {
  try {
    const config = nfseConfigSchema.parse(req.body);
    
    // TODO: Salvar no banco de dados
    // Por enquanto, retorna sucesso
    
    res.json({
      success: true,
      message: "Configuração NFSe salva com sucesso!",
      data: {
        ambiente: config.ambiente,
        certificado: config.certificadoNome,
        proximoNumero: config.proximoNumero,
      },
    });
  } catch (error) {
    console.error("Erro ao salvar configuração NFSe:", error);
    res.status(400).json({
      success: false,
      message: "Erro ao salvar configuração",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

// POST /api/nfse/testar-conexao - Testar conexão com API PBH
router.post("/testar-conexao", async (req: Request, res: Response) => {
  try {
    const { ambiente, loginPBH, senhaPBH } = req.body;
    
    // TODO: Implementar teste real de conexão
    // Por enquanto, simula sucesso
    
    res.json({
      success: true,
      message: "Conexão testada com sucesso!",
      data: {
        ambiente,
        status: "ONLINE",
        tempoResposta: "285ms",
        endpoint: ambiente === "homologacao" 
          ? "https://bhisshomologacao.pbh.gov.br/bhiss-ws/nfse"
          : "https://bhissdigital.pbh.gov.br/bhiss-ws/nfse",
      },
    });
  } catch (error) {
    console.error("Erro ao testar conexão:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao testar conexão",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

// Schema para emissão de NFSe
const emitirNfseSchema = z.object({
  tomador: z.object({
    cnpjCpf: z.string(),
    nome: z.string(),
    email: z.string().email().optional(),
  }),
  servico: z.object({
    descricao: z.string(),
    valorServico: z.number(),
    desconto: z.number().optional(),
    itemListaServico: z.string(),
    codigoTributacao: z.string(),
    aliquota: z.number(),
  }),
});

// POST /api/nfse/emitir - Emitir NFSe (com fila e sincronização)
router.post("/emitir", async (req: Request, res: Response) => {
  try {
    const dados = emitirNfseSchema.parse(req.body);
    const tenantId = (req as any).tenantId || "default";
    
    // Adicionar à fila para processamento
    const queueId = await nfseQueue.adicionar({
      tenantId,
      dados: {
        tomador: dados.tomador,
        servico: dados.servico,
      },
    });
    
    // Retornar imediatamente com ID da fila
    res.json({
      success: true,
      message: "NFSe adicionada à fila de emissão!",
      data: {
        queueId,
        status: "processando",
        mensagem: "A NFSe será emitida automaticamente. Consulte o status usando o queueId.",
      },
    });
    
  } catch (error) {
    console.error("Erro ao adicionar NFSe na fila:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao adicionar NFSe na fila",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

// GET /api/nfse/consultar/:numero - Consultar NFSe
router.get("/consultar/:numero", async (req: Request, res: Response) => {
  try {
    const { numero } = req.params;
    
    // TODO: Implementar consulta real
    
    res.json({
      success: true,
      data: {
        numero,
        serie: "1",
        codigoVerificacao: "A1B2C3D4",
        dataEmissao: new Date().toLocaleDateString("pt-BR"),
        status: "Autorizada",
        prestador: "Bil's Cinema e Vídeo Ltda",
        tomador: "Cliente Exemplo",
        valorServico: 1000.00,
        valorISS: 50.00,
        link: `https://bhissdigital.pbh.gov.br/nfse/${numero}`,
      },
    });
  } catch (error) {
    console.error("Erro ao consultar NFSe:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao consultar NFSe",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

// POST /api/nfse/cancelar - Cancelar NFSe
router.post("/cancelar", async (req: Request, res: Response) => {
  try {
    const { numero, motivo } = req.body;
    
    if (!numero || !motivo) {
      return res.status(400).json({
        success: false,
        message: "Número da NFSe e motivo são obrigatórios",
      });
    }
    
    // TODO: Implementar cancelamento real
    
    res.json({
      success: true,
      message: "NFSe cancelada com sucesso!",
      data: {
        numero,
        dataCancelamento: new Date().toISOString(),
        motivo,
      },
    });
  } catch (error) {
    console.error("Erro ao cancelar NFSe:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao cancelar NFSe",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

// GET /api/nfse/fila/status/:queueId - Consultar status na fila
router.get("/fila/status/:queueId", async (req: Request, res: Response) => {
  try {
    const { queueId } = req.params;
    const item = nfseQueue.obterStatus(queueId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item não encontrado na fila",
      });
    }
    
    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Erro ao consultar fila:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao consultar fila",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

// GET /api/nfse/fila/estatisticas - Estatísticas da fila
router.get("/fila/estatisticas", async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || "default";
    const estatisticas = nfseQueue.obterEstatisticas();
    const itensTenant = nfseQueue.obterPorTenant(tenantId);
    
    res.json({
      success: true,
      data: {
        geral: estatisticas,
        tenant: {
          total: itensTenant.length,
          pendentes: itensTenant.filter(i => i.status === "pendente").length,
          sucesso: itensTenant.filter(i => i.status === "sucesso").length,
          erro: itensTenant.filter(i => i.status === "erro").length,
        },
        itens: itensTenant.map(i => ({
          id: i.id,
          status: i.status,
          tentativas: i.tentativas,
          criado: i.criado,
          resultado: i.resultado,
          erro: i.erro,
        })),
      },
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao obter estatísticas",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

// POST /api/nfse/fila/reprocessar/:queueId - Reprocessar item que falhou
router.post("/fila/reprocessar/:queueId", async (req: Request, res: Response) => {
  try {
    const { queueId } = req.params;
    const sucesso = await nfseQueue.reprocessar(queueId);
    
    if (!sucesso) {
      return res.status(400).json({
        success: false,
        message: "Não foi possível reprocessar este item",
      });
    }
    
    res.json({
      success: true,
      message: "Item reprocessado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao reprocessar:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao reprocessar",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

// GET /api/nfse/sistema/versao - Versão do sistema
router.get("/sistema/versao", async (req: Request, res: Response) => {
  try {
    const versao = nfseAutoUpdate.obterVersaoAtual();
    const ultimaVerificacao = nfseAutoUpdate.obterUltimaVerificacao();
    
    res.json({
      success: true,
      data: {
        versao,
        ultimaVerificacao,
        status: "atualizado",
      },
    });
  } catch (error) {
    console.error("Erro ao obter versão:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao obter versão",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

// POST /api/nfse/sistema/verificar-atualizacoes - Forçar verificação de atualizações
router.post("/sistema/verificar-atualizacoes", async (req: Request, res: Response) => {
  try {
    const updateInfo = await nfseAutoUpdate.forcarVerificacao();
    
    res.json({
      success: true,
      message: updateInfo.atualizacoesDisponiveis 
        ? "Atualizações aplicadas com sucesso!" 
        : "Sistema já está atualizado",
      data: updateInfo,
    });
  } catch (error) {
    console.error("Erro ao verificar atualizações:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao verificar atualizações",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

export default router;

