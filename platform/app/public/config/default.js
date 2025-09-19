// Get token from URL parameter or localStorage
function getAuthToken() {
    const urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get('token');

    if (token) {
        // Store token if found in URL
        localStorage.setItem('risAuthToken', token);
    } else {
        // Get from localStorage if not in URL
        token = localStorage.getItem('risAuthToken');

        // If we have a token but it's not in URL, add it to current URL
        if (token && !urlParams.has('token')) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('token', token);
            window.history.replaceState({}, '', newUrl);
        }
    }

    return token;
}

  window.config = {
    routerBasename: '/',

    extensions: [],
    modes: [],
    whiteLabeling: {
      createLogoComponentFn: function(React) {
        return React.createElement(
          'p',
          {
            style: { display: 'flex', alignItems: 'center' }
          },
          React.createElement('img', {
            src: 'https://somapublic.objectstore.e2enetworks.net/somatiq_logo.png',
            alt: 'Company Logo',
            style: { height: '40px' }
          })
        );
      }
    },

    showStudyList: false,

    // Disable OHIF authentication
    userAuthenticationService: {
        enabled: false,
    },

    dataSources: [
        {
            sourceName: 'dicomweb',
            namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
            configuration: {
                friendlyName: 'dcm4chee PACS',
                name: 'DCM4CHEE',

                wadoUriRoot: `https://${window.location.hostname}:8443/dcm4chee-arc/aets/DCM4CHEE/wado`,
                qidoRoot: `https://${window.location.hostname}:8443/dcm4chee-arc/aets/DCM4CHEE/rs`,
                wadoRoot: `https://${window.location.hostname}:8443/dcm4chee-arc/aets/DCM4CHEE/rs`,

                // wadoUriRoot: `https://archive.dcm.somatiq.ai/dcm4chee-arc/aets/DCM4CHEE/wado`,
                // qidoRoot: `https://archive.dcm.somatiq.ai/dcm4chee-arc/aets/DCM4CHEE/rs`,
                // wadoRoot: `https://archive.dcm.somatiq.ai/dcm4chee-arc/aets/DCM4CHEE/rs`,

                qidoSupportsIncludeField: true,
                supportsReject: true,
                imageRendering: 'wadors',
                thumbnailRendering: 'wadors',
                enableStudyLazyLoad: true,
                supportsFuzzyMatching: true,
                supportsWildcard: true,

                // Use token from RIS
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Accept': 'application/dicom+json',
                    'Content-Type': 'application/dicom+json'
                }
            }
        },
        {
            namespace: '@ohif/extension-default.dataSourcesModule.dicomjson',
            sourceName: 'dicomjson',
            configuration: {
              friendlyName: 'dicom json',
              name: 'json',
            },
          },
    ],

    defaultDataSourceName: 'dicomweb',
    disableErrors: true,

    httpConfiguration: {
        headers: {
            'Accept': 'application/dicom+json',
            'Content-Type': 'application/dicom+json'
        }
    },

    httpErrorHandler: (error) => {
    },

    investigationalUseDialog: {
        option: 'never'
    },

    hotkeys: [
        {
            commandName: 'incrementActiveViewport',
            label: 'Next Viewport',
            keys: ['right']
        },
        {
            commandName: 'decrementActiveViewport',
            label: 'Previous Viewport',
            keys: ['left']
        }
    ],

    studyListFunctionsEnabled: true,
    experimentalStudyBrowserSort: true,
    language: 'en-US',
    showPatientInfoInViewportOverlay: true,
    showStudyInfoInViewportOverlay: true,

    customizationService: {
        dicomUploadComponent: null
    },

    studyPrefetcher: {
        enabled: true,
        order: 'downward',
        displaySetsCount: 20,
        maxNumPrefetchRequests: 10000,
      },
  };
