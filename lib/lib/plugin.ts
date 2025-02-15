import { Logger, makeLogger } from '../utils';

import type { Event } from './event';

export type PluginEventContext<C = any> = {
  logger: Logger;
  context: C;
};

export type ArrayPluginEvents<C> = ReadonlyArray<
  Event<
    string,
    (context: PluginEventContext<C>) => (...args: Array<any>) => any
  >
>;

export type PluginEventsMapObjectFromArray<
  C,
  PEA extends ArrayPluginEvents<C>
> = {
  [PE in PEA[number] as PE['name']]: PE['action'];
};

export type PluginsMapObjectFromArray<
  PA extends ReadonlyArray<Plugin<any, any, any>>
> = {
  [P in PA[number] as P['name']]: P['actions'];
};

export type ActionsMapObjectFromPluginEventsMapObject<
  C,
  APE extends ArrayPluginEvents<C>,
  PEMO extends PluginEventsMapObjectFromArray<C, APE>
> = {
  [Key in keyof PEMO]: PEMO[Key] extends (ctx: PluginEventContext<C>) => infer R
    ? R
    : never;
};

export interface Plugin<N extends string, C, AME extends ArrayPluginEvents<C>> {
  name: N;
  actions: ActionsMapObjectFromPluginEventsMapObject<
    C,
    AME,
    PluginEventsMapObjectFromArray<C, AME>
  >;
}

export interface PluginCreator {
  <N extends string, C, AME extends ArrayPluginEvents<C>>(
    name: N,
    defaultContext: C,
    events: AME
  ): Plugin<N, C, AME>;
}

/**
 * *plugin* - это функция, которая возвращает объект Plugin
 * с указанным контекстом и набором методов для управления
 * этим контекстом.
 *
 * Links:
 * - [event](./event.ts)
 *
 * @example
 * ```typescript
 * interface PluginContext {
 *   pluginField: string;
 * }
 *
 * const pluginContext: PluginContext = {
 *   pluginField: 'test',
 * };
 *
 * const pluginEventFunc = (context: PluginContext) => (name: string) => {
 *   if (name !== 'test') return;
 *   return context.pluginField;
 * }
 *
 * const pluginName = plugin('PluginName', pluginContext, [
 *   event('EventName', pluginEventFunc),
 * ]);
 * ```
 */
export const plugin: PluginCreator = (name, defaultContext, events) => {
  const context = { ...defaultContext };
  const logger = makeLogger(name);

  const actions = Object.fromEntries(
    events.map((e) => [
      e.name,
      (data: any) => {
        logger.debug(`'${e.name}' plugin action was called!`);
        return e.action({ logger, context })(data);
      },
    ])
  ) as ActionsMapObjectFromPluginEventsMapObject<
    typeof defaultContext,
    typeof events,
    PluginEventsMapObjectFromArray<typeof defaultContext, typeof events>
  >;

  return {
    name,
    actions,
  };
};
