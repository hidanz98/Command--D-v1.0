// Gerador de PDFs profissionais para o sistema de locação
// Usa a biblioteca jsPDF (precisa instalar: npm install jspdf jspdf-autotable)

export interface CompanyInfo {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
}

export interface ClientInfo {
  name: string;
  document: string; // CPF ou CNPJ
  email?: string;
  phone?: string;
  address?: string;
}

export interface ProductItem {
  name: string;
  quantity: number;
  dailyRate: number;
  days: number;
  total: number;
}

export interface OrderInfo {
  id: string;
  date: Date;
  startDate: Date;
  endDate: Date;
  client: ClientInfo;
  items: ProductItem[];
  subtotal: number;
  discount?: number;
  total: number;
  status: string;
  notes?: string;
  // Campos de produção audiovisual
  projectName?: string;        // Nome do Projeto/Filme/Produção
  productionDirector?: string; // Direção de Produção
  productionCompany?: string;  // Produtora
  shootLocation?: string;      // Local de Filmagem
  paymentStatus?: 'pending' | 'partial' | 'paid' | 'overdue'; // Status de pagamento
  paymentDate?: Date;          // Data do pagamento
}

// Dados da empresa (em produção, viria do contexto/API)
const DEFAULT_COMPANY: CompanyInfo = {
  name: "Bil's Cinema e Vídeo",
  cnpj: "00.000.000/0001-00",
  address: "Rua das Câmeras, 123 - São Paulo, SP",
  phone: "(11) 99999-9999",
  email: "contato@bilscinema.com.br"
};

