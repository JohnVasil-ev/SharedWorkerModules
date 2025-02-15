import { event, module } from '../../lib';

import { getNameChannel } from './channels';
import { changeName, genName, releaseClient, releaseName } from './events';
import { widgetNameContext } from './widgetName.constants';

export const widgetName = module('WidgetName', widgetNameContext, {
  events: [
    event('GenName', genName),
    event('ChangeName', changeName),
    event('ReleaseName', releaseName),
    event('ReleaseClient', releaseClient),
  ],
  channels: [getNameChannel],
});
