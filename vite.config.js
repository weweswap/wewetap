// eslint-disable-next-line import/no-unresolved
import { dirname, resolve } from 'node:path';
import { URL, fileURLToPath } from 'node:url';

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import nodePolyfills from 'vite-plugin-node-stdlib-browser';

export default ({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    const url = {
        api: process.env.VITE_APP_API_URL
    };
    return defineConfig({
        build: {
            minify: false,
            target: 'esnext'
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `
                        @import "/src/assets/scss/variables";
                        @import "/src/assets/scss/mixins";
                    `
                }
            }
        },
        plugins: [
            vue(),
            createHtmlPlugin({
                minify: true,
                inject: {
                    data: {
                        favicon: `/img/${process.env.VITE_APP_PROJECT_FAVICON || 'logo.svg'}`
                    }
                }
            }),
            VueI18nPlugin({
                include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locale/**'),
                strictMessage: false
            }),
            nodePolyfills()
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        server: {
            proxy: {
                '/proxy': {
                    target: url.api,
                    changeOrigin: true,
                    secure: false,
                    ws: true,
                    rewrite: (path) => path.replace('/proxy', '')
                }
            }
        }
    });
};
