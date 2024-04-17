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
          expect(response.body[0].title).to.equal('Perdido em Marte');
          expect(response.body[0].id).to.equal(1);
      });
  });

  it('Deve procurar filme pelo id', function () {
    cy.request({
        method: 'GET',
        url: `/movies/2`,
        failOnStatusCode: false
    }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('object');
        expect(response.body.id).to.equal(2);
    });
  });  
})