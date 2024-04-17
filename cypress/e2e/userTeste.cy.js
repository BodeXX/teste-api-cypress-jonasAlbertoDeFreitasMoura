import { allLocales, faker } from '@faker-js/faker';

describe('Testes de rotas /users', function () {
  describe('Testes de Bad requests', function () {
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
  });
});


describe('Teste de criação e consulta de usuário', function () {
  let userId;

    it('Não deve ser possivel cadastrar um usuário com e-mail já em uso', function () {
    const email = faker.internet.email();
  
    cy.request({
      method: 'POST',
      url: '/users',
      body: {
        name: 'user teste',
        email: email,
        password: 'teste123'
      },
      failOnStatusCode: false,
    });
  
    cy.request({
      method: 'POST',
      url: '/users',
      body: {
        name: 'user teste 2',
        email: email,
        password: 'teste123'
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(409);
      expect(response.body).to.be.an('object');
      expect(response.body.error).to.exist;
    });
  });

    it('Deve ser possível criar um novo usuário e verificar os dados', function () {
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
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('id')
      expect(response.body).to.have.property('name', name);
      expect(response.body).to.have.property('email', email);

      userId = response.body.id;
      });
    });
    after(() => {
      cy.request({
        method: 'DELETE',
        url: `/users/${userId}`,
        failOnStatusCode: false,
      });
  });
});

describe('Teste de promoção de usuario', function () {
  let token;
  let userId;
  
    it('Deve ser possivel promover um usuário comum a Administrador', function () {

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

          userId = response.body.id;

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

              token = loginResponse.body.accessToken;

              // Promove a admin
              cy.request({
                  method: 'PATCH',
                  url: `/users/admin`,
                  headers: {
                      Authorization: `Bearer ${token}`
                  },
                  failOnStatusCode: false
              }).then((response) => {
                  expect(response.status).to.equal(204);
              });

              // Obtém os detalhes do usuário promovido
              cy.request({
                  method: 'GET',
                  url: `/users/${userId}`,
                  headers: {
                      Authorization: `Bearer ${token}`
                  },
                  failOnStatusCode: false
              }).then((response) => {
                  expect(response.status).to.equal(200);
                  expect(response.body.type).to.equal(1);
              });
          });
      });
  });

    it('Deve ser possivel promover um usuário comum a critico', function () {
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

        userId = response.body.id;

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

            token = loginResponse.body.accessToken;

            // Promove a admin
            cy.request({
                method: 'PATCH',
                url: `/users/apply`,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(204);
            });

            // Obtém os detalhes do usuário promovido
            cy.request({
                method: 'GET',
                url: `/users/${userId}`,
                headers: {
                    Authorization: `Bearer ${token}`
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
  const email = faker.internet.email();
  const name = faker.internet.userName();
  const password = faker.internet.password({ length: 12 });
    it('Deve ser possivel listar todos os usuários', function () {
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
        
          token = loginResponse.body.accessToken;
        
          cy.wrap(token).as('accessToken');
        
            
          cy.request({
             method: 'PATCH',
              url: `/users/admin`,
              headers: {
                  Authorization: `Bearer ${token}`
                },
              failOnStatusCode: false
            }).then((response) => {
              expect(response.status).to.equal(204);
        
               
            cy.request({
                  method: 'GET',
                  url: '/users',
                  headers: {
                  Authorization: `Bearer ${token}`
                  },
                  failOnStatusCode: false
                }).then((response) => {
                  expect(response.status).to.equal(200);
          });
        });
      });
    });
  });

    it('Deve ser possivel buscar um usuário pelo id', function () {
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
      
      token = loginResponse.body.accessToken;
      
      cy.wrap(token).as('accessToken');
      
          
        cy.request({
          method: 'PATCH',
          url: `/users/admin`,
          headers: {
            Authorization: `Bearer ${token}`
          },
        failOnStatusCode: false
          }).then((response) => {
          expect(response.status).to.equal(204);
      
             
          cy.request({
            method: 'GET',
            url: `/users/${userId}`,
            headers: {
            Authorization: `Bearer ${token}`
            },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.equal(200);
        });
      });
    });
  });
});
});

});

describe('Teste de inativar e deletar usuário pelo id', function () {
  const email = faker.internet.email();
  const name = faker.internet.userName();
  const password = faker.internet.password({ length: 12 });
  let token;
  it('Deve ser possivel deletar um usuário pelo id com autorização admin', function (){
  
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
        
          token = loginResponse.body.accessToken;
        
          cy.request({
             method: 'PATCH',
              url: `/users/admin`,
              headers: {
                  Authorization: `Bearer ${token}`
                },
              failOnStatusCode: false
            }).then((response) => {
              expect(response.status).to.equal(204);
        
               
              cy.request({
                method: 'DELETE',
                url: `/users/${userId}`,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(204);
            });
          });
        });
      });
      });
  it('Deve ser possivel inativar usuário com autorização admin', function () {
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
    
      token = loginResponse.body.accessToken;
        
      cy.request({
         method: 'PATCH',
          url: `/users/admin`,
          headers: {
              Authorization: `Bearer ${token}`
            },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.equal(204);
    
           
          cy.request({
            method: 'PATCH',
            url: `/users/inactivate`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(204);
        });
      });
    });
  });
  });  


  })    
      
describe ('Teste de atualizar usuário pelo id', function () {
  const email = faker.internet.email();
  const name = faker.internet.userName();
  const password = faker.internet.password({ length: 12 });
  let token;

  it('Deve ser possivel atualizar usuário pelo id', function () {
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
  
  token = loginResponse.body.accessToken;
  
      
    cy.request({
      method: 'PATCH',
      url: `/users/admin`,
      headers: {
        Authorization: `Bearer ${token}`
      },
    failOnStatusCode: false
      }).then((response) => {
      expect(response.status).to.equal(204);
  
         
      cy.request({
        method: 'PUT',
        url: `/users/${userId}`,
        headers: {
        Authorization: `Bearer ${token}`
        },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(200);
    });
  });
});
});
});
});


