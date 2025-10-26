import fs from 'node:fs'
import { Engine } from 'janja'

export default {
  name: 'janja',
  ext: 'janja',
  async render(templatePath, data) {
    const template = fs.readFileSync(templatePath, 'utf-8')
    return new Engine().render(template, data)
  },
}
