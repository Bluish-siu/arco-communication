import { db } from './db.js';

async function resetWidgetDefaults() {
  const current = await db.getObject('settings');
  console.log('Current settings:', JSON.stringify(current?.widget, null, 2));

  const updatedWidget = {
    ...(current?.widget || {}),
    desktopPosition: 'right',
    desktopSideSpacing: 10,
    desktopBottomSpacing: 10,
    mobilePosition: 'right',
    mobileSideSpacing: 10,
    mobileBottomSpacing: 10,
    buttonType: 'with-text',
    buttonText: 'Chat with us',
    buttonColor: '#25D366',
  };

  await db.updateObject('settings', {
    ...current,
    widget: updatedWidget,
  });

  console.log('Reset widget settings to default Right + Bottom:');
  const refreshed = await db.getObject('settings');
  console.log(JSON.stringify(refreshed?.widget, null, 2));
  process.exit(0);
}

resetWidgetDefaults();
