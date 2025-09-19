// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { useSystem } from '@ohif/core';
import usePatientInfo from '../../hooks/usePatientInfo';
import usePatientHistory from '../../hooks/usePatientHistory';
import { Icons, Button, useModal, useImageViewer } from '@ohif/ui-next';

type SidebarHeaderProps = {
  servicesManager: AppTypes.ServicesManager;
};

function getInitials(name?: string): string {
  if (!name) return '';
  const parts = name.split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
  return initials || '';
}

export default function SidebarHeader({ servicesManager }: SidebarHeaderProps) {
  // Ensure we use the same servicesManager instance passed from the viewer
  const sm = servicesManager ?? useSystem().servicesManager;
  const { patientInfo } = usePatientInfo(sm);
  const { show } = useModal();
  // mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  React.useEffect(() => {
    if (isMobile) {
      setExpanded(true); // use entire space on mobile
    }
  }, [isMobile]);

  // Get the current StudyInstanceUID from the image viewer
  const internalImageViewer = useImageViewer();
  const currentStudyInstanceUID = internalImageViewer.StudyInstanceUIDs?.[0]; // Get first study UID

  // Fetch patient history from API
  const { history: patientHistory, loading: historyLoading, error: historyError, refetch } = usePatientHistory(currentStudyInstanceUID);

  // Fallback history text
  const fallbackHistory = "No patient history available.";
  const displayHistory = patientHistory || fallbackHistory;


  // const initials = useMemo(() => getInitials(patientInfo?.PatientName), [patientInfo?.PatientName]);

  const HistoryBlock = (
    <div className="relative">
      <div
        className={`text-muted-foreground ${isMobile ? 'text-[12px]' : 'text-[11px]'} transition-all duration-200 ${
          expanded ? 'max-h-none' : 'max-h-[2.2em] overflow-hidden'
        }`}
      >
        {historyLoading ? (
          <div className="flex items-center gap-2">
            <Icons.LoadingSpinner className="h-3 w-3" />
            <span>Loading patient history...</span>
          </div>
        ) : historyError ? (
          <span className="text-red-400">Failed to load patient history</span>
        ) : (
          displayHistory
        )}
      </div>
      <div className="flex items-center justify-between mt-1">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-white text-[10px] flex items-center gap-1"
          disabled={historyLoading}
        >
          {expanded ? 'Show less' : 'Show more'}
          <Icons.ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={refetch}
            disabled={historyLoading}
            className="text-muted-foreground hover:text-white"
            title="Refresh patient history"
          >
            <Icons.Refresh className={`h-3 w-3 ${historyLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() =>
              show({
                title: isMobile ? 'Patient history' : 'Patient details',
                containerClassName: isMobile
                  ? 'w-[96vw] max-w-none p-4'
                  : 'max-w-md',
                content: PatientInfoPopupContent,
                contentProps: {
                  patientInfo,
                  historyText: displayHistory,
                  currentStudyInstanceUID,
                  historyLoading,
                  historyError,
                  isMobile,
                },
              })
            }
            className="text-muted-foreground hover:text-white"
          >
            <Icons.ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      {isMobile ? (
        <div className="bg-bkg-med/60 border-bkg-high flex rounded-lg px-3 py-2">
          <div className="flex min-w-0 flex-col w-full">{HistoryBlock}</div>
        </div>
      ) : (
        <div className="bg-bkg-med/60 border-bkg-high flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex min-w-0 flex-col">
            <div className="truncate text-[13px] font-semibold text-white">{patientInfo?.PatientName || '—'}</div>
            <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
              { patientInfo.PatientAge && <span>{patientInfo.PatientAge}</span>}
              {patientInfo?.PatientSex && (
                <span className="before:text-muted-foreground before:content-['•'] before:pr-2">{patientInfo.PatientSex}</span>
              )}
            </div>
            {HistoryBlock}
          </div>
        </div>
      )}
    </div>
  );
}

type PatientInfoPopupProps = {
  patientInfo: any;
  historyText: string;
  currentStudyInstanceUID?: string;
  historyLoading?: boolean;
  historyError?: string | null;
  hide?: () => void;
  isMobile?: boolean;
};

function PatientInfoPopupContent({
  patientInfo,
  historyText,
  currentStudyInstanceUID,
  historyLoading,
  historyError,
  hide,
  isMobile,
}: PatientInfoPopupProps) {
  return (
    <div className="text-white">
      {!isMobile && (
        <div className="mb-2 text-lg font-semibold">{patientInfo?.PatientName || '—'}</div>
      )}
      <div className={`text-muted-foreground mb-3 ${isMobile ? 'text-[12px]' : 'text-[12px]'} flex flex-wrap gap-3`}>
        {patientInfo?.PatientID && <span>ID: {patientInfo.PatientID}</span>}
        {patientInfo?.PatientAge && <span>Age: {patientInfo.PatientAge}</span>}
        {patientInfo?.PatientSex && <span>Sex: {patientInfo.PatientSex}</span>}
        {patientInfo?.PatientDOB && <span>DOB: {patientInfo.PatientDOB}</span>}
        {currentStudyInstanceUID && <span>Study: {currentStudyInstanceUID}</span>}
      </div>

      <div className="mb-2">
        <h3 className="text-[14px] font-semibold text-white mb-2">Patient History</h3>
        <div className={`${isMobile ? 'text-[13px]' : 'text-[12px]'} leading-5 text-white/90 whitespace-pre-wrap min-h-[60px]`}>
          {historyLoading ? (
            <div className="flex items-center gap-2">
              <Icons.LoadingSpinner className="h-4 w-4" />
              <span>Loading patient history...</span>
            </div>
          ) : historyError ? (
            <span className="text-red-400">Error: {historyError}</span>
          ) : (
            historyText
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={hide}>
          Close
        </Button>
      </div>
    </div>
  );
}
