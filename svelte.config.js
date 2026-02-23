
import azure from 'svelte-adapter-azure-swa';
/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    experimental: {
      async: true
    }
  },
  kit: {
    adapter: azure()
  }
};

export default config;
