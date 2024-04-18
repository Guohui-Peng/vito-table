import {
    defineConfig,
    presetUno,
    presetAttributify,
    presetIcons,
    transformerDirectives,
    transformerVariantGroup,
  } from "unocss";
  
  export default defineConfig({
    presets: [
      presetUno(),
      presetAttributify({
        prefix: 'un-',
        prefixedOnly: true // 强制使用前缀，避免与Vue的指令冲突
      }),
      presetIcons({
        collections: {
          // carbon: () =>
          //   import("@iconify-json/carbon/icons.json").then((i) => i.default),
          mdi: () =>
            import("@iconify-json/mdi/icons.json").then((i) => i.default),
          // logos: () =>
          //   import("@iconify-json/logos/icons.json").then((i) => i.default),
        },
        extraProperties:{
          display: 'inline-block'
        }
      }),
    ],
    transformers: [transformerDirectives(), transformerVariantGroup()],
  });
  