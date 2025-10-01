import type { Tag } from '../types'

export const BLOCK = ['block', '#block']
export const SUPER = ['super']
export const END_BLOCK = ['end_block', 'endblock', '/block']

/**
 * Do nothing as it's already merged into the parent block in the tokenizer.
 * @example {{ #block title }}{{ super }}...{{ /block }}
 *             ^^^^^^ ^^^^^      ^^^^^         ^^^^^^
 */
export const tag: Tag = {
  names: [...BLOCK, ...SUPER, ...END_BLOCK],
}
