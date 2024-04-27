import { allLocales, faker } from '@faker-js/faker';

describe('Testes da rota /movies', function () {
  describe('Bad Request - Criar e Atualizar Filme', () => {
    let idUser;
  let user;
  let accessToken;
  let filmeCriadoId;

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
    it('Deve retornar um erro 400 ao tentar criar um filme sem título', () => {
        cy.request({
            method: 'POST',
            url: '/movies',
            body: {
                "genre": "Ação",
                "description": "Um filme de ação emocionante.",
                "durationInMinutes": 120,
                "releaseYear": 2022
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(400);
            expect(response.body.error).to.equal('Bad Request');
        });
    });

    it('Deve retornar um erro 400 ao tentar atualizar um filme sem fornecer o ID', () => {
        cy.request({
            method: 'PUT',
            url: '/movies',
            body: {
                "title": "Novo Título",
                "genre": "Comédia",
                "description": "Um filme engraçado.",
                "durationInMinutes": 90,
                "releaseYear": 2023
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(404);
            expect(response.body.error).to.equal('Not Found');
        });
    });
});
  describe('Teste de consulta de filmes', function () {
    it('Deve consultar lista de filmes existentes', function () {
      cy.request({
        method: "GET",
        url: "/movies",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(true).to.be.true;
      });
    });

    it('Deve procurar filme pelo titulo', function () {
      cy.request({
        method: "GET",
        url: "/movies",
        qs: {
          title: 'Perdido em Marte'
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body[0].title).to.exist;
        expect(response.body[0].id).to.equal(1);
        expect(response.body).to.be.an('array');

      });
    });
  });
  it('Deve encontrar filme pelo id', function () {
    cy.request({
      method: 'GET',
      url: `/movies/2`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
      expect(response.body.id).to.equal(2);
      expect(response.body.reviews).to.be.an('array');
      expect(response.body.reviews[0]).to.have.property('id');
      expect(response.body.reviews[0]).to.have.property('reviewText');
      expect(response.body.reviews[0]).to.have.property('score');
      expect(response.body.reviews[0]).to.have.property('user');
    });
  });
});

describe('Testes de criação e delete de filme', function () {
  let idUser;
  let user;
  let accessToken;
  let filmeCriadoId;

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

  it('Deve criar um novo filme', function () {
    const novoFilme = {
      "title": "Carros",
      "genre": "infantil",
      "description": "Filme de corrida de carros",
      "durationInMinutes": 120,
      "releaseYear": 2022
    };

    cy.request({
      method: 'POST',
      url: '/movies',
      body: novoFilme,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body.title).to.equal(novoFilme.title);
      expect(response.body.genre).to.equal(novoFilme.genre);
      expect(response.body.description).to.equal(novoFilme.description);
      expect(response.body.durationInMinutes).to.equal(novoFilme.durationInMinutes);
      expect(response.body.releaseYear).to.equal(novoFilme.releaseYear);

      filmeCriadoId = response.body.id;
    });
  });

  it('Deve atualizar um filme pelo ID', function () {
    const filmeAtualizado = {
      "title": "Carros 2",
      "genre": "infantil",
      "description": "Filme de corrida de carros",
      "durationInMinutes": 120,
      "releaseYear": 2024
    };

    cy.request({
      method: 'PUT',
      url: `/movies/${filmeCriadoId}`,
      body: filmeAtualizado,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((response) => {
      expect(response.status).to.equal(204);


      cy.request({
        method: 'GET',
        url: `/movies/${filmeCriadoId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.id).to.equal(filmeCriadoId);
        expect(response.body.title).to.equal(filmeAtualizado.title);
        expect(response.body.genre).to.equal(filmeAtualizado.genre);
        expect(response.body.description).to.equal(filmeAtualizado.description);
        expect(response.body.durationInMinutes).to.equal(filmeAtualizado.durationInMinutes);
        expect(response.body.releaseYear).to.equal(filmeAtualizado.releaseYear);
      });
    });
  });

  it('Deve deletar um filme pelo ID', function () {
    cy.request({
      method: 'DELETE',
      url: `/movies/${filmeCriadoId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((response) => {
      expect(response.status).to.equal(204);
    });
  });
});

