import { type Logger, makeLogger } from '../utils';

import type { Channel } from './channel';
import type { Event } from './event';
import type { Plugin, PluginsMapObjectFromArray } from './plugin';

export interface ModuleEventContext<
  C = any,
  AMC extends ArrayModuleChannels<C> = ArrayModuleChannels<C>,
  PA extends ReadonlyArray<Plugin<any, any, any>> = ReadonlyArray<
    Plugin<any, any, any>
  >
> {
  logger: Logger;
  context: C;
  channels: ActionsMapObjectFromModuleChannelsMapObject<
    C,
    AMC,
    ModuleChannelsMapObjectFromArray<C, AMC>
  >;
  plugins: PluginsMapObjectFromArray<PA>;
}

export interface ModuleChannelContext<C = any> {
  context: C;
}

export interface EventData<P = undefined> {
  postMessage(data: any): void;
  clientId: string;
  payload: P;
}

export interface ChannelData<R, P = R> {
  postMessage(data: R): void;
  data: P;
}

export type ArrayModuleEvents<
  C,
  AMC extends ArrayModuleChannels<C>,
  PA extends ReadonlyArray<Plugin<any, any, any>>
> = ReadonlyArray<
  Event<
    string,
    (context: ModuleEventContext<C, AMC, PA>) => (data: EventData<any>) => any
  >
>;

export type ArrayModuleChannels<C> = ReadonlyArray<
  Channel<string, (context: ModuleChannelContext<C>) => (data: any) => void>
>;

export type ModuleEventsMapObjectFromArray<
  C,
  PA extends ReadonlyArray<Plugin<any, any, any>>,
  AMC extends ArrayModuleChannels<C>,
  AME extends ArrayModuleEvents<C, AMC, PA>
> = {
  [T in AME[number] as T['name']]: T['action'];
};

export type ModuleChannelsMapObjectFromArray<
  C,
  AMC extends ArrayModuleChannels<C>
> = {
  [T in AMC[number] as T['name']]: T['action'];
};

export type ModulesMapObjectFromArray<
  MA extends ReadonlyArray<Module<any, any, any, any, any>>
> = {
  [M in MA[number] as M['name']]: {
    actions: M['actions'];
    channels: M['channels'];
  };
};

export type ActionsMapObjectFromModuleEventsMapObject<
  C,
  PA extends ReadonlyArray<Plugin<any, any, any>>,
  AMC extends ArrayModuleChannels<C>,
  AME extends ArrayModuleEvents<C, AMC, PA>,
  MEMO extends ModuleEventsMapObjectFromArray<C, PA, AMC, AME>
> = {
  [Key in keyof MEMO]: MEMO[Key] extends (
    context: ModuleEventContext<C, AMC, PA>
  ) => infer R
    ? R
    : never;
};

export type ActionsMapObjectFromModuleChannelsMapObject<
  C,
  AMC extends ArrayModuleChannels<C>,
  MCMO extends ModuleChannelsMapObjectFromArray<C, AMC>
> = {
  [Key in keyof MCMO]: MCMO[Key] extends (
    context: ModuleChannelContext<C>
  ) => infer R
    ? R
    : never;
};

export interface Module<
  N extends string,
  C,
  PA extends ReadonlyArray<Plugin<any, any, any>>,
  AMC extends ArrayModuleChannels<C>,
  AME extends ArrayModuleEvents<C, AMC, PA>
> {
  name: N;
  actions: ActionsMapObjectFromModuleEventsMapObject<
    C,
    PA,
    AMC,
    AME,
    ModuleEventsMapObjectFromArray<C, PA, AMC, AME>
  >;
  channels: ActionsMapObjectFromModuleChannelsMapObject<
    C,
    AMC,
    ModuleChannelsMapObjectFromArray<C, AMC>
  >;
}

export interface ModuleCreator {
  <
    N extends string,
    C,
    PA extends ReadonlyArray<Plugin<any, any, any>>,
    AMC extends ArrayModuleChannels<C>,
    AME extends ArrayModuleEvents<C, AMC, PA>
  >(
    name: N,
    defaultContext: C,
    config: { events: AME; channels: AMC; plugins?: PA }
  ): Module<N, C, PA, AMC, AME>;
}

/**
 * *module* - это фнукция, которая возвращает объект Module
 * с указанным контекстом, набором методов для управления
 * этим контекстом, а также плагинами, которые доступны
 * внутри ивентов.
 *
 * Links:
 * - [channel](channel.ts)
 * - [plugin](plugin.ts)
 * - [event](event.ts)
 *
 * @example
 * ```typescript
 * interface ModuleContext {
 *   moduleField: string;
 * }
 *
 * const moduleContext: ModuleContext = {
 *   moduleField: 'test';
 * }
 *
 * const moduleChannelFunc =
 *   ({ context }: ModuleChannelContext<ModuleContext>) =>
 *   ({ postMessage payload }: ChannelData<string, number>) => {
 *     postMessage(String(payload));
 *   }
 *
 * const moduleEventFunc =
 *   ({ context, plugins }: ModuleEventContext<ModuleContext, [typeof pluginName]>) =>
 *   ({ port, payload }: EventData<{ name: string }>) => {
 *     if (payload.name !== 'test') return;
 *
 *     channels.ChannelName(123);
 *   }
 *
 * const moduleName = module('ModuleName', moduleContext, {
 *   events: [
 *     event('EventName', moduleEventFunc),
 *   ],
 *   channels: [
 *     channel('ChannelName', moduleChannelFunc),
 *   ],
 *   plugins: [
 *     pluginName,
 *   ]
 * });
 * ```
 */
export const module: ModuleCreator = (
  name,
  defaultContext,
  { events, channels, plugins = [] }
) => {
  const context = { ...defaultContext };
  const logger = makeLogger(name);

  const _channels = Object.fromEntries(
    channels.map((c) => [
      c.name,
      ({ postMessage, ...data }: ChannelData<any, any>) => {
        logger.debug(`'${c.name}' channel action was called`);
        const channelPostMessage = (payload: any) =>
          postMessage({ moduleChannel: c.name, payload });
        c.action({ context })({
          ...data,
          postMessage: channelPostMessage,
        });
      },
    ])
  ) as ActionsMapObjectFromModuleChannelsMapObject<
    typeof defaultContext,
    typeof channels,
    ModuleChannelsMapObjectFromArray<typeof defaultContext, typeof channels>
  >;

  const _plugins = Object.fromEntries(
    plugins.map((p) => [p.name, p.actions] as const)
  ) as PluginsMapObjectFromArray<typeof plugins>;

  const actions = Object.fromEntries(
    events.map((e) => [
      e.name,
      (data: any) => {
        logger.debug(`'${e.name}' event action was called!`);
        e.action({
          logger,
          context,
          channels: _channels,
          plugins: _plugins,
        })(data);
      },
    ])
  ) as ActionsMapObjectFromModuleEventsMapObject<
    typeof defaultContext,
    typeof plugins,
    typeof channels,
    typeof events,
    ModuleEventsMapObjectFromArray<
      typeof defaultContext,
      typeof plugins,
      typeof channels,
      typeof events
    >
  >;

  return {
    name,
    actions,
    channels: _channels,
  };
};
