# Mi Billetera Lite

PWA mobile-first para registrar gastos diarios y consultarlos sin conexión. Los
gastos se guardan únicamente en `localStorage` del navegador; no se envían a
ningún servidor.

## Ejecutar localmente

Requiere Node.js y pnpm.

```bash
pnpm install
pnpm dev
```

Abre la URL que muestra Vite, normalmente `http://localhost:5173`. El
`localhost` permite registrar el service worker durante el desarrollo sin
necesitar un certificado HTTPS.

## Validar una compilación de producción

```bash
pnpm lint
pnpm build
pnpm preview
```

Para comprobar la experiencia offline, abre la aplicación una vez con conexión,
usa DevTools > Network > Offline y recarga. El manifest y el service worker se
pueden revisar en DevTools > Application.

## Publicar en GitHub Pages

El repositorio actual es `TorresTG/Billetera-Lite`, por lo que la URL de Pages
será:

`https://torrestg.github.io/Billetera-Lite/`

El workflow `.github/workflows/deploy-pages.yml` compila y publica
automáticamente cada push a `main`. En GitHub, configura **Settings >
Pages > Source** como **GitHub Actions**. Si Pages estaba configurado como
`Deploy from a branch`, cambia esa opción para que el workflow pueda publicar.

La URL raíz `https://torrestg.github.io/` requiere que el repositorio se llame
exactamente `TorresTG/torrestg.github.io`; no se puede obtener desde el
repositorio actual sin renombrarlo o crear ese repositorio de usuario.

## Alcance

La aplicación incluye manifest instalable, iconos locales de 192x192 y 512x512,
service worker con precache y estrategia Cache First/Network Fallback,
persistencia local, formulario de gastos, totalizador e historial newest-first.

El despliegue en GitHub Pages, Vercel, Netlify, Firebase u otro hosting, así
como la entrega de una URL pública HTTPS, requiere interacción externa y no
forma parte de esta ejecución local.
