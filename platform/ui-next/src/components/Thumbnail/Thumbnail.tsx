import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useDrag } from 'react-dnd';
import { Icons } from '../Icons';
import { DisplaySetMessageListTooltip } from '../DisplaySetMessageListTooltip';
import { TooltipTrigger, TooltipContent, Tooltip } from '../Tooltip';
import { useSystem } from '@ohif/core';
import { useEffect } from 'react';

/**
 * Display a thumbnail for a display set.
 */
const Thumbnail = ({
  displaySetInstanceUID,
  className,
  imageSrc,
  imageAltText,
  description,
  seriesNumber,
  numInstances,
  loadingProgress,
  countIcon,
  messages,
  isActive,
  onClick,
  onDoubleClick,
  thumbnailType,
  modality,
  viewPreset = 'thumbnails',
  isHydratedForDerivedDisplaySet = false,
  isTracked = false,
  canReject = false,
  dragData = {},
  onReject = () => {},
  onClickUntrack = () => {},
  ThumbnailMenuItems = () => {},
}: withAppTypes): React.ReactNode => {
  const { servicesManager } = useSystem();
  const { studyPrefetcherService } = servicesManager.services;

  const [loadingProgressFromPrefetcher, setLoadingProgressFromPrefetcher] = useState(0);

  const _displaySetLoadingStates = studyPrefetcherService._displaySetLoadingStates;

  useEffect(() => {
    const interval = setInterval(() => {
      const currentProgress = _displaySetLoadingStates.get(displaySetInstanceUID)?.loadingProgress || 0;
      setLoadingProgressFromPrefetcher(currentProgress);

      if (currentProgress >= 1) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [displaySetInstanceUID, _displaySetLoadingStates]);



  // TODO: We should wrap our thumbnail to create a "DraggableThumbnail", as
  // this will still allow for "drag", even if there is no drop target for the
  // specified item.
  const [collectedProps, drag, dragPreview] = useDrag({
    type: 'displayset',
    item: { ...dragData },
    canDrag: function (monitor) {
      return Object.keys(dragData).length !== 0;
    },
  });

  const [lastTap, setLastTap] = useState(0);

  const handleTouchEnd = e => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected - open the series
      onDoubleClick(e);
    }
    // Single tap is ignored to prevent opening series while scrolling
    setLastTap(currentTime);
  };

  const renderThumbnailPreset = () => {
    return (
      <div
        className={classnames(
          'flex h-full w-full flex-col items-center justify-center gap-[4px] px-[8px] py-[12px]',
          isActive && 'bg-popover rounded'
        )}
      >
        <div className="h-[150px] w-[180px]">
          <div className="relative">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={imageAltText}
                className="h-[150px] w-[180px] rounded object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="bg-background h-[150px] w-[180px] rounded"></div>
            )}


            {/* top right */}
            <div className="absolute top-0 right-0 flex items-center gap-[4px]">
              <DisplaySetMessageListTooltip
                messages={messages}
                id={`display-set-tooltip-${displaySetInstanceUID}`}
              />
              {isTracked && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="group">
                      <Icons.StatusTracking className="text-primary-light h-[15px] w-[15px] group-hover:hidden" />
                      <Icons.Cancel
                        className="text-primary-light hidden h-[15px] w-[15px] group-hover:block"
                        onClick={onClickUntrack}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="flex flex-1 flex-row">
                      <div className="flex-2 flex items-center justify-center pr-4">
                        <Icons.InfoLink className="text-primary" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <span>
                          <span className="text-white">
                            {isTracked ? 'Series is tracked' : 'Series is untracked'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {/* bottom right */}
            <div className="absolute bottom-0 right-0 flex items-center gap-[4px] p-[4px]">
              <ThumbnailMenuItems
                displaySetInstanceUID={displaySetInstanceUID}
                canReject={canReject}
                onReject={onReject}
              />
            </div>
          </div>
        </div>
        <div className="flex h-[60px] w-[180px] flex-col justify-start pt-[4px]">
          <Tooltip>
            <TooltipContent>{description}</TooltipContent>
            <TooltipTrigger>
              <div className="min-h-[18px] w-[180px] overflow-hidden text-ellipsis whitespace-nowrap pb-0.5 pl-1 text-left text-[13px] font-normal leading-4 text-white">
                {description}
              </div>
            </TooltipTrigger>
          </Tooltip>
          <div className="flex h-[14px] items-center gap-[8px] overflow-hidden px-1">
          <div className="text-[12px] font-semibold text-white flex-shrink-0">{modality}</div>
            <div className="text-muted-foreground text-[12px] flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"> S:{seriesNumber}</div>
            <div className="text-muted-foreground text-[12px] flex-shrink-0 ml-auto">
              <div className="flex items-center gap-[4px]">
                {countIcon ? (
                  React.createElement(Icons[countIcon] || Icons.MissingIcon, { className: 'w-3' })
                ) : (
                  <Icons.InfoSeries className="w-3" />
                )}
                <div>{numInstances}</div>
              {loadingProgressFromPrefetcher && loadingProgressFromPrefetcher < 1 ? (
                <div className="flex items-center gap-2 ml-2">
                  <div className="animate-spin h-[10px] w-[10px] border-2 border-white border-t-transparent rounded-full"></div>
                  <span className="text-[11px] font-semibold text-white">
                    {Math.round(loadingProgressFromPrefetcher * 100)}%
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-[11px] font-semibold text-white">
                    {Math.round(loadingProgressFromPrefetcher * 100)}%
                  </span>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderListPreset = () => {
    return (
      <div
        className={classnames(
          'flex h-full w-full items-center justify-between pr-[8px] pl-[8px] pt-[4px] pb-[4px]',
          isActive && 'bg-popover rounded'
        )}
      >
        <div className="relative flex h-[32px] w-full items-center gap-[8px] overflow-hidden">
          <div
            className={classnames(
              'h-[32px] w-[4px] min-w-[4px] rounded',
              isActive || isHydratedForDerivedDisplaySet ? 'bg-highlight' : 'bg-primary/65',
              loadingProgress && loadingProgress < 1 && 'bg-primary/25'
            )}
          ></div>
          <div className="flex h-full w-[calc(100%-12px)] flex-col justify-start">
            <div className="flex items-center gap-[7px]">
              <div className="text-[13px] font-semibold text-white">{modality}</div>
              <Tooltip>
                <TooltipContent>{description}</TooltipContent>
                <TooltipTrigger className="w-full overflow-hidden">
                  <div className="max-w-[160px] overflow-hidden overflow-ellipsis whitespace-nowrap text-left text-[13px] font-normal text-white">
                    {description}
                  </div>
                </TooltipTrigger>
              </Tooltip>
            </div>

            <div className="flex h-[12px] items-center gap-[7px] overflow-hidden">
              <div className="text-muted-foreground text-[12px]"> S:{seriesNumber}</div>
              <div className="text-muted-foreground text-[12px]">
                <div className="flex items-center gap-[4px]">
                  {' '}
                  {countIcon ? (
                    React.createElement(Icons[countIcon] || Icons.MissingIcon, { className: 'w-3' })
                  ) : (
                    <Icons.InfoSeries className="w-3" />
                  )}
                  <div>{numInstances}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex h-full items-center gap-[4px]">
          <DisplaySetMessageListTooltip
            messages={messages}
            id={`display-set-tooltip-${displaySetInstanceUID}`}
          />
          {isTracked && (
            <Tooltip>
              <TooltipTrigger>
                <div className="group">
                  <Icons.StatusTracking className="text-primary-light h-[20px] w-[15px] group-hover:hidden" />
                  <Icons.Cancel
                    className="text-primary-light hidden h-[15px] w-[15px] group-hover:block"
                    onClick={onClickUntrack}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex flex-1 flex-row">
                  <div className="flex-2 flex items-center justify-center pr-4">
                    <Icons.InfoLink className="text-primary" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span>
                      <span className="text-white">
                        {isTracked ? 'Series is tracked' : 'Series is untracked'}
                      </span>
                    </span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
          <ThumbnailMenuItems
            displaySetInstanceUID={displaySetInstanceUID}
            canReject={canReject}
            onReject={onReject}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className={classnames(
        className,
        'bg-muted hover:bg-primary/30 group flex cursor-pointer select-none flex-col rounded outline-none',
        viewPreset === 'thumbnails' && 'h-[200px] w-[200px] min-w-[200px]',
        viewPreset === 'list' && 'h-[40px] w-full'
      )}
      id={`thumbnail-${displaySetInstanceUID}`}
      data-cy={
        thumbnailType === 'thumbnailNoImage'
          ? 'study-browser-thumbnail-no-image'
          : 'study-browser-thumbnail'
      }
      data-series={seriesNumber}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onTouchEnd={handleTouchEnd}
      role="button"
    >
      <div
        ref={drag}
        className="h-full w-full"
      >
        {viewPreset === 'thumbnails' && renderThumbnailPreset()}
        {viewPreset === 'list' && renderListPreset()}
      </div>
    </div>
  );
};

Thumbnail.propTypes = {
  displaySetInstanceUID: PropTypes.string.isRequired,
  className: PropTypes.string,
  imageSrc: PropTypes.string,
  /**
   * Data the thumbnail should expose to a receiving drop target. Use a matching
   * `dragData.type` to identify which targets can receive this draggable item.
   * If this is not set, drag-n-drop will be disabled for this thumbnail.
   *
   * Ref: https://react-dnd.github.io/react-dnd/docs/api/use-drag#specification-object-members
   */
  dragData: PropTypes.shape({
    /** Must match the "type" a dropTarget expects */
    type: PropTypes.string.isRequired,
  }),
  imageAltText: PropTypes.string,
  description: PropTypes.string.isRequired,
  seriesNumber: PropTypes.any,
  numInstances: PropTypes.number.isRequired,
  loadingProgress: PropTypes.number,
  messages: PropTypes.object,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
  viewPreset: PropTypes.string,
  modality: PropTypes.string,
  isHydratedForDerivedDisplaySet: PropTypes.bool,
  isTracked: PropTypes.bool,
  onClickUntrack: PropTypes.func,
  countIcon: PropTypes.string,
  thumbnailType: PropTypes.oneOf(['thumbnail', 'thumbnailTracked', 'thumbnailNoImage']),
};

export { Thumbnail };
