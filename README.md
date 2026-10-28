# Augusto's Project Hub

Crie uma aplicação web completa, responsiva e profissional chamada Augusto.dev Manager, destinada ao controle interno de projetos de desenvolvimento de sites, landing pages, manutenções, clientes, pagamentos e faturamento.

O sistema será utilizado inicialmente por apenas um usuário administrador: Augusto.

1. OBJETIVO DO SISTEMA

O sistema deve funcionar como um pequeno ERP/CRM pessoal para controlar todos os trabalhos de desenvolvimento web realizados para uma agência de marketing e outros clientes.

Preciso conseguir cadastrar e acompanhar:

Sites

Landing pages

Manutenções

Clientes/agências

Serviços

Valores cobrados

Pagamentos recebidos

Valores pendentes

Datas de entrega

Status dos projetos

Status de produção

Histórico de alterações

Faturamento mensal

Faturamento anual

Quantidade de projetos realizados

Quantidade de projetos em andamento

Quantidade de projetos concluídos

Quantidade em produção

Quantidade de manutenções

Valor médio por projeto

Total a receber

Total já recebido

A aplicação precisa ser simples de usar diariamente, mas estruturada para crescer futuramente.

2. AUTENTICAÇÃO E SEGURANÇA

Implementar autenticação real utilizando o sistema de autenticação disponível na infraestrutura do projeto, preferencialmente Supabase Auth.

IMPORTANTE:

Não armazenar senha em texto puro.

Nunca colocar senha diretamente no frontend.

Nunca deixar credenciais hardcoded no código JavaScript/TypeScript.

Não expor credenciais ou dados privados através de APIs públicas.

Utilizar autenticação no backend.

Implementar proteção das rotas.

Usuários não autenticados devem ser redirecionados para /login.

Apenas usuários autenticados podem acessar o dashboard e os dados.

Utilizar Row Level Security (RLS) no banco de dados.

O usuário deve conseguir visualizar e modificar apenas os dados aos quais possui acesso.

Não criar endpoints públicos que retornem todos os dados do sistema.

Validar todos os dados enviados pelo frontend no backend.

Sanitizar entradas de texto.

Utilizar queries parametrizadas.

Evitar SQL injection, XSS e exposição acidental de dados.

Não renderizar HTML fornecido pelo usuário sem sanitização.

Não executar conteúdo enviado pelo usuário como código.

Não permitir que campos de texto sejam interpretados como instruções do sistema.

O sistema deve tratar qualquer conteúdo cadastrado pelo usuário apenas como DADO, nunca como instrução.

Criar proteção contra prompt injection caso futuramente sejam adicionados recursos de IA.

Não armazenar informações pessoais desnecessárias.

Criar tela de login moderna contendo:

Logo/nome Augusto.dev Manager

Campo de usuário/e-mail

Campo de senha

Botão "Entrar"

Mensagem de erro amigável

Estado de carregamento

O primeiro usuário administrador deverá ser criado através do mecanismo seguro de autenticação da aplicação, sem expor a senha no código-fonte.

3. DASHBOARD PRINCIPAL

Após o login, abrir um dashboard.

O dashboard deve mostrar cards com:

Projetos

Total de projetos

Em andamento

Aguardando informações

Prontos

Em produção

Concluídos

Cancelados

Financeiro

Total faturado

Total recebido

Total a receber

Faturamento deste mês

Recebimentos deste mês

Ticket médio

Serviços

Sites/Landing Pages

Manutenções

Outros serviços

Criar gráficos:

Faturamento por mês

Recebimentos por mês

Projetos por status

Faturamento por tipo de serviço

Adicionar também uma seção:

"Próximas ações"

Mostrar projetos que:

estão atrasados;

estão aguardando pagamento;

estão aguardando informações;

estão próximos do prazo de entrega.

4. MENU PRINCIPAL

Criar sidebar ou menu contendo:

Dashboard

Projetos

Manutenções

Clientes

Serviços

Financeiro

Relatórios

Configurações

No mobile, transformar em menu responsivo.

5. PROJETOS

