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
  menuOption: {
    title: string;
    icon?: string;
    onClick: () => void;
  };
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
  menuOption,
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

        <div className="absolute  right-0 top-1/2 flex -translate-y-1/2 select-none items-center">
          <div className=" bg-muted border border-ohif-dark rounded-xl flex items-center justify-center space-x-2">{children}</div>
          {UndoRedo}
          <div className="border-ohif-dark mx-1.5 h-[25px] border-r"></div>
          <div className="flex-shrink-0">

                {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:bg-primary-dark mt-2 h-full w-full"
                >
                  <Icons.GearSettings onClick={menuOption.onClick}/>
                </Button>
                ) }
          </div>
        </div>
      </div>
    </NavBar>
  );
}

export default Header;
