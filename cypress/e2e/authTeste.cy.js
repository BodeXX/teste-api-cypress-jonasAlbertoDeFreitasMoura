import { faker } from '@faker-js/faker';

describe('Teste de rota /auth', function (){
  describe('Teste de acesso a usuário', function () {
    it('Deve ser possível efetuar login', function () {
      const email = faker.internet.email();
      const name = faker.internet.userName();
      const password = faker.internet.password({ length: 12 });
    
      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          name: name,
          email: email,
          password: password,
        },
        failOnStatusCode: false
    
      }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('id')
        expect(response.body).to.have.property('name', name);
        expect(response.body).to.have.property('email', email);
    
        const userId = response.body.id;
    
        cy.request({
          method: 'POST',
          url: '/auth/login',
          body: {
            email: email,
            password: password,
          },
          failOnStatusCode: false
        }).then((loginResponse) => {
          expect(loginResponse.status).to.equal(200);
          expect(loginResponse.body).to.be.an('object');
          expect(loginResponse.body).to.have.property('accessToken');
        });
      });
    });
  
    it('Deve receber um erro ao tentar logar com e-mail inválido', function () {
      const email = 'emailinvalido@.com';
      const password = faker.internet.password({ length: 12 });
    
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: {
          email: email,
          password: password,
        },
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.equal(400);
        expect(loginResponse.body).to.be.an('object');
        expect(loginResponse.body).to.have.property('error');
      });
    });
  });

  it('Deve receber um erro ao tentar logar com senha errada', function () {
    const email = faker.internet.email();
    const name = faker.internet.userName();
    const password = faker.internet.password({ length: 12 });
  
    cy.request({
      method: 'POST',
      url: '/users',
      body: {
        name: name,
        email: email,
        password: password,
      },
      failOnStatusCode: false
  
    }).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('id')
      expect(response.body).to.have.property('name', name);
      expect(response.body).to.have.property('email', email);
  
      const userId = response.body.id;
  
      cy.request({
        method: 'POST',
        url: '/auth/login',
        body: {
          email: email,
          password: "123456",
        },
        failOnStatusCode: false
      }).then((loginResponse) => {
        expect(loginResponse.status).to.equal(401);
        expect(loginResponse.body).to.be.an('object');
        expect(loginResponse.body).to.have.property('error');
      });
    });
  });
});