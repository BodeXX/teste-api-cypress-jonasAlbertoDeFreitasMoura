import { allLocales, faker } from '@faker-js/faker';



let idUser;
let user;
let accessToken;
let responselog;


describe('Testes de rotas /users', function () {
  describe('Testes de Bad requests', function () {
    beforeEach(function () {
      cy.criarUser().then((response) => {
        idUser = response.body.id;
        user = response.body;

        cy.loginUser(user.email, '123456').then((response) => {
          accessToken = response.body.accessToken;


          cy.promoteUser(accessToken).then((response) => {
            expect(response.status).to.equal(204);
          });
        });
      });
    });
    it('Deve receber Bad request ao tentar cadastrar um usuário sem e-mail', function () {
      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          name: 'user teste',
          password: 'teste123'
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.be.an('object');
        expect(response.body.email).to.be.undefined;
      });
    });

    it('Deve receber Bad request ao tentar cadastrar um usuário sem nome', function () {
      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          email: 'userteste@qa.com',
          password: 'teste123'
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.be.an('object');
        expect(response.body.email).to.be.undefined;
      });
    });

    it('Deve receber Bad request ao tentar cadastrar um usuário sem senha', function () {
      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          nome: 'user teste',
          email: 'userteste@qa.com',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.be.an('object');
        expect(response.body.email).to.be.undefined;
      });
    });

    it('Deve receber Bad request ao tentar cadastrar um usuário com caracteres especiais no nome ou e-mail', function () {
      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          nome: 'user_teste',
          email: 'user$teste@qa.com',
          password: 'teste123'
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.be.an('object');
        expect(response.body.email).to.be.undefined;
      });
    });

    it('Deve recebecer Bad request ao tentar cadastrar um usuário com senha de 5 digitos', function () {
      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          nome: 'User Teste',
          email: 'userteste@qa.com',
          password: '12345'
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.be.an('object');
        expect(response.body.password).to.be.undefined;
      });
    });


    it('Deve recebecer Bad request ao tentar cadastrar um usuário com senha de 13 digitos', function () {
      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          nome: 'User Teste',
          email: 'userteste@qa.com',
          password: '1234567891011'
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.be.an('object');
        expect(response.body.password).to.be.undefined;
      });
    });

    it('Deve receber Bad request ao tentar cadastrar um usuário com e-mail inválido', function () {
      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          name: 'user teste',
          email: 'userTesteQa.br',
          password: 'teste123'
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.be.an('object');
        expect(response.body.email).to.be.undefined;
      });
    });

    it('Deve receber Bad request ao tentar fazer Review a movie com score acima de 5', function () {
      cy.request({
        method: 'POST',
        url: '/users/review',
        body: {
          "movieId": 2,
          "score": 6,
          "reviewText": "HACK"
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.error).to.contain('Bad Request');
      });
    });
  });


  describe('Teste de criação e consulta de usuário', function () {

    beforeEach(function () {
      cy.criarUser().then((response) => {
        user = response.body;
        responselog = response;
      });
    });

    it('Deve ser possível criar um novo usuário', function () {

      expect(responselog.status).to.equal(201);
      expect(user.type).to.exist;
      expect(user.email).to.exist;
      expect(user.name).to.exist;
      expect(user.id).to.be.exist;
    });


    it('Não deve ser possivel cadastrar um usuário com e-mail já em uso', function () {

      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          name: 'user teste 2',
          email: user.email,
          password: 'teste123'
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(409);
        expect(response.body).to.be.an('object');
        expect(response.body.error).to.exist;
        expect(response.body.message).to.exist;
      });
    });
  });

  describe('Teste de promoção de usuario', function () {

    beforeEach(function () {
      cy.criarUser().then((response) => {
        idUser = response.body.id;
        user = response.body;

        cy.loginUser(user.email, '123456').then((response) => {
          accessToken = response.body.accessToken;


          cy.promoteUser(accessToken).then((response) => {
            expect(response.status).to.equal(204);
          });
        });
      });
    });

    it('Deve ser possível promover um usuário comum a Administrador', function () {
      cy.request({
        method: 'GET',
        url: `/users/${idUser}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.type).to.equal(1);
        expect(response.body.id).to.deep.equal(idUser);

      });
    });

    it('Deve ser possível promover um usuário comum a crítico', function () {
      cy.request({
        method: 'PATCH',
        url: '/users/apply',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      }).then((response) => {
        expect(response.status).to.equal(204);

        cy.request({
          method: 'GET',
          url: `/users/${idUser}`,
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body.type).to.equal(2);
        });
      });
    });
  });

  describe('Teste de listar usuário e busca pelo id', function () {

    beforeEach(function () {
      cy.criarUser().then((response) => {
        idUser = response.body.id;
        user = response.body;

        cy.loginUser(user.email, '123456').then((response) => {
          accessToken = response.body.accessToken;


          cy.promoteUser(accessToken).then((response) => {
            expect(response.status).to.equal(204);
          });
        });
      });
    });

    afterEach(function () {
      cy.deleteUser(idUser, accessToken).then((response) => {
        expect(response.status).to.equal(204);
      });
    });

    it('Deve ser possivel listar todos os usuários', function () {
      cy.request({
        method: 'GET',
        url: '/users',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }

      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
        response.body.forEach(user => {
          expect(user).to.be.an('object');
          expect(user).to.have.property('id');
          expect(user).to.have.property('name');
          expect(user).to.have.property('email');
        });
      });
    });

    it('Deve ser possivel buscar um usuário pelo id', function () {

      cy.request({
        method: 'GET',
        url: `/users/${idUser}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('id').to.equal(idUser);
        expect(response.body).to.have.property('name').to.deep.equal(response.body.name);
        expect(response.body).to.have.property('email').to.deep.equal(response.body.email);
      });
    });
  });


  describe('Teste de inativar e deletar usuário pelo id', function () {
    let user;
    let accessToken;

    beforeEach(function () {
      cy.criarUser().then((response) => {
        idUser = response.body.id;
        user = response.body;

        cy.loginUser(user.email, '123456').then((response) => {
          accessToken = response.body.accessToken;

          cy.promoteUser(accessToken).then((response) => {
            expect(response.status).to.equal(204);
          });
        });
      });
    });

    it('Deve deletar usuário', function () {
      cy.deleteUser(idUser, accessToken).then((response) => {
        expect(response.status).to.equal(204);
      });
    });

    it('Deve inativar usuário', function () {
      cy.request({
        method: 'PATCH',
        url: '/users/inactivate',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      }).then((response) => {
        expect(response.status).to.equal(204);
      });
    });
  });


  describe('Teste de atualizar usuário pelo id', function () {
    let user;
    let accessToken;
    let idUser;

    beforeEach(function () {
      cy.criarUser().then((response) => {
        idUser = response.body.id;
        user = response.body;

        cy.loginUser(user.email, '123456').then((response) => {
          accessToken = response.body.accessToken;

          cy.promoteUser(accessToken).then(() => {
            expect(response.status).to.equal(200);
          });
        });
      });
    });

    afterEach(function () {
      cy.deleteUser(idUser, accessToken).then((response) => {
        expect(response.status).to.equal(204);
      });
    });

    it('Deve ser possível atualizar dados do usuário pelo id', function () {
      let novoNome = 'Nome atualizado';

      expect(user.name).to.exist;
      expect(user.id).to.exist;

      cy.request({
        method: 'PUT',
        url: `/users/${idUser}`,
        body: {
          name: novoNome,
          password: 'novaSenha'
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);

        cy.request({
          method: 'GET',
          url: `/users/${idUser}`,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }).then((response) => {
          expect(response.body.name).to.equal(novoNome);
          expect(response.body.name).to.not.equal(user.name);
          expect(response.body.id).to.equal(idUser);
        });
      });
    });
  });

  describe('Teste de Review a movie e list reviews', function () {
    let user;
    let accessToken;
    let idUser;

    beforeEach(function () {
      cy.criarUser().then((response) => {
        idUser = response.body.id;
        user = response.body;

        cy.loginUser(user.email, '123456').then((response) => {
          accessToken = response.body.accessToken;

          cy.promoteUser(accessToken).then(() => {
            expect(response.status).to.equal(200);
          });
        });
      });
    });

    it('Deve realizar um Review a movie', function () {
      cy.request({
        method: 'POST',
        url: '/users/review',
        body: {
          "movieId": 2,
          "score": 5,
          "reviewText": "HACK"
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.headers).to.have.property('date');
      });
    });


    it('Deve realizar um Review a movie', function () {
      cy.request({
        method: 'GET',
        url: '/users/review/all',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
      });
    });
  });

});