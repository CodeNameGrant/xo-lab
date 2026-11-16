import { defineConfig } from '@vite-pwa/assets-generator/config'

/*
 * Generates the PNG app icons in public/ from public/icon.svg: run `npm run icons` after
 * changing the SVG, and commit the PNGs. The SVG already has its dark background and keeps
 * the board inside a maskable icon's safe circle, so no size adds padding or a background.
 */
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    transparent: { sizes: [64, 192, 512], padding: 0, favicons: [[48, 'favicon.ico']] },
    maskable: { sizes: [512], padding: 0 },
    apple: { sizes: [180], padding: 0 },
  },
  images: ['public/icon.svg'],
})
