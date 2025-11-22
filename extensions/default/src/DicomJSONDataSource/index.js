import { DicomMetadataStore, IWebApiDataSource } from '@ohif/core';
import OHIF from '@ohif/core';
import qs from 'query-string';

import getImageId from '../DicomWebDataSource/utils/getImageId';
import getDirectURL from '../utils/getDirectURL';

const metadataProvider = OHIF.classes.MetadataProvider;

const mappings = {
  studyInstanceUid: 'StudyInstanceUID',
  patientId: 'PatientID',
};

let _store = {
  urls: [],
  studyInstanceUIDMap: new Map(), // map of urls to array of study instance UIDs
  // {
  //   url: url1
  //   studies: [Study1, Study2], // if multiple studies
  // }
  // {
  //   url: url2
  //   studies: [Study1],
  // }
  // }
};

function wrapSequences(obj) {
  return Object.keys(obj).reduce(
    (acc, key) => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively wrap sequences for nested objects
        acc[key] = wrapSequences(obj[key]);
      } else {
        acc[key] = obj[key];
      }
      if (key.endsWith('Sequence')) {
        acc[key] = OHIF.utils.addAccessors(acc[key]);
      }
      return acc;
    },
    Array.isArray(obj) ? [] : {}
  );
}
const getMetaDataByURL = url => {
  return _store.urls.find(metaData => metaData.url === url);
};

const findStudies = (key, value) => {
  let studies = [];
  _store.urls.map(metaData => {
    metaData.studies.map(aStudy => {
      if (aStudy[key] === value) {
        studies.push(aStudy);
      }
    });
  });
  return studies;
};

