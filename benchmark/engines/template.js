const { Engine } = require('template');

const engine = new Engine();

module.exports = {
  name: 'JianJia',
  ext: 'jianjia',
  render: async function (template, data) {
    return (await engine.compile(template)).render(data);
  },
};
