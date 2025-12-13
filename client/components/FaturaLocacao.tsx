import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Printer, FileText, Plus, Trash2, Download } from "lucide-react";
import { useLogo } from "@/context/LogoContext";
import { useTenant } from "@/context/TenantContext";

interface ItemFatura {
  codigo: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface DadosCliente {
  nome: string;
  cnpjCpf: string;
  endereco: string;
  bairro: string;
  cep: string;
  municipio: string;
  uf: string;
  telefone: string;
  inscEstadual: string;
}

interface DadosFatura {
  numero: string;
  dataEmissao: string;
  dataVencimento: string;
  naturezaOperacao: string;
  enderecoCobranca: string;
  observacoes: string;
  // Campos específicos para locadora de cinema
  projeto?: string;
  direcao?: string;
  producao?: string;
  periodoLocacao?: string;
}

interface FaturaLocacaoProps {
  clienteInicial?: DadosCliente;
  itensIniciais?: ItemFatura[];
  onSave?: (fatura: any) => void;
}

export function FaturaLocacao({ clienteInicial, itensIniciais, onSave }: FaturaLocacaoProps) {
  const { currentLogo } = useLogo();
  const { currentTenant } = useTenant();
  const printRef = useRef<HTMLDivElement>(null);
  
  // Dados da empresa
  const empresa = {
    nome: currentTenant?.name || "Bil's Cinema e Vídeo",
    cnpj: currentTenant?.owner?.cnpj || "13.250.869/0001-36",
    inscEstadual: currentTenant?.owner?.ie || "",
    inscMunicipal: "282.440/001-8",
    endereco: currentTenant?.owner?.address || "Belo Horizonte, MG",
    telefone: currentTenant?.owner?.phone || "(31) 99999-9999",
  };

  // Estado do cliente
  const [cliente, setCliente] = useState<DadosCliente>(clienteInicial || {
    nome: "",
    cnpjCpf: "",
    endereco: "",
    bairro: "",
    cep: "",
    municipio: "",
    uf: "MG",
    telefone: "",
    inscEstadual: "",
  });

  // Estado da fatura
  const [fatura, setFatura] = useState<DadosFatura>({
    numero: gerarNumeroFatura(),
    dataEmissao: new Date().toISOString().split('T')[0],
    dataVencimento: "",
    naturezaOperacao: "Locação de Equipamento",
    enderecoCobranca: "",
    observacoes: "",
  });

  // Estado dos itens
  const [itens, setItens] = useState<ItemFatura[]>(itensIniciais || []);

  // Novo item
  const [novoItem, setNovoItem] = useState<ItemFatura>({
    codigo: "",
    descricao: "",
    quantidade: 1,
    valorUnitario: 0,
    valorTotal: 0,
  });

  function gerarNumeroFatura(): string {
    const ultimoNumero = localStorage.getItem('ultimaFaturaNumero') || '3723';
    const novoNumero = (parseInt(ultimoNumero) + 1).toString();
    localStorage.setItem('ultimaFaturaNumero', novoNumero);
    return novoNumero;
  }

  function adicionarItem() {
    if (!novoItem.descricao) return;
    
    const itemComTotal = {
      ...novoItem,
      valorTotal: novoItem.quantidade * novoItem.valorUnitario,
    };
    
    setItens([...itens, itemComTotal]);
    setNovoItem({
      codigo: "",
      descricao: "",
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
    });
  }

  function removerItem(index: number) {
    setItens(itens.filter((_, i) => i !== index));
  }

  function calcularTotal(): number {
    return itens.reduce((acc, item) => acc + item.valorTotal, 0);
  }

  function formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatarData(data: string): string {
    if (!data) return "";
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  function imprimirFatura() {
    const conteudo = printRef.current;
    if (!conteudo) return;

    const janelaImpressao = window.open('', '_blank');
    if (!janelaImpressao) return;

    janelaImpressao.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fatura de Locação Nº ${fatura.numero}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; }
          .fatura { border: 2px solid #000; max-width: 800px; margin: 0 auto; }
          .header { display: flex; border-bottom: 2px solid #000; }
          .logo-area { width: 100px; padding: 10px; border-right: 2px solid #000; display: flex; align-items: center; justify-content: center; }
          .logo-area img { max-width: 80px; max-height: 60px; }
          .titulo-area { flex: 1; }
          .titulo { background: #f0f0f0; padding: 8px; text-align: center; font-weight: bold; font-size: 14px; border-bottom: 1px solid #000; }
          .subtitulo { padding: 5px; text-align: center; font-size: 12px; border-bottom: 1px solid #000; }
          .dados-empresa { display: flex; border-bottom: 1px solid #000; }
          .dados-empresa > div { flex: 1; padding: 5px; border-right: 1px solid #000; }
          .dados-empresa > div:last-child { border-right: none; }
          .row { display: flex; border-bottom: 1px solid #000; }
          .row > div { padding: 5px; border-right: 1px solid #000; }
          .row > div:last-child { border-right: none; }
          .label { font-weight: bold; font-size: 9px; color: #666; }
          .value { font-size: 11px; min-height: 16px; }
          .col-1 { width: 8.33%; }
          .col-2 { width: 16.66%; }
          .col-3 { width: 25%; }
          .col-4 { width: 33.33%; }
          .col-5 { width: 41.66%; }
          .col-6 { width: 50%; }
          .col-8 { width: 66.66%; }
          .col-12 { width: 100%; }
          .section-title { background: #f0f0f0; padding: 5px; font-weight: bold; border-bottom: 1px solid #000; }
          .items-table { width: 100%; border-collapse: collapse; }
          .items-table th { background: #f0f0f0; padding: 5px; border: 1px solid #000; font-size: 10px; }
          .items-table td { padding: 5px; border: 1px solid #000; font-size: 10px; }
          .items-table .valor { text-align: right; }
          .observacoes { min-height: 80px; padding: 10px; border-bottom: 1px solid #000; }
          .total { text-align: right; padding: 10px; font-weight: bold; font-size: 14px; border-bottom: 1px solid #000; }
          .rodape { display: flex; border-top: 1px solid #000; }
          .rodape-left { width: 30%; padding: 10px; border-right: 1px solid #000; }
          .rodape-right { flex: 1; padding: 10px; font-size: 9px; }
          .assinatura { margin-top: 30px; border-top: 1px solid #000; padding-top: 5px; }
          .assinatura-campos { display: flex; margin-top: 20px; }
          .assinatura-campos > div { flex: 1; text-align: center; }
          @media print {
            body { padding: 0; }
            .fatura { border: 1px solid #000; }
          }
        </style>
      </head>
      <body>
        <div class="fatura">
          <!-- Cabeçalho -->
          <div class="header">
            <div class="logo-area">
              <img src="${currentLogo}" alt="Logo" />
            </div>
            <div class="titulo-area">
              <div class="titulo">FATURA DE LOCAÇÃO</div>
              <div class="subtitulo">1ª VIA CLIENTE</div>
              <div class="dados-empresa">
                <div><span class="label">INSC. ESTADUAL</span><br/><span class="value">${empresa.inscEstadual}</span></div>
                <div><span class="label">CNPJ / CPF</span><br/><span class="value">${empresa.cnpj}</span></div>
              </div>
              <div class="row">
                <div class="col-6"><span class="label">Natureza da Operação:</span><br/><span class="value">${fatura.naturezaOperacao}</span></div>
                <div class="col-3"><span class="label">Dt. de emissão</span><br/><span class="value">${formatarData(fatura.dataEmissao)}</span></div>
                <div class="col-3"><span class="label">Insc. Municipal</span><br/><span class="value">${empresa.inscMunicipal}</span></div>
              </div>
            </div>
          </div>

          <!-- Dados do Cliente -->
          <div class="section-title">Dados do Cliente</div>
          <div class="row">
            <div class="col-8"><span class="label">Nome / Razão Social</span><br/><span class="value">${cliente.nome}</span></div>
            <div class="col-4"><span class="label">CNPJ / CPF</span><br/><span class="value">${cliente.cnpjCpf}</span></div>
          </div>
          <div class="row">
            <div class="col-6"><span class="label">Endereço</span><br/><span class="value">${cliente.endereco}</span></div>
            <div class="col-3"><span class="label">Bairro</span><br/><span class="value">${cliente.bairro}</span></div>
            <div class="col-3"><span class="label">Insc. Estadual</span><br/><span class="value">${cliente.inscEstadual}</span></div>
          </div>
          <div class="row">
            <div class="col-2"><span class="label">Cep</span><br/><span class="value">${cliente.cep}</span></div>
            <div class="col-4"><span class="label">Município</span><br/><span class="value">${cliente.municipio}</span></div>
            <div class="col-2"><span class="label">UF</span><br/><span class="value">${cliente.uf}</span></div>
            <div class="col-4"><span class="label">Fone / Fax</span><br/><span class="value">${cliente.telefone}</span></div>
          </div>

          <!-- Dados da Fatura -->
          <div class="row">
            <div class="col-4"><span class="label">Número da Fatura de Locação</span><br/><span class="value">${fatura.numero}</span></div>
            <div class="col-4"><span class="label">Dt. vencimento</span><br/><span class="value">${formatarData(fatura.dataVencimento)}</span></div>
            <div class="col-4"><span class="label">Valor</span><br/><span class="value">${formatarMoeda(calcularTotal())}</span></div>
          </div>
          <div class="row">
            <div class="col-12"><span class="label">Endereço de Cobrança / Praça de Pagamento</span><br/><span class="value">${fatura.enderecoCobranca || cliente.endereco}</span></div>
          </div>

          <!-- Itens -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 50%">Código e Descrição</th>
                <th style="width: 15%">Quantidade</th>
                <th style="width: 17.5%">Valor Unitário R$</th>
                <th style="width: 17.5%">Valor Total R$</th>
              </tr>
            </thead>
            <tbody>
              ${itens.map(item => `
                <tr>
                  <td>${item.codigo ? item.codigo + ' - ' : ''}${item.descricao}</td>
                  <td class="valor">${item.quantidade}</td>
                  <td class="valor">${formatarMoeda(item.valorUnitario)}</td>
                  <td class="valor">${formatarMoeda(item.valorTotal)}</td>
                </tr>
              `).join('')}
              ${Array(Math.max(0, 10 - itens.length)).fill('<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>').join('')}
            </tbody>
          </table>

          <!-- Observações e Total -->
          <div class="row">
            <div class="col-8">
              <span class="label">Observações</span>
              <div class="observacoes">${fatura.observacoes.replace(/\n/g, '<br/>')}</div>
            </div>
            <div class="col-4">
              <span class="label">Valor Total da Nota de Locação</span>
              <div class="total">${formatarMoeda(calcularTotal())}</div>
            </div>
          </div>

          <!-- Rodapé -->
          <div class="rodape">
            <div class="rodape-left">
              <span class="label">FATURA DE LOCAÇÃO N°</span>
              <div class="value" style="font-size: 16px; font-weight: bold; margin-top: 10px;">${fatura.numero}</div>
            </div>
            <div class="rodape-right">
              <p>Reconheço(emos) a exatidão desta FATURA DE LOCAÇÃO, na importância acima, que pagarei(emos) à ${empresa.nome} indicada ao lado.</p>
              <div class="assinatura-campos">
                <div>
                  <div class="assinatura"></div>
                  <span class="label">Data do Recebimento</span>
                </div>
                <div>
                  <div class="assinatura"></div>
                  <span class="label">Identificação e Assinatura do Recebedor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    janelaImpressao.document.close();
  }

  return (
    <Card className="bg-cinema-dark-lighter border-cinema-gray">
      <CardHeader>
        <CardTitle className="text-cinema-yellow flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Gerar Fatura de Locação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dados do Cliente */}
        <div>
          <h3 className="text-white font-semibold mb-3">Dados do Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Label className="text-gray-300">Nome / Razão Social</Label>
              <Input
                value={cliente.nome}
                onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                className="bg-cinema-gray border-cinema-gray-light text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">CNPJ / CPF</Label>
              <Input
                value={cliente.cnpjCpf}
                onChange={(e) => setCliente({ ...cliente, cnpjCpf: e.target.value })}
                className="bg-cinema-gray border-cinema-gray-light text-white"
              />
            </div>
            <div className="lg:col-span-2">
              <Label className="text-gray-300">Endereço</Label>
              <Input
                value={cliente.endereco}
                onChange={(e) => setCliente({ ...cliente, endereco: e.target.value })}
                className="bg-cinema-gray border-cinema-gray-light text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Bairro</Label>
              <Input
                value={cliente.bairro}
                onChange={(e) => setCliente({ ...cliente, bairro: e.target.value })}
                className="bg-cinema-gray border-cinema-gray-light text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">CEP</Label>
              <Input
                value={cliente.cep}
                onChange={(e) => setCliente({ ...cliente, cep: e.target.value })}
                className="bg-cinema-gray border-cinema-gray-light text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Município</Label>
              <Input
                value={cliente.municipio}
                onChange={(e) => setCliente({ ...cliente, municipio: e.target.value })}
                className="bg-cinema-gray border-cinema-gray-light text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">UF</Label>
              <Input
                value={cliente.uf}
                onChange={(e) => setCliente({ ...cliente, uf: e.target.value })}
                className="bg-cinema-gray border-cinema-gray-light text-white"
                maxLength={2}
              />
            </div>
            <div>
              <Label className="text-gray-300">Telefone</Label>
              <Input
                value={cliente.telefone}
                onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })}
                className="bg-cinema-gray border-cinema-gray-light text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Insc. Estadual</Label>
              <Input
                value={cliente.inscEstadual}
                onChange={(e) => setCliente({ ...cliente, inscEstadual: e.target.value })}
                className="bg-cinema-gray border-cinema-gray-light text-white"
              />
            </div>
          </div>
        </div>

        {/* Dados da Fatura */}
        <div>
          <h3 className="text-white font-semibold mb-3">Dados da Fatura</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-gray-300">Número da Fatura</Label>
              <Input
                value={fatura.numero}
                onChange={(e) => setFatura({ ...fatura, numero: e.target.value })}
                className="bg-cinema-gray border-cinema-gray-light text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Data de Emissão</Label>
              <Input
                type="date"
                value={fatura.dataEmissao}
                onChange={(e) => setFatura({ ...fatura, dataEmissao: e.target.value })}
                className="bg-cinema-gray border-cinema-gray-light text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Data de Vencimento</Label>
              <Input
                type="date"
                value={fatura.dataVencimento}
                onChange={(e) => setFatura({ ...fatura, dataVencimento: e.target.value })}
                className="bg-cinema-gray border-cinema-gray-light text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Natureza da Operação</Label>
              <Input
                value={fatura.naturezaOperacao}
                onChange={(e) => setFatura({ ...fatura, naturezaOperacao: e.target.value })}
                className="bg-cinema-gray border-cinema-gray-light text-white"
              />
            </div>
          </div>
        </div>

        {/* Itens da Fatura */}
        <div>
          <h3 className="text-white font-semibold mb-3">Itens da Locação</h3>
          
          {/* Adicionar Item */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-4 p-3 bg-cinema-gray/30 rounded-lg">
            <div>
              <Label className="text-gray-300 text-xs">Código</Label>
              <Input
                value={novoItem.codigo}
                onChange={(e) => setNovoItem({ ...novoItem, codigo: e.target.value })}
                className="bg-cinema-gray border-cinema-gray-light text-white text-sm"
                placeholder="Opcional"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-gray-300 text-xs">Descrição</Label>
              <Input
                value={novoItem.descricao}
                onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
                className="bg-cinema-gray border-cinema-gray-light text-white text-sm"
                placeholder="Ex: SONY FX6 - 5 diárias"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Qtd</Label>
              <Input
                type="number"
                value={novoItem.quantidade}
                onChange={(e) => setNovoItem({ ...novoItem, quantidade: parseInt(e.target.value) || 1 })}
                className="bg-cinema-gray border-cinema-gray-light text-white text-sm"
                min={1}
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Valor Unit.</Label>
              <Input
                type="number"
                value={novoItem.valorUnitario}
                onChange={(e) => setNovoItem({ ...novoItem, valorUnitario: parseFloat(e.target.value) || 0 })}
                className="bg-cinema-gray border-cinema-gray-light text-white text-sm"
                step="0.01"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={adicionarItem} className="w-full bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* Lista de Itens */}
          {itens.length > 0 && (
            <div className="border border-cinema-gray rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-cinema-gray">
                  <tr className="text-gray-300">
                    <th className="p-2 text-left">Descrição</th>
                    <th className="p-2 text-right w-20">Qtd</th>
                    <th className="p-2 text-right w-28">V. Unit.</th>
                    <th className="p-2 text-right w-28">V. Total</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item, index) => (
                    <tr key={index} className="border-t border-cinema-gray text-white">
                      <td className="p-2">{item.codigo ? `${item.codigo} - ` : ''}{item.descricao}</td>
                      <td className="p-2 text-right">{item.quantidade}</td>
                      <td className="p-2 text-right">{formatarMoeda(item.valorUnitario)}</td>
                      <td className="p-2 text-right">{formatarMoeda(item.valorTotal)}</td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerItem(index)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-cinema-gray">
                  <tr className="text-cinema-yellow font-bold">
                    <td className="p-2" colSpan={3}>TOTAL</td>
                    <td className="p-2 text-right">{formatarMoeda(calcularTotal())}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Observações */}
        <div>
          <Label className="text-gray-300">Observações</Label>
          <Textarea
            value={fatura.observacoes}
            onChange={(e) => setFatura({ ...fatura, observacoes: e.target.value })}
            className="bg-cinema-gray border-cinema-gray-light text-white min-h-[100px]"
            placeholder="Informações adicionais, condições de pagamento, dados bancários..."
          />
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-4 border-t border-cinema-gray">
          <Button
            onClick={imprimirFatura}
            className="bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark"
            disabled={itens.length === 0}
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir / Gerar PDF
          </Button>
        </div>

        {/* Área de impressão oculta */}
        <div ref={printRef} className="hidden"></div>
      </CardContent>
    </Card>
  );
}

export default FaturaLocacao;

// Função para gerar fatura diretamente de um pedido
export function gerarFaturaPDF(pedido: {
  id: string;
  orderNumber: string;
  cliente: {
    nome: string;
    cnpjCpf?: string;
    endereco?: string;
    bairro?: string;
    cep?: string;
    cidade?: string;
    uf?: string;
    telefone?: string;
  };
  itens: Array<{
    nome: string;
    quantidade: number;
    valorUnitario: number;
  }>;
  valorTotal: number;
  dataVencimento: string;
  projeto?: string;
  direcao?: string;
  producao?: string;
  periodoLocacao?: string;
  observacoes?: string;
}, empresaConfig?: {
  nome?: string;
  cnpj?: string;
  inscEstadual?: string;
  inscMunicipal?: string;
  endereco?: string;
  telefone?: string;
  logo?: string;
}) {
  // Dados da empresa (padrão ou configurado)
  const empresa = {
    nome: empresaConfig?.nome || "Bil's Cinema e Vídeo",
    cnpj: empresaConfig?.cnpj || "13.250.869/0001-36",
    inscEstadual: empresaConfig?.inscEstadual || "",
    inscMunicipal: empresaConfig?.inscMunicipal || "282.440/001-8",
    endereco: empresaConfig?.endereco || "Belo Horizonte, MG",
    telefone: empresaConfig?.telefone || "(31) 99999-9999",
    logo: empresaConfig?.logo || "",
  };

  // Gerar número da fatura
  const ultimoNumero = localStorage.getItem('ultimaFaturaNumero') || '3723';
  const novoNumero = (parseInt(ultimoNumero) + 1).toString().padStart(6, '0');
  localStorage.setItem('ultimaFaturaNumero', novoNumero);

  const dataEmissao = new Date().toLocaleDateString('pt-BR');
  const dataVenc = pedido.dataVencimento ? new Date(pedido.dataVencimento).toLocaleDateString('pt-BR') : '';

  // Montar observações com projeto, direção, produção
  let observacoes = '';
  if (pedido.projeto) observacoes += `Projeto: ${pedido.projeto}\n`;
  if (pedido.direcao) observacoes += `Direção: ${pedido.direcao}\n`;
  if (pedido.producao) observacoes += `Produção: ${pedido.producao}\n`;
  if (pedido.periodoLocacao) observacoes += `Período: ${pedido.periodoLocacao}\n`;
  if (pedido.observacoes) observacoes += `\n${pedido.observacoes}`;

  const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const janelaImpressao = window.open('', '_blank');
  if (!janelaImpressao) {
    alert('Popup bloqueado! Permita popups para gerar o PDF.');
    return;
  }

  janelaImpressao.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fatura de Locação Nº ${novoNumero}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; background: #fff; }
        .fatura { border: 2px solid #000; max-width: 800px; margin: 0 auto; background: #fff; }
        .header { display: flex; border-bottom: 2px solid #000; }
        .logo-area { width: 120px; padding: 10px; border-right: 2px solid #000; display: flex; align-items: center; justify-content: center; background: #f5f5f5; }
        .logo-area img { max-width: 100px; max-height: 80px; }
        .logo-placeholder { width: 80px; height: 60px; border: 1px dashed #999; display: flex; align-items: center; justify-content: center; color: #999; font-size: 10px; }
        .titulo-area { flex: 1; }
        .titulo { background: #333; color: #fff; padding: 10px; text-align: center; font-weight: bold; font-size: 16px; }
        .subtitulo { padding: 5px; text-align: center; font-size: 11px; border-bottom: 1px solid #000; background: #f0f0f0; }
        .dados-empresa { display: flex; border-bottom: 1px solid #000; }
        .dados-empresa > div { flex: 1; padding: 8px; border-right: 1px solid #000; }
        .dados-empresa > div:last-child { border-right: none; }
        .row { display: flex; border-bottom: 1px solid #000; }
        .row > div { padding: 8px; border-right: 1px solid #000; }
        .row > div:last-child { border-right: none; }
        .label { font-weight: bold; font-size: 9px; color: #666; text-transform: uppercase; }
        .value { font-size: 12px; min-height: 18px; margin-top: 2px; }
        .col-2 { width: 16.66%; }
        .col-3 { width: 25%; }
        .col-4 { width: 33.33%; }
        .col-6 { width: 50%; }
        .col-8 { width: 66.66%; }
        .col-12 { width: 100%; }
        .section-title { background: #333; color: #fff; padding: 8px; font-weight: bold; font-size: 12px; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th { background: #f0f0f0; padding: 8px; border: 1px solid #000; font-size: 10px; text-transform: uppercase; }
        .items-table td { padding: 8px; border: 1px solid #000; font-size: 11px; }
        .items-table .valor { text-align: right; }
        .items-table tr:nth-child(even) { background: #fafafa; }
        .observacoes { min-height: 100px; padding: 10px; white-space: pre-line; line-height: 1.5; }
        .total-area { background: #333; color: #fff; padding: 15px; text-align: right; font-size: 18px; font-weight: bold; }
        .rodape { display: flex; border-top: 2px solid #000; }
        .rodape-left { width: 35%; padding: 15px; border-right: 2px solid #000; background: #f5f5f5; }
        .rodape-right { flex: 1; padding: 15px; font-size: 10px; }
        .numero-fatura { font-size: 24px; font-weight: bold; color: #333; margin-top: 10px; }
        .assinatura { margin-top: 40px; border-top: 1px solid #000; padding-top: 5px; text-align: center; }
        .assinatura-campos { display: flex; margin-top: 30px; gap: 20px; }
        .assinatura-campos > div { flex: 1; text-align: center; }
        @media print {
          body { padding: 0; }
          .fatura { border: 1px solid #000; }
        }
      </style>
    </head>
    <body>
      <div class="fatura">
        <!-- Cabeçalho -->
        <div class="header">
          <div class="logo-area">
            ${empresa.logo ? `<img src="${empresa.logo}" alt="Logo" />` : `<div class="logo-placeholder">LOGO</div>`}
          </div>
          <div class="titulo-area">
            <div class="titulo">FATURA DE LOCAÇÃO</div>
            <div class="subtitulo">1ª VIA CLIENTE</div>
            <div class="dados-empresa">
              <div><span class="label">Empresa</span><br/><span class="value">${empresa.nome}</span></div>
              <div><span class="label">CNPJ</span><br/><span class="value">${empresa.cnpj}</span></div>
              <div><span class="label">Insc. Municipal</span><br/><span class="value">${empresa.inscMunicipal}</span></div>
            </div>
            <div class="row">
              <div class="col-6"><span class="label">Natureza da Operação</span><br/><span class="value">LOCAÇÃO DE EQUIPAMENTOS</span></div>
              <div class="col-3"><span class="label">Data Emissão</span><br/><span class="value">${dataEmissao}</span></div>
              <div class="col-3"><span class="label">Nº Pedido</span><br/><span class="value">${pedido.orderNumber}</span></div>
            </div>
          </div>
        </div>

        <!-- Dados do Cliente -->
        <div class="section-title">DADOS DO CLIENTE</div>
        <div class="row">
          <div class="col-8"><span class="label">Nome / Razão Social</span><br/><span class="value">${pedido.cliente.nome}</span></div>
          <div class="col-4"><span class="label">CNPJ / CPF</span><br/><span class="value">${pedido.cliente.cnpjCpf || '-'}</span></div>
        </div>
        <div class="row">
          <div class="col-6"><span class="label">Endereço</span><br/><span class="value">${pedido.cliente.endereco || '-'}</span></div>
          <div class="col-3"><span class="label">Bairro</span><br/><span class="value">${pedido.cliente.bairro || '-'}</span></div>
          <div class="col-3"><span class="label">Telefone</span><br/><span class="value">${pedido.cliente.telefone || '-'}</span></div>
        </div>
        <div class="row">
          <div class="col-3"><span class="label">CEP</span><br/><span class="value">${pedido.cliente.cep || '-'}</span></div>
          <div class="col-6"><span class="label">Cidade</span><br/><span class="value">${pedido.cliente.cidade || '-'}</span></div>
          <div class="col-3"><span class="label">UF</span><br/><span class="value">${pedido.cliente.uf || 'MG'}</span></div>
        </div>

        <!-- Dados da Fatura -->
        <div class="row" style="background: #f5f5f5;">
          <div class="col-4"><span class="label">Número da Fatura</span><br/><span class="value" style="font-size: 16px; font-weight: bold;">${novoNumero}</span></div>
          <div class="col-4"><span class="label">Data Vencimento</span><br/><span class="value" style="font-size: 14px; font-weight: bold; color: #c00;">${dataVenc}</span></div>
          <div class="col-4"><span class="label">Valor Total</span><br/><span class="value" style="font-size: 16px; font-weight: bold; color: #060;">${formatarMoeda(pedido.valorTotal)}</span></div>
        </div>

        <!-- Itens -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 55%">Descrição do Equipamento</th>
              <th style="width: 10%">Qtd</th>
              <th style="width: 17.5%">Valor Unitário</th>
              <th style="width: 17.5%">Valor Total</th>
            </tr>
          </thead>
          <tbody>
            ${pedido.itens.map(item => `
              <tr>
                <td>${item.nome}</td>
                <td class="valor">${item.quantidade}</td>
                <td class="valor">${formatarMoeda(item.valorUnitario)}</td>
                <td class="valor">${formatarMoeda(item.quantidade * item.valorUnitario)}</td>
              </tr>
            `).join('')}
            ${Array(Math.max(0, 6 - pedido.itens.length)).fill('<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>').join('')}
          </tbody>
        </table>

        <!-- Observações e Total -->
        <div class="row">
          <div class="col-8">
            <span class="label">Observações</span>
            <div class="observacoes">${observacoes || 'Sem observações'}</div>
          </div>
          <div class="col-4" style="display: flex; flex-direction: column;">
            <span class="label">Valor Total da Locação</span>
            <div class="total-area" style="flex: 1; display: flex; align-items: center; justify-content: center;">
              ${formatarMoeda(pedido.valorTotal)}
            </div>
          </div>
        </div>

        <!-- Rodapé -->
        <div class="rodape">
          <div class="rodape-left">
            <span class="label">FATURA DE LOCAÇÃO Nº</span>
            <div class="numero-fatura">${novoNumero}</div>
          </div>
          <div class="rodape-right">
            <p>Reconheço(emos) a exatidão desta FATURA DE LOCAÇÃO, na importância acima, que pagarei(emos) à <strong>${empresa.nome}</strong>, ou à sua ordem, na praça e vencimento indicados.</p>
            <div class="assinatura-campos">
              <div>
                <div class="assinatura"></div>
                <span class="label">Data do Recebimento</span>
              </div>
              <div>
                <div class="assinatura"></div>
                <span class="label">Identificação e Assinatura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() { 
          setTimeout(function() { window.print(); }, 500);
        };
      </script>
    </body>
    </html>
  `);
  janelaImpressao.document.close();
}

