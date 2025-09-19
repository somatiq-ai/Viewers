import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@ohif/ui';
import html2canvas from 'html2canvas';
import './USCaptureModal.css';

// Component to show ACTUAL US image preview using the same method as existing capture
const USImagePreview = React.memo(
  ({ displaySet, index, viewportGridService, cornerstoneViewportService, onHide }: any) => {
    const [imageCanvas, setImageCanvas] = useState<HTMLCanvasElement | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      let isMounted = true;
      let tempViewportId: string | null = null;
      let tempElement: HTMLElement | null = null;

      const loadActualImage = async () => {
        try {
          console.log(`Loading ACTUAL image ${index + 1}:`, displaySet);

          // Create a temporary hidden viewport to render the actual image at very high resolution
          tempElement = document.createElement('div');
          tempElement.style.cssText = `
                  position: fixed;
                  top: -9999px;
                  left: -9999px;
                  width: 1200px;
                  height: 900px;
                  visibility: hidden;
                  pointer-events: none;
                  background: black;
                `;
          tempElement.setAttribute('data-viewport-uid', `us-temp-${index}-${Date.now()}`);
          document.body.appendChild(tempElement);

          // Generate unique viewport ID
          tempViewportId = `us-temp-${index}-${Date.now()}-${Math.random()}`;

          console.log(`Creating temporary viewport: ${tempViewportId}`);

          // Use the same method as the existing capture - get the rendering engine
          const renderingEngine = cornerstoneViewportService.getRenderingEngine();

          if (!renderingEngine) {
            throw new Error('No rendering engine available');
          }

          // Enable the element using the rendering engine (same as CornerstoneViewportDownloadForm)
          const viewportInput = {
            viewportId: tempViewportId,
            element: tempElement,
            type: 'stack', // US images are typically stack viewports
            defaultOptions: {
              background: [0, 0, 0], // Black background
            },
          };

          renderingEngine.enableElement(viewportInput);
          const viewport = renderingEngine.getViewport(tempViewportId);

          console.log(`Viewport enabled, setting display sets...`);

          // Load the image using the same approach
          if (displaySet.instances && displaySet.instances.length > 0) {
            // Get the image ID from the first instance
            const instance = displaySet.instances[0];
            const imageId = instance.getImageId ? instance.getImageId() : instance.imageId;

            if (imageId) {
              console.log(`Loading image ID: ${imageId}`);
              await viewport.setStack([imageId]);
            } else {
              throw new Error('No image ID found');
            }
          } else {
            throw new Error('No instances in display set');
          }

          console.log(`Display set configured, waiting for render...`);

          // Wait for the image to load and render
          await new Promise(resolve => setTimeout(resolve, 800));

          if (!isMounted) {
            return;
          }

          // Get the rendered canvas from the temporary viewport
          const renderedCanvas = tempElement.querySelector('canvas');
          console.log(`Rendered canvas found:`, !!renderedCanvas);

          if (renderedCanvas && renderedCanvas.width > 0 && renderedCanvas.height > 0) {
            // Create a very high-resolution copy of the canvas for our preview
            const previewCanvas = document.createElement('canvas');
            // Use much higher resolution for outstanding quality
            const scaleFactor = 4;
            previewCanvas.width = 600 * scaleFactor;
            previewCanvas.height = 450 * scaleFactor;

            const ctx = previewCanvas.getContext('2d');
            if (ctx) {
              // Enable high-quality rendering
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';

              // Fill with black background
              ctx.fillStyle = 'black';
              ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

              // Calculate aspect ratio to maintain image proportions
              const sourceAspect = renderedCanvas.width / renderedCanvas.height;
              const targetAspect = previewCanvas.width / previewCanvas.height;

              let drawWidth = previewCanvas.width;
              let drawHeight = previewCanvas.height;
              let offsetX = 0;
              let offsetY = 0;

              if (sourceAspect > targetAspect) {
                // Source is wider, fit to width
                drawHeight = previewCanvas.width / sourceAspect;
                offsetY = (previewCanvas.height - drawHeight) / 2;
              } else {
                // Source is taller, fit to height
                drawWidth = previewCanvas.height * sourceAspect;
                offsetX = (previewCanvas.width - drawWidth) / 2;
              }

              // Draw the actual image with proper aspect ratio and high quality
              ctx.drawImage(renderedCanvas, offsetX, offsetY, drawWidth, drawHeight);

              // No watermark - clean image display

              console.log(`Image ${index + 1} successfully rendered!`);

              if (isMounted) {
                setImageCanvas(previewCanvas);
                setError(null);
              }
            }
          } else {
            console.warn(`No valid canvas found for image ${index + 1}`);
            if (isMounted) {
              setError(`No image data available`);
            }
          }
        } catch (error) {
          console.error(`Failed to load image ${index + 1}:`, error);
          if (isMounted) {
            setError(`Failed to load: ${error.message}`);
          }
        } finally {
          // Cleanup - use the same method as CornerstoneViewportDownloadForm
          if (tempViewportId && cornerstoneViewportService) {
            try {
              const renderingEngine = cornerstoneViewportService.getRenderingEngine();
              if (renderingEngine) {
                renderingEngine.disableElement(tempViewportId);
              }
            } catch (cleanupError) {
              console.warn('Cleanup error:', cleanupError);
            }
          }

          if (tempElement && tempElement.parentNode) {
            document.body.removeChild(tempElement);
          }

          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      loadActualImage();

      return () => {
        isMounted = false;
        // Cleanup will happen in the finally block
      };
    }, [displaySet, index, cornerstoneViewportService]);

    if (isLoading) {
      return (
        <div className="us-image-preview-container">
          <div
            className="us-image-preview"
            style={{
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <div style={{ color: '#666', fontSize: '16px', marginBottom: '8px' }}>⏳</div>
            <div style={{ color: '#333', fontSize: '12px' }}>Loading...</div>
            <div style={{ color: '#999', fontSize: '10px' }}>Image #{index + 1}</div>
          </div>
          <div className="us-image-preview-info">
            <div className="text-xs">Loading #{index + 1}</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="us-image-preview-container">
          <div
            className="us-image-preview"
            style={{
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            {/* Just show empty white space for errors */}
          </div>
          <div className="us-image-preview-info">
            <div className="text-xs">Empty #{index + 1}</div>
          </div>
        </div>
      );
    }

    if (imageCanvas) {
      return (
        <div
          className="us-image-preview-container"
          style={{ position: 'relative' }}
        >
          <div
            className="us-image-preview"
            style={{ background: 'white' }}
          >
            {/* Close button */}
            <button
              onClick={() => onHide && onHide(displaySet.displaySetInstanceUID)}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 0, 0, 0.8)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                fontWeight: 'bold',
              }}
              title="Hide this image"
            >
              ×
            </button>
            {/* Render the actual image canvas */}
            <canvas
              width={imageCanvas.width}
              height={imageCanvas.height}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              ref={canvas => {
                if (canvas && imageCanvas) {
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(imageCanvas, 0, 0);
                  }
                }
              }}
            />
          </div>
          <div className="us-image-preview-info">
            <div className="text-xs font-bold">#{index + 1}</div>
            <div className="text-xs">
              S{displaySet.seriesNumber} I{displaySet.instanceNumber}
            </div>
            <div className="text-xs opacity-70">
              {displaySet.SeriesDescription?.substring(0, 15) || 'US Series'}
            </div>
          </div>
        </div>
      );
    }

    // Final fallback - empty white space
    return (
      <div className="us-image-preview-container">
        <div
          className="us-image-preview"
          style={{
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Empty white space */}
        </div>
      </div>
    );
  }
);

interface USCaptureModalProps {
  hide: () => void;
  servicesManager: any;
}

const USCaptureModal = ({ hide, servicesManager }: USCaptureModalProps) => {
  const [filename, setFilename] = useState('US_Images');
  const [isLoading, setIsLoading] = useState(true);
  const [displaySets, setDisplaySets] = useState([]);
  const [selectedGrid, setSelectedGrid] = useState<'1x2' | '2x4' | '2x5'>('2x4');
  const [hiddenImages, setHiddenImages] = useState<Set<string>>(new Set());
  const [patientInfo, setPatientInfo] = useState({
    PatientName: '',
    PatientID: '',
    PatientSex: '',
    PatientAge: '',
  });

  const { displaySetService, viewportGridService, cornerstoneViewportService } =
    servicesManager.services;

  // Function to hide an image
  const hideImage = useCallback((displaySetInstanceUID: string) => {
    setHiddenImages(prev => new Set([...prev, displaySetInstanceUID]));
  }, []);

  // Function to show an image (if needed later)
  const showImage = useCallback((displaySetInstanceUID: string) => {
    setHiddenImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(displaySetInstanceUID);
      return newSet;
    });
  }, []);

  useEffect(() => {
    const loadUSImages = async () => {
      try {
        // Get all US display sets
        const allDisplaySets = displaySetService.getActiveDisplaySets();
        const usDisplaySets = allDisplaySets.filter(
          (ds: any) =>
            ds.Modality === 'US' ||
            (ds.instances && ds.instances.some((instance: any) => instance.Modality === 'US'))
        );

        console.log(`Found ${usDisplaySets.length} US display sets`);

        // Create individual display sets for each instance
        const allUSImages = [];
        usDisplaySets.forEach((ds: any) => {
          if (ds.instances && ds.instances.length > 0) {
            // Create a separate display set for each instance
            ds.instances.forEach((instance: any, instanceIndex: number) => {
              // Create a new display set that represents just this one instance
              const singleInstanceDisplaySet = {
                ...ds,
                // Override instances to contain only this specific instance
                instances: [instance],
                // Set the current instance index to 0 since we only have one instance in this display set
                currentImageIndex: 0,
                instanceIndex: instanceIndex,
                instanceData: instance,
                displayName: `${ds.SeriesDescription || 'US Series'} - Image ${instanceIndex + 1}/${ds.instances.length}`,
                seriesNumber: ds.SeriesNumber || 1,
                instanceNumber: instance.InstanceNumber || instanceIndex + 1,
                // Create a unique display set UID for this specific instance
                displaySetInstanceUID: `${ds.displaySetInstanceUID}-inst-${instanceIndex}`,
                uniqueId: `${ds.displaySetInstanceUID}-${instanceIndex}`,
                // Add original display set reference
                originalDisplaySetUID: ds.displaySetInstanceUID,
                originalInstanceIndex: instanceIndex,
              };

              allUSImages.push(singleInstanceDisplaySet);
            });
          } else {
            // Fallback for display sets without instances array
            allUSImages.push({
              ...ds,
              instanceIndex: 0,
              displayName: ds.SeriesDescription || 'US Series',
              seriesNumber: ds.SeriesNumber || 1,
              instanceNumber: 1,
              uniqueId: `${ds.displaySetInstanceUID}-0`,
            });
          }
        });

        allUSImages.sort((a, b) => {
          const getAcquisitionTimeNumber = (image: { instanceData: any; instances: any[] }) => {
            const instance = image.instanceData || (image.instances && image.instances[0]);
            if (!instance?.AcquisitionDate || !instance?.AcquisitionTime) {
              return 0;
            }

            // Direct concatenation + parseInt for maximum performance
            // AcquisitionDate: "20240917" + AcquisitionTime: "143052" = "20240917143052"
            const timeNumber = parseInt(
              instance.AcquisitionDate + instance.AcquisitionTime.substring(0, 6),
              10
            );

            return timeNumber || 0;
          };

          const timeA = getAcquisitionTimeNumber(a);
          const timeB = getAcquisitionTimeNumber(b);

          // Both have acquisition times - sort chronologically (simple integer comparison)
          if (timeA && timeB) {
            return timeA - timeB;
          }

          // One has time, one doesn't - prioritize the one with time
          if (timeA && !timeB) {
            return -1;
          }
          if (!timeA && timeB) {
            return 1;
          }

          // Neither has acquisition time - fallback to original logic
          if (a.seriesNumber !== b.seriesNumber) {
            return a.seriesNumber - b.seriesNumber;
          }
          return a.instanceNumber - b.instanceNumber;
        });

        console.log(
          `Found ${allUSImages.length} total US images across ${usDisplaySets.length} series`
        );
        console.log(
          'US Images breakdown:',
          allUSImages.map(img => `${img.seriesNumber}-${img.instanceNumber}`)
        );

        setDisplaySets(allUSImages);

        // Get patient information from the first display set
        if (usDisplaySets.length > 0) {
          const firstDisplaySet = usDisplaySets[0];
          const instance = firstDisplaySet?.instances?.[0] || firstDisplaySet?.instance;
          if (instance) {
            const { utils } = await import('@ohif/core');
            const { formatPN } = utils;

            setPatientInfo({
              PatientName: instance.PatientName
                ? formatPN(instance.PatientName)
                : 'Unknown Patient',
              PatientID: instance.PatientID || 'Unknown ID',
              PatientSex: instance.PatientSex || 'Unknown',
              PatientAge: instance.PatientAge || 'Unknown',
            });
          }
        }
      } catch (error) {
        console.error('Failed to load US images:', error);
        setDisplaySets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUSImages();
  }, [displaySetService]);

  const createImageFromDisplaySet = useCallback(
    async (displaySet: any, index: number) => {
      const canvas = document.createElement('canvas');
      // Use higher resolution for print quality
      const printScaleFactor = 3; // Higher resolution for printing
      canvas.width = 400 * printScaleFactor;
      canvas.height = 300 * printScaleFactor;
      canvas.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      border: 1px solid #ccc;
      background: black;
    `;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return canvas;
      }

      try {
        // Try to find an existing viewport that has this display set loaded
        const { viewports } = viewportGridService.getState();
        const currentViewports = Array.from(viewports.values());

        // Look for a viewport that contains this display set (check both original and new UIDs)
        let sourceCanvas = null;
        for (const viewport of currentViewports) {
          const vp = viewport as any;
          if (
            vp.displaySetInstanceUIDs &&
            (vp.displaySetInstanceUIDs.includes(displaySet.displaySetInstanceUID) ||
              vp.displaySetInstanceUIDs.includes(displaySet.originalDisplaySetUID))
          ) {
            // Found a viewport with this display set
            const viewportElement = document.querySelector(
              `[data-viewport-uid="${vp.viewportId}"]`
            );
            if (viewportElement) {
              const existingCanvas = viewportElement.querySelector('canvas');
              if (existingCanvas) {
                sourceCanvas = existingCanvas;
                break;
              }
            }
          }
        }

        if (sourceCanvas) {
          // Enable high-quality rendering for print
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Copy the existing canvas with proper aspect ratio
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Calculate aspect ratio to maintain image proportions
          const sourceAspect = sourceCanvas.width / sourceCanvas.height;
          const targetAspect = canvas.width / canvas.height;

          let drawWidth = canvas.width;
          let drawHeight = canvas.height;
          let offsetX = 0;
          let offsetY = 0;

          if (sourceAspect > targetAspect) {
            // Source is wider, fit to width
            drawHeight = canvas.width / sourceAspect;
            offsetY = (canvas.height - drawHeight) / 2;
          } else {
            // Source is taller, fit to height
            drawWidth = canvas.height * sourceAspect;
            offsetX = (canvas.width - drawWidth) / 2;
          }

          ctx.drawImage(sourceCanvas, offsetX, offsetY, drawWidth, drawHeight);

          // Add image info overlay
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(5, canvas.height - 35, canvas.width - 10, 30);

          ctx.fillStyle = 'white';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(`#${index + 1}`, 10, canvas.height - 20);

          ctx.font = '10px Arial';
          const seriesText = `S${displaySet.seriesNumber} I${displaySet.instanceNumber}`;
          ctx.fillText(seriesText, 10, canvas.height - 8);

          return canvas;
        }

        // If no existing canvas found, try to create a temporary viewport
        await createTemporaryViewportForImage(displaySet, canvas, ctx, index);
      } catch (error) {
        console.warn(`Failed to create image for display set ${index}:`, error);

        // Fallback: create a detailed placeholder
        ctx.fillStyle = '#1a202c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add border
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Add content
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔊 US IMAGE', canvas.width / 2, canvas.height / 2 - 30);

        ctx.font = '12px Arial';
        ctx.fillText(`#${index + 1}`, canvas.width / 2, canvas.height / 2 - 10);

        ctx.font = '10px Arial';
        ctx.fillText(
          `Series ${displaySet.seriesNumber || '?'}`,
          canvas.width / 2,
          canvas.height / 2 + 5
        );
        ctx.fillText(
          `Instance ${displaySet.instanceNumber || '?'}`,
          canvas.width / 2,
          canvas.height / 2 + 20
        );

        if (displaySet.SeriesDescription) {
          ctx.fillText(
            displaySet.SeriesDescription.substring(0, 25),
            canvas.width / 2,
            canvas.height / 2 + 35
          );
        }
      }

      return canvas;
    },
    [viewportGridService]
  );

  const createTemporaryViewportForImage = useCallback(
    async (
      displaySet: any,
      targetCanvas: HTMLCanvasElement,
      ctx: CanvasRenderingContext2D,
      index: number
    ) => {
      try {
        // Create a temporary viewport element
        const tempElement = document.createElement('div');
        tempElement.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 300px;
        height: 200px;
      `;
        document.body.appendChild(tempElement);

        const tempViewportId = `temp-us-${index}-${Date.now()}`;

        // Try to create a temporary cornerstone viewport
        try {
          await cornerstoneViewportService.setViewportDisplaySets(tempViewportId, [displaySet], []);

          // Wait for image to load
          await new Promise(resolve => setTimeout(resolve, 300));

          // Get the viewport and its canvas
          const tempViewport = cornerstoneViewportService.getCornerstoneViewport(tempViewportId);
          if (tempViewport) {
            const tempCanvas = tempViewport.getCanvas();
            if (tempCanvas) {
              // Copy to our target canvas
              ctx.fillStyle = 'black';
              ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
              ctx.drawImage(tempCanvas, 0, 0, targetCanvas.width, targetCanvas.height);

              // Clean up
              cornerstoneViewportService.destroy(tempViewportId);
              document.body.removeChild(tempElement);
              return;
            }
          }
        } catch (tempError) {
          console.warn('Temporary viewport creation failed:', tempError);
        }

        // Clean up
        document.body.removeChild(tempElement);

        // If temporary viewport failed, create a styled placeholder
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);

        // Add US-like visual elements
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 1;

        // Add scan lines
        for (let i = 0; i < 20; i++) {
          const y = (targetCanvas.height / 20) * i;
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(targetCanvas.width, y);
          ctx.stroke();
        }

        ctx.globalAlpha = 1;

        // Add center info
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(
          targetCanvas.width / 4,
          targetCanvas.height / 2 - 25,
          targetCanvas.width / 2,
          50
        );

        ctx.fillStyle = '#1a202c';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('US IMAGE', targetCanvas.width / 2, targetCanvas.height / 2 - 5);
        ctx.font = '10px Arial';
        ctx.fillText(`#${index + 1}`, targetCanvas.width / 2, targetCanvas.height / 2 + 10);
      } catch (error) {
        console.warn('Failed to create temporary viewport:', error);
      }
    },
    [cornerstoneViewportService]
  );

  const createTemporaryViewports = useCallback(async () => {
    const tempContainer = document.createElement('div');
    tempContainer.className = 'us-capture-container';
    tempContainer.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 800px;
      height: 1000px;
      background: white;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: repeat(4, 1fr);
      gap: 8px;
      padding: 16px;
    `;

    document.body.appendChild(tempContainer);

    // Create canvases for each display set
    const canvasPromises = displaySets.map((displaySet: any, index: number) =>
      createImageFromDisplaySet(displaySet, index)
    );

    const canvases = await Promise.all(canvasPromises);

    // Add canvases to container
    canvases.forEach(canvas => {
      tempContainer.appendChild(canvas);
    });

    // Fill remaining slots with placeholders if needed
    while (tempContainer.children.length < 8) {
      const placeholder = document.createElement('div');
      placeholder.style.cssText = `
        border: 1px solid #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 14px;
        background: #f8f9fa;
      `;
      placeholder.textContent = 'Empty';
      tempContainer.appendChild(placeholder);
    }

    return tempContainer;
  }, [displaySets, createImageFromDisplaySet]);

  const handlePrint = useCallback(async () => {
    try {
      setIsLoading(true);

      // Filter out hidden images for printing
      const visibleDisplaySets = displaySets.filter(
        (ds: any) => !hiddenImages.has(ds.displaySetInstanceUID)
      );
      console.log(
        'Starting print process with',
        visibleDisplaySets.length,
        'visible images (',
        hiddenImages.size,
        'hidden)'
      );

      // Use selected grid layout
      let gridConfig;
      if (selectedGrid === '1x2') {
        gridConfig = { cols: 1, rows: 2, imagesPerPage: 2, name: '1x2' };
      } else if (selectedGrid === '2x4') {
        gridConfig = { cols: 2, rows: 4, imagesPerPage: 8, name: '2x4' };
      } else {
        gridConfig = { cols: 2, rows: 5, imagesPerPage: 10, name: '2x5' };
      }

      console.log(`Using ${gridConfig.name} grid layout for ${visibleDisplaySets.length} images`);

      const totalPages = Math.ceil(visibleDisplaySets.length / gridConfig.imagesPerPage);

      // Calculate dimensions for A4 page (210mm x 297mm) - more compact
      const a4Width = 200; // 210mm - 10mm margins
      const a4Height = 280; // Reduced from 287mm to prevent cropping
      const headerHeight = 8; // Reduced header space in mm
      const gridPadding = 6; // Top, left, and right padding in mm (further increased left margin)
      const availableHeight = a4Height - headerHeight - gridPadding; // Available space for grid (minus top padding)
      const availableWidth = a4Width - gridPadding * 2; // Available width (minus left and right padding)
      const gap = 2; // Reduced gap between items in mm

      // Calculate grid item dimensions
      const totalGapWidth = (gridConfig.cols - 1) * gap;
      const totalGapHeight = (gridConfig.rows - 1) * gap;
      const itemWidth = (availableWidth - totalGapWidth) / gridConfig.cols;
      const itemHeight = (availableHeight - totalGapHeight) / gridConfig.rows;

      console.log(`Grid calculations for ${gridConfig.name}:`, {
        a4Dimensions: `${a4Width}mm x ${a4Height}mm`,
        headerHeight: `${headerHeight}mm`,
        gridPadding: `${gridPadding}mm (further increased left margin)`,
        availableHeight: `${availableHeight}mm`,
        availableWidth: `${availableWidth}mm`,
        gaps: `${gap}mm between items`,
        totalGapWidth: `${totalGapWidth}mm`,
        totalGapHeight: `${totalGapHeight}mm`,
        itemWidth: `${itemWidth.toFixed(1)}mm`,
        itemHeight: `${itemHeight.toFixed(1)}mm`,
        totalItems: gridConfig.imagesPerPage,
        gridLayout: `${gridConfig.cols}x${gridConfig.rows}`,
      });

      // Create a simple HTML string for printing
      let printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @page {
              size: A4;
              margin: 5mm;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
              font-family: Arial, sans-serif;
            }
                        .page {
              width: 200mm;
              height: 280mm;
              page-break-after: always;
              display: flex;
              flex-direction: column;
              background: white;
              overflow: hidden;
              box-sizing: border-box;
            }
                                                .header {
              display: flex;
              justify-content: space-between;
              padding: 4mm 8mm 1mm 8mm;
              border-bottom: 1px solid #ccc;
              font-size: 12px;
              font-weight: bold;
              background: white;
              height: ${headerHeight}mm;
              flex-shrink: 0;
              box-sizing: border-box;
            }
                        .grid {
              display: grid;
              grid-template-columns: repeat(${gridConfig.cols}, ${itemWidth.toFixed(1)}mm);
              grid-template-rows: repeat(${gridConfig.rows}, ${itemHeight.toFixed(1)}mm);
              gap: ${gap}mm;
              width: 200mm;
              height: ${availableHeight}mm;
              background: white;
              justify-content: start;
              align-content: start;
              box-sizing: border-box;
              margin: 0;
              padding: 8mm 8mm 0 8mm;
            }
            .grid-item {
              background: white;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
              padding: 0;
              border: none;
              width: ${itemWidth.toFixed(1)}mm;
              height: ${itemHeight.toFixed(1)}mm;
              max-width: ${itemWidth.toFixed(1)}mm;
              max-height: ${itemHeight.toFixed(1)}mm;
              overflow: hidden;
              box-sizing: border-box;
            }
            .grid-item img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              margin: 0;
              padding: 0;
              border: none;
            }
          </style>
        </head>
        <body>
      `;

      // Build patient info string
      const patientInfoParts = [];
      if (patientInfo.PatientName && patientInfo.PatientName !== 'Unknown') {
        patientInfoParts.push(patientInfo.PatientName);
      }
      if (patientInfo.PatientAge && patientInfo.PatientAge !== 'Unknown') {
        patientInfoParts.push(`Age: ${patientInfo.PatientAge}`);
      }
      if (patientInfo.PatientSex && patientInfo.PatientSex !== 'Unknown') {
        patientInfoParts.push(`Sex: ${patientInfo.PatientSex}`);
      }
      if (patientInfo.PatientID && patientInfo.PatientID !== 'Unknown') {
        patientInfoParts.push(`ID: ${patientInfo.PatientID}`);
      }
      const patientInfoString =
        patientInfoParts.length > 0 ? patientInfoParts.join(' | ') : 'Patient Information';

      // Get all the preview canvases
      const previewElements = document.querySelectorAll('.us-image-preview canvas');
      console.log(`Found ${previewElements.length} preview canvases`);

      // Create each page
      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const startIndex = pageIndex * gridConfig.imagesPerPage;
        const endIndex = Math.min(startIndex + gridConfig.imagesPerPage, visibleDisplaySets.length);

        printHTML += `
          <div class="page">
            <div class="header">
              <span>${patientInfoString}</span>
              <span>Page ${pageIndex + 1} of ${totalPages}</span>
            </div>
            <div class="grid">
        `;

        // Add grid items
        for (let gridIndex = 0; gridIndex < gridConfig.imagesPerPage; gridIndex++) {
          const imageIndex = startIndex + gridIndex;

          if (imageIndex < visibleDisplaySets.length && previewElements[imageIndex]) {
            const sourceCanvas = previewElements[imageIndex] as HTMLCanvasElement;
            const dataURL = sourceCanvas.toDataURL('image/png', 1.0);

            printHTML += `
              <div class="grid-item">
                <img src="${dataURL}" style="width: ${itemWidth.toFixed(1)}mm; height: ${itemHeight.toFixed(1)}mm; object-fit: cover; margin: 0; padding: 0; border: none;" />
              </div>
            `;
          } else {
            // Empty white slot
            printHTML += `<div class="grid-item"></div>`;
          }
        }

        printHTML += `
            </div>
          </div>
        `;
      }

      printHTML += `
        </body>
        </html>
      `;

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printHTML);
        printWindow.document.close();

        // Wait for images to load
        await new Promise(resolve => setTimeout(resolve, 1000));

        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }

      setIsLoading(false);
      console.log('Print process completed');
    } catch (error) {
      console.error('Print failed:', error);
      setIsLoading(false);
    }
  }, [displaySets, patientInfo, selectedGrid]);

  const handleDownload = useCallback(async () => {
    try {
      setIsLoading(true);

      // Create temporary container with all US images
      const tempContainer = await createTemporaryViewports();

      // Use html2canvas to capture the grid
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: 'white',
        scale: 3, // Even higher resolution for download
        useCORS: true,
        allowTaint: true,
        width: tempContainer.scrollWidth,
        height: tempContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        imageTimeout: 15000,
        removeContainer: false,
      });

      // Download the image
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      // Cleanup
      if (tempContainer.parentNode) {
        document.body.removeChild(tempContainer);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Download failed:', error);
      setIsLoading(false);
    }
  }, [createTemporaryViewports, filename, displaySets, hiddenImages]);

  const renderScrollablePreview = useCallback(() => {
    if (isLoading) {
      return (
        <div className="us-capture-loading">
          <div>Loading US images...</div>
        </div>
      );
    }

    // Filter out hidden images
    const visibleDisplaySets = displaySets.filter(
      (ds: any) => !hiddenImages.has(ds.displaySetInstanceUID)
    );

    if (visibleDisplaySets.length === 0) {
      return (
        <div className="us-capture-empty">
          <div>No visible US images</div>
          <p className="mt-2 text-sm text-gray-600">
            {displaySets.length > 0
              ? `${displaySets.length} images hidden. Refresh to show all images.`
              : 'Make sure you have ultrasound (US) images loaded in the current study.'}
          </p>
        </div>
      );
    }

    // Calculate pages (8 images per A4 page in 2x4 grid)
    // Calculate pages based on selected grid layout
    const imagesPerPage = selectedGrid === '1x2' ? 2 : selectedGrid === '2x4' ? 8 : 10;
    const totalPages = Math.ceil(visibleDisplaySets.length / imagesPerPage);
    const gridCols = selectedGrid === '1x2' ? 1 : 2;
    const gridRows = selectedGrid === '1x2' ? 2 : selectedGrid === '2x4' ? 4 : 5;

    return (
      <div className="us-scrollable-container">
        {/* Scrollable Content */}
        <div className="us-scrollable-content">
          {Array.from({ length: totalPages }).map((_, pageIndex) => {
            const startIndex = pageIndex * imagesPerPage;
            const endIndex = Math.min(startIndex + imagesPerPage, visibleDisplaySets.length);
            const pageImages = visibleDisplaySets.slice(startIndex, endIndex);

            return (
              <div
                key={pageIndex}
                className="us-page-container"
                data-page={pageIndex + 1}
              >
                {/* Page Header */}
                <div className="us-page-header">
                  <h4>
                    Page {pageIndex + 1} of {totalPages}
                  </h4>
                  <span className="text-sm text-gray-500">
                    Images {startIndex + 1}-{endIndex} of {visibleDisplaySets.length}
                    {hiddenImages.size > 0 && ` (${hiddenImages.size} hidden)`}
                  </span>
                </div>

                {/* 2x4 Grid for this page */}
                <div
                  className="us-page-grid"
                  style={{
                    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                    gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                  }}
                >
                  {Array.from({ length: imagesPerPage }).map((_, gridIndex) => {
                    const imageIndex = startIndex + gridIndex;
                    const image = pageImages[gridIndex];

                    return (
                      <div
                        key={gridIndex}
                        className="us-grid-item"
                      >
                        {image ? (
                          <div className="us-image-card">
                            <USImagePreview
                              displaySet={image}
                              index={imageIndex}
                              viewportGridService={viewportGridService}
                              cornerstoneViewportService={cornerstoneViewportService}
                              onHide={hideImage}
                            />
                          </div>
                        ) : (
                          <div className="us-empty-grid-slot">{/* Empty white space */}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [isLoading, displaySets, selectedGrid, hiddenImages, hideImage]);

  return (
    <div className="us-capture-modal-content">
      {/* Grid Layout Selector */}
      <div className="us-grid-selector">
        <div className="us-grid-selector-header">
          <h4>Choose Grid Layout:</h4>
          <span className="text-sm text-gray-600">
            {displaySets.filter((ds: any) => !hiddenImages.has(ds.displaySetInstanceUID)).length}{' '}
            visible images
            {hiddenImages.size > 0 && ` (${hiddenImages.size} hidden)`} • Selected: {selectedGrid}(
            {selectedGrid === '1x2' ? '2' : selectedGrid === '2x4' ? '8' : '10'} images per page)
          </span>
        </div>
        <div className="us-grid-options">
          <button
            onClick={() => setSelectedGrid('1x2')}
            className={`us-grid-option ${selectedGrid === '1x2' ? 'active' : ''}`}
          >
            <div className="grid-preview">
              <div className="grid-1x2">
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
              </div>
            </div>
            <span>1×2</span>
            <small>Large Images</small>
          </button>

          <button
            onClick={() => setSelectedGrid('2x4')}
            className={`us-grid-option ${selectedGrid === '2x4' ? 'active' : ''}`}
          >
            <div className="grid-preview">
              <div className="grid-2x4">
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
              </div>
            </div>
            <span>2×4</span>
            <small>Standard</small>
          </button>

          <button
            onClick={() => setSelectedGrid('2x5')}
            className={`us-grid-option ${selectedGrid === '2x5' ? 'active' : ''}`}
          >
            <div className="grid-preview">
              <div className="grid-2x5">
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
                <div className="grid-cell"></div>
              </div>
            </div>
            <span>2×5</span>
            <small>Compact</small>
          </button>
          <div
            className="us-capture-header-right"
            style={{ marginTop: '10px', marginLeft: 'auto' }}
          >
            <Button
              onClick={handlePrint}
              disabled={
                isLoading ||
                displaySets.filter((ds: any) => !hiddenImages.has(ds.displaySetInstanceUID))
                  .length === 0
              }
              className="bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {isLoading ? 'Printing...' : 'Print'}
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Preview */}
      {renderScrollablePreview()}
    </div>
  );
};

export default USCaptureModal;
