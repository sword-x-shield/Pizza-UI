import { fetchCode } from './utils';
async function getContentOfExample(code) {
  return {
    template: await fetchCode(code, 'template'),
    script: await fetchCode(code, 'script'),
    style: await fetchCode(code, 'style'),
    docs: await fetchCode(code, 'docs'),
  }
}

async function parserExample(code, id) {

}

export function genExampleEntry() {
  return {
    name: 'pizza:vite-plugin-gen-example',
    transform: async (code, id)=>{
      if (id.endsWith('.example.vue')) {
        return {
          code: await parserExample(code, id),
          map: null,
        }
      }
    },
  }
}