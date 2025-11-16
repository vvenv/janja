import fs from 'node:fs'
import { Renderer } from 'janja'

export default {
  name: 'janja',
  ext: 'janja',
  async render(templatePath, data) {
    const template = fs.readFileSync(templatePath, 'utf-8')
    return new Renderer().render(template, data)
  },
}
