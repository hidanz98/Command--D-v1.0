import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

// Configurar multer para upload de imagens
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "products");
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "product-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Apenas imagens são permitidas (JPG, PNG, WEBP)"));
    }
  },
});

// Exportar multer instance para uso no server/index.ts
export { upload };

export const uploadMiddleware = upload.single("image");

export const uploadProductImage: RequestHandler = async (
  req: AuthenticatedRequest,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhuma imagem foi enviada" });
    }

    // URL relativa da imagem
    const imageUrl = `/uploads/products/${req.file.filename}`;

    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({ error: "Erro ao fazer upload da imagem" });
  }
};

// Upload de múltiplas imagens de produto
export const uploadProductImages: RequestHandler = async (
  req: AuthenticatedRequest,
  res
) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Nenhuma imagem foi enviada" });
    }

    // URLs relativas das imagens
    const imageUrls = files.map(file => ({
      url: `/uploads/products/${file.filename}`,
      filename: file.filename,
    }));

    res.json({
      success: true,
      images: imageUrls,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({ error: "Erro ao fazer upload das imagens" });
  }
};

// Deletar imagem de produto
export const deleteProductImage: RequestHandler = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ error: "Nome do arquivo não fornecido" });
    }

    const filePath = path.join(process.cwd(), "uploads", "products", filename);
    
    // Verificar se o arquivo existe
    try {
      await fs.access(filePath);
      // Deletar o arquivo
      await fs.unlink(filePath);
      
      res.json({
        success: true,
        message: "Imagem deletada com sucesso",
      });
    } catch (error) {
      res.status(404).json({ error: "Imagem não encontrada" });
    }
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
    res.status(500).json({ error: "Erro ao deletar imagem" });
  }
};
