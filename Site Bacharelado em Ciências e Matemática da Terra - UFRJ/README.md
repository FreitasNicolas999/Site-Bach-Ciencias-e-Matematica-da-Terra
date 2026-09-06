# BCMT UFRJ — guia de alunos para alunos

Site estático para apresentar o **Bacharelado em Ciências Matemáticas e da Terra (BCMT)** da UFRJ a novos interessados e, ao mesmo tempo, servir como ponto de partida para alunos do curso.

## O que mudou nesta reformulação

A página deixou de ser apenas uma landing page institucional e passou a ter duas jornadas claras:

- **Novos interessados:** apresentação do curso, estrutura, ênfases, comparativo e um orientador interativo por interesses.
- **Alunos:** central de atalhos para Portal do Aluno, SIGA, calendário acadêmico, manual estudantil, Acesso à Graduação e CCMN.

Também foram incluídos:

- novo hero com chamadas de ação e resumo do curso;
- seção “O que você veio procurar?”;
- apresentação em cards tipo bento;
- linha do tempo do BCMT;
- carrossel editorial responsivo e acessível;
- seletor interativo de afinidades entre as ênfases;
- páginas/seções detalhadas para os quatro percursos;
- checklist de início de período;
- FAQ;
- aviso claro de que este é um projeto informativo estudantil, não um canal oficial da UFRJ;
- responsividade, acessibilidade por teclado e suporte a `prefers-reduced-motion`.

## Informações acadêmicas

A versão considera a matriz curricular vigente no SIGA desde **2025/1**, organizada em:

1. CMT — Puro (Formação Geral)
2. Análise de Dados
3. Sensoriamento Remoto e Geoprocessamento
4. Patrimônio Natural

O curso foi criado em **2008** e recebeu sua primeira turma em **2009**.

> Este projeto organiza informações para facilitar a vida dos estudantes. Para regras, prazos, grades e procedimentos, consulte sempre os canais oficiais da UFRJ.

## Como executar

Não há dependências ou etapa de build. Abra `index.html` diretamente ou rode um servidor local:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Arquivos

```text
/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
```

## Tecnologias

- HTML5 semântico
- CSS3 responsivo
- JavaScript Vanilla
- Google Fonts: Manrope e JetBrains Mono
