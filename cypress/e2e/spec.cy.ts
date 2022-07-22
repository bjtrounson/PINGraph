describe('PIN Chart Specs', () => {
  it('chart should be visible', () => {
    cy.visit(Cypress.env('base_url'))
    cy.get('#pin-chart')
      .should('be.visible')
  })
})