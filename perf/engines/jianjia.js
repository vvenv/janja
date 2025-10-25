import fs from 'node:fs'
import { Engine } from 'jianjia'

export default {
  name: 'jianjia',
  ext: 'jianjia',
  async render(templatePath, data) {
    const template = fs.readFileSync(templatePath, 'utf-8')
    return new Engine().render(template, data)
  },
}
