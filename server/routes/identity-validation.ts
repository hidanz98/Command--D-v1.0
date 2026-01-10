import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { requireTenant } from '../middleware/tenantMiddleware';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// SISTEMA DE VALIDAÇÃO DE IDENTIDADE - 100% REAL
// ============================================
// APIs Utilizadas:
// - ReceitaWS: Consulta CNPJ (GRATUITA e REAL)
// - ViaCEP: Consulta CEP (GRATUITA e REAL)
// - BrasilAPI: Backup para CNPJ (GRATUITA e REAL)
// - BigDataCorp: CPF + Facial (quando configurado)
// ============================================

const BIGDATA_ACCESS_TOKEN = process.env.BIGDATA_ACCESS_TOKEN || '';
const COMPREFACE_URL = process.env.COMPREFACE_URL || '';
const COMPREFACE_API_KEY = process.env.COMPREFACE_API_KEY || '';

// ============================================
// VALIDAÇÃO DE CPF - Algoritmo Oficial
// ============================================
function isValidCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  if (/^(\d)\1+$/.test(numbers)) return false; // Todos dígitos iguais
  
  // Primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(numbers[9])) return false;
  
  // Segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  return rest === parseInt(numbers[10]);
}

// ============================================
// VALIDAÇÃO DE CNPJ - Algoritmo Oficial
// ============================================
function isValidCNPJ(cnpj: string): boolean {
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) return false;
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // Primeiro dígito
  let sum = 0;
  let weight = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weight[i];
  }
  let rest = sum % 11;
  let digit1 = rest < 2 ? 0 : 11 - rest;
  if (parseInt(numbers[12]) !== digit1) return false;
  
  // Segundo dígito
  sum = 0;
  weight = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weight[i];
  }
  rest = sum % 11;
  let digit2 = rest < 2 ? 0 : 11 - rest;
  return parseInt(numbers[13]) === digit2;
}

// ============================================
// CONSULTA CPF - REAL
// ============================================
router.post('/validate-cpf', async (req: Request, res: Response) => {
  try {
    const { cpf, nome } = req.body;

    if (!cpf) {
      return res.status(400).json({ error: 'CPF é obrigatório' });
    }

    const cpfLimpo = cpf.replace(/\D/g, '');

    // Validação matemática REAL do CPF
    if (!isValidCPF(cpfLimpo)) {
      return res.json({
        success: true,
        valid: false,
        provider: 'algoritmo-oficial',
        message: 'CPF inválido - dígitos verificadores não conferem',
        data: {
          cpf: cpfLimpo,
          valid: false,
          situacao: 'INVÁLIDO'
        }
      });
    }

    // Se BigDataCorp configurado, consulta dados completos
    if (BIGDATA_ACCESS_TOKEN) {
      try {
        console.log('🔍 Consultando CPF via BigDataCorp...');
        const response = await fetch('https://plataforma.bigdatacorp.com.br/pessoas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'AccessToken': BIGDATA_ACCESS_TOKEN
          },
          body: JSON.stringify({
            Datasets: 'basic_data',
            q: `doc{${cpfLimpo}}`
          })
        });

        const result = await response.json();
        const basicData = result[0]?.Result?.[0]?.BasicData;

        if (basicData) {
          return res.json({
            success: true,
            valid: basicData.TaxIdStatus === 'Regular',
            provider: 'BigDataCorp',
            data: {
              cpf: cpfLimpo,
              valid: basicData.TaxIdStatus === 'Regular',
              situacao: basicData.TaxIdStatus || 'Não encontrado',
              nome: basicData.Name,
              dataNascimento: basicData.BirthDate,
              nomeMae: basicData.MotherName,
              sexo: basicData.Gender,
              idade: basicData.Age,
              nomeConferido: nome ? basicData.Name?.toUpperCase().includes(nome.toUpperCase()) : null
            }
          });
        }
      } catch (err) {
        console.error('❌ Erro BigDataCorp:', err);
      }
    }

    // CPF válido matematicamente, mas sem dados completos
    console.log('✅ CPF válido (verificação matemática):', cpfLimpo);
    
    return res.json({
      success: true,
      valid: true,
      provider: 'algoritmo-oficial',
      message: 'CPF válido matematicamente. Para dados completos (nome, nascimento), configure BigDataCorp.',
      data: {
        cpf: cpfLimpo,
        valid: true,
        situacao: 'VÁLIDO',
        // Dados serão preenchidos com BigDataCorp quando configurado
        dadosCompletosDisponiveis: !!BIGDATA_ACCESS_TOKEN
      }
    });

  } catch (error: any) {
    console.error('Erro ao validar CPF:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao validar CPF' 
    });
  }
});