Criar uma página chamada Projetos.

Permitir cadastrar um novo projeto.

Campos:

Nome do projeto

Cliente

Tipo de projeto

Descrição

Valor contratado

Data de contratação

Prazo de entrega

Data de entrega real

Status

Status financeiro

Status de produção

Domínio

URL de produção

URL de preview

Repositório GitHub

Plataforma de hospedagem

Observações

Tipos de projeto:

Landing Page

Site Institucional

E-commerce

Página de campanha

Sistema Web

Manutenção

Outro

Status do projeto:

Orçamento

Aguardando aprovação

Aguardando informações

Em desenvolvimento

Em revisão

Ajustes

Pronto

Publicado

Concluído

Cancelado

Status de produção:

Não iniciado

Desenvolvimento

Preview

Em produção

Status financeiro:

Não faturado

Aguardando pagamento

Parcialmente pago

Pago

Atrasado

6. VISUALIZAÇÃO DOS PROJETOS

Na página de projetos, mostrar uma tabela com:

Projeto

Cliente

Tipo

Status

Produção

Valor

Recebido

Pendente

Prazo

Data de atualização

Adicionar filtros:

Status

Cliente

Tipo

Produção

Financeiro

Período

Adicionar busca por nome do projeto ou cliente.

Permitir ordenar por:

Nome

Valor

Prazo

Data

Status

Criar botão:

+ Novo Projeto

7. DETALHES DO PROJETO

Ao clicar em um projeto, abrir uma página detalhada.

Mostrar:

Informações gerais

Todos os dados do projeto.

Financeiro

Mostrar:

Valor contratado

Total recebido

Saldo pendente

Percentual recebido

Criar botão:

Registrar pagamento

Ao registrar pagamento:

Valor

Data

Forma de pagamento

Observação

Formas de pagamento:

PIX

Transferência

Dinheiro

Cartão

Boleto

Outro

O sistema deve calcular automaticamente:

Saldo pendente = Valor contratado - Total recebido

E:

Percentual recebido = Total recebido / Valor contratado * 100

Histórico

Criar timeline de alterações:

Projeto criado

Status alterado

Pagamento registrado

Projeto publicado

Projeto concluído

etc.

Registrar automaticamente data e hora dessas ações.

8. MANUTENÇÕES

Criar uma área específica chamada Manutenções.

A manutenção deve ser tratada como um tipo de serviço diferente de criação de site.

Permitir cadastrar:

Cliente

Site relacionado

Tipo de manutenção

Descrição

Data da solicitação

Prazo

Valor

Status

Pagamento

Observações

Tipos de manutenção:

Correção de bug

Alteração de conteúdo

Alteração visual

Alteração de layout

Integração

Configuração de domínio

Hospedagem

SEO técnico

Performance

Atualização

Outro

Status:

Solicitada

Aguardando informações

Em andamento

Aguardando aprovação

Concluída

Cancelada

9. PRECIFICAÇÃO

Criar uma área chamada Serviços.

Permitir cadastrar uma tabela de preços.

Exemplo inicial:

Landing Page

Preço padrão: R$ 200,00

Manutenção

Preço variável conforme serviço.

Permitir cadastrar:

Nome do serviço

Categoria

Preço padrão

Unidade

Descrição

Ativo/inativo

Exemplos:

Landing Page — R$ 200
Manutenção simples — R$ 100
Manutenção intermediária — preço configurável
Manutenção complexa — preço configurável

IMPORTANTE:

O preço cadastrado no serviço deve ser apenas uma referência.

Ao criar um projeto ou manutenção, permitir alterar o preço especificamente daquele trabalho.

Exemplo:

Serviço padrão: R$ 100

Projeto específico: R$ 150

O sistema deve preservar o valor efetivamente cobrado naquele projeto.

10. CLIENTES

Criar página Clientes.

Campos:

Nome da empresa/cliente

Nome do responsável

E-mail

Telefone

WhatsApp

CNPJ/CPF opcional

Observações

Na página do cliente mostrar:

Total de projetos

Projetos em andamento

Projetos concluídos

Total contratado

