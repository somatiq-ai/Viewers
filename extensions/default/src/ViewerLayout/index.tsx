import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import { InvestigationalUseDialog } from '@ohif/ui-next';
import { HangingProtocolService, CommandsManager } from '@ohif/core';
import { useAppConfig } from '@state';
import ViewerHeader from './ViewerHeader';
import SidePanelWithServices from '../Components/SidePanelWithServices';
import { Onboarding, ResizablePanelGroup, ResizablePanel, ResizableHandle, Button, Icons } from '@ohif/ui-next';
import useResizablePanels from './ResizablePanelsHook';
import { WrappedPanelStudyBrowser } from '../Panels';
import { Toolbar } from '../Toolbar/Toolbar';

const resizableHandleClassName = 'mt-[1px] bg-black';

function ViewerLayout({
  // From Extension Module Params
  extensionManager,
  servicesManager,
  hotkeysManager,
  commandsManager,
  // From Modes
  viewports,
  ViewportGridComp,
  leftPanelClosed = false,
  rightPanelClosed = false,
  leftPanelResizable = false,
  rightPanelResizable = false,
  leftPanelInitialExpandedWidth,
  rightPanelInitialExpandedWidth,
  leftPanelMinimumExpandedWidth,
  rightPanelMinimumExpandedWidth,
}: withAppTypes): React.FunctionComponent {
  const [appConfig] = useAppConfig();

  const { panelService, hangingProtocolService, customizationService } = servicesManager.services;
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(appConfig.showLoadingIndicator);

  const hasPanels = useCallback(
    (side): boolean => !!panelService.getPanels(side).length,
    [panelService]
  );

  const [hasRightPanels, setHasRightPanels] = useState(hasPanels('right'));
  const [hasLeftPanels, setHasLeftPanels] = useState(hasPanels('left'));
  const [leftPanelClosedState, setLeftPanelClosed] = useState(leftPanelClosed);
  const [rightPanelClosedState, setRightPanelClosed] = useState(rightPanelClosed);

  const [
    leftPanelProps,
    rightPanelProps,
    resizablePanelGroupProps,
    resizableLeftPanelProps,
    resizableViewportGridPanelProps,
    resizableRightPanelProps,
    onHandleDragging,
  ] = useResizablePanels(
    leftPanelClosed,
    setLeftPanelClosed,
    rightPanelClosed,
    setRightPanelClosed,
    hasLeftPanels,
    hasRightPanels,
    leftPanelInitialExpandedWidth,
    rightPanelInitialExpandedWidth,
    leftPanelMinimumExpandedWidth,
    rightPanelMinimumExpandedWidth
  );

  const handleMouseEnter = () => {
    (document.activeElement as HTMLElement)?.blur();
  };

  const LoadingIndicatorProgress = customizationService.getCustomization(
    'ui.loadingIndicatorProgress'
  );

  /**
   * Set body classes (tailwindcss) that don't allow vertical
   * or horizontal overflow (no scrolling). Also guarantee window
   * is sized to our viewport.
   */
  useEffect(() => {
    document.body.classList.add('bg-black');
    document.body.classList.add('overflow-hidden');

    return () => {
      document.body.classList.remove('bg-black');
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  const getComponent = id => {
    const entry = extensionManager.getModuleEntry(id);

    if (!entry || !entry.component) {
      throw new Error(
        `${id} is not valid for an extension module or no component found from extension ${id}. Please verify your configuration or ensure that the extension is properly registered. It's also possible that your mode is utilizing a module from an extension that hasn't been included in its dependencies (add the extension to the "extensionDependencies" array in your mode's index.js file). Check the reference string to the extension in your Mode configuration`
      );
    }

    return { entry };
  };

  useEffect(() => {
    const { unsubscribe } = hangingProtocolService.subscribe(
      HangingProtocolService.EVENTS.PROTOCOL_CHANGED,

      // Todo: right now to set the loading indicator to false, we need to wait for the
      // hangingProtocolService to finish applying the viewport matching to each viewport,
      // however, this might not be the only approach to set the loading indicator to false. we need to explore this further.
      () => {
        setShowLoadingIndicator(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [hangingProtocolService]);

  const getViewportComponentData = viewportComponent => {
    const { entry } = getComponent(viewportComponent.namespace);

    return {
      component: entry.component,
      isReferenceViewable: entry.isReferenceViewable,
      displaySetsToDisplay: viewportComponent.displaySetsToDisplay,
    };
  };

  useEffect(() => {
    const { unsubscribe } = panelService.subscribe(
      panelService.EVENTS.PANELS_CHANGED,
      ({ options }) => {
        setHasLeftPanels(hasPanels('left'));
        setHasRightPanels(hasPanels('right'));
        if (options?.leftPanelClosed !== undefined) {
          setLeftPanelClosed(options.leftPanelClosed);
        }
        if (options?.rightPanelClosed !== undefined) {
          setRightPanelClosed(options.rightPanelClosed);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [panelService, hasPanels]);

  const viewportComponents = (viewports as any[]).map(getViewportComponentData);

  // Mobile detection
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showStudyBrowserOnMobile, setShowStudyBrowserOnMobile] = useState<boolean>(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 768px)');
    const updateIsMobile = () => setIsMobile(query.matches);
    updateIsMobile();
    query.addEventListener?.('change', updateIsMobile);
    return () => query.removeEventListener?.('change', updateIsMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setShowStudyBrowserOnMobile(true);
    } else {
      setShowStudyBrowserOnMobile(false);
    }
  }, [isMobile]);

  // Listen for mobile back to series event from close viewport
  useEffect(() => {
    const handleBackToSeries = () => {
      if (isMobile) {
        setShowStudyBrowserOnMobile(true);
      }
    };

    window.addEventListener('ohif-mobile-back-to-series', handleBackToSeries);
    return () => window.removeEventListener('ohif-mobile-back-to-series', handleBackToSeries);
  }, [isMobile]);

  const MobileStudiesToggle = ({ onClick }: { onClick: () => void }) => (
    <Button
      variant="ghost"
      className="hover:bg-primary-dark"
      onClick={onClick}
    >
      <Icons.GroupLayers className="mr-2" />
      Studies
    </Button>
  );

  return (
    <div className={`${isMobile ? 'h-[calc(100dvh-64px)]' : 'h-screen'} w-full overflow-hidden flex flex-col`}>
      <ViewerHeader
        hotkeysManager={hotkeysManager}
        extensionManager={extensionManager}
        servicesManager={servicesManager}
        appConfig={appConfig}
        isMobile={isMobile}
        hideToolbars={isMobile}
        onClickOpenStudies={() => setShowStudyBrowserOnMobile(true)}
        showStudyBrowserOnMobile={showStudyBrowserOnMobile}
      />
      {isMobile ? (
        <div
          className="relative flex w-full flex-1 flex-row flex-nowrap items-stretch overflow-hidden bg-black"
          style={{
            overscrollBehavior: 'none',
            touchAction: 'none'
          }}
        >
          <div className="flex h-full w-full flex-1 flex-col" style={{ overscrollBehavior: 'none' }}>
            <div className="relative flex h-full flex-1 overflow-hidden bg-black" style={{ overscrollBehavior: 'none' }}>
              {showLoadingIndicator && (
                <LoadingIndicatorProgress className="absolute inset-0 h-full w-full bg-black" />
              )}
              {/* Keep viewport grid mounted; toggle visibility to avoid cache purge */}
              <div
                className={`absolute inset-0 ${showStudyBrowserOnMobile ? 'invisible pointer-events-none' : 'visible'}`}
                onMouseEnter={handleMouseEnter}
                style={{ overscrollBehavior: 'none', touchAction: 'none' }}
              >
                <ViewportGridComp
                  servicesManager={servicesManager}
                  viewportComponents={viewportComponents}
                  commandsManager={commandsManager}
                />
              </div>
              {/* Studies overlay */}
              {showStudyBrowserOnMobile && (
                <div className="absolute inset-0 h-full w-full overflow-y-auto bg-black">
                  <WrappedPanelStudyBrowser
                    onMobileOpenViewportGrid={() => setShowStudyBrowserOnMobile(false)}
                  />
                </div>
              )}
              {/* Mobile bottom toolbar footer */}
              {!showStudyBrowserOnMobile && (
                <div className="h-[64px] pointer-events-auto fixed bottom-0 left-0 right-0 z-10 bg-black/80 backdrop-blur">
                  <div className="mx-auto flex max-w-[1000px] items-center justify-between px-3 py-2">
                    <Toolbar
                      servicesManager={servicesManager}
                      buttonSection="primary"
                      allowedIds={[
                        'MeasurementTools',
                        'Zoom',
                        'Pan',
                        'WindowLevel',
                        'TwoPanel',
                        'MPR',
                        'StackScroll',
                        'MoreTools',
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="relative flex w-full flex-1 flex-row flex-nowrap items-stretch overflow-hidden bg-black"
          style={{ overscrollBehavior: 'none' }}
        >
          <React.Fragment>
            {showLoadingIndicator && <LoadingIndicatorProgress className="h-full w-full bg-black" />}
            <ResizablePanelGroup {...resizablePanelGroupProps}>
              {/* LEFT SIDEPANELS */}
              {hasLeftPanels ? (
                <>
                  <ResizablePanel {...resizableLeftPanelProps}>
                    <SidePanelWithServices
                      side="left"
                      isExpanded={!leftPanelClosedState}
                      servicesManager={servicesManager}
                      {...leftPanelProps}
                    />
                  </ResizablePanel>
                  <ResizableHandle
                    onDragging={onHandleDragging}
                    disabled={!leftPanelResizable}
                    className={resizableHandleClassName}
                  />
                </>
              ) : null}
              {/* TOOLBAR + GRID */}
              <ResizablePanel {...resizableViewportGridPanelProps}>
                <div className="flex h-full flex-1 flex-col">
                  <div
                    className="relative flex h-full flex-1 items-center justify-center overflow-hidden bg-black"
                    onMouseEnter={handleMouseEnter}
                  >
                    <ViewportGridComp
                      servicesManager={servicesManager}
                      viewportComponents={viewportComponents}
                      commandsManager={commandsManager}
                    />
                  </div>
                </div>
              </ResizablePanel>
              {hasRightPanels ? (
                <>
                  <ResizableHandle
                    onDragging={onHandleDragging}
                    disabled={!rightPanelResizable}
                    className={resizableHandleClassName}
                  />
                  <ResizablePanel {...resizableRightPanelProps}>
                    <SidePanelWithServices
                      side="right"
                      isExpanded={!rightPanelClosedState}
                      servicesManager={servicesManager}
                      {...rightPanelProps}
                    />
                  </ResizablePanel>
                </>
              ) : null}
            </ResizablePanelGroup>
          </React.Fragment>
        </div>
      )}
      <Onboarding tours={customizationService.getCustomization('ohif.tours')} />
      <InvestigationalUseDialog dialogConfiguration={appConfig?.investigationalUseDialog} />
    </div>
  );
}

ViewerLayout.propTypes = {
  // From extension module params
  extensionManager: PropTypes.shape({
    getModuleEntry: PropTypes.func.isRequired,
  }).isRequired,
  commandsManager: PropTypes.instanceOf(CommandsManager),
  servicesManager: PropTypes.object.isRequired,
  // From modes
  leftPanels: PropTypes.array,
  rightPanels: PropTypes.array,
  leftPanelClosed: PropTypes.bool.isRequired,
  rightPanelClosed: PropTypes.bool.isRequired,
  /** Responsible for rendering our grid of viewports; provided by consuming application */
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  viewports: PropTypes.array,
};

export default ViewerLayout;
