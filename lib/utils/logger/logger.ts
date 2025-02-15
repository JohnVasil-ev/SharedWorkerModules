import { genHex } from '../functions';

export function makeLogger(prefix = 'Untitled', clientColor = genHex('dark')) {
  function log(color: string, message: string, ...args: Array<unknown>) {
    console.log(
      `%c[${prefix}]:%c ${message}`,
      `background: ${clientColor}; color: white`,
      `color: ${color}`,
      ...args
    );
  }

  function groupLog(title: string, expanded: boolean) {
    console[expanded ? 'group' : 'groupCollapsed'](
      `%c[${prefix}]:%c ${title}`,
      `background: ${clientColor}; color: white`,
      'color: white'
    );
  }

  return {
    group(title: string, expanded: boolean = false) {
      groupLog(title, expanded);
    },
    groupEnd() {
      console.groupEnd();
    },
    debug(message: string, ...args: Array<unknown>) {
      log('orange', message, ...args);
    },
    info(message: string, ...args: Array<unknown>) {
      log('white', message, ...args);
    },
    warn(message: string, ...args: Array<unknown>) {
      log('yellow', message, ...args);
    },
    error(message: string, ...args: Array<unknown>) {
      log('red', message, ...args);
    },
  };
}

export type Logger = ReturnType<typeof makeLogger>;
