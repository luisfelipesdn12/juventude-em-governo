# Juventude em Governo

Aplicação web para o jogo "Juventude em Governo" com integração Firebase e atualizações em tempo real.

## Configuração

### Pré-requisitos

- Node.js 18+ 
- Yarn ou npm
- Conta Firebase com um projeto configurado

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/luisfelipesdn12/juventude-em-governo.git
   cd juventude-em-governo
   ```

2. Instale as dependências:
   ```bash
   yarn install
   # ou
   npm install
   ```

### Configuração do Firebase

A aplicação já está configurada para utilizar o Firebase. Se você precisar trocar para seu próprio projeto:

1. Atualize as credenciais em `src/lib/firebase.ts` 
2. Certifique-se que seu projeto Firebase tem o Firestore habilitado

## Desenvolvimento

Execute o servidor de desenvolvimento:

```bash
yarn dev
# ou
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação.

## Upload de Dados

Para popular o Firestore com os dados de exemplo:

1. Certifique-se que seu arquivo `seed.json` na raiz do projeto está atualizado com os dados desejados
2. Execute o script de upload:

```bash
yarn upload-data
# ou
npm run upload-data
```

Este script irá carregar todas as categorias, cartas, itens e salas para o Firebase Firestore.

## Estrutura de Dados

A aplicação utiliza a seguinte estrutura no Firestore:

- **collections/categories**: Categorias do jogo
  - **subcollection/cards**: Cartas de cada categoria com suas métricas
- **collection/items**: Itens da loja
- **collection/rooms**: Salas de jogo criadas
- **collection/open_government_cards**: Cartas de governo aberto

## Gerenciamento de Estado e Atualizações em Tempo Real

A aplicação utiliza Zustand para gerenciamento de estado global e Firebase Firestore para atualizações em tempo real:

- **src/lib/store.ts**: Definição do store global com Zustand
- Cada página cliente utiliza hooks do store para:
  1. Carregar dados iniciais
  2. Configurar listeners para atualizações em tempo real usando `onSnapshot`
  3. Limpar os listeners quando o componente é desmontado

Principais recursos:

- Atualizações instantâneas quando os dados são modificados no Firestore
- Centralização de lógica de acesso aos dados
- Estado global compartilhado entre componentes
- Gestão automática de carregamento/estados de erro

## Construção para Produção

```bash
yarn build
# ou
npm run build
```

## Licença

Veja o arquivo LICENSE para detalhes.