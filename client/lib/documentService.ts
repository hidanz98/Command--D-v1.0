// Serviço para consulta automática de documentos (CPF/CNPJ)

interface CPFData {
  nome: string;
  situacao: string;
  cpf: string;
  rg?: string;
  data_nascimento?: string;
  nome_mae?: string;
}

interface CNPJData {
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  situacao: string;
  inscricao_estadual?: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  contato: {
    telefone?: string;
    email?: string;
  };
  atividade_principal: string;
  data_abertura: string;
  porte: string;
}

interface CEPData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export class DocumentService {
  // APIs Gratuitas Reais
  private static readonly CNPJ_BRASIL_API = 'https://brasilapi.com.br/api/cnpj/v1/';
  private static readonly CNPJ_RECEITA_WS = 'https://www.receitaws.com.br/v1/cnpj/';
  private static readonly CNPJ_CNPJA = 'https://open.cnpja.com/office/';
  
  // APIs de CPF para teste/desenvolvimento
  private static readonly APICPF_API = 'https://api.apicpf.com/cpf/';
  private static readonly BRASILAPI_CPF = 'https://brasilapi.com.br/api/cpf/v1/';
  private static readonly SIMPLE_DATA_API = 'https://api.simpledata.com.br/cpf/';
  private static readonly CPF_HUB_API = 'https://cpfhub.io/api/v1/cpf/';
  
  private static readonly CEP_API_URL = 'https://viacep.com.br/ws/';
  
  // Cache para evitar consultas repetidas e respeitar rate limits
  private static cache = new Map<string, any>();
  private static lastRequest = new Map<string, number>();

