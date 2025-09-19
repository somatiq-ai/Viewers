import React from 'react';
import { Icons } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';

interface ViewportCloseButtonProps {
  viewportId: string;
}

function ViewportCloseButton({ viewportId }: ViewportCloseButtonProps) {
  const { commandsManager } = useSystem();

  const handleCloseViewport = () => {
    commandsManager.runCommand('closeViewport', { viewportId });
  };

  return (
    <button
      className="bg-transparent rounded p-1"
      onClick={handleCloseViewport}
      title="Close Viewport"
      data-cy="close-viewport-btn"
    >
      <Icons.Close className="text-primary-active h-4 w-4" />
    </button>
  );
}

export default ViewportCloseButton;
