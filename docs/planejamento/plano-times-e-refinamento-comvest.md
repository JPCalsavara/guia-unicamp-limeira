# Plano de Times e Cronograma ate a Lista de Aprovados

Este documento define a operacao dos times, o corte de entregas por release e o cronograma semanal ate a divulgacao da lista de aprovados da Unicamp.

---

## 1. Corte de Releases

- **Release 1 na Lista de Aprovados:** portal pronto para receber bixos de todos os cursos da FT e FCA com `#48`, `#59`, `#49`, `#50`, `#58`, `#43`, `#42`, coleta de cursos `#61`, campanha de marketing `#62` e alinhamento de parcerias `#63`.
- **Release 2 na Semana da Calourada e Pos-Matricula:** jogo isometrico `#51`, autenticacao Unicamp `#56`, personalizacao e digest por e-mail `#57`, calculadora de horas `#52`, NextRound e DevFolio `#53`, e Hub Comunidade `#54`.

---

## 2. Estrutura Operacional em 3 Nucleos

Para evitar sobrecarga de gestao durante o periodo de provas e ferias, os 5 assuntos do Kanban sao conduzidos por 3 nucleos de pessoas com 1 lider por nucleo.

### Nucleo 1: Produto e Engenharia
- **Labels no Kanban:** `time:integracoes` e `time:jogo`
- **Responsabilidade na Release 1:** concluir `#48`, `#59`, `#49`, `#50`, `#58` e `#43`.
- **Responsabilidade na Release 2:** dividir entre o jogo na `#51` e a camada de plataforma e carreira nas issues `#52`, `#53`, `#54`, `#56` e `#57`.

### Nucleo 2: Ecossistema e Conteudo
- **Labels no Kanban:** `time:cursos` e `time:parcerias`
- **Responsabilidade na Release 1:** executar `#61`, `#63` e apoiar a revisao `#42`. Contatar CAs e veteranos dos cursos da FT e FCA usando o template em `docs/planejamento/template-coleta-curso.md`, alinhar licencas com `otbox/manual-do-bixo-ultimate` e `MarceloSantosBMDev/SerrinhaGame`, e validar locais no entorno dos campi para o mapa `#43`.
- **Responsabilidade na Release 2:** mapear entidades, historico de gestoes, produtos da comunidade e hall da fama para `#54`.

### Nucleo 3: Marketing e Comunidade
- **Label no Kanban:** `time:marketing`
- **Responsabilidade na Release 1:** executar `#62`, estruturar o perfil `@guiaunicamplimeira`, produzir carrosseis salvaveis de aquecimento e coordenar o disparo nos grupos de aprovados no dia da lista.
- **Responsabilidade na Release 2:** gravar Reels do jogo isometrico e divulgar as ferramentas de curriculo e portfolio.

---

## 3. Checklist de Cursos de Limeira

- **FT:** BSI, TADS, Engenharia Ambiental, Engenharia de Telecomunicacoes e Engenharia de Transportes.
- **FCA:** Administracao, Administracao Publica, Ciencias do Esporte, Engenharia de Manufatura, Engenharia de Producao, Gestao de Agronegocio, Gestao de Comercio Internacional, Gestao de Politicas Publicas e Nutricao.

---

## 4. Ritual e Cronograma Sugerido

- **Ritual semanal:** reuniao objetiva de 15 minutos entre os 3 lideres filtrando o Kanban por `release:1-aprovados`.
- **Semanas 1 e 2:** fechamento dos lideres, execucao de `#48` e `#59`, envio do template de coleta `#61` e contato de licencas `#63`.
- **Semanas 3 a 5:** recebimento dos dados dos cursos FT e FCA, implementacao de `#49`, `#50`, `#58` e `#43`, e lancamento dos primeiros conteudos no `@guiaunicamplimeira`.
- **Semanas 6 e 7:** revisao textual `#42`, testes mobile conforme ADR 0002, validacao com veteranos e preparacao do kit do dia da lista.
- **Semana 8 em diante:** publicacao da Release 1 na lista da Comvest e sprint dedicado a Release 2 para a semana da calourada.
