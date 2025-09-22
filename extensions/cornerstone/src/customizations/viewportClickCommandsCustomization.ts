export default {
  cornerstoneViewportClickCommands: {
    doubleClick: ['toggleOneUp'],
    button1: [
      'closeContextMenu',
      {
        commandName: 'toggleCrosshairsAndReferenceLines',
        commandOptions: {
          requireNearbyToolData: true,
          menuId: 'measurementsContextMenu',
        },
      },
    ],
    button3: [
      {
        commandName: 'showSpinnerContextMenu',
        commandOptions: {},
      },
    ],
  },
};
