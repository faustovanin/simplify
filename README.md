# Por que simplify?
Esse é o repositório do Token Simplify.

Veja abaixo como instalar e utilizar:

# Pré-Requisitos
* [npm](https://www.npmjs.com/) para gerenciar os pacotes node
* [Truffle](https://truffleframework.com/) para compilar e instalar os contratos.


Para testes locais, sugerismos a utilização de uma rede local com uma solução como:
* [Geth](https://github.com/ethereum/go-ethereum/wiki/geth)
* [Ganache](https://truffleframework.com/ganache)
* [Mist](https://github.com/ethereum/mist)

Para rodar a instância web, recomenda-se o uso do plugin de navegador [Metamask](https://metamask.io/).

# Instalação

```bash
git clone https://github.com/faustovanin/simplify
npm install
```

# Compilar e Instalar os Smart Contracts

```bash
truffle compile
truffle migrate
```

# Testar

```bash
truffle test
```
# Front-End

Para utilizar o front web, execute o arquivo ```index.html``` contido no diretório ```docs```.

# Contrato

```
https://ropsten.etherscan.io/token/0xa862b25d93b7b73e74d26a7412206ecfc017ada5
```

### Para adicionar SY a sua MetaMask:

> Antes de tudo selecione a rede de teste Ropsten!

1. No menu esquerdo selecione "Adicionar Tokens"
2. Em "Adicionar Tokens" selecione "Custom Token"
3. No "Token Contract Address" cole `0xa862b25d93b7b73e74d26a7412206ecfc017ada5`
4. Vão aparecer o "Símbolo do Token" e os "Decimais" automaGicamente!
5. Selecione "ADICIONAR TOKENS"
Pronto! Agora você pode visualizar seus SY em sua carteira MetaMask