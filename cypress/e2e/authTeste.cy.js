import { faker } from '@faker-js/faker';

let userId;
let user;
let accessToken;

describe('Teste de rota /auth', function () {
  describe('Testes de acesso', function () {
    beforeEach(function () {
        cy.criarUser().then((response) => {
            userId = response.id;
            user = response;
        });
    });

    it('Deve ser possível efetuar login', function () {
      cy.loginUser(user.email, '123456')
      .then((loginResponse) => {
          console.log(loginResponse);
          expect(loginResponse.status).to.equal(200);
          expect(loginResponse.body).to.be.an('object');
          expect(loginResponse.body).to.have.property('accessToken');
        })
      });
      it('Deve receber um erro ao tentar logar com e-mail inválido', function () {
        let emailInvalido = 'emailInvalido.com.br';
      
        cy.request({
          method: 'POST',
          url: '/auth/login',
          body: {
            email: emailInvalido,
            password: user.password,
          },
          failOnStatusCode: false
        }).then((loginResponse) => {
          expect(loginResponse.status).to.equal(400);
          expect(loginResponse.body).to.be.an('object');
          expect(loginResponse.body).to.have.property('error').to.deep.equal('Bad Request');
        });
      });
    
  
    it('Deve receber um erro ao tentar logar com senha invalida', function () {
      const password = '321456';

      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: {
          email: user.email,
          password: password,
        },
        failOnStatusCode: false
        }).then((loginResponse) => {
          expect(loginResponse.status).to.equal(400);
          expect(loginResponse.body).to.be.an('object');
          expect(loginResponse.body).to.have.property('error').to.deep.equal('Bad Request');
        });
      });
    });
  });

