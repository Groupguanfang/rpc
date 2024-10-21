import Vue from 'unplugin-vue/vite'
import { defineConfig } from 'vite'
import Rpc from 'vite-plugin-rpc'

export default defineConfig({
  plugins: [
    Vue(),
    Rpc(),
  ],
})