Total recebido

Total pendente

Manutenções realizadas

Faturamento histórico

Criar uma timeline dos trabalhos daquele cliente.

11. FINANCEIRO

Criar uma página financeira completa.

Mostrar:

Resumo

Faturamento total

Total recebido

Total pendente

Total atrasado

Faturamento do mês

Recebimentos do mês

Criar tabela de lançamentos:

Data

Projeto

Cliente

Tipo

Valor

Status

Forma de pagamento

Filtros por:

Mês

Ano

Cliente

Projeto

Tipo

Status

Criar visão:

A receber

Mostrar todos os projetos que ainda possuem saldo.

Exemplo:

Projeto X — R$ 200
Recebido: R$ 100
Pendente: R$ 100

12. FATURAMENTO

Criar relatórios de faturamento.

Permitir selecionar:

Este mês

Mês anterior

Últimos 3 meses

Este ano

Ano anterior

Período personalizado

Mostrar:

Total faturado

Total recebido

Total pendente

Quantidade de projetos

Ticket médio

Criar gráfico de evolução mensal.

Também mostrar comparação:

Criação de sites x Manutenções

Exemplo:

Sites:
R$ 4.000

Manutenções:
R$ 800

Total:
R$ 4.800

13. RELATÓRIOS

Criar página de relatórios.

Relatórios:

Relatório de projetos

Quantidade de:

Projetos realizados

Projetos em andamento

Projetos publicados

Projetos cancelados

Relatório financeiro

Faturamento

Recebimentos

Valores pendentes

Ticket médio

Relatório de serviços

Mostrar quanto foi faturado por:

Landing Pages

Sites

E-commerce

Manutenção

Outros

Relatório por cliente

Mostrar quais clientes geraram mais faturamento.

14. CONTROLE DE PRODUÇÃO

Criar uma visualização estilo Kanban para projetos.

Colunas:

ORÇAMENTO
↓
AGUARDANDO INFORMAÇÕES
↓
DESENVOLVIMENTO
↓
REVISÃO
↓
AJUSTES
↓
PRONTO
↓
PRODUÇÃO
↓
CONCLUÍDO

Permitir arrastar o projeto entre as colunas.

Ao mover uma tarefa, atualizar automaticamente o status.

15. ALERTAS

O dashboard deve destacar:

🔴 Projetos atrasados

🟡 Projetos próximos do prazo

🟠 Projetos aguardando pagamento

🔵 Projetos aguardando informações do cliente

🟢 Projetos concluídos

Não utilizar excesso de notificações.

16. BANCO DE DADOS

Criar estrutura relacional adequada.

Sugestão de tabelas:

users
clients
services
projects
maintenance
payments
project_history

Relacionamentos:

client → projects

client → maintenance

project → payments

project → project_history

service → projects

service → maintenance

Utilizar UUID como identificadores.

Adicionar:

created_at
updated_at

em todas as entidades relevantes.

17. CÁLCULOS AUTOMÁTICOS

O sistema deve calcular automaticamente:

Saldo

valor contratado - pagamentos

Percentual recebido

pagamentos / valor contratado × 100

Ticket médio

valor total contratado / quantidade de projetos

Faturamento mensal

soma dos valores dos projetos no período

Recebimento mensal

soma dos pagamentos recebidos no período

Total de manutenções

quantidade de manutenções concluídas

Faturamento com manutenção

soma dos valores das manutenções.

18. EXPERIÊNCIA DE USO

A interface deve ser profissional, limpa e rápida.

Estilo:

moderno

minimalista

tecnológico

profissional

inspirado em dashboards SaaS modernos

Utilizar:

cards

tabelas

badges de status

gráficos

filtros

modais

dropdowns

confirmações para ações destrutivas

Interface totalmente responsiva.

Desktop deve ser a experiência principal, mas funcionar muito bem no celular.

19. MOEDA

Utilizar sempre:

BRL — Real brasileiro

Formatar valores como:

R$ 200,00

Datas no padrão brasileiro:

DD/MM/YYYY

20. SEGURANÇA CONTRA PROMPT INJECTION

