# Contributing to Blueprin SDK

Thank you for your interest in contributing to the Blueprin SDK!

## Development Setup

```bash
git clone https://github.com/qalvinahmad/blueprin-sdk.git
cd blueprin-sdk
npm install
```

## Project Structure

```
blueprin-sdk/
├── lib/
│   ├── index.js              # Main entry point
│   └── src/
│       ├── core/             # Core SDK (SDK, PluginManager, EventBus, etc.)
│       ├── project/          # Project domain module
│       ├── material/         # Material domain module
│       ├── rab/              # RAB (budget) module
│       ├── schedule/         # Schedule module
│       ├── marketplace/      # Marketplace module
│       ├── auth/             # Auth module
│       ├── storage/          # Storage module
│       ├── hooks/            # Hook helpers
│       ├── events/           # Event helpers
│       ├── ui/               # UI components
│       ├── connector/        # Connector SDK
│       └── utils/            # Utility functions
├── example/                  # Example plugins
├── docs/                     # Documentation
└── test/                     # Tests
```

## Scripts

```bash
npm run build       # Build the SDK
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run lint        # Lint the code
npm run typecheck   # Type check
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Add tests if applicable
4. Run `npm test` and `npm run lint`
5. Submit a PR with a clear description

## Code Style

- Use JSDoc for all public APIs
- Follow existing code patterns
- No comments unless requested
- Use meaningful variable names
