import React from 'react';
import { useToolbar } from '@ohif/core';

type ToolbarProps = {
  servicesManager: AppTypes.ServicesManager;
  buttonSection?: string;
  allowedIds?: string[];
};

export function Toolbar({ servicesManager, buttonSection = 'primary', allowedIds }: ToolbarProps) {
  const { toolbarButtons, onInteraction } = useToolbar({
    servicesManager,
    buttonSection,
  });

  if (!toolbarButtons.length) {
    return null;
  }

  return (
    <>
      {toolbarButtons
        ?.filter(toolDef => (allowedIds ? allowedIds.includes(toolDef?.id) : true))
        .map(toolDef => {
        if (!toolDef) {
          return null;
        }

        const { id, Component, componentProps } = toolDef;
        const tool = (
          <Component
            key={id}
            id={id}
            onInteraction={onInteraction}
            servicesManager={servicesManager}
            {...componentProps}
          />
        );

        return <div key={id}>{tool}</div>;
      })}
    </>
  );
}