// Função para formatar data
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Função para formatar moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Gerar HTML do relatório (para visualização e impressão)
export function generateReportHTML(
  type: 'contract' | 'receipt' | 'report',
  data: OrderInfo,
  company: CompanyInfo = DEFAULT_COMPANY
): string {
  const styles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
      .container { max-width: 800px; margin: 0 auto; padding: 40px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #f59e0b; }
      .logo { font-size: 28px; font-weight: bold; color: #f59e0b; }
      .logo-subtitle { font-size: 12px; color: #666; }
      .company-info { text-align: right; font-size: 12px; color: #666; }
      .title { text-align: center; margin: 30px 0; }
      .title h1 { font-size: 24px; color: #1a1a1a; margin-bottom: 5px; }
      .title .doc-number { color: #666; font-size: 14px; }
      .section { margin: 25px 0; }
      .section-title { font-size: 14px; font-weight: bold; color: #f59e0b; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
      .info-item { }
      .info-label { font-size: 11px; color: #666; text-transform: uppercase; }
      .info-value { font-size: 14px; font-weight: 500; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      th { background: #1a1a1a; color: white; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
      td { padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; }
      tr:nth-child(even) { background: #f9f9f9; }
      .totals { margin-top: 20px; text-align: right; }
      .totals-row { display: flex; justify-content: flex-end; gap: 50px; margin: 5px 0; }
      .totals-label { color: #666; }
      .totals-value { font-weight: 500; min-width: 120px; }
      .total-final { font-size: 20px; color: #f59e0b; font-weight: bold; margin-top: 10px; padding-top: 10px; border-top: 2px solid #1a1a1a; }
      .terms { margin: 30px 0; padding: 20px; background: #f5f5f5; border-radius: 8px; font-size: 11px; color: #666; }
      .terms h3 { font-size: 12px; color: #1a1a1a; margin-bottom: 10px; }
      .terms ol { padding-left: 20px; }
      .terms li { margin: 5px 0; }
      .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 60px; }
      .signature-box { text-align: center; }
      .signature-line { border-top: 1px solid #1a1a1a; padding-top: 10px; margin-top: 60px; }
      .signature-name { font-weight: 500; }
      .signature-doc { font-size: 12px; color: #666; }
      .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #999; }
      .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
      .status-active { background: #dcfce7; color: #166534; }
      .status-pending { background: #fef3c7; color: #92400e; }
      .status-completed { background: #e0e7ff; color: #3730a3; }
      @media print {
        .container { padding: 20px; }
        .no-print { display: none; }
      }
    </style>
  `;

  const getStatusClass = (status: string) => {
    if (status.toLowerCase().includes('ativ') || status.toLowerCase().includes('andamento')) return 'status-active';
    if (status.toLowerCase().includes('pend')) return 'status-pending';
    return 'status-completed';
  };

  const header = `
    <div class="header">
      <div>
        <div class="logo">🎬 ${company.name}</div>
        <div class="logo-subtitle">Locação de Equipamentos Audiovisuais</div>
      </div>
      <div class="company-info">
        <div><strong>CNPJ:</strong> ${company.cnpj}</div>
        <div>${company.address}</div>
        <div>${company.phone}</div>
        <div>${company.email}</div>
      </div>
    </div>
  `;

  const clientSection = `
    <div class="section">
      <div class="section-title">Dados do Cliente</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Nome / Razão Social</div>
          <div class="info-value">${data.client.name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">CPF / CNPJ</div>
          <div class="info-value">${data.client.document}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Telefone</div>
          <div class="info-value">${data.client.phone || '-'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">E-mail</div>
          <div class="info-value">${data.client.email || '-'}</div>
        </div>
        ${data.client.address ? `
        <div class="info-item" style="grid-column: 1 / -1;">
          <div class="info-label">Endereço</div>
          <div class="info-value">${data.client.address}</div>
        </div>
        ` : ''}
      </div>
    </div>
  `;

  const itemsTable = `
    <div class="section">
      <div class="section-title">Equipamentos</div>
      <table>
        <thead>
          <tr>
            <th>Equipamento</th>
            <th style="text-align: center;">Qtd</th>
            <th style="text-align: right;">Diária</th>
            <th style="text-align: center;">Dias</th>
            <th style="text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">${formatCurrency(item.dailyRate)}</td>
              <td style="text-align: center;">${item.days}</td>
              <td style="text-align: right;">${formatCurrency(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals">
        <div class="totals-row">
          <span class="totals-label">Subtotal:</span>
          <span class="totals-value">${formatCurrency(data.subtotal)}</span>
        </div>
        ${data.discount ? `
        <div class="totals-row">
          <span class="totals-label">Desconto:</span>
          <span class="totals-value" style="color: #dc2626;">- ${formatCurrency(data.discount)}</span>
        </div>
        ` : ''}
        <div class="totals-row total-final">
          <span class="totals-label">TOTAL:</span>
          <span class="totals-value">${formatCurrency(data.total)}</span>
        </div>
      </div>
    </div>
  `;

  // Contrato de Locação
  if (type === 'contract') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Contrato de Locação #${data.id}</title>
        ${styles}
      </head>
      <body>
        <div class="container">
          ${header}
          
          <div class="title">
            <h1>CONTRATO DE LOCAÇÃO DE EQUIPAMENTOS</h1>
            <div class="doc-number">Contrato Nº ${data.id} • ${formatDate(data.date)}</div>
          </div>

          <div class="section">
            <div class="section-title">Período da Locação</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Data de Retirada</div>
                <div class="info-value">${formatDate(data.startDate)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Data de Devolução</div>
                <div class="info-value">${formatDate(data.endDate)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">
                  <span class="status-badge ${getStatusClass(data.status)}">${data.status}</span>
                </div>
              </div>
            </div>
          </div>

          ${clientSection}
          ${itemsTable}

          <div class="terms">
            <h3>TERMOS E CONDIÇÕES</h3>
            <ol>
              <li>O LOCATÁRIO declara ter recebido os equipamentos em perfeito estado de funcionamento e conservação.</li>
              <li>O LOCATÁRIO se compromete a devolver os equipamentos nas mesmas condições em que foram recebidos.</li>
              <li>Em caso de avaria ou extravio, o LOCATÁRIO será responsável pelo valor de reposição do equipamento.</li>
              <li>O não cumprimento do prazo de devolução acarretará cobrança de diárias adicionais.</li>
              <li>A locação somente será confirmada após o pagamento integral ou conforme acordo firmado.</li>
              <li>O LOCADOR reserva-se o direito de verificar os equipamentos no momento da devolução.</li>
              <li>Qualquer dano identificado será cobrado proporcionalmente ao valor do reparo ou substituição.</li>
              <li>Este contrato é regido pelas leis brasileiras, com foro na comarca de São Paulo/SP.</li>
            </ol>
          </div>

          ${data.notes ? `
          <div class="section">
            <div class="section-title">Observações</div>
            <p>${data.notes}</p>
          </div>
          ` : ''}

          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-name">${company.name}</div>
                <div class="signature-doc">CNPJ: ${company.cnpj}</div>
              </div>
              <div style="font-size: 11px; color: #999; margin-top: 5px;">LOCADOR</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-name">${data.client.name}</div>
                <div class="signature-doc">CPF/CNPJ: ${data.client.document}</div>
              </div>
              <div style="font-size: 11px; color: #999; margin-top: 5px;">LOCATÁRIO</div>
            </div>
          </div>

          <div class="footer">
            <p>Documento gerado em ${formatDate(new Date())} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            <p>${company.name} • ${company.phone} • ${company.email}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Recibo
  if (type === 'receipt') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recibo #${data.id}</title>
        ${styles}
      </head>
      <body>
        <div class="container">
          ${header}
          
          <div class="title">
            <h1>RECIBO DE PAGAMENTO</h1>
            <div class="doc-number">Recibo Nº ${data.id} • ${formatDate(data.date)}</div>
          </div>

          <div class="section" style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="font-size: 16px;">
              Recebemos de <strong>${data.client.name}</strong>, 
              inscrito no CPF/CNPJ sob o nº <strong>${data.client.document}</strong>, 
              a importância de:
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <div style="font-size: 36px; font-weight: bold; color: #22c55e;">
                ${formatCurrency(data.total)}
              </div>
              <div style="font-size: 14px; color: #666; margin-top: 5px;">
                (${numberToWords(data.total)})
              </div>
            </div>
            <p style="font-size: 14px; color: #666;">
              Referente à locação de equipamentos conforme pedido nº ${data.id}.
            </p>
          </div>

          ${itemsTable}

          <div class="signatures" style="margin-top: 40px;">
            <div></div>
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-name">${company.name}</div>
                <div class="signature-doc">CNPJ: ${company.cnpj}</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>São Paulo, ${formatDate(new Date())}</p>
            <p>Este recibo é válido como comprovante de pagamento.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Relatório padrão
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Locação #${data.id}</title>
      ${styles}
    </head>
    <body>
      <div class="container">
        ${header}
        
        <div class="title">
          <h1>RELATÓRIO DE LOCAÇÃO</h1>
          <div class="doc-number">Pedido Nº ${data.id} • Emitido em ${formatDate(new Date())}</div>
        </div>

        <div class="section">
          <div class="section-title">Informações do Pedido</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Data do Pedido</div>
              <div class="info-value">${formatDate(data.date)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value">
                <span class="status-badge ${getStatusClass(data.status)}">${data.status}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Início da Locação</div>
              <div class="info-value">${formatDate(data.startDate)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Fim da Locação</div>
              <div class="info-value">${formatDate(data.endDate)}</div>
            </div>
          </div>
        </div>

        ${clientSection}
        ${itemsTable}

        ${data.notes ? `
        <div class="section">
          <div class="section-title">Observações</div>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 8px;">${data.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p>Relatório gerado automaticamente em ${formatDate(new Date())} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          <p>${company.name} • Sistema de Gestão de Locações</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Converter número para extenso (simplificado)
function numberToWords(value: number): string {
  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  if (value === 0) return 'zero reais';
  
  const intPart = Math.floor(value);
  const decPart = Math.round((value - intPart) * 100);
  
  let result = '';
  
  if (intPart >= 1000) {
    const thousands = Math.floor(intPart / 1000);
    result += thousands === 1 ? 'mil' : units[thousands] + ' mil';
    if (intPart % 1000 > 0) result += ' e ';
  }
  
  const remainder = intPart % 1000;
  if (remainder >= 100) {
    result += remainder === 100 ? 'cem' : hundreds[Math.floor(remainder / 100)];
    if (remainder % 100 > 0) result += ' e ';
  }
  
  const tensRemainder = remainder % 100;
  if (tensRemainder >= 20) {
    result += tens[Math.floor(tensRemainder / 10)];
    if (tensRemainder % 10 > 0) result += ' e ' + units[tensRemainder % 10];
  } else if (tensRemainder >= 10) {
    result += teens[tensRemainder - 10];
  } else if (tensRemainder > 0) {
    result += units[tensRemainder];
  }
  
  result += intPart === 1 ? ' real' : ' reais';
  
  if (decPart > 0) {
    result += ' e ' + (decPart < 10 ? units[decPart] : (decPart < 20 ? teens[decPart - 10] : tens[Math.floor(decPart / 10)] + (decPart % 10 > 0 ? ' e ' + units[decPart % 10] : '')));
    result += decPart === 1 ? ' centavo' : ' centavos';
  }
  
  return result;
}

// Gerar código de barras simulado (Code128-like visual)
function generateBarcodeHTML(code: string): string {
  const bars = code.split('').map((char, i) => {
    const width = (char.charCodeAt(0) % 3) + 1;
    const isBlack = i % 2 === 0;
    return `<div style="width: ${width}px; height: 50px; background: ${isBlack ? '#000' : '#fff'}; display: inline-block;"></div>`;
  }).join('');
  
  return `
    <div style="text-align: center;">
      <div style="display: inline-flex; border: 1px solid #000; padding: 5px; background: #fff;">
        ${bars}
      </div>
      <div style="font-family: monospace; font-size: 10px; margin-top: 3px; letter-spacing: 2px;">${code}</div>
    </div>
  `;
}

// Gerar Nota Fiscal de Locação de Bens Móveis - Padrão BH/MG
export function generateNotaFiscalLocacao(
  data: OrderInfo,
  company: CompanyInfo = DEFAULT_COMPANY,
  notaNumero?: string
): string {
  const numero = notaNumero || `${new Date().getFullYear()}${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
  const serie = '001';
  const chaveAcesso = `31${new Date().toISOString().slice(2,4)}${new Date().toISOString().slice(5,7)}${company.cnpj.replace(/\D/g, '')}55${serie}${numero}1${String(Math.floor(Math.random() * 99999999)).padStart(8, '0')}`;
  
  // Status de pagamento
  const getPaymentStatusLabel = (status?: string) => {
    switch(status) {
      case 'paid': return { label: 'PAGO', color: '#16a34a', bg: '#dcfce7' };
      case 'partial': return { label: 'PARCIAL', color: '#ca8a04', bg: '#fef9c3' };
      case 'overdue': return { label: 'ATRASADO', color: '#dc2626', bg: '#fee2e2' };
      default: return { label: 'PENDENTE', color: '#ea580c', bg: '#ffedd5' };
    }
  };
  const paymentInfo = getPaymentStatusLabel(data.paymentStatus);
  
  const styles = `
    <style>
      @page { size: A4; margin: 10mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; font-size: 9px; color: #000; background: #fff; }
      .nf-container { width: 210mm; min-height: 297mm; padding: 5mm; background: #fff; }
      .nf-border { border: 2px solid #000; }
      .nf-header { display: grid; grid-template-columns: 1fr 200px 1fr; border-bottom: 2px solid #000; }
      .nf-logo-area { padding: 10px; border-right: 1px solid #000; text-align: center; }
      .nf-logo-area h1 { font-size: 16px; margin-bottom: 5px; }
      .nf-logo-area p { font-size: 8px; line-height: 1.4; }
      .nf-titulo-area { padding: 10px; border-right: 1px solid #000; text-align: center; display: flex; flex-direction: column; justify-content: center; }
      .nf-titulo { font-size: 14px; font-weight: bold; border: 2px solid #000; padding: 8px; margin-bottom: 8px; }
      .nf-entrada-saida { display: flex; gap: 10px; justify-content: center; }
      .nf-entrada-saida div { border: 1px solid #000; padding: 3px 10px; }
      .nf-numero-area { padding: 10px; text-align: center; }
      .nf-numero { font-size: 12px; font-weight: bold; }
      .nf-chave { font-size: 7px; word-break: break-all; margin-top: 5px; padding: 5px; border: 1px solid #000; }
      .nf-natureza { border-bottom: 1px solid #000; padding: 5px; display: grid; grid-template-columns: 1fr 150px 150px; }
      .nf-field { border-right: 1px solid #000; padding: 3px 5px; }
      .nf-field:last-child { border-right: none; }
      .nf-field-label { font-size: 7px; color: #666; text-transform: uppercase; }
      .nf-field-value { font-size: 10px; font-weight: 500; margin-top: 2px; }
      .nf-section-title { background: #e5e5e5; padding: 3px 5px; font-weight: bold; font-size: 8px; text-transform: uppercase; border-bottom: 1px solid #000; }
      .nf-dest { display: grid; grid-template-columns: 1fr 200px; }
      .nf-dest-info { border-right: 1px solid #000; }
      .nf-dest-row { display: grid; grid-template-columns: 1fr 1fr 1fr; border-bottom: 1px solid #000; }
      .nf-dest-row.two-cols { grid-template-columns: 1fr 1fr; }
      .nf-dest-row.full { grid-template-columns: 1fr; }
      .nf-barcode-area { padding: 10px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
      .nf-items { margin-top: 0; }
      .nf-items-header { display: grid; grid-template-columns: 50px 1fr 60px 60px 80px 80px 80px; background: #e5e5e5; border-bottom: 1px solid #000; font-weight: bold; font-size: 8px; text-transform: uppercase; }
      .nf-items-header div { padding: 5px 3px; border-right: 1px solid #000; text-align: center; }
      .nf-items-header div:last-child { border-right: none; }
      .nf-items-row { display: grid; grid-template-columns: 50px 1fr 60px 60px 80px 80px 80px; border-bottom: 1px solid #ccc; }
      .nf-items-row div { padding: 4px 3px; border-right: 1px solid #ccc; font-size: 8px; }
      .nf-items-row div:last-child { border-right: none; }
      .nf-items-row div:nth-child(n+3) { text-align: right; }
      .nf-totais { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; border-top: 2px solid #000; border-bottom: 1px solid #000; }
      .nf-totais .nf-field { border-bottom: 1px solid #000; }
      .nf-totais-row { display: grid; grid-template-columns: repeat(4, 1fr); }
      .nf-transp { border-bottom: 1px solid #000; }
      .nf-transp-row { display: grid; grid-template-columns: 1fr 100px 100px 100px 100px; }
      .nf-dados-adicionais { display: grid; grid-template-columns: 1fr 200px; min-height: 60px; }
      .nf-info-adicional { border-right: 1px solid #000; padding: 5px; font-size: 8px; }
      .nf-reservado { padding: 5px; font-size: 7px; color: #666; }
      .nf-footer { margin-top: 10px; text-align: center; font-size: 8px; color: #666; }
      .text-right { text-align: right !important; }
      .text-center { text-align: center !important; }
      .font-bold { font-weight: bold; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .nf-container { width: 100%; }
      }
    </style>
  `;

  const totalItems = data.items.reduce((acc, item) => acc + item.quantity, 0);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Nota Fiscal de Locação #${numero}</title>
      ${styles}
    </head>
    <body>
      <div class="nf-container nf-border">
        <!-- CABEÇALHO -->
        <div class="nf-header">
          <div class="nf-logo-area">
            <h1>🎬 ${company.name}</h1>
            <p>
              ${company.address}<br>
              Tel: ${company.phone}<br>
              CNPJ: ${company.cnpj}<br>
              ${company.email}
            </p>
          </div>
          <div class="nf-titulo-area">
            <div class="nf-titulo">NOTA FISCAL</div>
            <div style="font-size: 10px; margin-bottom: 5px;">LOCAÇÃO DE BENS MÓVEIS</div>
            <div class="nf-entrada-saida">
              <div>0 - ENTRADA</div>
              <div style="background: #000; color: #fff;">1 - SAÍDA</div>
            </div>
          </div>
          <div class="nf-numero-area">
            <div class="nf-numero">Nº ${numero}</div>
            <div style="font-size: 9px;">SÉRIE ${serie}</div>
            <div style="font-size: 8px; margin-top: 5px;">Folha 1/1</div>
            <div class="nf-chave">
              <strong>CHAVE DE ACESSO</strong><br>
              ${chaveAcesso.match(/.{1,4}/g)?.join(' ')}
            </div>
          </div>
        </div>

        <!-- NATUREZA DA OPERAÇÃO -->
        <div class="nf-natureza">
          <div class="nf-field">
            <div class="nf-field-label">Natureza da Operação</div>
            <div class="nf-field-value">LOCAÇÃO DE BENS MÓVEIS - EQUIPAMENTOS AUDIOVISUAIS</div>
          </div>
          <div class="nf-field">
            <div class="nf-field-label">Data de Emissão</div>
            <div class="nf-field-value">${formatDate(data.date)}</div>
          </div>
          <div class="nf-field">
            <div class="nf-field-label">Data Saída/Entrada</div>
            <div class="nf-field-value">${formatDate(data.startDate)}</div>
          </div>
        </div>

        <!-- DESTINATÁRIO/REMETENTE -->
        <div class="nf-section-title">Destinatário / Locatário</div>
        <div class="nf-dest">
          <div class="nf-dest-info">
            <div class="nf-dest-row full">
              <div class="nf-field">
                <div class="nf-field-label">Nome / Razão Social</div>
                <div class="nf-field-value">${data.client.name}</div>
              </div>
            </div>
            <div class="nf-dest-row">
              <div class="nf-field">
                <div class="nf-field-label">CPF / CNPJ</div>
                <div class="nf-field-value">${data.client.document}</div>
              </div>
              <div class="nf-field">
                <div class="nf-field-label">Inscrição Estadual</div>
                <div class="nf-field-value">ISENTO</div>
              </div>
              <div class="nf-field">
                <div class="nf-field-label">Telefone</div>
                <div class="nf-field-value">${data.client.phone || '-'}</div>
              </div>
            </div>
            <div class="nf-dest-row full">
              <div class="nf-field">
                <div class="nf-field-label">Endereço</div>
                <div class="nf-field-value">${data.client.address || 'Belo Horizonte - MG'}</div>
              </div>
            </div>
            <div class="nf-dest-row two-cols">
              <div class="nf-field">
                <div class="nf-field-label">Data Retirada</div>
                <div class="nf-field-value">${formatDate(data.startDate)}</div>
              </div>
              <div class="nf-field">
                <div class="nf-field-label">Data Devolução Prevista</div>
                <div class="nf-field-value">${formatDate(data.endDate)}</div>
              </div>
            </div>
          </div>
          <div class="nf-barcode-area">
            ${generateBarcodeHTML(numero)}
            <div style="font-size: 7px; margin-top: 10px; text-align: center; color: #666;">
              Protocolo de Autorização<br>
              ${new Date().toISOString().replace('T', ' ').slice(0, 19)}
            </div>
            <!-- Status de Pagamento -->
            <div style="margin-top: 10px; padding: 5px 15px; background: ${paymentInfo.bg}; color: ${paymentInfo.color}; border-radius: 4px; font-weight: bold; font-size: 10px;">
              ${paymentInfo.label}
            </div>
          </div>
        </div>

        <!-- DADOS DA PRODUÇÃO -->
        <div class="nf-section-title" style="background: #fef3c7;">Dados da Produção / Projeto</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #000;">
          <div class="nf-field" style="border-right: 1px solid #000;">
            <div class="nf-field-label">Nome do Projeto / Filme / Produção</div>
            <div class="nf-field-value" style="font-size: 12px; font-weight: bold;">${data.projectName || '-'}</div>
          </div>
          <div class="nf-field">
            <div class="nf-field-label">Produtora</div>
            <div class="nf-field-value">${data.productionCompany || data.client.name}</div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #000;">
          <div class="nf-field" style="border-right: 1px solid #000;">
            <div class="nf-field-label">Direção de Produção</div>
            <div class="nf-field-value">${data.productionDirector || '-'}</div>
          </div>
          <div class="nf-field">
            <div class="nf-field-label">Local de Filmagem / Set</div>
            <div class="nf-field-value">${data.shootLocation || '-'}</div>
          </div>
        </div>

        <!-- ITENS -->
        <div class="nf-section-title">Equipamentos / Itens da Locação</div>
        <div class="nf-items">
          <div class="nf-items-header">
            <div>CÓDIGO</div>
            <div>DESCRIÇÃO DO EQUIPAMENTO</div>
            <div>QTD</div>
            <div>DIAS</div>
            <div>VL. DIÁRIA</div>
            <div>VL. UNIT</div>
            <div>VL. TOTAL</div>
          </div>
          ${data.items.map((item, idx) => `
            <div class="nf-items-row">
              <div class="text-center">${String(idx + 1).padStart(3, '0')}</div>
              <div>${item.name}</div>
              <div>${item.quantity}</div>
              <div>${item.days}</div>
              <div>${formatCurrency(item.dailyRate)}</div>
              <div>${formatCurrency(item.dailyRate * item.days)}</div>
              <div class="font-bold">${formatCurrency(item.total)}</div>
            </div>
          `).join('')}
          <!-- Linhas vazias para preencher -->
          ${Array(Math.max(0, 8 - data.items.length)).fill(0).map(() => `
            <div class="nf-items-row">
              <div>&nbsp;</div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          `).join('')}
        </div>

        <!-- TOTAIS -->
        <div class="nf-section-title">Cálculo da Locação</div>
        <div class="nf-totais">
          <div class="nf-field">
            <div class="nf-field-label">Base de Cálculo</div>
            <div class="nf-field-value text-right">${formatCurrency(data.subtotal)}</div>
          </div>
          <div class="nf-field">
            <div class="nf-field-label">Desconto</div>
            <div class="nf-field-value text-right">${data.discount ? formatCurrency(data.discount) : 'R$ 0,00'}</div>
          </div>
          <div class="nf-field">
            <div class="nf-field-label">Outras Despesas</div>
            <div class="nf-field-value text-right">R$ 0,00</div>
          </div>
          <div class="nf-field">
            <div class="nf-field-label">Valor Total da Locação</div>
            <div class="nf-field-value text-right font-bold" style="font-size: 14px; color: #000;">${formatCurrency(data.total)}</div>
          </div>
        </div>
        <div class="nf-totais-row">
          <div class="nf-field">
            <div class="nf-field-label">Qtd Total de Itens</div>
            <div class="nf-field-value text-right">${totalItems}</div>
          </div>
          <div class="nf-field">
            <div class="nf-field-label">Período Total</div>
            <div class="nf-field-value text-right">${data.items[0]?.days || 0} dia(s)</div>
          </div>
          <div class="nf-field">
            <div class="nf-field-label">ISS/ICMS</div>
            <div class="nf-field-value text-right">NÃO INCIDE</div>
          </div>
          <div class="nf-field">
            <div class="nf-field-label">Valor por Extenso</div>
            <div class="nf-field-value" style="font-size: 7px;">${numberToWords(data.total)}</div>
          </div>
        </div>

        <!-- TRANSPORTADOR -->
        <div class="nf-section-title">Transportador / Volumes Transportados</div>
        <div class="nf-transp">
          <div class="nf-transp-row">
            <div class="nf-field">
              <div class="nf-field-label">Nome / Razão Social</div>
              <div class="nf-field-value">RETIRADA PELO LOCATÁRIO</div>
            </div>
            <div class="nf-field">
              <div class="nf-field-label">Frete</div>
              <div class="nf-field-value">SEM FRETE</div>
            </div>
            <div class="nf-field">
              <div class="nf-field-label">Qtd Volumes</div>
              <div class="nf-field-value">${totalItems}</div>
            </div>
            <div class="nf-field">
              <div class="nf-field-label">Espécie</div>
              <div class="nf-field-value">CAIXA/CASE</div>
            </div>
            <div class="nf-field">
              <div class="nf-field-label">Peso Bruto</div>
              <div class="nf-field-value">-</div>
            </div>
          </div>
        </div>

        <!-- INFORMAÇÕES TRIBUTÁRIAS -->
        <div class="nf-section-title" style="background: #dbeafe;">Informações Tributárias - NÃO RETENÇÃO DE ISS</div>
        <div style="padding: 10px; border-bottom: 2px solid #000; background: #f0f9ff;">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 8px;">
            <div>
              <strong>OPERAÇÃO:</strong><br>
              LOCAÇÃO DE BENS MÓVEIS<br>
              (Equipamentos Audiovisuais)
            </div>
            <div style="text-align: center; padding: 5px; background: #dcfce7; border-radius: 4px;">
              <strong style="color: #166534;">NÃO INCIDE ISS</strong><br>
              <span style="font-size: 7px;">Locação de bens móveis não constitui prestação de serviço</span>
            </div>
            <div style="text-align: right;">
              <strong>BASE LEGAL:</strong><br>
              Art. 156, III da CF/88<br>
              LC 116/2003 - Lista de Serviços
            </div>
          </div>
          <div style="margin-top: 8px; padding: 8px; background: #fef3c7; border-radius: 4px; font-size: 7px; text-align: center;">
            <strong>⚠️ ATENÇÃO TOMADOR:</strong> Esta operação refere-se exclusivamente à LOCAÇÃO DE BENS MÓVEIS, 
            não caracterizando prestação de serviços. Conforme entendimento do STF e legislação municipal de Belo Horizonte, 
            <strong>NÃO HÁ RETENÇÃO DE ISS</strong> para locação de bens móveis, pois não se enquadra na Lista de Serviços da LC 116/2003.
          </div>
        </div>

        <!-- DADOS ADICIONAIS -->
        <div class="nf-section-title">Dados Adicionais</div>
        <div class="nf-dados-adicionais">
          <div class="nf-info-adicional">
            <strong>INFORMAÇÕES COMPLEMENTARES:</strong><br><br>
            ${data.projectName ? `• <strong>PROJETO:</strong> ${data.projectName}<br>` : ''}
            ${data.productionDirector ? `• <strong>DIREÇÃO DE PRODUÇÃO:</strong> ${data.productionDirector}<br>` : ''}
            ${data.shootLocation ? `• <strong>LOCAL DE FILMAGEM:</strong> ${data.shootLocation}<br>` : ''}
            • <strong>PERÍODO:</strong> ${formatDate(data.startDate)} a ${formatDate(data.endDate)}<br>
            • <strong>PEDIDO Nº:</strong> ${data.id}<br>
            ${data.paymentDate ? `• <strong>DATA PAGAMENTO:</strong> ${formatDate(data.paymentDate)}<br>` : ''}
            ${data.notes ? `• <strong>OBS:</strong> ${data.notes}<br>` : ''}
            <br>
            <strong>TERMOS:</strong> O locatário declara ter recebido os equipamentos em perfeito estado 
            e se compromete a devolvê-los nas mesmas condições. Em caso de avaria ou extravio, 
            o locatário será responsável pelo valor de reposição.
          </div>
          <div class="nf-reservado">
            <strong>RESERVADO AO FISCO</strong><br><br>
            <strong style="color: #dc2626;">DOCUMENTO SEM VALOR FISCAL</strong><br>
            Recibo de locação de bens móveis.<br>
            Não constitui nota fiscal de serviços.<br><br>
            <strong>Município:</strong> Belo Horizonte - MG<br>
            <strong>Natureza:</strong> Locação de Bens
          </div>
        </div>

        <!-- ASSINATURAS -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 15px; border-top: 2px solid #000;">
          <div style="text-align: center;">
            <div style="border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; font-size: 8px;">
              <strong>${company.name}</strong><br>
              CNPJ: ${company.cnpj}<br>
              LOCADOR
            </div>
          </div>
          <div style="text-align: center;">
            <div style="border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; font-size: 8px;">
              <strong>${data.client.name}</strong><br>
              CPF/CNPJ: ${data.client.document}<br>
              LOCATÁRIO - RECEBI OS EQUIPAMENTOS
            </div>
          </div>
        </div>

        <div class="nf-footer">
          Documento emitido em ${formatDate(new Date())} às ${new Date().toLocaleTimeString('pt-BR')} • 
          ${company.name} • Sistema de Gestão de Locações • Belo Horizonte - MG
        </div>
      </div>
    </body>
    </html>
  `;
}

// Função para abrir PDF em nova janela (para impressão)
export function openPrintWindow(html: string): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

// Função para download como HTML
export function downloadHTML(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

