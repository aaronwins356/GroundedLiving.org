describe("blog index", () => {
  it("navigates to blog page", () => {
    cy.visit("/blog");
    cy.contains("Featured");
  });
});
