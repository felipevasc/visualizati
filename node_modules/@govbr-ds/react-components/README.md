# React Components - GOVBR-DS

Biblioteca de componentes [React](https://react.dev/) baseada nas especificações do [Padrão Digital de Governo](https://www.gov.br/ds) (GOVBR-DS).

## Tecnologias

Este projeto está sendo desenvolvido com:

1. [React](https://reactjs.org/)
2. [TypeScript](https://www.typescriptlang.org/)
3. [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
4. [Prettier](https://prettier.io/), [ESLint](https://eslint.org/) & [EditorConfig](https://editorconfig.org/)
5. [Storybook](https://storybook.js.org/)
6. [Vite](https://vitejs.dev/)

Para saber mais detalhes sobre React, sugerimos que consulte a [Documentação Oficial](https://react.dev/).

## Instalação

1. Instalar a biblioteca de componentes React:

   ```sh
   npm install --save @govbr-ds/react-components
   ```

2. Instalar a biblioteca de ícones Font Awesome Free na versão 5.x:

   ```sh
   npm install --save @fortawesome/fontawesome-free@^5.11.2
   ```

3. Importar os arquivos CSS necessários das duas bibliotecas acima no _entrypoint_ da aplicação (geralmente o arquivo `src/index.jsx`, `src/index.tsx` ou `src/main.tsx`):

   ```javascript
   /* Arquivo src/index.jsx, src/index.tsx ou src/main.tsx */

   import "@fortawesome/fontawesome-free/css/all.min.css";
   import "@govbr-ds/core/dist/core.min.css";
   ```

4. Adicionar as fontes _Rawline_ e _Raleway_, utilizadas pelo GOVBR-DS, ao `<head>` do arquivo `index.html` ou `public/index.html` do projeto (_Opção 1_), ou instalar/baixar estas dependências e importar no _entrypoint_ da aplicação (_Opção 2_):

   _Opção 1:_

   ```html
   <!-- Arquivo index.html ou public/index.html -->

   <html>
     <head>
       <!-- outras entradas do <head> ... -->

       <!-- Fonte Rawline-->
       <link href="https://fonts.cdnfonts.com/css/rawline" rel="stylesheet" />

       <!-- Fonte Raleway-->
       <link
         rel="stylesheet"
         href="https://fonts.googleapis.com/css?family=Raleway:300,400,500,600,700,800,900&amp;display=swap"
       />
     </head>
     <!-- restante do documento -->
   </html>
   ```

   ou

   _Opção 2:_

   ```javascript
   /* Arquivo src/index.jsx, src/index.tsx ou src/main.tsx */

   import "./assets/arquivo-fonte-rawline.css";
   import "./assets/arquivo-fonte-raleway.css";
   ```

## Utilização

Após os passos de instalação, ja é possível importar do pacote `@govbr-ds/react-components` os componentes necessários em sua aplicação. Como o pacote exporta os tipos TypeScript dos componentes, se o seu projeto utilizar TypeScript, poderá se aproveitar do recurso de auto-completar as propriedades.

Exemplo:

```jsx
import { BrButton } from "@govbr-ds/react-components";

const MyComponent = () => {
   return (
      <div>
         <BrButton primary size="large">My Button</Button>
      </div>
   )
}
```

## Documentação e exemplos

A documentação sobre as propriedades dos componentes e exemplos de utilização podem ser vistos no [Storybook](https://govbr-ds.gitlab.io/bibliotecas/react-components/).

## Contribuição

Por favor, verifique o nosso [guia de contribuição](./CONTRIBUTING.md "Guia de Contribuição").

#### Especificação mínima de ferramentas para contribuição

A única ferramenta estritamente necessária é o [Node.js](https://nodejs.org/) em alguma versão >= **18.x**

#### Desenvolvimento da biblioteca

Após clonar o projeto, entre em seu diretório pelo terminal e execute o comando abaixo para instalar as dependências necessárias:

```sh
npm install
```

Depois utilize os scripts disponíveis, de acordo com a necessidade, executando comandos no padrão:

```sh
npm run <nome-do-script>
```

**Scripts disponíveis:**

- `generate`: executa o [Plop](https://plopjs.com/) para criar um novo componente, utilizando templates pré-definidos, com uma estrutura inicial de componente, testes unitários e Storybook. Informando apenas o nome do componente em um guia interativo, serão criados os arquivos em `src/components/NomeDoComponente`. Exemplo:

  ```bash
  $ npm run generate

  @govbr-ds/react-components@2.0.0 generate
  plop --plopfile ./generators/plopfile.js

  Nome do componente? BrTable

  ✔  ++ ~/react-components/src/components/BrTable/index.tsx
  ✔  ++ ~/react-components/src/components/BrTable/stories.tsx
  ✔  ++ ~/react-components/src/components/BrTable/BrTable.test.tsx
  ```

- `test`: Executa todos os testes.
- `test:watch`: Executa todos os testes em _watch mode_.
- `coverage`: Verifica a cobertura de testes do projeto.
- `dev`: Inicia uma aplicação React, em modo de desenvolvimento, permitindo testar os componentes criados em um Showcase.
- `build:lib`: Compila e empacota a biblioteca de componentes e a disponibiliza no diretório `dist`.
- `build:showcase`: Compila e empacota o Showcase para produção e o disponibiliza no diretório `showcase/`.
- `storybook`: Executa localmente a documentação do Storybook.
- `storybook:build`: Prepara documentação estática do Storybook para implantação e a disponibiliza no diretório `storybook/`.
- `lint`: Executa o ESLint para checagem estática do código, gerando um relatório no arquivo `report-eslint.html`.
- `commit`: Executa o Commitizen para facilitar a padronização dos commits.

#### Commits

Utilizamos um padrão para branches e commits. Por favor observe a documentação na nossa [wiki](https://gov.br/ds/wiki/ "Wiki") para aprender sobre os nossos padrões.

## Reportar bugs/necessidades

Você pode criar [issues](https://gitlab.com/govbr-ds/bibliotecas/react-components/-/issues/new) para nos informar os problemas que tem enfrentado ao utilizar nossa biblioteca ou sugestões de novas _features_. Por favor, preencha o modelo que mais se encaixa na sua necessidade com o máximo de detalhes possíveis.

Nos comprometemos a responder a todas as issues.

## Precisa de ajuda?

> Por favor, **não** crie issues para fazer perguntas!

Acesse os canais abaixo para tirar suas dúvidas:

- Site do GOVBR-DS <http://gov.br/ds>
- React Components <https://gitlab.com/govbr-ds/bibliotecas/react-components/>
- Usando nosso canal no discord <https://discord.gg/U5GwPfqhUP>

## Créditos

O [React Components - GOVBR-DS](https://gitlab.com/govbr-ds/bibliotecas/react-components "React Components - GOVBR-DS") foi criado pelo [SERPRO](https://www.serpro.gov.br/ "SERPRO | Serviço Federal de Processamento de Dados") e [Dataprev](https://www.dataprev.gov.br/ "Dataprev | Empresa de Tecnologia e Informações da Previdência Social"), com a participação da comunidade.

## Licença

Neste projeto utilizamos a licença MIT.
