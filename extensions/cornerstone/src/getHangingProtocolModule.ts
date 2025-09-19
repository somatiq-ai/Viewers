import { fourUp } from './hps/fourUp';
import { main3D } from './hps/main3D';
import { mpr } from './hps/mpr';
import { mprAnd3DVolumeViewport } from './hps/mprAnd3DVolumeViewport';
import { only3D } from './hps/only3D';
import { primary3D } from './hps/primary3D';
import { primaryAxial, primaryAxiaMobile } from './hps/primaryAxial';
import { frameView } from './hps/frameView';
import { sagittal } from './hps/sagittal';
import { axial } from './hps/axial';
import { coronal } from './hps/coronal';

function getHangingProtocolModule() {
  return [
    {
      name: mpr.id,
      protocol: mpr,
    },
    {
      name: mprAnd3DVolumeViewport.id,
      protocol: mprAnd3DVolumeViewport,
    },
    {
      name: fourUp.id,
      protocol: fourUp,
    },
    {
      name: main3D.id,
      protocol: main3D,
    },
    {
      name: primaryAxial.id,
      protocol: primaryAxial,
    },
    {
      name: primaryAxiaMobile.id,
      protocol: primaryAxiaMobile,
    },
    {
      name: only3D.id,
      protocol: only3D,
    },
    {
      name: primary3D.id,
      protocol: primary3D,
    },
    {
      name: frameView.id,
      protocol: frameView,
    },
    {
      name: sagittal.id,
      protocol: sagittal,
    },
    {
      name: axial.id,
      protocol: axial,
    },
    {
      name: coronal.id,
      protocol: coronal,
    },
  ];
}

export default getHangingProtocolModule;
