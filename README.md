# BCMT UFRJ — guia de alunos para alunos

Site estático do **Bacharelado em Ciências Matemáticas e da Terra (BCMT)** da UFRJ, pensado para dois públicos: quem está conhecendo o curso e quem já vive a graduação.

## O que o projeto oferece

### Para novos interessados
- apresentação do BCMT e de sua proposta interdisciplinar;
- linha do tempo do curso;
- carrossel com as quatro ênfases atuais;
- seletor informal de afinidades;
- fluxograma semestral de graduação interativo (1º ao 8º período) por ênfase com rastreamento de pré-requisitos e dependências;
- catálogo responsivo de 90 disciplinas eletivas com busca instantânea e filtros por grupo temático;
- informações de carga horária e créditos de cada percurso;
- acesso às matrizes curriculares públicas;
- link oficial de Acesso à Graduação.

### Para estudantes
- Portal do Aluno;
- Intranet UFRJ e identidade digital;
- criação/acesso ao e-mail institucional;
- CAFe, eduroam e Central de Serviços TIC;
- calendário acadêmico e Manual Estudantil;
- extensão, iniciação científica e tecnológica, monitoria, auxílios, mobilidade e estágio;
- Base Minerva, Proxy/CAFe e acesso remoto a recursos acadêmicos;
- BandejApp para consultar o cardápio do Restaurante Universitário, transporte interno, acessibilidade e serviços da PR-7;
- FAQ com alerta específico para alunos vinculados a currículos anteriores à matriz 2025/1.

## Matriz curricular apresentada

Os números exibidos na página correspondem às **ênfases vigentes a partir de 2025/1**:

| Ênfase | Carga horária | Créditos mínimos | Livre escolha |
|---|---:|---:|---:|
| CMT — Puro | 2.400 h | 116 | 32 |
| Análise de Dados | 2.400 h | 126 | 8 |
| Sensoriamento Remoto e Geoprocessamento | 2.400 h | 123 | 14 |
| Patrimônio Natural | 2.400 h | 117 | 10 |

As quatro matrizes também incluem **240 h de atividade curricular de extensão**.

> Alunos de currículos anteriores devem conferir a situação individual no Portal do Aluno e confirmar transição, equivalências e integralização com a orientação acadêmica.

## Identidade e autoria

A logo fornecida para o projeto foi convertida em **SVG vetorial** e é utilizada no cabeçalho, no rodapé e como favicon.

O site é desenvolvido pela **Comissão do BCMT**, com contribuição especialmente destacada de:
- **Nicolas Freitas** — ingresso 25.2;
- **Matheus Augusto** — Sensoriamento Remoto e Geoprocessamento, ingresso 18.2.

O rodapé reúne o **Instagram oficial do BCMT** (`@bcmt_ufrj`), os canais oficiais da Comissão e as identidades institucionais da **UFRJ** e do **CCMN**.

## Observação sobre o SIGA

O acesso geral para a rotina acadêmica foi substituído no site pelo **Portal do Aluno**. O domínio histórico do SIGA aparece apenas nos links das **páginas públicas do repositório de matrizes curriculares**, que continuam acessíveis e são usadas como referência curricular.

## Como executar

Não há dependências nem etapa de build. Abra `index.html` diretamente ou rode:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Estrutura

```text
/
├── index.html
├── style.css
├── script.js
├── favicon.svg
├── README.md
├── REVISAO.md
└── assets/
    ├── logo-bcmt.svg
    └── imagens do site
```

## Tecnologias
- HTML5 semântico
- CSS3 responsivo
- JavaScript Vanilla
- Google Fonts: Manrope e JetBrains Mono


## Ajustes desta versão

- **Aba 'Fluxograma do Curso'**: fluxograma semestral interativo completo (1º ao 8º período) para as 4 ênfases vigentes a partir de 2025/1 (Análise de Dados, Patrimônio Natural, CMT — Puro e Sensoriamento Remoto e Geoprocessamento) com rastreamento visual de pré-requisitos e dependências.
- **Catálogo de Eletivas**: 90 disciplinas eletivas extraídas das matrizes oficiais com busca em tempo real e filtros por agrupamento temático (Matemática, Estatística/Dados, Física, Geologia/Geociências, Geografia/Sensoriamento, Meteorologia/Atmosfera e Humanidades/Geral).
- **Referências Curriculares Oficiais**: inclusão de códigos curriculares, processo de aprovação (254757/2023-16), data de atualização e links diretos para cada repositório do SIGA.
- **Guia de Inscrições em Disciplinas**: painel dedicado na Central do Aluno com as regras oficiais de alocação de vagas (Curso de origem/Localidade, Periodização, Critérios variáveis CRA/COA/Turno e Critério pós-fixo por data/hora) e limites acadêmicos (faixa de 6 a 32 créditos por período, pré-requisitos e choques, limite de 1/3 fora do currículo e diferença entre CRPID e CRID).
- **Portal do Aluno**: link oficial unificado e atualizado para `https://portal.ufrj.br/`.
- **Secretaria de Graduação do BCMT**: canal institucional oficial (`secgradbcmt@ccmn.ufrj.br`) evidenciado na Central do Aluno, no Guia de Inscrição, no FAQ e no rodapé institucional junto ao CCMN.



## Atualização de identidade institucional

- adicionado o Instagram oficial do curso: `https://www.instagram.com/bcmt_ufrj/`;
- adicionadas as logos da UFRJ e do CCMN no rodapé, preservando a identidade visual de cada marca;
- o perfil oficial do curso foi visualmente separado dos canais da Comissão para evitar confusão entre comunicação institucional e comunicação estudantil.

## Ajuste visual das marcas institucionais

As marcas da UFRJ e do CCMN foram preparadas em PNG com transparência para uso no tema escuro. No desktop, os dois cards institucionais ocupam colunas iguais; a marca UFRJ usa versão branca e a marca CCMN preserva o amarelo/branco, ambas sobre o mesmo fundo e borda.
