import type { EventData, ModuleEventContext } from '../../../lib';
import { getCorrectNameExpr, getUniqKey } from '../utils';
import type { WidgetNameContext } from '../widgetName.types';

export interface ChangeNameData {
  widgetType: string;
  widgetId: string;
  widgetBaseName: string;
  widgetName: string;
}

export const changeName =
  ({ context }: ModuleEventContext<WidgetNameContext>) =>
  ({
    clientId,
    payload: { widgetType, widgetId, widgetBaseName, widgetName },
  }: EventData<ChangeNameData>) => {
    const { widgets } = context;
    const uniqKey = getUniqKey(clientId, widgetId);

    if (!widgets[widgetType] || !widgets[widgetType][uniqKey]) {
      return;
    }

    const hasCorrectNameExpr = getCorrectNameExpr(widgetName, widgetBaseName);

    if (!hasCorrectNameExpr) {
      delete widgets[widgetType][uniqKey];
      if (!Object.keys(widgets[widgetType]).length) {
        delete widgets[widgetType];
      }
      return;
    }

    widgets[widgetType][uniqKey] = widgetName;
  };
