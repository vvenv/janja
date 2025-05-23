import { Engine } from 'template';
import fs from 'node:fs';

export default {
  name: 'jianjia',
  ext: 'jianjia',
  render: async function (templatePath, data) {
    const template = fs.readFileSync(templatePath, 'utf-8');
    return (await(await(await new Engine().initialize(template)).parse()).compile()).render(data);
  },
};
