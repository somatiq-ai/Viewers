import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Icons,
  Button,
  ToolButton,
} from '../';
import { IconPresentationProvider } from '@ohif/ui-next';

import NavBar from '../NavBar';

// Todo: we should move this component to composition and remove props base

interface HeaderProps {
  children?: ReactNode;
  menuOptions: Array<{
    title: string;
    icon?: string;
    onClick: () => void;
  }>;
  isReturnEnabled?: boolean;
  onClickReturnButton?: () => void;
  isSticky?: boolean;
  Logo?: ReactNode;
  isMobile?: boolean;
  WhiteLabeling?: {
    createLogoComponentFn?: (React: any, props: any) => ReactNode;
  };
  PatientInfo?: ReactNode;
  Secondary?: ReactNode;
  UndoRedo?: ReactNode;
}

function Header({
  children,
  menuOptions,
  isReturnEnabled = true,
  Logo,
  isMobile = false,
  onClickReturnButton,
  isSticky = false,
  WhiteLabeling,
  PatientInfo,
  UndoRedo,
  Secondary,
  ...props
}: HeaderProps): ReactNode {

  return (
    <NavBar
      isSticky={isSticky}
      {...props}
    >
      <div className="relative h-[48px] items-center">
        <div className="absolute left-0 top-1/2 flex -translate-y-1/2 items-center">
          {Logo}
          <div className="mr-3 inline-flex items-center"> {PatientInfo}</div>
        </div>

        <div className="absolute right-0 top-1/2 flex -translate-y-1/2 select-none items-center">
          <div className="flex items-center justify-center space-x-2">{children}</div>
          {UndoRedo}
          <div className="border-primary-dark mx-1.5 h-[25px] border-r"></div>
          <div className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:bg-primary-dark mt-2 h-full w-full"
                >
                  <Icons.GearSettings />
                </Button>
                ) }
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {menuOptions.map((option, index) => {
                  const IconComponent = option.icon
                    ? Icons[option.icon as keyof typeof Icons]
                    : null;
                  return (
                    <DropdownMenuItem
                      key={index}
                      onSelect={option.onClick}
                      className="flex items-center gap-2 py-2"
                    >
                      {IconComponent && (
                        <span className="flex h-4 w-4 items-center justify-center">
                          <Icons.ByName name={IconComponent.toString()} />
                        </span>
                      )}
                      <span className="flex-1">{option.title}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </NavBar>
  );
}

export default Header;
