import { Plugin } from '../types';
import { plugin as blockPlugin } from './block';
import { plugin as callPlugin } from './call';
import { plugin as capturePlugin } from './capture';
import { plugin as commentPlugin } from './comment';
import { plugin as forPlugin } from './for';
import { plugin as ifPlugin } from './if';
import { plugin as includePlugin } from './include';
import { plugin as macroPlugin } from './macro';
import { plugin as outputPlugin } from './output';
import { plugin as setPlugin } from './set';
import { plugin as textPlugin } from './text';
import { plugin as unexpectedPlugin } from './unexpected';
import { plugin as unknownPlugin } from './unknown';

export const plugins: Plugin[] = [
  blockPlugin,
  callPlugin,
  commentPlugin,
  capturePlugin,
  forPlugin,
  ifPlugin,
  includePlugin,
  macroPlugin,
  setPlugin,
  textPlugin,
  outputPlugin,
  unexpectedPlugin,
  unknownPlugin,
];
