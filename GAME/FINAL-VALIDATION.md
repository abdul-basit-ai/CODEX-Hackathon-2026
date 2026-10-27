# Final five-game validation

The final application was validated through its production build, rather than only checking a Git diff or HTTP status.

- Browser suite: 22 scenarios passed against the production server, including direct Chess entry, 64 visible squares on desktop and mobile, legal moves with Stockfish replies, queries, pause/resume, undo, flip/keyboard navigation, history review, hints, saved-game reloads, and library switching.
- Additional browser checks: Black-side moves and computer replies at all five Chess difficulties; castling; en passant and capture narration; promotion; checkmate; resignation; replay; a completed Tic-Tac-Toe round and score; a complete Intercept ending; Loups-Garous quick-test creation, investigation, discussion/vote transitions, and spoken-equivalent Continue controls.
- Local unit/integration suite: 137 checks, including 100 seeded Ludo playthroughs to completion, exhaustive human continuations against hard Tic-Tac-Toe, 20 Intercept paths to endings, mocked voice connections/tool deduplication/mute/cleanup for each game, and the existing game/server tests.
- Frontend TypeScript check passed. Oxlint passed. Client and Nitro production build passed using the available local Vite runner. The exact Bun/Vite+ toolchain is not installed on this machine, so the canonical Bun build was not run.
- The initial client JavaScript bundle is about 479 KB, down from about 1,006 KB by loading the added games separately.

## Limits and exclusions

All new and existing test-file changes remain local, as requested. Four old assertions in the repository still describe the earlier two-game catalog; the local suite updates those expectations for validation, but those test changes are excluded from GitHub.

The paid live provider cannot be reached from the tool-launched local server: outbound connections fail with EACCES. Voice connection handling and tool execution were checked with simulated transport, but real microphone recognition and provider audio have not been verified. To test voice from a normal PowerShell process, run start-local-verified.ps1. It reads the existing server-side environment file without printing the API key and defaults to port 3021.

The production test server started by this session is http://127.0.0.1:3020/dashboard/. Disabled multiplayer and timer choices remain explicitly marked Coming soon.
