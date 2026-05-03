# Yorozuya Run — Preview Sample

## Run locally

```bash
python3 -m http.server 8000
```

Open: `http://localhost:8000`

## Controls

- Move: `A/D` or `←/→`
- Jump: `Space`/`W`/`↑`
- Attack: `J`
- Dash: `K`
- Character switch: `1` (Gintoki), `2` (Kagura), `3` (Shinpachi)

## Character sprite integration (new)

Add your PNG files (from your provided character sheets) into:

- `assets/characters/gintoki.png`
- `assets/characters/kagura.png`
- `assets/characters/shinpachi.png`

The game auto-loads these sprites and falls back to colored placeholders if any file is missing.

## Preview features

- Multi-character stat differences
- Side-scrolling platforming and camera
- SP-based dash + melee attacks
- Enemy patrol/combat
- Coin objective + level gate win condition
- Rotating comedy dialogue events
- Basic mobile/touch buttons
- Sprite rendering with left/right flipping and run bob animation