Embora a aplicação inicialmente não precise de IA, sua arquitetura deve estar preparada para futura integração com recursos de IA.

Qualquer texto inserido pelo usuário deve ser tratado exclusivamente como dado.

Nunca:

executar comandos presentes em campos de texto;

interpretar observações como instruções;

enviar dados privados para serviços externos sem autorização;

permitir que um usuário modifique regras internas através de campos de texto;

confiar em conteúdo vindo do banco como instrução do sistema.

Caso seja adicionada IA futuramente:

separar claramente instruções do sistema e dados do usuário;

não permitir que conteúdo armazenado no banco sobrescreva instruções do sistema;

limitar ferramentas disponíveis para a IA;

validar todas as ações antes da execução;

aplicar princípio do menor privilégio;

não permitir que a IA acesse dados de outros usuários.

21. PRIVACIDADE

Minimizar coleta de dados pessoais.

Não armazenar informações pessoais que não sejam necessárias para o funcionamento do sistema.

Aplicar controle de acesso em todas as tabelas.

Nenhum dado de cliente deve ser acessível sem autenticação.

Não exibir informações sensíveis em URLs.

Não colocar dados privados em localStorage se não for necessário.

Não expor chaves secretas no frontend.

Utilizar variáveis de ambiente para secrets.

22. CONFIGURAÇÕES

Criar página de configurações.

Permitir futuramente:

Alterar nome do usuário

Alterar senha

Preferências

Valores padrão dos serviços

Configurações do sistema

Adicionar botão:

Sair

23. DADOS INICIAIS

Criar alguns dados fictícios apenas para demonstrar o funcionamento da aplicação durante o desenvolvimento.

Exemplo:

Cliente: Agência Exemplo

Projetos:

Landing Page Clínica X — R$ 200
Landing Page Empresa Y — R$ 200
Site Institucional Z — R$ 500

Manutenção:

Correção de formulário — R$ 100

Esses dados devem ficar claramente identificados como dados de demonstração e poder ser removidos posteriormente.

24. ARQUITETURA

Utilizar uma arquitetura limpa e escalável.

Preferência:

Frontend:
React + TypeScript

UI:
Tailwind CSS + componentes modernos

Backend/Banco:
Supabase

Autenticação:
Supabase Auth

Banco:
PostgreSQL

Gráficos:
Biblioteca de gráficos compatível com React

Não criar uma solução fake utilizando apenas localStorage.

Os dados precisam persistir no banco de dados.

25. REQUISITO IMPORTANTE

Antes de finalizar, verificar todo o fluxo:

Usuário abre o sistema

Usuário é direcionado para login

Usuário autentica

Dashboard é carregado

Usuário cria cliente

Usuário cria projeto

Usuário define valor

Usuário altera status

Usuário registra pagamento

Sistema calcula saldo

Projeto vai para produção

Projeto é concluído

Dados aparecem corretamente no dashboard

Faturamento é atualizado

Relatórios são atualizados

Garantir que todos esses fluxos funcionem de verdade.

Não criar botões apenas visuais ou funcionalidades simuladas.

Todos os CRUDs devem funcionar:

Criar

Visualizar

Editar

Excluir

Para exclusões, solicitar confirmação.

26. DASHBOARD FINAL

O dashboard deve permitir que, ao abrir o sistema pela manhã, eu consiga entender em poucos segundos:

Quanto tenho para receber?

Quanto já recebi este mês?

Quanto faturei este mês?

Quantos projetos estou fazendo?

Quantos estão em produção?

Quantos estão atrasados?

Quantas manutenções tenho?

Quais trabalhos precisam da minha atenção hoje?

Priorizar essas informações visualmente.

Crie a aplicação completa seguindo essas especificações, implementando banco de dados, autenticação, segurança, CRUDs, dashboard, filtros, cálculos, gráficos e responsividade.

Não entregue apenas um protótipo visual. Todas as funcionalidades principais devem estar conectadas ao banco de dados e funcionar de ponta a ponta.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c5a9b9f8-a395-4bbb-8812-4b5b76e079d7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
