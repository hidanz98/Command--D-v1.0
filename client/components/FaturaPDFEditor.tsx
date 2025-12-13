import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Printer, Download, X } from "lucide-react";

interface DadosFatura {
  // Dados da Empresa (preenchidos automaticamente)
  empresaNome?: string;
  empresaCNPJ?: string;
  empresaInscEstadual?: string;
  empresaInscMunicipal?: string;
  
  // Dados do Cliente
  clienteNome: string;
  clienteCNPJ: string;
  clienteEndereco: string;
  clienteBairro: string;
  clienteCEP: string;
  clienteMunicipio: string;
  clienteUF: string;
  clienteTelefone: string;
  clienteInscEstadual?: string;
  
  // Dados da Fatura
  numeroFatura: string;
  dataEmissao: string;
  dataVencimento: string;
  naturezaOperacao: string;
  
  // Itens
  itens: Array<{
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
  
  // Observações (incluindo Projeto, Direção, Produção)
  projeto?: string;
  direcao?: string;
  producao?: string;
  observacoes?: string;
  
  // Total
  valorTotal: number;
}

// Coordenadas dos campos no PDF "PDF Nota Recibo.pdf"
// Baseado no layout A4 (595 x 842 pontos) - Ajustado conforme template Bil's
const COORDENADAS_CAMPOS = {
  // Logo (canto superior esquerdo - área amarela)
  logo: { x: 20, y: 770, width: 90, height: 70 },
  
  // Cabeçalho - Dados da Empresa (linha superior direita)
  empresaInscEstadual: { x: 365, y: 738 },  // INSC. ESTADUAL
  empresaCNPJ: { x: 460, y: 738 },          // CNPJ / CPF da empresa
  
  // Linha da Natureza da Operação
  naturezaOperacao: { x: 130, y: 700 },     // Natureza da Operação
  dataEmissao: { x: 400, y: 700 },          // Dt. de emissão
  inscMunicipal: { x: 500, y: 700 },        // Insc. Municipal
  
  // Dados do Cliente - Linha 1
  clienteNome: { x: 130, y: 660 },          // Nome / Razão Social
  clienteCNPJ: { x: 460, y: 660 },          // CNPJ / CPF do cliente
  
  // Dados do Cliente - Linha 2
  clienteEndereco: { x: 70, y: 635 },       // Endereço
  clienteBairro: { x: 300, y: 635 },        // Bairro
  clienteInscEstadual: { x: 460, y: 635 },  // Insc. Estadual do cliente
  
  // Dados do Cliente - Linha 3
  clienteCEP: { x: 50, y: 610 },            // CEP
  clienteMunicipio: { x: 130, y: 610 },     // Município
  clienteUF: { x: 280, y: 610 },            // UF
  clienteTelefone: { x: 350, y: 610 },      // Fone / Fax
  
  // Dados da Fatura
  numeroFatura: { x: 130, y: 570 },         // Número da Fatura de Locação
  dataVencimento: { x: 330, y: 570 },       // Dt. vencimento
  valorFatura: { x: 450, y: 570 },          // Valor
  
  // Endereço de Cobrança
  enderecoCobranca: { x: 50, y: 545 },      // Endereço de Cobrança / Praça de Pagamento
  
  // Itens da tabela (área de equipamentos)
  itemDescricao: { x: 50, y: 500, lineHeight: 14 },   // Código e Descrição
  itemQtd: { x: 340, y: 500, lineHeight: 14 },        // Quantidade
  itemValorUnit: { x: 410, y: 500, lineHeight: 14 },  // Valor Unitário R$
  itemValorTotal: { x: 510, y: 500, lineHeight: 14 }, // Valor Total R$
  
  // Observações (Projeto, Direção, Produção)
  observacoes: { x: 50, y: 180, lineHeight: 12 },
  
  // Valor Total da Nota de Locação
  valorTotalNota: { x: 420, y: 155 },
  
  // Rodapé - Número da Fatura grande
  numeroFaturaRodape: { x: 50, y: 75 },
};

interface FaturaPDFEditorProps {
  dados?: Partial<DadosFatura>;
  onClose?: () => void;
}

export function FaturaPDFEditor({ dados, onClose }: FaturaPDFEditorProps) {
  const [pdfTemplate, setPdfTemplate] = useState<ArrayBuffer | null>(null);
  const [templateName, setTemplateName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Dados do formulário
  const [formData, setFormData] = useState<DadosFatura>({
    clienteNome: dados?.clienteNome || "",
    clienteCNPJ: dados?.clienteCNPJ || "",
    clienteEndereco: dados?.clienteEndereco || "",
    clienteBairro: dados?.clienteBairro || "",
    clienteCEP: dados?.clienteCEP || "",
    clienteMunicipio: dados?.clienteMunicipio || "",
    clienteUF: dados?.clienteUF || "MG",
    clienteTelefone: dados?.clienteTelefone || "",
    clienteInscEstadual: dados?.clienteInscEstadual || "",
    numeroFatura: dados?.numeroFatura || gerarNumeroFatura(),
    dataEmissao: dados?.dataEmissao || new Date().toISOString().split('T')[0],
    dataVencimento: dados?.dataVencimento || "",
    naturezaOperacao: dados?.naturezaOperacao || "Locação de Equipamentos",
    itens: dados?.itens || [],
    projeto: dados?.projeto || "",
    direcao: dados?.direcao || "",
    producao: dados?.producao || "",
    observacoes: dados?.observacoes || "",
    valorTotal: dados?.valorTotal || 0,
  });

  function gerarNumeroFatura(): string {
    const ultimoNumero = localStorage.getItem('ultimaFaturaNumero') || '3723';
    const novoNumero = (parseInt(ultimoNumero) + 1).toString().padStart(6, '0');
    localStorage.setItem('ultimaFaturaNumero', novoNumero);
    return novoNumero;
  }

  function formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatarData(data: string): string {
    if (!data) return "";
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  // Carregar template PDF do localStorage ou arquivo
  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const arrayBuffer = await file.arrayBuffer();
    setPdfTemplate(arrayBuffer);
    setTemplateName(file.name);
    
    // Salvar no localStorage para uso futuro
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    localStorage.setItem('fatura_template_pdf', base64);
    localStorage.setItem('fatura_template_nome', file.name);
  }

  // Carregar template salvo
  useState(() => {
    const savedTemplate = localStorage.getItem('fatura_template_pdf');
    const savedName = localStorage.getItem('fatura_template_nome');
    if (savedTemplate && savedName) {
      const binaryString = atob(savedTemplate);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      setPdfTemplate(bytes.buffer);
      setTemplateName(savedName);
    }
  });

  async function gerarPDFPreenchido() {
    if (!pdfTemplate) {
      alert("Por favor, faça upload do seu template PDF primeiro.");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Carregar o PDF template
      const pdfDoc = await PDFDocument.load(pdfTemplate);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      
      // Fonte padrão
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const fontSize = 10;
      const fontSizeSmall = 9;
      const corTexto = rgb(0, 0, 0);
      
      // Função auxiliar para desenhar texto
      const desenharTexto = (texto: string, x: number, y: number, size = fontSize, bold = false) => {
        firstPage.drawText(texto || "", {
          x,
          y,
          size,
          font: bold ? fontBold : font,
          color: corTexto,
        });
      };

      // Carregar dados da empresa do localStorage
      const empresaConfig = JSON.parse(localStorage.getItem('companyConfig') || '{}');
      const empresaCNPJ = empresaConfig.cnpj || "13.250.869/0001-36";
      const empresaInscEstadual = empresaConfig.inscricaoEstadual || "";
      const empresaInscMunicipal = empresaConfig.inscricaoMunicipal || "";
      
      // ========== DADOS DA EMPRESA (Cabeçalho) ==========
      desenharTexto(empresaInscEstadual, COORDENADAS_CAMPOS.empresaInscEstadual.x, COORDENADAS_CAMPOS.empresaInscEstadual.y, fontSizeSmall);
      desenharTexto(empresaCNPJ, COORDENADAS_CAMPOS.empresaCNPJ.x, COORDENADAS_CAMPOS.empresaCNPJ.y, fontSizeSmall);
      desenharTexto(formData.naturezaOperacao, COORDENADAS_CAMPOS.naturezaOperacao.x, COORDENADAS_CAMPOS.naturezaOperacao.y, fontSizeSmall);
      desenharTexto(formatarData(formData.dataEmissao), COORDENADAS_CAMPOS.dataEmissao.x, COORDENADAS_CAMPOS.dataEmissao.y, fontSizeSmall);
      desenharTexto(empresaInscMunicipal, COORDENADAS_CAMPOS.inscMunicipal.x, COORDENADAS_CAMPOS.inscMunicipal.y, fontSizeSmall);
      
      // ========== LOGO (se disponível) ==========
      const logoUrl = localStorage.getItem('company_logo');
      if (logoUrl) {
        try {
          const logoResponse = await fetch(logoUrl);
          const logoArrayBuffer = await logoResponse.arrayBuffer();
          let logoImage;
          
          if (logoUrl.includes('.png') || logoUrl.startsWith('data:image/png')) {
            logoImage = await pdfDoc.embedPng(logoArrayBuffer);
          } else {
            logoImage = await pdfDoc.embedJpg(logoArrayBuffer);
          }
          
          firstPage.drawImage(logoImage, {
            x: COORDENADAS_CAMPOS.logo.x,
            y: COORDENADAS_CAMPOS.logo.y,
            width: COORDENADAS_CAMPOS.logo.width,
            height: COORDENADAS_CAMPOS.logo.height,
          });
        } catch (e) {
          console.log('Não foi possível carregar o logo:', e);
        }
      }

      // ========== DADOS DO CLIENTE ==========
      desenharTexto(formData.clienteNome, COORDENADAS_CAMPOS.clienteNome.x, COORDENADAS_CAMPOS.clienteNome.y);
      desenharTexto(formData.clienteCNPJ, COORDENADAS_CAMPOS.clienteCNPJ.x, COORDENADAS_CAMPOS.clienteCNPJ.y);
      desenharTexto(formData.clienteEndereco, COORDENADAS_CAMPOS.clienteEndereco.x, COORDENADAS_CAMPOS.clienteEndereco.y);
      desenharTexto(formData.clienteBairro, COORDENADAS_CAMPOS.clienteBairro.x, COORDENADAS_CAMPOS.clienteBairro.y);
      desenharTexto(formData.clienteInscEstadual || "", COORDENADAS_CAMPOS.clienteInscEstadual.x, COORDENADAS_CAMPOS.clienteInscEstadual.y, fontSizeSmall);
      desenharTexto(formData.clienteCEP, COORDENADAS_CAMPOS.clienteCEP.x, COORDENADAS_CAMPOS.clienteCEP.y);
      desenharTexto(formData.clienteMunicipio, COORDENADAS_CAMPOS.clienteMunicipio.x, COORDENADAS_CAMPOS.clienteMunicipio.y);
      desenharTexto(formData.clienteUF, COORDENADAS_CAMPOS.clienteUF.x, COORDENADAS_CAMPOS.clienteUF.y);
      desenharTexto(formData.clienteTelefone, COORDENADAS_CAMPOS.clienteTelefone.x, COORDENADAS_CAMPOS.clienteTelefone.y);
      
      // ========== DADOS DA FATURA ==========
      desenharTexto(formData.numeroFatura, COORDENADAS_CAMPOS.numeroFatura.x, COORDENADAS_CAMPOS.numeroFatura.y, 11, true);
      desenharTexto(formatarData(formData.dataVencimento), COORDENADAS_CAMPOS.dataVencimento.x, COORDENADAS_CAMPOS.dataVencimento.y);
      desenharTexto(formatarMoeda(formData.valorTotal), COORDENADAS_CAMPOS.valorFatura.x, COORDENADAS_CAMPOS.valorFatura.y, 11, true);
      
      // Endereço de Cobrança (usa endereço do cliente se não tiver outro)
      desenharTexto(formData.clienteEndereco + ", " + formData.clienteBairro + " - " + formData.clienteMunicipio + "/" + formData.clienteUF, 
        COORDENADAS_CAMPOS.enderecoCobranca.x, COORDENADAS_CAMPOS.enderecoCobranca.y, fontSizeSmall);
      
      // ========== ITENS DA TABELA ==========
      formData.itens.forEach((item, index) => {
        const y = COORDENADAS_CAMPOS.itemDescricao.y - (index * COORDENADAS_CAMPOS.itemDescricao.lineHeight);
        desenharTexto(item.descricao, COORDENADAS_CAMPOS.itemDescricao.x, y, fontSizeSmall);
        desenharTexto(item.quantidade.toString(), COORDENADAS_CAMPOS.itemQtd.x, y, fontSizeSmall);
        desenharTexto(formatarMoeda(item.valorUnitario), COORDENADAS_CAMPOS.itemValorUnit.x, y, fontSizeSmall);
        desenharTexto(formatarMoeda(item.valorTotal), COORDENADAS_CAMPOS.itemValorTotal.x, y, fontSizeSmall);
      });
      
      // ========== OBSERVAÇÕES (Projeto, Direção, Produção) ==========
      let obsTexto = "";
      if (formData.projeto) obsTexto += `Projeto: ${formData.projeto}\n`;
      if (formData.direcao) obsTexto += `Direção: ${formData.direcao}\n`;
      if (formData.producao) obsTexto += `Produção: ${formData.producao}\n`;
      if (formData.observacoes) obsTexto += `\n${formData.observacoes}`;
      
      // Quebrar observações em linhas
      const linhasObs = obsTexto.split('\n');
      linhasObs.forEach((linha, index) => {
        desenharTexto(linha, COORDENADAS_CAMPOS.observacoes.x, COORDENADAS_CAMPOS.observacoes.y - (index * COORDENADAS_CAMPOS.observacoes.lineHeight), fontSizeSmall);
      });
      
      // ========== VALOR TOTAL DA NOTA ==========
      desenharTexto(formatarMoeda(formData.valorTotal), COORDENADAS_CAMPOS.valorTotalNota.x, COORDENADAS_CAMPOS.valorTotalNota.y, 14, true);
      
      // ========== NÚMERO DA FATURA NO RODAPÉ ==========
      desenharTexto(formData.numeroFatura, COORDENADAS_CAMPOS.numeroFaturaRodape.x, COORDENADAS_CAMPOS.numeroFaturaRodape.y, 18, true);
      
      // Gerar o PDF final
      const pdfBytes = await pdfDoc.save();
      
      // Criar blob para download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Detectar se é mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // No mobile: criar link de download direto
        const link = document.createElement('a');
        link.href = url;
        link.download = `Fatura_${formData.numeroFatura}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Mostrar mensagem de sucesso
        setTimeout(() => {
          alert(`✅ PDF gerado com sucesso!\n\nArquivo: Fatura_${formData.numeroFatura}.pdf\n\nVerifique sua pasta de Downloads.`);
        }, 500);
      } else {
        // No desktop: abrir em nova janela
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          // Se popup foi bloqueado, fazer download
          const link = document.createElement('a');
          link.href = url;
          link.download = `Fatura_${formData.numeroFatura}.pdf`;
          link.click();
        }
      }
      
      // Limpar URL após um tempo
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('❌ Erro ao gerar PDF.\n\nVerifique se o template foi carregado corretamente.');
    } finally {
      setIsProcessing(false);
    }
  }

  // Fechar com tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        // Fechar ao clicar fora do modal
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="text-white font-bold">Gerar Fatura de Locação</h3>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-zinc-400 hover:text-white p-2">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Upload do Template + Botão Teste */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-zinc-300 text-sm">Template PDF</Label>
              <button
                onClick={() => {
                  // Carregar dados de teste baseados na NF 4016 real
                  setFormData({
                    clienteNome: "Kilomba Producoes Ltda",
                    clienteCNPJ: "33.163.124/0001-47",
                    clienteEndereco: "Rua Maestro Henrique Vogeler, 154",
                    clienteBairro: "Braz De Pina",
                    clienteCEP: "21235-680",
                    clienteMunicipio: "Rio de Janeiro",
                    clienteUF: "RJ",
                    clienteTelefone: "21-97603-0440",
                    clienteInscEstadual: "",
                    numeroFatura: "NF-4016/2025",
                    dataEmissao: "2025-12-05",
                    dataVencimento: "2025-12-12",
                    naturezaOperacao: "Locação de Equipamentos",
                    itens: [
                      { descricao: "CANON L SERIES 24/70mm II USM F*2,8", quantidade: 1, valorUnitario: 290.00, valorTotal: 290.00 },
                      { descricao: "BLACKMAGIC POCKET 6K PRO BODY", quantidade: 1, valorUnitario: 217.30, valorTotal: 217.30 },
                      { descricao: "CABEÇA SACHTLER FSB8 ALUMINIUM 75mm", quantidade: 1, valorUnitario: 174.55, valorTotal: 174.55 },
                      { descricao: "TRIPÉ SACHTLER FSB8 ALUMINIUM 75mm", quantidade: 1, valorUnitario: 145.45, valorTotal: 145.45 },
                      { descricao: "SSD SAMSUNG T5 1TB (2 unidades)", quantidade: 2, valorUnitario: 96.58, valorTotal: 193.16 },
                      { descricao: "POWER BANK BASEUS 65W 30000mha (2 un)", quantidade: 2, valorUnitario: 83.72, valorTotal: 167.44 },
                      { descricao: "Acessórios diversos (bateria, cage, cabos)", quantidade: 1, valorUnitario: 172.10, valorTotal: 172.10 },
                    ],
                    projeto: 'O que quero dizer quando falo de amor',
                    direcao: '',
                    producao: 'RIOFILME - Contrato nº 1053/2023',
                    observacoes: 'Locação de equipamentos de câmera no período de 05/12/2025 a 07/12/2025.\nDados Bancários: Banco Itau - 341 | AG:0925 | C/C:57.969-0\nCHAVE PIX: 13.250.869/0001-36',
                    valorTotal: 1360.00,
                  });
                }}
                className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded"
              >
                📋 Carregar Teste (NF 4016)
              </button>
            </div>
            {templateName ? (
              <div className="flex items-center justify-between bg-zinc-700/50 rounded-lg p-3">
                <span className="text-emerald-400 text-sm">✓ {templateName}</span>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-zinc-600 rounded-xl text-zinc-400 hover:border-amber-500 hover:text-amber-400 transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Fazer upload do template PDF
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Dados do Cliente */}
          <div className="space-y-3">
            <h4 className="text-white font-medium text-sm">Dados do Cliente</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-zinc-400 text-xs">Nome / Razão Social</Label>
                <Input 
                  value={formData.clienteNome}
                  onChange={(e) => setFormData({...formData, clienteNome: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">CNPJ / CPF</Label>
                <Input 
                  value={formData.clienteCNPJ}
                  onChange={(e) => setFormData({...formData, clienteCNPJ: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Telefone</Label>
                <Input 
                  value={formData.clienteTelefone}
                  onChange={(e) => setFormData({...formData, clienteTelefone: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Insc. Estadual</Label>
                <Input 
                  value={formData.clienteInscEstadual}
                  onChange={(e) => setFormData({...formData, clienteInscEstadual: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                  placeholder="Opcional"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-zinc-400 text-xs">Endereço</Label>
                <Input 
                  value={formData.clienteEndereco}
                  onChange={(e) => setFormData({...formData, clienteEndereco: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Bairro</Label>
                <Input 
                  value={formData.clienteBairro}
                  onChange={(e) => setFormData({...formData, clienteBairro: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">CEP</Label>
                <Input 
                  value={formData.clienteCEP}
                  onChange={(e) => setFormData({...formData, clienteCEP: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Cidade</Label>
                <Input 
                  value={formData.clienteMunicipio}
                  onChange={(e) => setFormData({...formData, clienteMunicipio: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">UF</Label>
                <Input 
                  value={formData.clienteUF}
                  onChange={(e) => setFormData({...formData, clienteUF: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Dados da Fatura */}
          <div className="space-y-3">
            <h4 className="text-white font-medium text-sm">Dados da Fatura</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-zinc-400 text-xs">Nº Fatura</Label>
                <Input 
                  value={formData.numeroFatura}
                  onChange={(e) => setFormData({...formData, numeroFatura: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Vencimento</Label>
                <Input 
                  type="date"
                  value={formData.dataVencimento}
                  onChange={(e) => setFormData({...formData, dataVencimento: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Valor Total</Label>
                <Input 
                  type="number"
                  value={formData.valorTotal}
                  onChange={(e) => setFormData({...formData, valorTotal: parseFloat(e.target.value) || 0})}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Projeto / Direção / Produção */}
          <div className="space-y-3">
            <h4 className="text-white font-medium text-sm">Dados do Projeto</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-zinc-400 text-xs">Projeto</Label>
                <Input 
                  value={formData.projeto}
                  onChange={(e) => setFormData({...formData, projeto: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                  placeholder="Nome do projeto"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Direção</Label>
                <Input 
                  value={formData.direcao}
                  onChange={(e) => setFormData({...formData, direcao: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                  placeholder="Nome do diretor"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Produção</Label>
                <Input 
                  value={formData.producao}
                  onChange={(e) => setFormData({...formData, producao: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                  placeholder="Nome da produção"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label className="text-zinc-400 text-xs">Observações Adicionais</Label>
            <Textarea 
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              className="bg-zinc-800 border-zinc-700 text-white text-sm min-h-[80px]"
              placeholder="Informações adicionais..."
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-zinc-800">
            <button
              onClick={gerarPDFPreenchido}
              disabled={isProcessing || !pdfTemplate}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {isProcessing ? (
                <>Gerando...</>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  Gerar PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FaturaPDFEditor;

