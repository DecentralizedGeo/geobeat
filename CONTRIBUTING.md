# Contributing to GeoBeat

Thank you for your interest in contributing to GeoBeat! This document provides guidelines and best practices for maintaining a clean, professional project.

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification to maintain a clean and readable git history.

### Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (white-space, formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to build process, dependencies, or auxiliary tools
- **research**: Research findings, analysis, or documentation
- **design**: Design documents, specifications, or architecture decisions

### Scope

The scope should indicate the area of the codebase affected:
- `dashboard`: Frontend dashboard
- `api`: Backend API
- `data`: Data processing or collection
- `docs`: Documentation
- `infra`: Infrastructure or deployment
- `config`: Configuration files

### Subject

- Use imperative, present tense: "add" not "added" nor "adds"
- Don't capitalize first letter
- No period (.) at the end
- Keep it concise (50 characters or less)

### Examples

**Good commits:**
```
feat(dashboard): add geographic distribution heatmap
fix(data): correct timezone handling in validator data
docs(readme): update installation instructions
research: document Ethereum validator geographic patterns
design(api): specify REST endpoints for node data
refactor(data): simplify geolocation parsing logic
test(api): add integration tests for data endpoints
chore(deps): update TypeScript to v5.3
```

**Bad commits:**
```
✗ Added stuff
✗ Fixed bug
✗ WIP
✗ Updated files
✗ asdfasdf
✗ Final commit (I swear)
```

## Branch Naming

Use descriptive branch names that reflect the work:

```
<type>/<short-description>

Examples:
feat/geographic-heatmap
fix/coordinate-parsing
docs/api-documentation
research/validator-analysis
```

## Pull Request Guidelines

1. **One concern per PR**: Keep pull requests focused on a single feature or fix
2. **Update documentation**: Include relevant documentation updates
3. **Write tests**: Add tests for new features or bug fixes
4. **Clean commits**: Squash WIP commits before requesting review
5. **Descriptive PR title**: Follow the same format as commit messages
6. **PR description**: Explain what, why, and how

### PR Template

```markdown
## Description
Brief description of what this PR does

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Research findings
- [ ] Design specification

## Testing
How has this been tested?

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
```

## Code Style

### General Principles
- Write clear, self-documenting code
- Use meaningful variable and function names
- Keep functions small and focused
- Comment complex logic, not obvious code
- Follow DRY (Don't Repeat Yourself)

### Language-Specific

**TypeScript/JavaScript:**
- Use Prettier for formatting (configured in pre-commit hooks)
- Use ESLint rules
- Prefer `const` over `let`, avoid `var`
- Use TypeScript types, avoid `any`

**Python:**
- Follow PEP 8 style guide
- Use Black for formatting (configured in pre-commit hooks)
- Use type hints
- Maximum line length: 100 characters

## Git Hooks (Husky)

We use Husky to enforce code quality and commit conventions:

```bash
# Install dependencies (Husky will be set up automatically)
npm install
```

### What the hooks enforce:
- **commit-msg**: Validates commit messages follow Conventional Commits format
- Future hooks may include:
  - Code formatting (Prettier for TS/JS, Black for Python)
  - Linting (ESLint, Flake8)
  - Test execution

### Commit Message Validation

Husky uses commitlint to enforce conventional commit format. Invalid commit messages will be rejected with helpful error messages.

## Documentation Standards

### Research Documentation
- Date your research notes
- Include sources and references
- Document assumptions and limitations
- Track open questions

### Design Documentation
- Explain the "why" behind decisions
- Include diagrams where helpful
- Document alternatives considered
- Keep specifications up-to-date

### Code Documentation
- Public APIs must have documentation
- Complex algorithms need explanation
- Include usage examples
- Keep comments current with code changes

## Git Workflow

1. **Create a branch** from `main`
2. **Make commits** following conventional commits
3. **Keep commits atomic**: One logical change per commit
4. **Rebase regularly** to stay current with `main`
5. **Clean history** before PR: squash WIP commits
6. **Request review** with a descriptive PR
7. **Address feedback** in new commits (squash before merge)
8. **Merge** using the appropriate strategy (squash for features, merge for releases)

## Questions?

If you have questions about contributing, please open an issue for discussion.

---

Thank you for helping make GeoBeat better!
