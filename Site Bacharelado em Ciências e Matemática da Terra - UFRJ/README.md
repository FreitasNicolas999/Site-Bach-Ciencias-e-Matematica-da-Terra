# 🌍 Bacharelado em Ciências Matemáticas e da Terra (BCMT)

Landing page institucional para apresentar o **Bacharelado em Ciências Matemáticas e da Terra (BCMT)** da UFRJ, sua proposta interdisciplinar, a formação geral CMT — Puro e as demais ênfases da matriz curricular vigente.

## Destaques

- Hero com identidade visual ligada à Terra e às geociências
- Navegação responsiva com menu acessível em dispositivos móveis
- Indicador de progresso de rolagem
- Relógio UTC em tempo real
- Efeito parallax com respeito a `prefers-reduced-motion`
- Carrossel 3D navegável por mouse, toque e teclado
- Links diretos para as grades curriculares no SIGA/UFRJ
- HTML semântico, foco visível e link para pular ao conteúdo
- Imagens otimizadas para reduzir o peso de carregamento

## Matriz curricular

A versão apresentada no site considera a reforma curricular vigente no SIGA a partir de **2025/1**, organizada em quatro ênfases:

- CMT — Puro (Formação Geral), com seção própria e detalhamento do percurso
- Análise de Dados
- Sensoriamento Remoto e Geoprocessamento
- Patrimônio Natural

> Para informações acadêmicas oficiais e atualizadas, consulte sempre o SIGA/UFRJ pelos links presentes na página.

## Histórico do curso

O BCMT foi aprovado pelo Consuni em **3 de julho de 2008**, com oferta prevista para o Vestibular de 2009. A primeira turma iniciou suas atividades em **2009**. Por isso, o site usa “desde 2009” para indicar o início efetivo da graduação.

## Como executar

O projeto é estático e não exige instalação de dependências.

### Abrindo diretamente

Abra `index.html` no navegador.

### Com servidor local (recomendado)

Na pasta do site, execute:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Tecnologias

- HTML5
- CSS3
- JavaScript (Vanilla)
- Google Fonts: Space Grotesk e JetBrains Mono

## Estrutura

```text
/
├── index.html
├── style.css
├── script.js
├── README.md
├── REVISAO.md
└── assets/
    ├── earth-lights.jpg
    ├── earth-terrain.jpg
    ├── analis.jpg
    ├── senso.jpg
    └── patri.jpg
```
