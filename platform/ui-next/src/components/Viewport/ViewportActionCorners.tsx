import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

/**
 * A small container that can render multiple "corner" items (like icons, status)
 * in each corner of the viewport: top-left, top-right, bottom-left, bottom-right.
 */
export enum ViewportActionCornersLocations {
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  topMiddle,
  bottomMiddle,
  leftMiddle,
  rightMiddle,
}

const commonClasses = 'pointer-events-auto flex items-center';
const locationClasses = {
  [ViewportActionCornersLocations.topLeft]: classNames(
    commonClasses,
    'absolute top-[4px] left-[0px] pl-[4px]'
  ),
  [ViewportActionCornersLocations.topRight]: classNames(
    commonClasses,
    'absolute top-[4px] right-[16px] right-viewport-scrollbar'
  ),
  [ViewportActionCornersLocations.bottomLeft]: classNames(
    commonClasses,
    'absolute bottom-[3px] left-[0px] pl-[4px]'
  ),
  [ViewportActionCornersLocations.bottomRight]: classNames(
    commonClasses,
    'absolute bottom-[3px] right-[16px] right-viewport-scrollbar'
  ),
  [ViewportActionCornersLocations.topMiddle]: classNames(
    commonClasses,
    // Todo: to place on right side of the viewport orientation label
    'absolute top-[25px] left-1/2 -translate-x-1/2'
  ),
  [ViewportActionCornersLocations.bottomMiddle]: classNames(
    commonClasses,
    'absolute bottom-[3px] left-1/2 -translate-x-1/2'
  ),
  [ViewportActionCornersLocations.leftMiddle]: classNames(
    commonClasses,
    'absolute left-[20px] top-[calc(50%+2px)] -translate-y-1/2 pl-[4px]'
  ),
  [ViewportActionCornersLocations.rightMiddle]: classNames(
    commonClasses,
    'absolute right-[16px] top-1/2 -translate-y-1/2 right-viewport-scrollbar'
  ),
};

function ViewportActionCorners({ cornerComponents }) {
  if (!cornerComponents) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute h-full w-full select-none z-10"
      onDoubleClick={event => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {Object.entries(cornerComponents).map(([location, locationArray]) => (
        <div
          key={location}
          className={locationClasses[location]}
        >
          {locationArray.map(componentInfo => (
            <div key={componentInfo.id}>{componentInfo.component}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

ViewportActionCorners.propTypes = {
  cornerComponents: PropTypes.object.isRequired,
};

// Keep the old API for backwards compatibility
const Container = ({ children }) => (
  <div className="pointer-events-none absolute h-full w-full select-none z-10">
    {children}
  </div>
);

const Corner = ({ location, children }) => (
  <div className={locationClasses[location]}>
    {children}
  </div>
);

const TopLeft = ({ children }) => <Corner location={ViewportActionCornersLocations.topLeft}>{children}</Corner>;
const TopRight = ({ children }) => <Corner location={ViewportActionCornersLocations.topRight}>{children}</Corner>;
const BottomLeft = ({ children }) => <Corner location={ViewportActionCornersLocations.bottomLeft}>{children}</Corner>;
const BottomRight = ({ children }) => <Corner location={ViewportActionCornersLocations.bottomRight}>{children}</Corner>;
const TopMiddle = ({ children }) => <Corner location={ViewportActionCornersLocations.topMiddle}>{children}</Corner>;
const BottomMiddle = ({ children }) => <Corner location={ViewportActionCornersLocations.bottomMiddle}>{children}</Corner>;
const LeftMiddle = ({ children }) => <Corner location={ViewportActionCornersLocations.leftMiddle}>{children}</Corner>;
const RightMiddle = ({ children }) => <Corner location={ViewportActionCornersLocations.rightMiddle}>{children}</Corner>;

// Export both the new and old API
export { ViewportActionCorners };

// Old API for backwards compatibility
ViewportActionCorners.Container = Container;
ViewportActionCorners.TopLeft = TopLeft;
ViewportActionCorners.TopRight = TopRight;
ViewportActionCorners.BottomLeft = BottomLeft;
ViewportActionCorners.BottomRight = BottomRight;
ViewportActionCorners.TopMiddle = TopMiddle;
ViewportActionCorners.BottomMiddle = BottomMiddle;
ViewportActionCorners.LeftMiddle = LeftMiddle;
ViewportActionCorners.RightMiddle = RightMiddle;