import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button, Header, Icons, useModal } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import { Toolbar } from '../Toolbar/Toolbar';
import HeaderPatientInfo from './HeaderPatientInfo';
import { PatientInfoVisibility } from './HeaderPatientInfo/HeaderPatientInfo';
import { preserveQueryParameters } from '@ohif/app';

function ViewerHeader({
  appConfig,
  isMobile,
  hideToolbars,
  onClickOpenStudies,
  showStudyBrowserOnMobile,
}: withAppTypes<{
  appConfig: AppTypes.Config;
  isMobile?: boolean;
  hideToolbars?: boolean;
  onClickOpenStudies?: () => void;
  showStudyBrowserOnMobile?: boolean;
}>) {
  const { servicesManager, extensionManager, commandsManager } = useSystem();
  const { customizationService } = servicesManager.services;

  const navigate = useNavigate();
  const location = useLocation();

  const onClickReturnButton = () => {
    const { pathname } = location;
    const dataSourceIdx = pathname.indexOf('/', 1);

    const dataSourceName = pathname.substring(dataSourceIdx + 1);
    const existingDataSource = extensionManager.getDataSources(dataSourceName);

    const searchQuery = new URLSearchParams();
    if (dataSourceIdx !== -1 && existingDataSource) {
      searchQuery.append('datasources', pathname.substring(dataSourceIdx + 1));
    }
    preserveQueryParameters(searchQuery);

    navigate({
      pathname: '/',
      search: decodeURIComponent(searchQuery.toString()),
    });
  };

  const { t } = useTranslation();
  const { show } = useModal();

  const AboutModal = customizationService.getCustomization(
    'ohif.aboutModal'
  ) as any;

  const UserPreferencesModal = customizationService.getCustomization(
    'ohif.userPreferencesModal'
  ) as any;

  const menuOption =
    {
      title: UserPreferencesModal.menuTitle ?? t('Header:Preferences'),
      icon: 'settings',
      onClick: () =>
        show({
          content: UserPreferencesModal,
          title: UserPreferencesModal.title ?? t('UserPreferencesModal:User preferences'),
          containerClassName:
            UserPreferencesModal?.containerClassName ?? 'flex max-w-4xl p-6 flex-col',
        }),
    };

  if (appConfig.oidc) {
    menuOptions.push({
      title: t('Header:Logout'),
      icon: 'power-off',
      onClick: async () => {
        navigate(`/logout?redirect_uri=${encodeURIComponent(window.location.href)}`);
      },
    });
  }

  return (
    <Header
      menuOption={menuOption}
      isReturnEnabled={!!appConfig.showStudyList}
      onClickReturnButton={onClickReturnButton}
      isMobile={isMobile}
      WhiteLabeling={appConfig.whiteLabeling}
      Secondary={
        hideToolbars ? undefined : (
          <Toolbar
            buttonSection="secondary"
          />
        )
      }
      PatientInfo={
        isMobile
          ? null
          : appConfig.showPatientInfo !== PatientInfoVisibility.DISABLED && (
              <HeaderPatientInfo
                servicesManager={servicesManager}
                appConfig={appConfig}
              />
            )
      }
      Logo={
        (isMobile && !showStudyBrowserOnMobile ) ? (
          <Button
            variant="ghost"
            className="hover:bg-primary-dark flex items-center gap-2"
            onClick={() => {
              onClickOpenStudies?.();
            }}
          >
            <Icons.ArrowLeftBold className="text-white w-5 h-5" />
            <span className="text-sm text-white font-bold">Back</span>
          </Button>
        ) : (
          <div
            className="mr-3 inline-flex items-center"
            data-cy="return-to-work-list"
          >
            <div className="ml-1">
            {appConfig.whiteLabeling?.createLogoComponentFn?.(React, appConfig) || <Icons.OHIFLogo />}
              {/* <Icons.OHIFLogo /> */}
            </div>
          </div>
        )
      }
      UndoRedo={
        <div className="h-10 ml-2 bg-muted border border-ohif-dark rounded-xl text-primary flex cursor-pointer items-center">
          {isMobile ? (
            <>

              <div className="mr-2 pl-2 flex items-center">
                <HeaderPatientInfo
                  appConfig={appConfig}
                />
              </div>
              {/* Undo/Redo buttons for mobile */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-primary-dark p-2"
                  onClick={() => {
                    commandsManager.run('undo');
                  }}
                >
                  <Icons.Undo className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-primary-dark p-2"
                  onClick={() => {
                    commandsManager.run('redo');
                  }}
                >
                  <Icons.Redo className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hover:bg-primary-dark"
                onClick={() => {
                  commandsManager.run('undo');
                }}
              >
                <Icons.Undo className="" />
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-primary-dark"
                onClick={() => {
                  commandsManager.run('redo');
                }}
              >
                <Icons.Redo className="" />
              </Button>
            </>
          )}
        </div>
      }
    >

      {hideToolbars ? null : (
        <div className="relative flex justify-center gap-[4px] ">
          <Toolbar />
        </div>
      )}
    </Header>
  );
}

export default ViewerHeader;