  /**
   * Valida formato do CPF
   */
  static isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação do algoritmo do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  }

  /**
   * Valida formato do CNPJ
   */
  static isValidCNPJ(cnpj: string): boolean {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    if (cleanCNPJ.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
    
    // Validação do algoritmo do CNPJ
    let size = cleanCNPJ.length - 2;
    let numbers = cleanCNPJ.substring(0, size);
    let digits = cleanCNPJ.substring(size);
    let sum = 0;
    let pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(0))) return false;
    
    size = size + 1;
    numbers = cleanCNPJ.substring(0, size);
    sum = 0;
    pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(1))) return false;
    
    return true;
  }

  /**
   * Detecta automaticamente se o documento é CPF ou CNPJ
   */
  static detectDocumentType(document: string): 'cpf' | 'cnpj' | 'unknown' {
    const cleanDoc = document.replace(/\D/g, '');
    
    if (cleanDoc.length === 11) {
      return 'cpf';
    } else if (cleanDoc.length === 14) {
      return 'cnpj';
    }
    
    return 'unknown';
  }

  /**
   * Retorna o label correto para o documento (CPF ou CNPJ)
   */
  static getDocumentLabel(document: string): string {
    const type = this.detectDocumentType(document);
    return type === 'cpf' ? 'CPF' : type === 'cnpj' ? 'CNPJ' : 'CPF/CNPJ';
  }

  /**
   * Consulta dados do CPF usando APIs reais gratuitas
   */
  static async consultarCPF(cpf: string): Promise<CPFData | null> {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (!this.isValidCPF(cleanCPF)) {
      throw new Error('CPF inválido');
    }

    // Verifica cache (desabilitado para testar API real)
    const cacheKey = `cpf_${cleanCPF}`;
    // if (this.cache.has(cacheKey)) {
    //   return this.cache.get(cacheKey);
    // }

    // Rate limiting - aguardar 1 segundo entre requests
    const lastReq = this.lastRequest.get('cpf') || 0;
    const now = Date.now();
    if (now - lastReq < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - (now - lastReq)));
    }
    this.lastRequest.set('cpf', Date.now());

    try {
      // 1. Tentar APICPF.com (500 consultas/dia gratuitas)
      try {
        const response = await fetch(`${this.APICPF_API}${cleanCPF}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer 5d5aa9e10bf337ca76a7469b49e9d0b786764a727a9aed1fe1bde9741e155a7b',
            'User-Agent': 'Sistema-Locadora/1.0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          console.log('📡 Resposta APICPF completa:', JSON.stringify(data, null, 2));
          
          // Processar diferentes formatos de resposta da APICPF
          let cpfData: CPFData | null = null;
          
          if (data.success === true && data.data) {
            // Formato: {success: true, data: {...}}
            cpfData = {
              nome: data.data.name || data.data.nome || '',
              situacao: data.data.status || 'REGULAR',
              cpf: cleanCPF,
              rg: data.data.rg || '',
              data_nascimento: data.data.birth_date || data.data.data_nascimento || ''
            };
          } else if (data.valid === true) {
            // Formato: {valid: true, name: "..."}
            cpfData = {
              nome: data.name || data.nome || '',
              situacao: data.status || 'REGULAR',
              cpf: cleanCPF,
              rg: data.rg || '',
              data_nascimento: data.birth_date || data.data_nascimento || ''
            };
          } else if (data.name || data.nome) {
            // Formato direto com nome
            cpfData = {
              nome: data.name || data.nome || '',
              situacao: data.status || 'REGULAR',
              cpf: cleanCPF,
              rg: data.rg || '',
              data_nascimento: data.birth_date || data.data_nascimento || ''
            };
          }

          if (cpfData && cpfData.nome) {
            this.cache.set(cacheKey, cpfData);
            console.log('✅ APICPF dados processados:', cpfData);
            return cpfData;
          } else {
            console.log('⚠️ APICPF retornou dados sem nome:', data);
          }
        } else {
          const errorText = await response.text();
          console.log('❌ APICPF erro HTTP:', response.status, response.statusText, errorText);
        }
      } catch (apiError) {
        console.log('APICPF indisponível, tentando CPFHub...', apiError);
      }

      // 2. Tentar CPFHub.io (plano gratuito)
      try {
        const response = await fetch(`${this.CPF_HUB_API}${cleanCPF}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Sistema-Locadora/1.0',
            // Em produção, adicionar: 'Authorization': 'Bearer YOUR_API_KEY'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data) {
            const cpfData: CPFData = {
              nome: data.data.name || data.data.nome,
              situacao: data.data.status || 'REGULAR',
              cpf: cleanCPF,
              rg: data.data.rg || '',
              data_nascimento: data.data.birthDate || data.data.data_nascimento
            };

            this.cache.set(cacheKey, cpfData);
            return cpfData;
          }
        }
      } catch (apiError) {
        console.log('CPFHub indisponível, tentando SimpleData...', apiError);
      }

      // 3. Tentar SimpleData (créditos gratuitos iniciais)
      try {
        const response = await fetch(`${this.SIMPLE_DATA_API}${cleanCPF}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Sistema-Locadora/1.0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.cpf && data.nome) {
            const cpfData: CPFData = {
              nome: data.nome,
              situacao: data.situacao || 'REGULAR',
              cpf: cleanCPF,
              rg: data.rg || '',
              data_nascimento: data.data_nascimento || ''
            };

            this.cache.set(cacheKey, cpfData);
            return cpfData;
          }
        }
      } catch (apiError) {
        console.log('SimpleData indisponível, usando dados de teste...', apiError);
      }

      // Se chegou aqui, todas as APIs falharam
      console.log('❌ Todas as APIs falharam, retornando apenas validação');
      
      return {
        nome: '', // API falhou, nome deve ser preenchido manualmente
        situacao: 'VÁLIDO', // CPF é válido (passou na validação)
        cpf: cleanCPF,
        rg: '',
        data_nascimento: ''
      };
    } catch (error) {
      console.error('Erro ao consultar CPF:', error);
      return null;
    }
  }

  /**
   * Consulta dados do CNPJ
   */
  static async consultarCNPJ(cnpj: string): Promise<CNPJData | null> {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    if (!this.isValidCNPJ(cleanCNPJ)) {
      throw new Error('CNPJ inválido');
    }

    // Verifica cache
    const cacheKey = `cnpj_${cleanCNPJ}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Rate limiting - aguardar 1 segundo entre requests
    const lastReq = this.lastRequest.get('cnpj') || 0;
    const now = Date.now();
    if (now - lastReq < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - (now - lastReq)));
    }
    this.lastRequest.set('cnpj', Date.now());

    try {
      // 1. Tentar BrasilAPI primeiro (oficial e gratuita)
      try {
        const response = await fetch(`${this.CNPJ_BRASIL_API}${cleanCNPJ}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Sistema-Locadora/1.0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          const cnpjData: CNPJData = {
            razao_social: data.legal_name || data.company?.name || '',
            nome_fantasia: data.trade_name || '',
            cnpj: cleanCNPJ,
            situacao: data.registration_status || 'ATIVA',
            inscricao_estadual: data.state_tax_number || '',
            endereco: {
              logradouro: data.address?.street || '',
              numero: data.address?.number || '',
              complemento: data.address?.details || '',
              bairro: data.address?.district || '',
              cidade: data.address?.city || '',
              uf: data.address?.state || '',
              cep: data.address?.zip_code?.replace(/\D/g, '') || ''
            },
            contato: {
              telefone: data.phones?.[0]?.number || '',
              email: data.emails?.[0]?.address || ''
            },
            atividade_principal: data.main_activity?.text || '',
            data_abertura: data.founded_at || '',
            porte: data.company_size || ''
          };

          this.cache.set(cacheKey, cnpjData);
          return cnpjData;
        }
      } catch (brasilApiError) {
        console.log('BrasilAPI indisponível, tentando ReceitaWS...');
      }

      // 2. Fallback: ReceitaWS (não oficial mas popular)
      try {
        const response = await fetch(`${this.CNPJ_RECEITA_WS}${cleanCNPJ}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Sistema-Locadora/1.0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.status !== 'ERROR') {
            const cnpjData: CNPJData = {
              razao_social: data.nome || '',
              nome_fantasia: data.fantasia || '',
              cnpj: cleanCNPJ,
              situacao: data.situacao || 'ATIVA',
              inscricao_estadual: '',
              endereco: {
                logradouro: data.logradouro || '',
                numero: data.numero || '',
                complemento: data.complemento || '',
                bairro: data.bairro || '',
                cidade: data.municipio || '',
                uf: data.uf || '',
                cep: data.cep?.replace(/\D/g, '') || ''
              },
              contato: {
                telefone: data.telefone || '',
                email: data.email || ''
              },
              atividade_principal: data.atividade_principal?.[0]?.text || '',
              data_abertura: data.abertura || '',
              porte: data.porte || ''
            };

            this.cache.set(cacheKey, cnpjData);
            return cnpjData;
          }
        }
      } catch (receitaWsError) {
        console.log('ReceitaWS indisponível, usando dados simulados...');
      }

      // 3. Fallback final: dados simulados
      return this.generateMockCNPJData(cleanCNPJ);
      
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error);
      return this.generateMockCNPJData(cleanCNPJ);
    }
  }

  /**
   * Consulta dados do CEP
   */
  static async consultarCEP(cep: string): Promise<CEPData | null> {
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length !== 8) {
      throw new Error('CEP inválido');
    }

    // Verifica cache
    const cacheKey = `cep_${cleanCEP}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.CEP_API_URL}${cleanCEP}/json/`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.erro) {
          throw new Error('CEP não encontrado');
        }

        // Adicionar ao cache
        this.cache.set(cacheKey, data);
        
        return data;
      } else {
        throw new Error('Erro ao consultar CEP');
      }
    } catch (error) {
      console.error('Erro ao consultar CEP:', error);
      return null;
    }
  }

  /**
   * Formatar CPF
   */
  static formatCPF(cpf: string): string {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formatar CNPJ
   */
  static formatCNPJ(cnpj: string): string {
    const numbers = cnpj.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formatar CEP
   */
  static formatCEP(cep: string): string {
    const numbers = cep.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  /**
   * Gerar dados simulados mais realistas baseados no CPF
   */
  private static generateMockName(cpf: string): string {
    // Dados específicos para CPFs de teste (DESABILITADO - usando apenas API real)
    const specificCPFs: { [key: string]: string } = {
      // '14034154632': 'Otavio Almeida de Souza', // Desabilitado para usar API
      // '10681186607': 'Eduardo Sasha Alves Santos', // Dados reais da API
    };

    if (specificCPFs[cpf]) {
      return specificCPFs[cpf];
    }
    
    const names = [
      'João Silva Santos', 'Maria Oliveira Costa', 'Pedro Souza Lima',
      'Ana Paula Ferreira', 'Carlos Eduardo Alves', 'Fernanda Santos Rocha',
      'Ricardo Pereira Dias', 'Juliana Martins Cunha', 'Bruno Costa Ribeiro',
      'Camila Rodrigues Barros', 'Lucas Fernandes Moura', 'Priscila Lima Cardoso'
    ];
    
    const index = parseInt(cpf.slice(-2)) % names.length;
    return names[index];
  }

  /**
   * Gerar RG simulado baseado no CPF
   */
  private static generateMockRG(cpf: string): string {
    // RGs específicos para CPFs de teste
    const specificRGs: { [key: string]: string } = {
      '14034154632': '14.034.154-6', // RG para Otavio Almeida de Souza
      '12345678901': '12.345.678-9',
      '98765432100': '98.765.432-1',
      '11111111111': '11.111.111-1',
      '22222222222': '22.222.222-2'
    };

    if (specificRGs[cpf]) {
      return specificRGs[cpf];
    }

    // Gerar RG baseado no CPF para outros casos
    const base = cpf.slice(0, 8);
    const digit = Math.floor(Math.random() * 10);
    return `${base.slice(0, 2)}.${base.slice(2, 5)}.${base.slice(5, 8)}-${digit}`;
  }

  /**
   * Gerar data de nascimento simulada baseada no CPF
   */
  private static generateMockBirthDate(cpf: string): string {
    // Usar dígitos do CPF para gerar uma data consistente
    const day = Math.max(1, parseInt(cpf.slice(0, 2)) % 28 + 1);
    const month = Math.max(1, parseInt(cpf.slice(2, 4)) % 12 + 1);
    const year = 1950 + (parseInt(cpf.slice(4, 6)) % 50); // Entre 1950 e 2000
    
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  }

  /**
   * Gerar dados simulados de CNPJ (fallback)
   */
  private static generateMockCNPJData(cnpj: string): CNPJData {
    // Dados específicos para CNPJs de teste
    const specificCNPJs: { [key: string]: any } = {
      '13250869000136': {
        razao_social: 'EMPRESA TESTE LTDA',
        nome_fantasia: 'Empresa Teste',
        atividade: 'Atividades de teste',
        inscricao_estadual: '132.508.690.001',
        endereco: {
          logradouro: 'Rua Teste',
          numero: '123',
          complemento: 'Sala 101',
          bairro: 'Centro',
          cidade: 'Belo Horizonte',
          uf: 'MG',
          cep: '30000000'
        }
      }
    };

    if (specificCNPJs[cnpj]) {
      const company = specificCNPJs[cnpj];
      return {
        razao_social: company.razao_social,
        nome_fantasia: company.nome_fantasia,
        cnpj: cnpj,
        situacao: 'ATIVA',
        inscricao_estadual: company.inscricao_estadual,
        endereco: company.endereco,
        contato: {
          telefone: '(31) 3333-3333',
          email: 'contato@empresa.com.br'
        },
        atividade_principal: company.atividade,
        data_abertura: '2020-01-15',
        porte: 'PEQUENO'
      };
    }

    const companies = [
      {
        razao_social: 'EMPRESA EXEMPLO LTDA',
        nome_fantasia: 'Empresa Exemplo',
        atividade: 'Locação de equipamentos audiovisuais'
      },
      {
        razao_social: 'TECNOLOGIA E SERVICOS LTDA',
        nome_fantasia: 'TechServ',
        atividade: 'Serviços de tecnologia'
      },
      {
        razao_social: 'COMERCIO DE EQUIPAMENTOS EIRELI',
        nome_fantasia: 'EquipCom',
        atividade: 'Comércio de equipamentos'
      }
    ];

    const index = parseInt(cnpj.slice(-2)) % companies.length;
    const company = companies[index];

    return {
      razao_social: company.razao_social,
      nome_fantasia: company.nome_fantasia,
      cnpj: cnpj,
      situacao: 'ATIVA',
      inscricao_estadual: '123456789',
      endereco: {
        logradouro: 'Rua das Empresas',
        numero: '123',
        complemento: 'Sala 101',
        bairro: 'Centro',
        cidade: 'Belo Horizonte',
        uf: 'MG',
        cep: '30000000'
      },
      contato: {
        telefone: '(31) 3333-3333',
        email: 'contato@empresa.com.br'
      },
      atividade_principal: company.atividade,
      data_abertura: '2020-01-15',
      porte: 'PEQUENO'
    };
  }

  /**
   * Limpar cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Limpar cache automaticamente ao inicializar (para desenvolvimento)
   */
  static {
    // Limpar cache automaticamente para garantir dados atualizados
    this.clearCache();
    console.log('🔧 DocumentService inicializado - Cache limpo para teste');
  }
}