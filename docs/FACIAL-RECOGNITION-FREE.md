# 🆓 Opções Gratuitas de Reconhecimento Facial

Este documento lista as melhores opções **gratuitas e open-source** para reconhecimento facial que podem ser integradas ao projeto.

## 📋 Opções Disponíveis

### 1. **CompreFace** ⭐ RECOMENDADO
**Open-source, REST API, Docker**

#### Características:
- ✅ 100% gratuito e open-source
- ✅ REST API fácil de integrar
- ✅ Suporta detecção, reconhecimento, verificação
- ✅ Landmarks, máscara, pose, idade/gênero
- ✅ Roda via Docker (on-premise)
- ✅ Não requer conhecimento de ML

#### Instalação:
```bash
# Via Docker
docker run -p 8000:8000 exadel/compreface-core:latest
```

#### Integração:
```typescript
// server/routes/identity-validation.ts
const COMPREFACE_URL = process.env.COMPREFACE_URL || 'http://localhost:8000';

// Verificação facial com CompreFace
const response = await fetch(`${COMPREFACE_URL}/api/v1/verification/verify`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    source_image: selfieBase64,
    target_image: documentPhotoBase64 // Foto do documento
  })
});
```

**GitHub**: https://github.com/exadel-inc/CompreFace

---

### 2. **face-api.js** 
**JavaScript puro, roda no navegador**

#### Características:
- ✅ 100% gratuito
- ✅ Roda no navegador (client-side)
- ✅ Não precisa de servidor
- ✅ Detecção, reconhecimento, expressões
- ✅ Idade, gênero, emoções

#### Instalação:
```bash
npm install face-api.js
```

#### Uso no Frontend:
```typescript
import * as faceapi from 'face-api.js';

// Carregar modelos
await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

// Detectar faces
const detections = await faceapi
  .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
  .withFaceLandmarks()
  .withFaceDescriptors();
```

**GitHub**: https://github.com/justadudewhohacks/face-api.js

---

### 3. **MediaPipe Face Detection** (Google)
**Já usado no projeto!**

#### Características:
- ✅ 100% gratuito (Google)
- ✅ Roda no navegador
- ✅ Já integrado no `FacialRecognitionCamera.tsx`
- ✅ Detecção em tempo real
- ✅ Landmarks faciais

#### Status no Projeto:
✅ Já implementado em `client/components/FacialRecognitionCamera.tsx`

---

### 4. **Open-Source Face Recognition SDK** (Faceplugin)
**Python, on-premise**

#### Características:
- ✅ Open-source
- ✅ On-premise (privacidade)
- ✅ Windows e Linux
- ✅ Real-time processing
- ✅ Python API

**GitHub**: https://github.com/Faceplugin-ltd/Open-Source-Face-Recognition-SDK

---

## 🔧 Implementação Recomendada

### Opção A: CompreFace (Servidor)
**Melhor para: Verificação facial completa (comparar selfie com documento)**

```typescript
// server/routes/identity-validation.ts
router.post('/validate-face-free', async (req, res) => {
  const { selfieBase64, documentPhotoBase64 } = req.body;
  
  // Usar CompreFace se configurado
  if (process.env.COMPREFACE_URL) {
    const response = await fetch(`${process.env.COMPREFACE_URL}/api/v1/verification/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_image: selfieBase64,
        target_image: documentPhotoBase64
      })
    });
    
    const result = await response.json();
    return res.json({
      success: true,
      provider: 'CompreFace',
      match: result.result === 'True',
      similarity: result.similarity || 0
    });
  }
  
  // Fallback: apenas detecção (sem verificação)
  return res.json({
    success: true,
    provider: 'fallback',
    message: 'Apenas detecção facial disponível. Configure CompreFace para verificação completa.'
  });
});
```

### Opção B: face-api.js (Cliente)
**Melhor para: Detecção e validação de qualidade no navegador**

```typescript
// client/utils/faceDetection.ts
import * as faceapi from 'face-api.js';

export async function detectFace(image: HTMLImageElement | HTMLVideoElement) {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  
  const detection = await faceapi
    .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();
  
  return {
    detected: !!detection,
    confidence: detection?.detection.score || 0,
    landmarks: detection?.landmarks
  };
}
```

---

## 📦 Setup Rápido - CompreFace

### 1. Instalar Docker
```bash
# Verificar se Docker está instalado
docker --version
```

### 2. Rodar CompreFace
```bash
docker run -p 8000:8000 exadel/compreface-core:latest
```

### 3. Configurar no .env
```env
COMPREFACE_URL=http://localhost:8000
COMPREFACE_API_KEY=sua-api-key-aqui
```

### 4. Testar
```bash
curl http://localhost:8000/api/v1/verification/verify
```

---

## 🎯 Comparação

| Recurso | CompreFace | face-api.js | MediaPipe | BigDataCorp |
|---------|-----------|-------------|-----------|-------------|
| **Custo** | 🆓 Gratuito | 🆓 Gratuito | 🆓 Gratuito | 💰 Pago |
| **Verificação** | ✅ Sim | ✅ Sim | ❌ Não | ✅ Sim |
| **Liveness** | ✅ Sim | ❌ Não | ❌ Não | ✅ Sim |
| **On-premise** | ✅ Sim | ✅ Sim | ✅ Sim | ❌ Não |
| **API REST** | ✅ Sim | ❌ Não | ❌ Não | ✅ Sim |
| **Idade/Gênero** | ✅ Sim | ✅ Sim | ❌ Não | ✅ Sim |

---

## 🚀 Próximos Passos

1. **Escolher opção**: CompreFace para servidor ou face-api.js para cliente
2. **Instalar dependências**: Docker (CompreFace) ou npm (face-api.js)
3. **Criar rota alternativa**: `/api/identity/validate-face-free`
4. **Atualizar frontend**: Usar nova rota quando BigDataCorp não estiver configurado
5. **Testar**: Validar funcionamento com selfies reais

---

## 📚 Recursos

- **CompreFace Docs**: https://github.com/exadel-inc/CompreFace
- **face-api.js Docs**: https://github.com/justadudewhohacks/face-api.js
- **MediaPipe Face**: https://google.github.io/mediapipe/solutions/face_detection

---

## ⚠️ Notas Importantes

1. **Privacidade**: CompreFace e face-api.js rodam on-premise (seus dados não saem do servidor)
2. **Precisão**: BigDataCorp pode ser mais preciso, mas CompreFace é excelente para a maioria dos casos
3. **Performance**: face-api.js roda no navegador (mais rápido, mas menos recursos)
4. **LGPD**: Todas as opções gratuitas respeitam LGPD (dados não saem do Brasil)
