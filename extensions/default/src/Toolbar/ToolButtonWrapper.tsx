import React from 'react';
import { useIconPresentation, Icons, Button } from '@ohif/ui-next';

export default function ToolButtonWrapper(props) {
  const { IconContainer, containerProps } = useIconPresentation();

  const { id, icon, disabled, commands, onInteraction, ...rest } = props;
  const Icon = <Icons.ByName name={icon} />;

  const handleClick = () => {
    if (disabled) {
      return;
    }
    onInteraction?.({ itemId: id, commands });
  };

  return (
    <div>
      {IconContainer ? (
        <IconContainer
          disabled={disabled}
          onClick={handleClick}
          {...rest}
          {...containerProps}
        >
          {Icon}
        </IconContainer>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={handleClick}
        >
          {Icon}
        </Button>
      )}
    </div>
  );
}

export { ToolButtonWrapper };
