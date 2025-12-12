import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";
import bwipjs from "bwip-js";

const prisma = new PrismaClient();

/**
 * Gera QR Code para um produto
 * POST /api/products/:id/generate-qrcode
 */
export const generateQRCode: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { regenerate } = req.body; // Se true, regenera mesmo se já existir

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    // Se já tem QR Code e não quer regenerar
    if (product.qrCode && !regenerate) {
      return res.status(200).json({
        qrCode: product.qrCode,
        message: "Produto já possui QR Code",
      });
    }

    // Gera um código único baseado no ID do produto
    const qrCodeData = `PROD-${id}`;

    // Atualiza o produto com o QR Code
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { qrCode: qrCodeData },
    });

    // Gera a imagem do QR Code
    const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
      margin: 1,
    });

    res.status(200).json({
      qrCode: qrCodeData,
      qrCodeImage,
      product: updatedProduct,
      message: "QR Code gerado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error);
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
};

/**
 * Gera código de barras para um produto
 * POST /api/products/:id/generate-barcode
 */
export const generateBarcode: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { regenerate, format = "code128" } = req.body;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    // Se já tem código de barras e não quer regenerar
    if (product.barcode && !regenerate) {
      return res.status(200).json({
        barcode: product.barcode,
        message: "Produto já possui código de barras",
      });
    }

    // Gera um código único (EAN-13 compatible ou Code128)
    const timestamp = Date.now().toString().slice(-10);
    const barcodeData = `${timestamp}${id.slice(0, 3)}`;

    // Atualiza o produto
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { barcode: barcodeData },
    });

    // Gera a imagem do código de barras
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: format, // Tipo: code128, ean13, upca, etc.
      text: barcodeData,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: "center",
    });

    const barcodeImage = `data:image/png;base64,${barcodeBuffer.toString("base64")}`;

    res.status(200).json({
      barcode: barcodeData,
      barcodeImage,
      product: updatedProduct,
      message: "Código de barras gerado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao gerar código de barras:", error);
    res.status(500).json({ error: "Erro ao gerar código de barras" });
  }
};

/**
 * Gera QR Code e Barcode para impressão
 * GET /api/products/:id/print-codes
 */
export const getPrintCodes: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { size = "medium" } = req.query; // small, medium, large

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    // Se não tem QR Code ou Barcode, gera automaticamente
    let qrCodeData = product.qrCode || `PROD-${id}`;
    let barcodeData = product.barcode;

    if (!product.qrCode || !product.barcode) {
      const timestamp = Date.now().toString().slice(-10);
      barcodeData = barcodeData || `${timestamp}${id.slice(0, 3)}`;

      await prisma.product.update({
        where: { id },
        data: {
          qrCode: qrCodeData,
          barcode: barcodeData,
        },
      });
    }

    // Define tamanhos baseado no parâmetro
    const sizes = {
      small: { qr: 150, barHeight: 8, barScale: 2 },
      medium: { qr: 300, barHeight: 10, barScale: 3 },
      large: { qr: 500, barHeight: 15, barScale: 4 },
    };

    const selectedSize = sizes[size as keyof typeof sizes] || sizes.medium;

    // Gera QR Code
    const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: selectedSize.qr,
      margin: 1,
    });

    // Gera Barcode
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: barcodeData!,
      scale: selectedSize.barScale,
      height: selectedSize.barHeight,
      includetext: true,
      textxalign: "center",
    });

    const barcodeImage = `data:image/png;base64,${barcodeBuffer.toString("base64")}`;

    res.status(200).json({
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category?.name,
      },
      qrCode: {
        data: qrCodeData,
        image: qrCodeImage,
      },
      barcode: {
        data: barcodeData,
        image: barcodeImage,
      },
      size: size as string,
    });
  } catch (error) {
    console.error("Erro ao gerar códigos para impressão:", error);
    res.status(500).json({ error: "Erro ao gerar códigos para impressão" });
  }
};

/**
 * Busca produto por QR Code ou Barcode
 * GET /api/products/scan/:code
 */
export const scanProduct: RequestHandler = async (req, res) => {
  try {
    const { code } = req.params;

    // Busca por QR Code ou Barcode
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ qrCode: code }, { barcode: code }],
      },
      include: {
        category: true,
        orderItems: {
          include: {
            order: {
              include: {
                client: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        maintenances: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    res.status(200).json({
      product,
      message: "Produto encontrado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({ error: "Erro ao buscar produto" });
  }
};

/**
 * Gera QR Code e Barcode em lote para múltiplos produtos
 * POST /api/products/batch-generate-codes
 */
export const batchGenerateCodes: RequestHandler = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: "IDs de produtos inválidos" });
    }

    const results = [];

    for (const id of productIds) {
      try {
        const product = await prisma.product.findUnique({
          where: { id },
        });

        if (!product) {
          results.push({ id, success: false, error: "Produto não encontrado" });
          continue;
        }

        const qrCodeData = product.qrCode || `PROD-${id}`;
        const timestamp = Date.now().toString().slice(-10);
        const barcodeData = product.barcode || `${timestamp}${id.slice(0, 3)}`;

        await prisma.product.update({
          where: { id },
          data: {
            qrCode: qrCodeData,
            barcode: barcodeData,
          },
        });

        results.push({
          id,
          success: true,
          qrCode: qrCodeData,
          barcode: barcodeData,
        });
      } catch (error) {
        results.push({ id, success: false, error: "Erro ao processar" });
      }
    }

    res.status(200).json({
      results,
      total: productIds.length,
      success: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });
  } catch (error) {
    console.error("Erro ao gerar códigos em lote:", error);
    res.status(500).json({ error: "Erro ao gerar códigos em lote" });
  }
};

