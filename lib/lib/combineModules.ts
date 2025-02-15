import { makeLogger } from '../utils';

import type { ChannelData, Module, ModulesMapObjectFromArray } from './module';

export type ModulesReturn<MOM extends ModulesMapObjectFromArray<any>> = {
  [MN in keyof MOM]: {
    [MF in keyof MOM[MN]]: MOM[MN] extends {
      actions: MOM[MN]['actions'];
      channels: MOM[MN]['channels'];
    }
      ? {
          [MC in keyof MOM[MN]['channels']]: {
            moduleName: MN;
            moduleChannel: MC;
            payload: MOM[MN]['channels'][MC] extends (
              data: ChannelData<infer R, any>
            ) => void
              ? R
              : never;
          };
        }[keyof MOM[MN]['channels']]
      : never;
  }[keyof MOM[MN]];
}[keyof MOM];

export type OnMessage<
  MMO extends ModulesMapObjectFromArray<
    ReadonlyArray<Module<any, any, any, any, any>>
  >
> = <MN extends keyof MMO, ME extends keyof MMO[MN]['actions']>(
  port: MessagePort,
  clientId: string,
  moduleName: MN,
  moduleEvent: ME,
  payload: any
) => void;

export interface CombineModulesCreator {
  <MA extends ReadonlyArray<Module<any, any, any, any, any>>>(modules: MA): {
    onMessage: OnMessage<ModulesMapObjectFromArray<MA>>;
    modules: ModulesMapObjectFromArray<MA>;
  };
}

/**
 * *combineModules* - это функция, которая возвращает
 * функцию *onMessage* и объект *modules*.
 *
 * *onMessage* - функция, которая применяется для
 * обработки сообщений принимаемых воркером от клиента
 * и отправляющая необходимый набор данных опредленному
 * методу и ивенту.
 *
 * *modules* - нормализированный объект модулей,
 * переданных в качестве аргумента функции *combineModules*.
 * Необходим для корректного вывода типа в api функции
 * *workerPostMessage*.
 *
 * Links:
 * - [module](module.ts)
 * - [plugin](plugin.ts)
 * - [channel](channel.ts)
 * - [event](event.ts)
 *
 * @example
 * ```typescript
 * export const { onMessage, modules } = combineModules([moduleName, ...]);
 * ```
 */
export const combineModules: CombineModulesCreator = (modules) => {
  const logger = makeLogger('SharedWorker');

  const _modules = Object.fromEntries(
    modules.map((m) => [m.name, { actions: m.actions, channels: m.channels }])
  ) as ModulesMapObjectFromArray<typeof modules>;

  const onMessage: OnMessage<typeof _modules> = (
    port,
    clientId,
    moduleName,
    moduleEvent,
    payload
  ) => {
    const { actions } = _modules[moduleName];
    if (!actions) {
      logger.error(`Module '${moduleName}' was not found!`);
      return;
    }

    const eventHandler = actions[moduleEvent];

    if (!eventHandler) {
      logger.error(
        `Event '${String(moduleEvent)}' was not found in module '${moduleName}'`
      );
      return;
    }

    logger.info(
      `Event '${String(
        moduleEvent
      )}' was called from module '${moduleName}' from client with id '${clientId}' with payload: `,
      payload
    );

    const postMessage = (data: any) =>
      port.postMessage({
        moduleName,
        ...data,
      });

    eventHandler({ postMessage, clientId, payload });
  };

  return { onMessage, modules: _modules };
};
