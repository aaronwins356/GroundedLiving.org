describe("blog detail", () => {
  it("shows not found when slug missing", () => {
    cy.visit("/blog/non-existent", { failOnStatusCode: false });
    cy.contains("not found", { matchCase: false });
  });
});
