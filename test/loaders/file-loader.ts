import { access, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'

export async function loader(path: string) {
  const absolutePath = join(cwd(), path)
  try {
    await access(absolutePath)
  }
  catch {
    throw new Error(`file not found: ${path}`)
  }
  return readFile(absolutePath, 'utf-8')
}
