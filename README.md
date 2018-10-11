# Antes de mais nada, um pouco do Rio Grande...

O Rio Grande do Sul é aquele lugar onde se conversa em torno de uma mateada. Onde a conversa é parte da tradição. Aqui se compartilha, se passa a vez, se conversa em roda e todos tem uma história.

No Rio Grande do Sul, se vibra com o hino de valores que podem inspirar outros povos e nações. Aspiramos que nossas façanhas sirvam de exemplo a toda terra.

No Rio Grande do Sul se escutam músicas e histórias de amor à terra, às pessoas e as tradições. Temos orgulho do hino que comove com o ideal de liberdade Farroupilha. Nas belezas da vida no campo, nossas origens na  vida simples, do abraço sincero, da amizade verdadeira.


# A origem do Pila

O pila é a moeda do Rio Grande do Sul! Aqui se compra na venda (no mercado, na padaria, no armazém), se paga com pila!

Desde pequeno se ouve falar no pila. Tantas moedas e planos econômicos passaram. O pila permanece. É nossa moeda forte! É como se algo não pudesse mudar. Algo no fundo tem que ter valor.

O pila se junta com suor do trabalho honesto. O pila é parte das tradições deste pedaço de terra.

# Como instalar e utilizar

Para replicar o repositório execute:

`git clone https://github.com/faustovanin/pila`

`cd pila`

Em seguinda instale os pacotes necessários:

`npm install`

Para compilar, execute o comando

`truffle compile`

Para testar ou para utilizar o contrato será necessária uma instância de mineração rodando localmente. Para transferir o contrato para sua rede de desenvolvimento (local) digite

`truffle migrate --network development`

Para realizar o deploy do contrato na rede de testes Ropsten será necessário inserir o mnemônico (conjunto de 12 palavras) da conta de base no arquivo `truffle.js` e em seguida executar

`truffle migrate --network ropsten`

Para rodar o teste automatizado (rede local) execute

`truffle test`

Para utilizar a interface web e interagir com o contrato, execute:

`npm start`