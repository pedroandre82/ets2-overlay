import React from 'react';

export interface GadgetProps {
  /** Indica se o gadget deve exibir seus dados simulados internos */
  isDemoMode?: boolean;
  /** Payload de dados brutos da telemetria (quando conectado) */
  data?: unknown;
}

export type GadgetComponent = React.ComponentType<GadgetProps>;