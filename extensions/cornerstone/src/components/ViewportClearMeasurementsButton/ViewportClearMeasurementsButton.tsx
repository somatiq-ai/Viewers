import React from 'react';
import { useSystem } from '@ohif/core';
import { BrushCleaning  } from 'lucide-react';

interface ViewportClearMeasurementsButtonProps {
  viewportId: string;
}

function ViewportClearMeasurementsButton({ viewportId }: ViewportClearMeasurementsButtonProps) {
  const { servicesManager } = useSystem();

  const handleClearMeasurements = () => {
    const { measurementService, viewportGridService } = servicesManager.services;

    // Get the displaySetInstanceUIDs for this specific viewport
    const displaySetInstanceUIDs = viewportGridService.getDisplaySetsUIDsForViewport(viewportId);

    if (!displaySetInstanceUIDs || displaySetInstanceUIDs.length === 0) {
      console.warn('No display sets found for viewport:', viewportId);
      return;
    }

    // Create a filter to only clear measurements from this viewport's display sets
    const viewportFilter = (measurement) => {
      return displaySetInstanceUIDs.includes(measurement.displaySetInstanceUID);
    };

    // Clear measurements only for this viewport
    measurementService.clearMeasurements(viewportFilter);
  };

  return (
    <button
      className="bg-transparent rounded px-2 py-1 text-white text-xs"
      onClick={handleClearMeasurements}
      title="Clear Measurements in this Viewport"
      data-cy="clear-measurements-btn"
    >
      <BrushCleaning className="h-5 w-5" />
    </button>
  );
}

export default ViewportClearMeasurementsButton;