// ============================================
// CONSULTA CNPJ - ReceitaWS (100% REAL)
// ============================================
router.post('/validate-cnpj', async (req: Request, res: Response) => {
  try {
    const { cnpj } = req.body;

    if (!cnpj) {
      return res.status(400).json({ error: 'CNPJ é obrigatório' });
    }

    const cnpjLimpo = cnpj.replace(/\D/g, '');

    // Validação matemática do CNPJ
    if (!isValidCNPJ(cnpjLimpo)) {
      return res.json({
        success: true,
        valid: false,
        provider: 'algoritmo-oficial',
        message: 'CNPJ inválido - dígitos verificadores não conferem',
        data: {
          cnpj: cnpjLimpo,
          valid: false,
          situacao: 'INVÁLIDO'
        }
      });
    }

    // Consulta ReceitaWS (API REAL e GRATUITA)
    console.log('🔍 Consultando CNPJ via ReceitaWS...');
    
    try {
      const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'OK') {
          console.log('✅ CNPJ encontrado:', data.nome);
          
          return res.json({
            success: true,
            valid: true,
            provider: 'ReceitaWS',
            data: {
              cnpj: cnpjLimpo,
              valid: true,
              razaoSocial: data.nome,
              nomeFantasia: data.fantasia || data.nome,
              situacao: data.situacao,
              dataAbertura: data.abertura,
              tipo: data.tipo,
              porte: data.porte,
              naturezaJuridica: data.natureza_juridica,
              capitalSocial: data.capital_social,
              atividadePrincipal: data.atividade_principal?.[0]?.text,
              codigoAtividade: data.atividade_principal?.[0]?.code,
              atividadesSecundarias: data.atividades_secundarias?.map((a: any) => ({
                codigo: a.code,
                descricao: a.text
              })),
              endereco: {
                logradouro: data.logradouro,
                numero: data.numero,
                complemento: data.complemento,
                bairro: data.bairro,
                municipio: data.municipio,
                uf: data.uf,
                cep: data.cep?.replace(/\D/g, '')
              },
              telefone: data.telefone,
              email: data.email,
              socios: data.qsa?.map((s: any) => ({
                nome: s.nome,
                qualificacao: s.qual
              })),
              optanteSimples: data.simples?.optante || false,
              dataOpcaoSimples: data.simples?.data_opcao,
              optanteMEI: data.simei?.optante || false,
              ultimaAtualizacao: data.ultima_atualizacao
            }
          });
        }
      }
    } catch (err) {
      console.error('❌ Erro ReceitaWS:', err);
    }

    // Fallback: BrasilAPI
    console.log('🔄 Tentando BrasilAPI como fallback...');
    
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      
      if (response.ok) {
        const data = await response.json();
        
        return res.json({
          success: true,
          valid: true,
          provider: 'BrasilAPI',
          data: {
            cnpj: cnpjLimpo,
            valid: true,
            razaoSocial: data.razao_social,
            nomeFantasia: data.nome_fantasia || data.razao_social,
            situacao: data.descricao_situacao_cadastral,
            dataAbertura: data.data_inicio_atividade,
            porte: data.porte,
            atividadePrincipal: data.cnae_fiscal_descricao,
            codigoAtividade: data.cnae_fiscal?.toString(),
            endereco: {
              logradouro: data.logradouro,
              numero: data.numero,
              complemento: data.complemento,
              bairro: data.bairro,
              municipio: data.municipio,
              uf: data.uf,
              cep: data.cep?.toString()
            },
            telefone: data.ddd_telefone_1,
            email: data.email,
            optanteSimples: data.opcao_pelo_simples,
            optanteMEI: data.opcao_pelo_mei
          }
        });
      }
    } catch (err) {
      console.error('❌ Erro BrasilAPI:', err);
    }

    // Se ambas APIs falharam mas CNPJ é válido matematicamente
    return res.json({
      success: true,
      valid: true,
      provider: 'algoritmo-oficial',
      message: 'CNPJ válido matematicamente. Consulta externa indisponível no momento.',
      data: {
        cnpj: cnpjLimpo,
        valid: true,
        situacao: 'VÁLIDO (sem dados externos)'
      }
    });

  } catch (error: any) {
    console.error('Erro ao validar CNPJ:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao validar CNPJ' 
    });
  }
});

