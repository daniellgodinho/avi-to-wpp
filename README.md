# avi to wpp

projeto criado pra resolver um problema simples da minha namorada: ela tem uma camera fotografica que grava videos em .avi, e o whatsapp nao aceita esse formato.

a solucao converte qualquer .avi (ou outro formato de video) pra .mp4 otimizado pro whatsapp, diretamente no navegador, sem precisar instalar nada e sem mandar o video pra nenhum servidor.

## como funciona

tudo roda no browser usando [ffmpeg.wasm](https://ffmpegwasm.netlify.app). o video nunca sai do computador de quem esta usando.

- arraste um ou varios videos
- clica em converter
- baixa o .mp4 pronto pro whatsapp

## stack

- next.js 16 (app router)
- ffmpeg.wasm (@ffmpeg/ffmpeg)
- tailwind css v4
- typescript
- deploy na vercel

## rodar localmente

```bash
npm install
npm run dev
```

abre em http://localhost:3000
