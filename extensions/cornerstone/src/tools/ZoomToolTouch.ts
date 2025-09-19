import { ZoomTool } from '@cornerstonejs/tools';

class ZoomToolTouch extends ZoomTool {
  static toolName = 'Zoom';

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

export default ZoomToolTouch;
