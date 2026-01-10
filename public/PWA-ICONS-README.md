# Ícones PWA

Para gerar os ícones PNG a partir dos SVGs, você pode usar:

## Opção 1: Online (Recomendado)
1. Acesse https://realfavicongenerator.net/
2. Faça upload de uma imagem 512x512px
3. Baixe os ícones gerados
4. Coloque `icon-192.png` e `icon-512.png` na pasta `public/`

## Opção 2: Usando ImageMagick
```bash
# Instalar ImageMagick primeiro
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt install imagemagick

# Gerar ícones
magick convert public/icon-512.svg -resize 192x192 public/icon-192.png
magick convert public/icon-512.svg -resize 512x512 public/icon-512.png
```

## Opção 3: Usando Node.js (sharp)
```bash
npm install -g sharp-cli
sharp -i public/icon-512.svg -o public/icon-192.png --resize 192 192
sharp -i public/icon-512.svg -o public/icon-512.png --resize 512 512
```

## Temporário
Por enquanto, os SVGs funcionam, mas para melhor compatibilidade, use PNGs.

