# AD X-RAY

Este repositório contém um MVP pronto para uso de análise heurística de anúncios.

## Funcionalidades

- Cadastro de anúncios
- Organização por nicho, produto e descrições
- Análise heurística com score, hook, oferta, público e CTA
- Interface PWA com manifest e service worker
- Persistência em localStorage

## Como rodar localmente

1. Abra a pasta do projeto no navegador usando um servidor simples, por exemplo:

```bash
python -m http.server 8000
```

2. Acesse:

```text
http://localhost:8000
```

## Arquivos principais

- `index.html` — shell principal da interface
- `app.js` — lógica do aplicativo e análise heurística
- `styles.css` — estilos visualmente modernos
- `manifest.webmanifest` — definição do app instalável
- `sw.js` — service worker para comportamento offline
- `supabase/schema.sql` — schema inicial em PostgreSQL/Supabase, conforme sua proposta

## Estrutura do banco (Supabase)

O arquivo `supabase/schema.sql` contém a base inicial com:

- `users`
- `projects`
- `competitors`
- `ads`
- `creatives`
- `hooks`
- `angles`
- `offers`
- `audiences`
- `ctas`
- `analyses`
- `variations`

## Observação

Essa é uma versão de base para prototipagem. O backend real pode ser integrado com Supabase Auth + PostgREST + Row Level Security em etapas posteriores.
