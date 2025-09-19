import { ZoomTool } from '@cornerstonejs/tools';

/**
 * ZoomInvertedTool: Zoom with inverted drag direction as default.
 * Supports Mouse and Touch.
 */
class ZoomInvertedTool extends ZoomTool {
  static toolName = 'ZoomInverted';

  constructor(
    toolProps = {},
    defaultToolProps = {
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        zoomToCenter: false,
        minZoomScale: 0.1,
        maxZoomScale: 30,
        pinchToZoom: false,
        pan: true,
        invert: true,
      },
    }
  ) {
    super(toolProps, defaultToolProps);
  }
}

export default ZoomInvertedTool;
