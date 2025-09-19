import { useState, useEffect } from 'react';
import { utils } from '@ohif/core';

const { formatPN, formatDate } = utils;

function usePatientInfo(servicesManager: AppTypes.ServicesManager) {
  const { displaySetService } = servicesManager.services;

  const [patientInfo, setPatientInfo] = useState({
    PatientName: '',
    PatientID: '',
    PatientSex: '',
    PatientDOB: '',
    PatientAge: '',
  });
  const [isMixedPatients, setIsMixedPatients] = useState(false);

  const checkMixedPatients = (PatientID: string) => {
    const displaySets = displaySetService.getActiveDisplaySets();
    let isMixedPatients = false;
    displaySets.forEach(displaySet => {
      const instance = displaySet?.instances?.[0] || displaySet?.instance;
      if (!instance) {
        return;
      }
      if (instance.PatientID !== PatientID) {
        isMixedPatients = true;
      }
    });
    setIsMixedPatients(isMixedPatients);
  };

  const updatePatientInfoFromActive = () => {
    const active = displaySetService.getActiveDisplaySets();
    if (!active?.length) {
      return;
    }
    const displaySet = active[0];
    const instance: any = displaySet?.instances?.[0] || displaySet?.instance;
    if (!instance) {
      return;
    }

    setPatientInfo({
      PatientID: instance.PatientID || null,
      PatientName: instance.PatientName ? formatPN(instance.PatientName) : null,
      PatientSex: instance.PatientSex || null,
      PatientDOB: formatDate(instance.PatientBirthDate) || null,
      PatientAge: instance.PatientAge || null,
    });
    checkMixedPatients(instance.PatientID || null);
  };

  useEffect(() => {
    // Initialize immediately (handles remounts when side panel is toggled)
    updatePatientInfoFromActive();

    // Update when display sets are added or changed
    const subAdded = displaySetService.subscribe(
      displaySetService.EVENTS.DISPLAY_SETS_ADDED,
      () => updatePatientInfoFromActive()
    );
    const subChanged = displaySetService.subscribe(
      displaySetService.EVENTS.DISPLAY_SETS_CHANGED,
      () => updatePatientInfoFromActive()
    );
    return () => {
      subAdded.unsubscribe();
      subChanged.unsubscribe();
    };
  }, []);

  return { patientInfo, isMixedPatients };
}

export default usePatientInfo;
