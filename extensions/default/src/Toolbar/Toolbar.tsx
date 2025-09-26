import React from 'react';
import { useToolbar } from '@ohif/core';

interface ToolbarProps {
  buttonSection?: string;
  viewportId?: string;
  location?: number;
  allowedIds?: string[];
}

export function Toolbar({ buttonSection = 'primary', viewportId, location, allowedIds }: ToolbarProps) {
  const {
    toolbarButtons,
    onInteraction,
    isItemOpen,
    isItemLocked,
    openItem,
    closeItem,
    toggleLock,
  } = useToolbar({
    buttonSection,
  });

  if (!toolbarButtons.length) {
    return null;
  }

  // Filter toolbar buttons if allowedIds is provided
  const filteredButtons = allowedIds
    ? toolbarButtons.filter(toolDef => allowedIds.includes(toolDef.id))
    : toolbarButtons;

  return (
    <>
      {filteredButtons?.map(toolDef => {
        if (!toolDef) {
          return null;
        }

        const { id, Component, componentProps } = toolDef;

        // Enhanced props with state and actions - respecting viewport specificity
        const enhancedProps = {
          ...componentProps,
          isOpen: isItemOpen(id, viewportId),
          isLocked: isItemLocked(id, viewportId),
          onOpen: () => openItem(id, viewportId),
          onClose: () => closeItem(id, viewportId),
          onToggleLock: () => toggleLock(id, viewportId),
          viewportId,
        };

        const tool = (
          <Component
            key={id}
            id={id}
            location={location}
            onInteraction={args => {
              onInteraction({
                ...args,
                itemId: id,
                viewportId,
              });
            }}
            {...enhancedProps}
          />
        );

        return <div key={id}>{tool}</div>;
      })}
    </>
  );
}
