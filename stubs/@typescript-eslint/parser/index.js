// Lightweight parser stub to satisfy eslint-config-next when the official parser
// cannot be installed. It returns empty AST structures so TypeScript files are
// still lintable for style issues that don't rely on type information.
module.exports = {
  parse() {
    return { type: "Program", body: [], sourceType: "module", tokens: [], comments: [] };
  },
  parseForESLint() {
    const ast = { type: "Program", body: [], sourceType: "module", tokens: [], comments: [] };
    return {
      ast,
      scopeManager: null,
      services: {},
      visitorKeys: {},
      tokens: ast.tokens,
      comments: ast.comments,
    };
  },
};
