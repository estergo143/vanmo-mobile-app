# Vanmo mobile app

Vanmo is an Expo and React Native starter for a van ride-hailing service.

## Project structure

- `src/app/` contains Expo Router layouts and route files.
- `src/features/` contains product features, organized by screen, component, and domain responsibility.
- Feature tests live next to their feature in `__tests__/`.
- Shared UI, API clients, and state stores can be added under `src/components/`, `src/services/`, and `src/stores/` as they are needed.

Keep route files focused on navigation and composing feature screens. Put ride rules and data contracts in feature domain modules, and keep service access out of UI components.

## Development

After dependencies are installed, use:

- `npm run start` to start Expo.
- `npm run typecheck` to run TypeScript.
- `npm test` to run Jest once.
- `npm run test:watch` to run Jest in watch mode.

The ride request screen is a UI scaffold; connect its submit handler to the ride-search service when that API is available.
