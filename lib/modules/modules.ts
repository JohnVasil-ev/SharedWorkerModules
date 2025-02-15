import { combineModules, ModulesReturn } from '../lib';

import { widgetName } from './widgetName';

export const { onMessage, modules } = combineModules([widgetName]);

export type Modules = typeof modules;
export type ModulesReturnData = ModulesReturn<Modules>;
