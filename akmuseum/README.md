# A Museum for K. — starter build

A walkable, Victorian-inspired 3D museum made with Three.js and Vite.

## Run locally
1. Install Node.js (LTS).
2. Open this folder in a terminal.
3. Run `npm install`
4. Run `npm run dev`
5. Open the local URL printed by Vite.

## Build for Cloudflare Pages
1. Run `npm install`
2. Run `npm run build`
3. Deploy the generated `dist` folder to Cloudflare Pages.

Cloudflare Pages build settings:
- Build command: `npm run build`
- Build output directory: `dist`

## Controls
- Desktop: WASD / arrow keys to walk; drag mouse to rotate camera.
- E: examine nearby photograph or dedication.
- V: switch between third-person and first-person view when near a photograph.
- Mobile: on-screen joystick; drag the scene to look around; VIEW / EXAMINE buttons.

## Personalisation
Photographs are in `public/images/`. Replace an image while keeping its filename to update it in the museum.
The central portrait currently uses `khadija-cake-portrait.jpg`.
The plaque text is in `src/main.js` in the `letter-copy` markup in `index.html`.

## Notes
The avatar is a custom procedural 3D placeholder wearing a black hijab and dark outfit with lavender sleeves, inspired by the supplied cake photograph. It is not a photorealistic scan or a likeness model. The calm background sound is an original synthesized ambient pad generated in-browser; it does not require an audio file.
