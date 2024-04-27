import { faker } from '@faker-js/faker';


let user;
let accessToken
let userId;

Cypress.Commands.add('criarUser', function () {
  return cy
    .request('POST', '/users', {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: '123456',
    })
    .then((response) => {
      user = response.body;
      return response;
    });
});

Cypress.Commands.add('loginUser', function () {
  if (!user) {
    throw new Error('Usuário não está definido.');
  }

  return cy.request('POST', '/auth/login', {
    email: user.email,
    password: '123456',
  }).then((response) => {
    accessToken = response.body.accessToken;
    userId = response.body.id;
  });
});

Cypress.Commands.add('promoteUser', (accessToken) => {
  return cy.request({
    method: 'PATCH',
    url: '/users/admin',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
});

Cypress.Commands.add('promoteUserCritico', (accessToken) => {
  return cy.request({
    method: 'PATCH',
    url: '/users/apply',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
});

Cypress.Commands.add('deleteUser', function (userId,accessToken) {
  cy.request({
    method: 'DELETE',
    url: `/users/${userId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
});