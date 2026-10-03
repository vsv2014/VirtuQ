# 3D assets

The virtual fitting room works out of the box with **procedural placeholder**
geometry — a body built from the shopper's measurements plus a garment shell
generated from the catalogue subcategory. You do not need any files here for
try-on to work.

Drop real models in this folder to upgrade it. The viewer checks for them on
every load and falls back to the procedural version when they are missing, so
you can migrate one product at a time.

## Filenames

| File            | Replaces                        |
| --------------- | ------------------------------- |
| `avatar.glb`    | The procedural body             |
| `<productId>.glb` | The procedural garment shell  |

`<productId>` is the catalogue id from `shared/catalog.js`, e.g.
`men-t-shirts-1.glb`, `women-dresses-3.glb`.

List ids with:

```bash
node -e "import('./shared/catalog.js').then(m => console.log(m.CATALOG.map(p => p.id).join('\n')))"
```

## Conventions

- **Format:** `.glb` (binary glTF), single file, no external textures.
- **Units:** metres.
- **Scale:** ignored — the viewer rescales every model to the shopper's height
  via `fitToHeight()`.
- **Origin:** ignored — models are centred on X/Z and seated on the floor at
  Y = 0.
- **Facing:** +Z is front.
- **Orientation:** Y-up.

Garments should be modelled in a neutral A-pose that matches the avatar, or
skinned to the same rig as `avatar.glb` if you want them to follow body
movement.

## Notes

- Textures should be embedded in the `.glb`. External `.bin`/image files are not
  fetched.
- Keep garments under ~2 MB each; they load over the network on demand.
- These files are served from the site root at `/models/...`, so they are
  publicly readable. Don't put anything private here.
