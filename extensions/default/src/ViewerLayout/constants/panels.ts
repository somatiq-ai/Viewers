const expandedInsideBorderSize = 0;
const collapsedInsideBorderSize = 4;
const collapsedOutsideBorderSize = 4;
const collapsedWidth = 25;

const rightPanelInitialExpandedWidth = 280;
const leftPanelInitialExpandedWidth = 145;

const panelGroupDefinition = {
  groupId: 'viewerLayoutResizablePanelGroup',
  shared: {
    expandedInsideBorderSize,
    collapsedInsideBorderSize,
    collapsedOutsideBorderSize,
    collapsedWidth,
  },
  left: {
    // id
    panelId: 'viewerLayoutResizableLeftPanel',
    // expanded width
    initialExpandedWidth: leftPanelInitialExpandedWidth,
    // expanded width + expanded inside border
    minimumExpandedOffsetWidth: leftPanelInitialExpandedWidth + expandedInsideBorderSize,
    // initial expanded width
    initialExpandedOffsetWidth: leftPanelInitialExpandedWidth + expandedInsideBorderSize,
    // collapsed width + collapsed inside border + collapsed outside border
    collapsedOffsetWidth: collapsedWidth + collapsedInsideBorderSize + collapsedOutsideBorderSize,
  },
  right: {
    panelId: 'viewerLayoutResizableRightPanel',
    initialExpandedWidth: rightPanelInitialExpandedWidth,
    minimumExpandedOffsetWidth: rightPanelInitialExpandedWidth + expandedInsideBorderSize,
    initialExpandedOffsetWidth: rightPanelInitialExpandedWidth + expandedInsideBorderSize,
    collapsedOffsetWidth: collapsedWidth + collapsedInsideBorderSize + collapsedOutsideBorderSize,
  },
};

const getPanelGroupDefinition = ({
  leftPanelInitialExpandedWidth: customLeftWidth,
  rightPanelInitialExpandedWidth: customRightWidth,
  leftPanelMinimumExpandedWidth: customLeftMinWidth,
  rightPanelMinimumExpandedWidth: customRightMinWidth,
}) => {
  const leftWidth = customLeftWidth || leftPanelInitialExpandedWidth;
  const rightWidth = customRightWidth || rightPanelInitialExpandedWidth;
  const leftMinWidth = customLeftMinWidth || leftPanelInitialExpandedWidth;
  const rightMinWidth = customRightMinWidth || rightPanelInitialExpandedWidth;

  return {
    groupId: 'viewerLayoutResizablePanelGroup',
    shared: {
      expandedInsideBorderSize,
      collapsedInsideBorderSize,
      collapsedOutsideBorderSize,
      collapsedWidth,
    },
    left: {
      panelId: 'viewerLayoutResizableLeftPanel',
      initialExpandedWidth: leftWidth,
      minimumExpandedOffsetWidth: leftMinWidth + expandedInsideBorderSize,
      initialExpandedOffsetWidth: leftWidth + expandedInsideBorderSize,
      collapsedOffsetWidth: collapsedWidth + collapsedInsideBorderSize + collapsedOutsideBorderSize,
    },
    right: {
      panelId: 'viewerLayoutResizableRightPanel',
      initialExpandedWidth: rightWidth,
      minimumExpandedOffsetWidth: rightMinWidth + expandedInsideBorderSize,
      initialExpandedOffsetWidth: rightWidth + expandedInsideBorderSize,
      collapsedOffsetWidth: collapsedWidth + collapsedInsideBorderSize + collapsedOutsideBorderSize,
    },
  };
};

export { panelGroupDefinition, getPanelGroupDefinition };
