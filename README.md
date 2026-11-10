# XO Lab

Tic-tac-toe and its variants, for two players sharing one phone or browser.

XO Lab is a hub: the home screen lists each variant as a card, and tapping one opens its game at its own address, such as `/play/classic`. Every variant is played on the same screen (top bar, player cards, board, Play again) with a How to play panel for its rules. The app follows the device's light or dark setting, or a theme chosen with the sun/moon toggle.

## Variants

| Variant      | How it plays                                                                                         | Status           |
| ------------ | ---------------------------------------------------------------------------------------------------- | ---------------- |
| **Classic**  | The standard 3×3 game. Three in a row wins; a full board with no line is a draw.                     | Playable         |
| **Infinite** | Each player keeps at most three pieces; placing a fourth removes their oldest. There is no draw.     | Planned, M2 (#5) |
| **Ultimate** | A 3×3 grid of 3×3 boards. The square you play in decides which small board your opponent plays next. | Planned, M3 (#6) |

Saving each variant's game in progress on the device is planned for M4 (#7). The full plan is the spec, issue #1.

## Running it

You need Node and npm; there are no environment variables or services.

```bash
npm install
npm run dev
```

The dev server runs on http://localhost:5173.

| Command          | What it does                                                 |
| ---------------- | ------------------------------------------------------------ |
| `npm run dev`    | Start the dev server                                         |
| `npm run test`   | Run the tests once (`test:watch` keeps running them)         |
| `npm run lint`   | Check the code with oxlint                                   |
| `npm run format` | Format everything with Prettier (`format:check` only checks) |
| `npm run build`  | Type-check, then build for production into `dist/`           |

Before opening a pull request, run all four gates: `npm run lint && npm run format:check && npm run test && npm run build`.

## How it's built

React 19, TypeScript and Vite, with React Router, Tailwind CSS v4 and Lucide icons. Tests run on Vitest. Vercel deploys `main` to production and gives every other branch a preview link.

```
src/
├── game/        The rules contract every variant implements, the game session, and the shared contract tests
├── variants/    One folder per variant (info, rules, board, tests) and the registry that lists them
├── boards/      Board components shared by more than one variant
├── screens/     The game screen every variant is played on
├── hub/         The home screen
├── theme/       Design tokens for both themes, and the light/dark switching
└── ui/          Icons, the X and O pieces, and shared class lists
```

Adding a variant is a new folder under `src/variants/` and one entry in `src/variants/registry.ts`. The hub, the routes, the game screen and the contract tests pick it up from there.

## Docs

| Doc                                            | What's in it                                                                     |
| ---------------------------------------------- | -------------------------------------------------------------------------------- |
| [01 · Decisions](docs/01-decisions.md)         | Every decision so far, numbered and dated, including the ones later replaced     |
| [02 · The game screen](docs/02-game-screen.md) | The layout, sizes and colours every variant uses, and what each variant changes  |
| [Contributing](CONTRIBUTING.md)                | Branches, pull requests, the gates, issues and milestones                        |
| [Agents](AGENTS.md)                            | How the code is written: architecture, theming, icons, accessibility and testing |

New docs take the next number in `docs/` (decision D-26).
