describe("homepage", () => {
  it("renders hero and categories", () => {
    cy.visit("/");
    cy.contains("Grounded Living");
    cy.get("section").should("exist");
  });
});
