import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PrintCodesResponse } from "@shared/api";
import { Printer, QrCode, Barcode as BarcodeIcon } from "lucide-react";
import { toast } from "sonner";

interface ProductLabelPrintProps {
  productId: string;
  productName: string;
}

type LabelSize = "small" | "medium" | "large";

const LABEL_SIZES = {
  small: { name: "Pequeno (Cabo USB, etc)", width: "60mm", height: "40mm" },
  medium: { name: "Médio (Equipamentos Padrão)", width: "80mm", height: "60mm" },
  large: { name: "Grande (Equipamentos Grandes)", width: "100mm", height: "80mm" },
};

export function ProductLabelPrint({ productId, productName }: ProductLabelPrintProps) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<LabelSize>("medium");
  const [loading, setLoading] = useState(false);
  const [codes, setCodes] = useState<PrintCodesResponse | null>(null);

  const loadCodes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/products/${productId}/print-codes?size=${size}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar códigos");
      }

      const data: PrintCodesResponse = await response.json();
      setCodes(data);
    } catch (error) {
      console.error("Erro ao carregar códigos:", error);
      toast.error("Erro ao carregar códigos para impressão");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!codes) return;

    // Cria uma janela de impressão
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const sizeConfig = LABEL_SIZES[size];

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta - ${codes.product.name}</title>
          <style>
            @page {
              size: ${sizeConfig.width} ${sizeConfig.height};
              margin: 0;
            }
            
            body {
              margin: 0;
              padding: 10px;
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: ${sizeConfig.height};
              width: ${sizeConfig.width};
            }
            
            .label {
              text-align: center;
              width: 100%;
            }
            
            .product-name {
              font-size: ${size === 'small' ? '10px' : size === 'medium' ? '12px' : '14px'};
              font-weight: bold;
              margin-bottom: 5px;
              word-wrap: break-word;
            }
            
            .product-sku {
              font-size: ${size === 'small' ? '8px' : size === 'medium' ? '10px' : '12px'};
              color: #666;
              margin-bottom: 8px;
            }
            
            .qr-code {
              margin: 5px 0;
            }
            
            .qr-code img {
              width: ${size === 'small' ? '80px' : size === 'medium' ? '120px' : '160px'};
              height: auto;
            }
            
            .barcode {
              margin: 5px 0;
            }
            
            .barcode img {
              width: ${size === 'small' ? '120px' : size === 'medium' ? '180px' : '240px'};
              height: auto;
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="product-name">${codes.product.name}</div>
            ${codes.product.sku ? `<div class="product-sku">SKU: ${codes.product.sku}</div>` : ''}
            
            <div class="qr-code">
              <img src="${codes.qrCode.image}" alt="QR Code" />
            </div>
            
            <div class="barcode">
              <img src="${codes.barcode.image}" alt="Código de Barras" />
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Aguarda carregar as imagens antes de imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={loadCodes}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimir Etiqueta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Imprimir Etiqueta</DialogTitle>
          <DialogDescription>
            Escolha o tamanho da etiqueta e imprima o QR Code e código de barras
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="size">Tamanho da Etiqueta</Label>
            <Select value={size} onValueChange={(v) => setSize(v as LabelSize)}>
              <SelectTrigger id="size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">{LABEL_SIZES.small.name}</SelectItem>
                <SelectItem value="medium">{LABEL_SIZES.medium.name}</SelectItem>
                <SelectItem value="large">{LABEL_SIZES.large.name}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">Gerando códigos...</p>
            </div>
          )}

          {codes && !loading && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{codes.product.name}</h4>
                {codes.product.sku && (
                  <p className="text-sm text-muted-foreground mb-3">
                    SKU: {codes.product.sku}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <QrCode className="w-4 h-4" />
                      <span className="text-sm font-medium">QR Code</span>
                    </div>
                    <img
                      src={codes.qrCode.image}
                      alt="QR Code"
                      className="w-full max-w-[200px] mx-auto"
                    />
                    <p className="text-xs text-muted-foreground font-mono">
                      {codes.qrCode.data}
                    </p>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <BarcodeIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Código de Barras</span>
                    </div>
                    <img
                      src={codes.barcode.image}
                      alt="Código de Barras"
                      className="w-full max-w-[200px] mx-auto"
                    />
                    <p className="text-xs text-muted-foreground font-mono">
                      {codes.barcode.data}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Dica:</strong> Cole a etiqueta impressa no equipamento para
                  facilitar a identificação e conferência durante saídas e devoluções.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handlePrint} disabled={!codes || loading}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