// ============================================
// CONSULTA CEP - ViaCEP (100% REAL)
// ============================================
router.post('/validate-cep', async (req: Request, res: Response) => {
  try {
    const { cep } = req.body;

    if (!cep) {
      return res.status(400).json({ error: 'CEP é obrigatório' });
    }

    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      return res.json({
        success: true,
        valid: false,
        message: 'CEP deve ter 8 dígitos',
        data: { cep: cepLimpo, valid: false }
      });
    }

    console.log('🔍 Consultando CEP via ViaCEP...');

    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();

    if (data.erro) {
      return res.json({
        success: true,
        valid: false,
        provider: 'ViaCEP',
        message: 'CEP não encontrado',
        data: { cep: cepLimpo, valid: false }
      });
    }

    console.log('✅ CEP encontrado:', data.logradouro);

    return res.json({
      success: true,
      valid: true,
      provider: 'ViaCEP',
      data: {
        cep: cepLimpo,
        valid: true,
        logradouro: data.logradouro,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf,
        ibge: data.ibge,
        ddd: data.ddd
      }
    });

  } catch (error: any) {
    console.error('Erro ao validar CEP:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao validar CEP' 
    });
  }
});

// ============================================
// VALIDAÇÃO FACIAL - BigDataCorp
// ============================================
router.post('/validate-face', async (req: Request, res: Response) => {
  try {
    const { cpf, selfieBase64 } = req.body;

    if (!cpf || !selfieBase64) {
      return res.status(400).json({ error: 'CPF e selfie são obrigatórios' });
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    console.log('📸 Validação facial para CPF:', cpfLimpo.substring(0, 3) + '***');

    // Verifica se BigDataCorp está configurado
    if (!BIGDATA_ACCESS_TOKEN) {
      // Tentar usar CompreFace como fallback gratuito
      if (COMPREFACE_URL) {
        try {
          const { documentPhotoBase64 } = req.body;
          
          if (documentPhotoBase64) {
            const comprefaceResponse = await fetch(`${COMPREFACE_URL}/api/v1/verification/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': COMPREFACE_API_KEY || ''
              },
              body: JSON.stringify({
                source_image: selfieBase64.replace(/^data:image\/\w+;base64,/, ''),
                target_image: documentPhotoBase64.replace(/^data:image\/\w+;base64,/, '')
              })
            });

            const comprefaceResult = await comprefaceResponse.json();
            
            return res.json({
              success: true,
              configured: true,
              provider: 'CompreFace (gratuito)',
              data: {
                faceMatch: comprefaceResult.result === 'True' || comprefaceResult.result === true,
                similarity: comprefaceResult.similarity || 0,
                liveness: false,
                qualityScore: comprefaceResult.quality || 0
              }
            });
          }
        } catch (error) {
          console.log('CompreFace não disponível, usando fallback básico');
        }
      }
      
      return res.json({
        success: true,
        configured: false,
        provider: 'none',
        message: 'BigDataCorp não configurado. Configure BIGDATA_ACCESS_TOKEN ou COMPREFACE_URL para validação facial.',
        data: {
          faceMatch: null,
          similarity: null,
          awaitsConfiguration: true
        }
      });
    }

    // Consulta REAL BigDataCorp
    console.log('🔍 Validando face via BigDataCorp...');
    
    const response = await fetch('https://plataforma.bigdatacorp.com.br/faces/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AccessToken': BIGDATA_ACCESS_TOKEN
      },
      body: JSON.stringify({
        cpf: cpfLimpo,
        image: selfieBase64.replace(/^data:image\/\w+;base64,/, '')
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erro na validação facial');
    }

    console.log('✅ Validação facial concluída. Match:', result.match);

    return res.json({
      success: true,
      configured: true,
      provider: 'BigDataCorp',
      data: {
        faceMatch: result.match === true,
        similarity: result.similarity || 0,
        liveness: result.liveness || false,
        antiSpoofing: result.antiSpoofing || false,
        qualityScore: result.qualityScore
      }
    });

  } catch (error: any) {
    console.error('Erro ao validar face:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao validar biometria' 
    });
  }
});

// ============================================
// VALIDAÇÃO FACIAL GRATUITA - CompreFace (Fallback)
// ============================================
router.post('/validate-face-free', async (req: Request, res: Response) => {
  try {
    const { selfieBase64, documentPhotoBase64, cpf } = req.body;

    if (!selfieBase64) {
      return res.status(400).json({ error: 'Selfie é obrigatória' });
    }

    // Opção 1: CompreFace (se configurado)
    if (COMPREFACE_URL) {
      try {
        console.log('🔍 Validando face via CompreFace (gratuito)...');
        
        // Se tiver foto do documento, fazer verificação
        if (documentPhotoBase64) {
          const response = await fetch(`${COMPREFACE_URL}/api/v1/verification/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': COMPREFACE_API_KEY || ''
            },
            body: JSON.stringify({
              source_image: selfieBase64.replace(/^data:image\/\w+;base64,/, ''),
              target_image: documentPhotoBase64.replace(/^data:image\/\w+;base64,/, '')
            })
          });

          const result = await response.json();
          
          return res.json({
            success: true,
            configured: true,
            provider: 'CompreFace',
            data: {
              faceMatch: result.result === 'True' || result.result === true,
              similarity: result.similarity || 0,
              liveness: false, // CompreFace não tem liveness nativo
              qualityScore: result.quality || 0
            }
          });
        } else {
          // Apenas detecção facial (sem comparação)
          const response = await fetch(`${COMPREFACE_URL}/api/v1/detection/detect`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': COMPREFACE_API_KEY || ''
            },
            body: JSON.stringify({
              file: selfieBase64.replace(/^data:image\/\w+;base64,/, '')
            })
          });

          const result = await response.json();
          
          return res.json({
            success: true,
            configured: true,
            provider: 'CompreFace',
            data: {
              faceDetected: result.result && result.result.length > 0,
              faceCount: result.result?.length || 0,
              qualityScore: result.result?.[0]?.quality || 0
            }
          });
        }
      } catch (error: any) {
        console.error('Erro ao usar CompreFace:', error);
        // Continua para fallback
      }
    }

    // Opção 2: Fallback - apenas validação básica (sem API externa)
    // Retorna sucesso se a imagem foi enviada (validação básica)
    return res.json({
      success: true,
      configured: false,
      provider: 'fallback',
      message: 'Apenas validação básica disponível. Configure CompreFace ou BigDataCorp para verificação completa.',
      data: {
        faceDetected: true, // Assume que foi detectado no frontend
        awaitsConfiguration: true
      }
    });

  } catch (error: any) {
    console.error('Erro ao validar face (gratuito):', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao validar biometria' 
    });
  }
});

