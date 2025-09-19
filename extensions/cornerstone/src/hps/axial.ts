export const VOI_SYNC_GROUP = {
  type: 'voi',
  id: 'default',
  source: true,
  target: true,
  options: {
    syncColormap: true,
  },
};

export const HYDRATE_SEG_SYNC_GROUP = {
  type: 'hydrateseg',
  id: 'sameFORId',
  source: true,
  target: true,
  options: {
    matchingRules: ['sameFOR'],
  },
};

export const axial = {
  id: 'axial',
  locked: true,
  name: 'Axial',
  icon: 'layout-common-1x1',
  isPreset: true,
  createdDate: '2025-08-09T10:29:44.894Z',
  modifiedDate: '2025-08-09T10:29:44.894Z',
  availableTo: {},
  editableBy: {},
  protocolMatchingRules: [],
  imageLoadStrategy: 'interleaveCenter',
  displaySetSelectors: {
    activeDisplaySet: {
      seriesMatchingRules: [
        {
          weight: 1,
          attribute: 'isReconstructable',
          constraint: {
            equals: {
              value: true,
            },
          },
          required: true,
        },
      ],
    },
  },
  stages: [
    {
      id: 'axialStage',
      name: 'axial',
      viewportStructure: {
        layoutType: 'grid',
        properties: {
          rows: 1,
          columns: 1,
          layoutOptions: [
            {
              viewportId: 'default',
              x: 0,
              y: 0,
              width: 1,
              height: 1,
            },
          ],
        },
      },
      viewports: [
        {
          viewportOptions: {
            viewportId: 'axial',
            toolGroupId: 'default',
            viewportType: 'volume',
            orientation: 'axial',
            initialImageOptions: {
              preset: 'middle',
            },
            syncGroups: [VOI_SYNC_GROUP, HYDRATE_SEG_SYNC_GROUP],
          },
          displaySets: [
            {
              id: 'activeDisplaySet',
            },
          ],
        },
      ],
    },
  ],
};
