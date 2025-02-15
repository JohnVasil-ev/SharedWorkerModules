import type { EventData, ModuleEventContext } from '../../../lib';
import { getUniqKey } from '../utils';
import type { WidgetNameContext } from '../widgetName.types';

export interface ReleaseNameData {
  widgetType: string;
  widgetId: string;
}

export const releaseName =
  ({ context }: ModuleEventContext<WidgetNameContext>) =>
  ({
    clientId,
    payload: { widgetType, widgetId },
  }: EventData<ReleaseNameData>) => {
    const { widgets } = context;
    const uniqKey = getUniqKey(clientId, widgetId);

    if (!widgets[widgetType] || !widgets[widgetType][uniqKey]) {
      return;
    }

    delete widgets[widgetType][uniqKey];
    if (!Object.keys(widgets[widgetType]).length) {
      delete widgets[widgetType];
    }
  };