// ============================================
// VALIDAÇÃO COMPLETA
// ============================================
router.post('/validate-complete', async (req: Request, res: Response) => {
  try {
    const { type, cpf, cnpj, nome, selfieBase64 } = req.body;

    const results: any = {
      success: true,
      type: type,
      validations: {}
    };

    // Validar CPF (se PF ou responsável de PJ)
    if (cpf) {
      const cpfLimpo = cpf.replace(/\D/g, '');
      const cpfValid = isValidCPF(cpfLimpo);
      
      results.validations.cpf = {
        numero: cpfLimpo,
        valid: cpfValid,
        situacao: cpfValid ? 'VÁLIDO' : 'INVÁLIDO'
      };

      // Se BigDataCorp configurado, busca dados completos
      if (cpfValid && BIGDATA_ACCESS_TOKEN) {
        try {
          const response = await fetch('https://plataforma.bigdatacorp.com.br/pessoas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'AccessToken': BIGDATA_ACCESS_TOKEN
            },
            body: JSON.stringify({
              Datasets: 'basic_data',
              q: `doc{${cpfLimpo}}`
            })
          });

          const data = await response.json();
          const basicData = data[0]?.Result?.[0]?.BasicData;

          if (basicData) {
            results.validations.cpf = {
              ...results.validations.cpf,
              situacao: basicData.TaxIdStatus,
              nome: basicData.Name,
              dataNascimento: basicData.BirthDate,
              nomeMae: basicData.MotherName,
              nomeConferido: nome ? basicData.Name?.toUpperCase().includes(nome.toUpperCase()) : null
            };
          }
        } catch (err) {
          console.error('Erro ao buscar dados CPF:', err);
        }
      }
    }

    // Validar CNPJ (se PJ)
    if (cnpj) {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      const cnpjValid = isValidCNPJ(cnpjLimpo);
      
      results.validations.cnpj = {
        numero: cnpjLimpo,
        valid: cnpjValid,
        situacao: cnpjValid ? 'VÁLIDO' : 'INVÁLIDO'
      };

      // Busca dados na ReceitaWS
      if (cnpjValid) {
        try {
          const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`);
          const data = await response.json();

          if (data.status === 'OK') {
            results.validations.cnpj = {
              ...results.validations.cnpj,
              razaoSocial: data.nome,
              nomeFantasia: data.fantasia,
              situacao: data.situacao,
              porte: data.porte,
              optanteSimples: data.simples?.optante
            };
          }
        } catch (err) {
          console.error('Erro ao buscar dados CNPJ:', err);
        }
      }
    }

    // Validar Face
    if (selfieBase64 && cpf) {
      if (BIGDATA_ACCESS_TOKEN) {
        try {
          const response = await fetch('https://plataforma.bigdatacorp.com.br/faces/match', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'AccessToken': BIGDATA_ACCESS_TOKEN
            },
            body: JSON.stringify({
              cpf: cpf.replace(/\D/g, ''),
              image: selfieBase64.replace(/^data:image\/\w+;base64,/, '')
            })
          });

          const data = await response.json();

          results.validations.face = {
            match: data.match === true,
            similarity: data.similarity || 0,
            liveness: data.liveness || false
          };
        } catch (err) {
          console.error('Erro validação facial:', err);
          results.validations.face = {
            match: null,
            error: 'Erro na validação'
          };
        }
      } else {
        results.validations.face = {
          match: null,
          awaitsConfiguration: true,
          message: 'BigDataCorp não configurado'
        };
      }
    }

    // Determinar aprovação
    const cpfOk = !cpf || results.validations.cpf?.valid;
    const cnpjOk = !cnpj || results.validations.cnpj?.valid;
    const faceOk = !selfieBase64 || !BIGDATA_ACCESS_TOKEN || results.validations.face?.match;

    results.approved = cpfOk && cnpjOk && faceOk;
    results.pendingReview = true; // Sempre requer aprovação manual
    results.bigdataConfigured = !!BIGDATA_ACCESS_TOKEN;

    return res.json(results);

  } catch (error: any) {
    console.error('Erro na validação completa:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro na validação' 
    });
  }
});

// ============================================
// VERIFICAÇÃO DE VAZAMENTOS - Have I Been Pwned
// ============================================

// Verificar se EMAIL foi vazado
router.post('/check-email-breach', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    console.log('🔍 Verificando vazamentos para email...');

    // Have I Been Pwned API (gratuita para uso pessoal)
    // Para uso comercial, precisa de API key
    const response = await fetch(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: {
          'User-Agent': 'BilsCinema-SecurityCheck',
          'hibp-api-key': process.env.HIBP_API_KEY || '' // Opcional para chamadas limitadas
        }
      }
    );

    if (response.status === 404) {
      // Email não encontrado em vazamentos
      console.log('✅ Email não encontrado em vazamentos');
      return res.json({
        success: true,
        breached: false,
        message: 'Ótimo! Este email não foi encontrado em nenhum vazamento conhecido.',
        breaches: []
      });
    }

    if (response.status === 429) {
      // Rate limit
      return res.json({
        success: true,
        breached: null,
        message: 'Muitas requisições. Tente novamente em alguns segundos.',
        rateLimited: true
      });
    }

    if (response.ok) {
      const breaches = await response.json();
      console.log(`⚠️ Email encontrado em ${breaches.length} vazamentos`);
      
      return res.json({
        success: true,
        breached: true,
        count: breaches.length,
        message: `Atenção! Este email foi encontrado em ${breaches.length} vazamento(s).`,
        breaches: breaches.map((b: any) => ({
          name: b.Name,
          domain: b.Domain,
          date: b.BreachDate,
          description: b.Description,
          dataClasses: b.DataClasses, // Tipos de dados vazados
          isVerified: b.IsVerified,
          isSensitive: b.IsSensitive
        }))
      });
    }

    // Erro desconhecido
    return res.json({
      success: true,
      breached: null,
      message: 'Não foi possível verificar no momento.'
    });

  } catch (error: any) {
    console.error('Erro ao verificar vazamento:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao verificar vazamentos' 
    });
  }
});

// Verificar se SENHA foi vazada (usando k-anonymity - seguro!)
router.post('/check-password-breach', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Senha é obrigatória' });
    }

    console.log('🔍 Verificando se senha foi vazada...');

    // Gerar SHA-1 da senha
    const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    
    // Usar k-anonymity: enviar apenas os 5 primeiros caracteres
    const prefix = sha1.substring(0, 5);
    const suffix = sha1.substring(5);

    // Consultar API do HIBP Passwords
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'User-Agent': 'BilsCinema-SecurityCheck'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao consultar API');
    }

    const text = await response.text();
    const hashes = text.split('\r\n');
    
    // Procurar o suffix no resultado
    let count = 0;
    for (const line of hashes) {
      const [hashSuffix, occurrences] = line.split(':');
      if (hashSuffix === suffix) {
        count = parseInt(occurrences, 10);
        break;
      }
    }

    if (count > 0) {
      console.log(`⚠️ Senha encontrada ${count} vezes em vazamentos`);
      return res.json({
        success: true,
        breached: true,
        count: count,
        message: `⚠️ ATENÇÃO: Esta senha apareceu ${count.toLocaleString('pt-BR')} vezes em vazamentos de dados! Recomendamos escolher outra senha.`,
        recommendation: 'Escolha uma senha única que você não usa em outros sites.'
      });
    }

    console.log('✅ Senha não encontrada em vazamentos');
    return res.json({
      success: true,
      breached: false,
      count: 0,
      message: '✅ Esta senha não foi encontrada em vazamentos conhecidos.',
      recommendation: 'Senha segura!'
    });

  } catch (error: any) {
    console.error('Erro ao verificar senha:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao verificar senha' 
    });
  }
});

// Verificação completa de segurança
router.post('/security-check', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const results: any = {
      success: true,
      email: null,
      password: null,
      overallSafe: true,
      warnings: []
    };

    // Verificar email
    if (email) {
      try {
        const emailResponse = await fetch(
          `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=true`,
          {
            headers: {
              'User-Agent': 'BilsCinema-SecurityCheck',
              'hibp-api-key': process.env.HIBP_API_KEY || ''
            }
          }
        );

        if (emailResponse.status === 404) {
          results.email = { breached: false, count: 0 };
        } else if (emailResponse.ok) {
          const breaches = await emailResponse.json();
          results.email = { breached: true, count: breaches.length };
          results.overallSafe = false;
          results.warnings.push(`Email encontrado em ${breaches.length} vazamento(s)`);
        }
      } catch (e) {
        results.email = { error: true };
      }
    }

    // Verificar senha
    if (password) {
      try {
        const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
        const prefix = sha1.substring(0, 5);
        const suffix = sha1.substring(5);

        const pwResponse = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        const text = await pwResponse.text();
        
        let count = 0;
        for (const line of text.split('\r\n')) {
          const [hashSuffix, occurrences] = line.split(':');
          if (hashSuffix === suffix) {
            count = parseInt(occurrences, 10);
            break;
          }
        }

        results.password = { breached: count > 0, count };
        if (count > 0) {
          results.overallSafe = false;
          results.warnings.push(`Senha encontrada ${count.toLocaleString('pt-BR')} vezes em vazamentos`);
        }
      } catch (e) {
        results.password = { error: true };
      }
    }

    return res.json(results);

  } catch (error: any) {
    console.error('Erro na verificação de segurança:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// STATUS DO SISTEMA
// ============================================
router.get('/status', (req: Request, res: Response) => {
  res.json({
    online: true,
    providers: {
      cpf: {
        algorithm: true,
        bigdata: !!BIGDATA_ACCESS_TOKEN
      },
      cnpj: {
        receitaws: true,
        brasilapi: true
      },
      cep: {
        viacep: true
      },
      face: {
        bigdata: !!BIGDATA_ACCESS_TOKEN
      },
      security: {
        emailBreach: true,      // Have I Been Pwned
        passwordBreach: true    // Pwned Passwords
      }
    },
    bigdataConfigured: !!BIGDATA_ACCESS_TOKEN,
    hibpConfigured: !!process.env.HIBP_API_KEY,
    message: BIGDATA_ACCESS_TOKEN 
      ? '✅ Sistema completo com BigDataCorp'
      : '⚠️ BigDataCorp não configurado. CPF e facial limitados.'
  });
});

// ============================================
// ARMAZENAMENTO DE CADASTROS PENDENTES
// ============================================
interface PendingRegistration {
  id: string;
  type: 'PF' | 'PJ';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  data: any;
  validations: any;
}

const pendingRegistrations: PendingRegistration[] = [];

// Salvar novo cadastro
router.post('/register', requireTenant, async (req: Request, res: Response) => {
  try {
    // Garantir que sempre retornamos JSON válido
    res.setHeader('Content-Type', 'application/json');
    
    console.log('📥 === RECEBENDO REQUISIÇÃO DE CADASTRO ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);
    console.log('Body existe?', !!req.body);
    console.log('Body keys:', req.body ? Object.keys(req.body) : 'N/A');
    
    // Validar se o body foi parseado corretamente
    if (!req.body) {
      console.error('❌ Body vazio ou inválido');
      return res.status(400).json({
        success: false,
        error: 'Dados não recebidos. Verifique se o Content-Type está correto (application/json).'
      });
    }

    const { type, data, validations } = req.body;
    
    // Validar estrutura básica
    if (!type || !data) {
      console.error('❌ Estrutura inválida:', { hasType: !!type, hasData: !!data });
      return res.status(400).json({
        success: false,
        error: 'Estrutura de dados inválida. Campos "type" e "data" são obrigatórios.'
      });
    }
    const tenantId = req.tenantId;

    console.log('📝 === NOVO CADASTRO ===');
    console.log('Tenant ID:', tenantId);
    console.log('Tipo:', type);
    console.log('Email:', data?.email);
    console.log('Nome:', data?.name);
    console.log('CPF/CNPJ:', type === 'PF' ? data?.cpf : data?.cnpj);

    if (!tenantId) {
      console.error('❌ Tenant ID não encontrado');
      return res.status(400).json({ 
        success: false, 
        error: 'Tenant ID obrigatório' 
      });
    }

    // Validar dados obrigatórios
    if (!data || !data.email || !data.password) {
      console.error('❌ Dados obrigatórios faltando:', { email: !!data?.email, password: !!data?.password });
      return res.status(400).json({ 
        success: false, 
        error: 'Email e senha são obrigatórios' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailInput = String(data.email || '').toLowerCase().trim();
    
    if (!emailRegex.test(emailInput)) {
      console.error('❌ Email inválido:', emailInput);
      return res.status(400).json({ 
        success: false, 
        error: 'Formato de email inválido' 
      });
    }

    const email = emailInput;
    const cpfCnpj = type === 'PF' 
      ? (data.cpf ? String(data.cpf).replace(/\D/g, '') : '') 
      : (data.cnpj ? String(data.cnpj).replace(/\D/g, '') : '');

    console.log('🔍 Verificando se cliente já existe...');
    // Verificar se já existe cliente com mesmo email ou CPF/CNPJ
    const existingClient = await prisma.client.findFirst({
      where: {
        tenantId,
        OR: [
          { email },
          ...(cpfCnpj ? [{ cpfCnpj }] : [])
        ]
      }
    });

    if (existingClient) {
      console.log('⚠️ Cliente já existe:', existingClient.id, existingClient.status);
      return res.status(400).json({ 
        success: false, 
        error: 'Já existe um cadastro com este email ou CPF/CNPJ',
        clientId: existingClient.id,
        status: existingClient.status
      });
    }

    console.log('✅ Cliente não existe, criando novo...');

    // Validar senha
    if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
      console.error('❌ Senha inválida (mínimo 6 caracteres)');
      return res.status(400).json({ 
        success: false, 
        error: 'Senha deve ter no mínimo 6 caracteres' 
      });
    }

    // Hash da senha
    console.log('🔐 Gerando hash da senha...');
    const hashedPassword = await bcrypt.hash(String(data.password), 10);
    console.log('✅ Hash gerado');

    // Criar cliente no banco de dados
    console.log('💾 Criando cliente no banco...');
    console.log('Dados do cliente:', {
      tenantId,
      name: data.name || '',
      email,
      phone: data.phone?.replace(/\D/g, '') || '',
      document: cpfCnpj || '',
      personType: type === 'PF' ? 'FISICA' : 'JURIDICA'
    });
    
    let client;
    try {
      client = await prisma.client.create({
        data: {
          tenantId,
          name: data.name || '',
          email,
          phone: data.phone?.replace(/\D/g, '') || '',
          document: cpfCnpj || '',
          cpfCnpj: cpfCnpj || '',
          personType: type === 'PF' ? 'FISICA' : 'JURIDICA',
          type: type === 'PF' ? 'INDIVIDUAL' : 'COMPANY',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode?.replace(/\D/g, '') || '',
          status: 'PENDING'
        }
      });
      console.log('✅ Cliente criado:', client.id, client.email);
    } catch (prismaError: any) {
      console.error('❌ Erro do Prisma ao criar cliente:', prismaError);
      console.error('Código do erro:', prismaError.code);
      console.error('Mensagem:', prismaError.message);
      throw new Error(`Erro ao criar cliente: ${prismaError.message || 'Erro desconhecido do banco de dados'}`);
    }

    // Criar usuário para login
    try {
      // Verificar se usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        // Atualizar senha se usuário já existe
        await prisma.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            name: data.name || existingUser.name
          }
        });
        console.log('✅ Usuário atualizado para:', email);
      } else {
        // Criar novo usuário
        await prisma.user.create({
          data: {
            tenantId,
            email,
            password: hashedPassword,
            name: data.name || '',
            role: 'CLIENT'
          }
        });
        console.log('✅ Usuário criado para:', email);
      }
    } catch (userError: any) {
      console.error('⚠️ Erro ao criar/atualizar usuário:', userError);
      // Não falhar o cadastro se usuário der erro (pode ser criado depois)
    }

    // Salvar foto facial como documento se existir
    if (data.selfieBase64) {
      try {
        console.log('📸 Processando foto facial...');
        console.log('Tamanho base64 (chars):', data.selfieBase64?.length || 0);
        
        // Validar se é base64 válido
        if (typeof data.selfieBase64 !== 'string') {
          throw new Error('Foto facial deve ser uma string base64');
        }
        
        // Converter base64 para buffer
        const base64Data = data.selfieBase64.replace(/^data:image\/\w+;base64,/, '');
        
        if (!base64Data || base64Data.length === 0) {
          throw new Error('Base64 da foto facial está vazio');
        }
        
        console.log('Tamanho base64 limpo (chars):', base64Data.length);
        
        let buffer;
        try {
          buffer = Buffer.from(base64Data, 'base64');
        } catch (bufferError: any) {
          console.error('❌ Erro ao converter base64 para buffer:', bufferError);
          throw new Error('Base64 inválido: ' + bufferError.message);
        }
        
        console.log('Tamanho do buffer (bytes):', buffer.length);
        
        if (buffer.length === 0) {
          throw new Error('Buffer da imagem está vazio');
        }
        
        // Salvar arquivo temporário (em produção, usar storage adequado)
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const fileName = `selfie_${client.id}_${Date.now()}.jpg`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, buffer);

        // Criar registro de documento
        await prisma.clientDocument.create({
          data: {
            clientId: client.id,
            type: 'SELFIE',
            name: fileName,
            fileName: fileName,
            url: `/uploads/documents/${fileName}`,
            size: buffer.length
          }
        });
        console.log('✅ Foto facial salva para cliente:', client.id);
      } catch (photoError) {
        console.error('⚠️ Erro ao salvar foto facial:', photoError);
        // Não falhar o cadastro se foto der erro
      }
    }

    // Manter registro em memória para compatibilidade
    const registration: PendingRegistration = {
      id: client.id,
      type: type || 'PF',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      data: {
        ...data,
        selfieBase64: data.selfieBase64 ? '[IMAGEM_CAPTURADA]' : null
      },
      validations
    };
    pendingRegistrations.push(registration);
    
    console.log('✅ === CADASTRO CONCLUÍDO ===');
    console.log('Cliente ID:', client.id);
    console.log('Email:', email);
    console.log('Status:', 'PENDING');
    console.log('Tenant:', tenantId);

    return res.json({
      success: true,
      registrationId: client.id,
      clientId: client.id,
      status: 'PENDING',
      message: 'Cadastro recebido com sucesso! Aguardando aprovação da equipe.',
      debug: {
        tenantId,
        email,
        clientId: client.id
      }
    });

  } catch (error: any) {
    console.error('❌ === ERRO AO SALVAR CADASTRO ===');
    console.error('Tipo do erro:', error?.constructor?.name);
    console.error('Mensagem:', error?.message);
    console.error('Stack:', error?.stack);
    console.error('Código do erro:', error?.code);
    console.error('Erro completo:', error);
    
    // Garantir que sempre retornamos JSON válido
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      
      const errorMessage = error?.message || String(error) || 'Erro desconhecido ao salvar cadastro';
      const statusCode = error?.status || error?.statusCode || 500;
      
      res.status(statusCode).json({ 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          type: error?.constructor?.name,
          stack: error?.stack,
          code: error?.code
        } : undefined
      });
    } else {
      console.error('⚠️ Resposta já foi enviada, não é possível enviar erro JSON');
    }
  }
});

// Listar cadastros pendentes
router.get('/pending', (req: Request, res: Response) => {
  res.json({
    success: true,
    total: pendingRegistrations.length,
    pending: pendingRegistrations.filter(r => r.status === 'PENDING').length,
    registrations: pendingRegistrations
  });
});

// Aprovar/Rejeitar
router.post('/review/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, reason } = req.body;

  const registration = pendingRegistrations.find(r => r.id === id);
  
  if (!registration) {
    return res.status(404).json({ error: 'Cadastro não encontrado' });
  }

  if (action === 'approve') {
    registration.status = 'APPROVED';
    console.log('✅ Cadastro aprovado:', id);
  } else if (action === 'reject') {
    registration.status = 'REJECTED';
    console.log('❌ Cadastro rejeitado:', id, '-', reason);
  }

  res.json({
    success: true,
    registration
  });
});

export default router;
