import type { App } from 'vue';
import * as components from './components';

const install = (app: App) => {
  for (const key of Object.keys(components)) {
    const name = key as keyof typeof components;
    app.use(components[name]);
  }
};

export default install;