function createDicomJSONApi(dicomJsonConfig) {
  const implementation = {
    initialize: async ({ query, url }) => {
      if (!url) {
        url = query.get('url');
      }
      let metaData = getMetaDataByURL(url);

      // if we have already cached the data from this specific url
      // We are only handling one StudyInstanceUID to run; however,
      // all studies for patientID will be put in the correct tab
      if (metaData) {
        return metaData.studies.map(aStudy => {
          return aStudy.StudyInstanceUID;
        });
      }

      const response = await fetch(url);
      const data = await response.json();

      let StudyInstanceUID;
      let SeriesInstanceUID;
      data.studies.forEach(study => {
        StudyInstanceUID = study.StudyInstanceUID;

        study.series.forEach(series => {
          SeriesInstanceUID = series.SeriesInstanceUID;

          series.instances.forEach(instance => {
            const { metadata: naturalizedDicom } = instance;
            const imageId = getImageId({ instance, frame: undefined, config: dicomJsonConfig });

            const { query } = qs.parseUrl(instance.url);

            // Add imageId specific mapping to this data as the URL isn't necessarily WADO-URI.
            const frameNumber = query.frame 
              ? (Array.isArray(query.frame) ? parseInt(query.frame[0]) : parseInt(query.frame))
              : undefined;
            metadataProvider.addImageIdToUIDs(imageId, {
              StudyInstanceUID,
              SeriesInstanceUID,
              SOPInstanceUID: naturalizedDicom.SOPInstanceUID,
              frameNumber: frameNumber,
            });
          });
        });
      });

      _store.urls.push({
        url,
        studies: [...data.studies],
      });
      _store.studyInstanceUIDMap.set(
        url,
        data.studies.map(study => study.StudyInstanceUID)
      );
    },
    query: {
      studies: {
        mapParams: () => {},
        search: async param => {
          const [key, value] = Object.entries(param)[0];
          const mappedParam = mappings[key];

          // todo: should fetch from dicomMetadataStore
          const studies = findStudies(mappedParam, value);

          return studies.map(aStudy => {
            return {
              accession: aStudy.AccessionNumber,
              date: aStudy.StudyDate,
              description: aStudy.StudyDescription,
              instances: aStudy.NumInstances,
              modalities: aStudy.Modalities,
              mrn: aStudy.PatientID,
              patientName: aStudy.PatientName,
              studyInstanceUid: aStudy.StudyInstanceUID,
              NumInstances: aStudy.NumInstances,
              time: aStudy.StudyTime,
            };
          });
        },
        processResults: () => {
          console.warn(' DICOMJson QUERY processResults not implemented');
        },
      },
      series: {
        // mapParams: mapParams.bind(),
        search: () => {
          console.warn(' DICOMJson QUERY SERIES SEARCH not implemented');
        },
      },
      instances: {
        search: () => {
          console.warn(' DICOMJson QUERY instances SEARCH not implemented');
        },
      },
    },
    retrieve: {
      /**
       * Generates a URL that can be used for direct retrieve of the bulkdata
       *
       * @param {object} params
       * @param {string} params.tag is the tag name of the URL to retrieve
       * @param {string} params.defaultPath path for the pixel data url
       * @param {object} params.instance is the instance object that the tag is in
       * @param {string} params.defaultType is the mime type of the response
       * @param {string} params.singlepart is the type of the part to retrieve
       * @param {string} params.fetchPart unknown?
       * @returns an absolute URL to the resource, if the absolute URL can be retrieved as singlepart,
       *    or is already retrieved, or a promise to a URL for such use if a BulkDataURI
       */
      directURL: params => {
        return getDirectURL(dicomJsonConfig, params);
      },
      series: {
        metadata: async ({ filters, StudyInstanceUID, madeInClient = false, customSort } = {}) => {
          if (!StudyInstanceUID) {
            throw new Error('Unable to query for SeriesMetadata without StudyInstanceUID');
          }

          const study = findStudies('StudyInstanceUID', StudyInstanceUID)[0];
          let series;

          if (customSort) {
            series = customSort(study.series);
          } else {
            series = study.series;
          }

          const seriesKeys = [
            'SeriesInstanceUID',
            'SeriesInstanceUIDs',
            'seriesInstanceUID',
            'seriesInstanceUIDs',
          ];
          const seriesFilter = seriesKeys.find(key => filters[key]);
          if (seriesFilter) {
            const seriesUIDs = filters[seriesFilter];
            series = series.filter(s => seriesUIDs.includes(s.SeriesInstanceUID));
          }

          const seriesSummaryMetadata = series.map(series => {
            const seriesSummary = {
              StudyInstanceUID: study.StudyInstanceUID,
              ...series,
            };
            delete seriesSummary.instances;
            return seriesSummary;
          });

          // Async load series, store as retrieved
          function storeInstances(naturalizedInstances) {
            DicomMetadataStore.addInstances(naturalizedInstances, madeInClient);
          }

          DicomMetadataStore.addSeriesMetadata(seriesSummaryMetadata, madeInClient);

          function setSuccessFlag() {
            const study = DicomMetadataStore.getStudy(StudyInstanceUID, madeInClient);
            study.isLoaded = true;
          }

          const numberOfSeries = series.length;
          series.forEach((series, index) => {
            const instances = series.instances.map(instance => {
              // for instance.metadata if the key ends with sequence then
              // we need to add a proxy to the first item in the sequence
              // so that we can access the value of the sequence
              // by using sequenceName.value
              const modifiedMetadata = wrapSequences(instance.metadata);

              const obj = {
                ...modifiedMetadata,
                url: instance.url,
                imageId: getImageId({ instance, frame: undefined, config: dicomJsonConfig }),
                ...series,
                ...study,
              };
              delete obj.instances;
              delete obj.series;
              
              // Register metadata for each frame if NumberOfFrames > 1
              const numberOfFrames = (modifiedMetadata && 'NumberOfFrames' in modifiedMetadata && modifiedMetadata.NumberOfFrames) 
                ? Number(modifiedMetadata.NumberOfFrames) 
                : 1;
              const { StudyInstanceUID, SeriesInstanceUID, SOPInstanceUID } = obj;
              
              if (numberOfFrames > 1) {
                // Register metadata for each frame
                for (let i = 1; i <= numberOfFrames; i++) {
                  const frameImageId = getImageId({
                    instance: { ...instance, metadata: modifiedMetadata },
                    frame: i,
                    config: dicomJsonConfig,
                  });
                  metadataProvider.addImageIdToUIDs(frameImageId, {
                    StudyInstanceUID,
                    SeriesInstanceUID,
                    SOPInstanceUID,
                    frameNumber: i,
                  });
                }
              } else {
                // Register metadata for single frame instance
                const imageId = getImageId({
                  instance: { ...instance, metadata: modifiedMetadata },
                  frame: undefined,
                  config: dicomJsonConfig,
                });
                metadataProvider.addImageIdToUIDs(imageId, {
                  StudyInstanceUID,
                  SeriesInstanceUID,
                  SOPInstanceUID,
                  frameNumber: undefined,
                });
              }
              
              return obj;
            });
            storeInstances(instances);
            if (index === numberOfSeries - 1) {
              setSuccessFlag();
            }
          });
        },
      },
    },
    store: {
      dicom: () => {
        console.warn(' DICOMJson store dicom not implemented');
      },
    },
    getImageIdsForDisplaySet(displaySet) {
      const images = displaySet.images;
      const imageIds = [];

      if (!Array.isArray(images) || !images.length) {
        return imageIds;
      }

      const { StudyInstanceUID, SeriesInstanceUID } = displaySet;
      const study = findStudies('StudyInstanceUID', StudyInstanceUID)?.[0];
      const series = study?.series?.find(s => s.SeriesInstanceUID === SeriesInstanceUID);

      const instanceMap = new Map();
      const seriesInstances = Array.isArray(series?.instances) ? series.instances : [];
      if (seriesInstances.length) {
        seriesInstances.forEach(instance => {
          if (instance?.metadata?.SOPInstanceUID) {
            const { metadata, url } = instance;
            const existingInstances = instanceMap.get(metadata.SOPInstanceUID) || [];
            existingInstances.push({ ...metadata, url });
            instanceMap.set(metadata.SOPInstanceUID, existingInstances);
          }
        });
      }

      images.forEach(instance => {
        const NumberOfFrames = instance.NumberOfFrames || 1;
        const instances = instanceMap.get(instance.SOPInstanceUID) || [instance];
        const SOPInstanceUID = instance.SOPInstanceUID || instances[0]?.metadata?.SOPInstanceUID;
        
        if (NumberOfFrames > 2) {
          for (let i = 1; i <= NumberOfFrames; i++) {
            const inst = instances[Math.min(i - 1, instances.length - 1)];
            const frame = i;
            const imageId =
              inst?.imageId ||
              getImageId({
                instance: inst,
                frame: frame,
                config: dicomJsonConfig,
              });
            
            // Register metadata for each frame-specific imageId
            if (SOPInstanceUID && StudyInstanceUID && SeriesInstanceUID) {
              metadataProvider.addImageIdToUIDs(imageId, {
                StudyInstanceUID,
                SeriesInstanceUID,
                SOPInstanceUID,
                frameNumber: frame,
              });
            }
            
            imageIds.push(imageId);
          }
        }
        else if (NumberOfFrames == 2) {
          const imageId0 = getImageId({
            instance: instances[0],
            frame: 0,
            config: dicomJsonConfig,
          });
          
          const imageId1 = getImageId({
            instance: instances[0],
            frame: 1,
            config: dicomJsonConfig,
          });
          
          // Register metadata for each frame
          if (SOPInstanceUID && StudyInstanceUID && SeriesInstanceUID) {
            metadataProvider.addImageIdToUIDs(imageId0, {
              StudyInstanceUID,
              SeriesInstanceUID,
              SOPInstanceUID,
              frameNumber: 0,
            });
            
            metadataProvider.addImageIdToUIDs(imageId1 , {
              StudyInstanceUID,
              SeriesInstanceUID,
              SOPInstanceUID,
              frameNumber: 1,
            });
          }
          
          imageIds.push(imageId0);
          imageIds.push(imageId1);
        }
        else {
          const imageId = getImageId({
            instance: instances[0],
            frame: undefined,
            config: dicomJsonConfig,
          });
          
          // Register metadata for single frame
          if (SOPInstanceUID && StudyInstanceUID && SeriesInstanceUID) {
            metadataProvider.addImageIdToUIDs(imageId, {
              StudyInstanceUID,
              SeriesInstanceUID,
              SOPInstanceUID,
              frameNumber: undefined,
            });
          }
          
          imageIds.push(imageId); 
        }
      });

      return imageIds;
    },
    getImageIdsForInstance({ instance, frame }) {
      const imageId = getImageId({ instance, frame, config: dicomJsonConfig });
      return imageId;
    },
    getStudyInstanceUIDs: ({ params, query }) => {
      const url = query.get('url');
      return _store.studyInstanceUIDMap.get(url);
    },
  };
  return IWebApiDataSource.create(implementation);
}

export { createDicomJSONApi };
