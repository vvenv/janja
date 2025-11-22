import { compilers as blockCompilers } from './block';
import { compilers as callCompilers } from './call';
import { compilers as captureCompilers } from './capture';
import { compilers as commentCompilers } from './comment';
import { compilers as forCompilers } from './for';
import { compilers as ifCompilers } from './if';
import { compilers as includeCompilers } from './include';
import { compilers as macroCompilers } from './macro';
import { compilers as outputCompilers } from './output';
import { compilers as setCompilers } from './set';
import { compilers as textCompilers } from './text';

export const compilers = {
  ...ifCompilers,
  ...forCompilers,
  ...includeCompilers,
  ...blockCompilers,
  ...textCompilers,
  ...outputCompilers,
  ...commentCompilers,
  ...macroCompilers,
  ...callCompilers,
  ...setCompilers,
  ...captureCompilers,
};
