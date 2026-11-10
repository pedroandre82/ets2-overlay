import { LayoutConfig } from '@/types/layout';

export const defaultLayout: LayoutConfig = {
  id: 'default-1080p',
  name: 'Layout Padrão Full HD (1920x1080)',
  width: 1920,
  height: 1080,
  gameViewport: {
    x: 160,
    y: 90,
    width: 1600,
    height: 900,
  },
  slots: [
    // --- TOPO (Altura: 90px) ---
    { id: 'top-corner-left', x: 0, y: 0, width: 160, height: 90 },
    { id: 'top-1', x: 160, y: 0, width: 360, height: 90 },
    { id: 'top-2', x: 520, y: 0, width: 360, height: 90 },
    { id: 'top-center', x: 880, y: 0, width: 160, height: 90 },
    { id: 'top-3', x: 1040, y: 0, width: 360, height: 90 },
    { id: 'top-4', x: 1400, y: 0, width: 360, height: 90 },
    { id: 'top-corner-right', x: 1760, y: 0, width: 160, height: 90 },

    // --- COLUNA ESQUERDA (Largura: 160px) ---
    { id: 'left-1', x: 0, y: 90, width: 160, height: 160 },
    { id: 'left-2', x: 0, y: 250, width: 160, height: 160 },
    { id: 'left-3', x: 0, y: 410, width: 160, height: 160 },
    { id: 'left-4', x: 0, y: 570, width: 160, height: 160 },
    { id: 'left-5', x: 0, y: 730, width: 160, height: 160 },
    { id: 'left-bottom', x: 0, y: 890, width: 160, height: 100 },

    // --- COLUNA DIREITA (Largura: 160px) ---
    { id: 'right-1', x: 1760, y: 90, width: 160, height: 160 },
    { id: 'right-2', x: 1760, y: 250, width: 160, height: 160 },
    { id: 'right-3', x: 1760, y: 410, width: 160, height: 160 },
    { id: 'right-4', x: 1760, y: 570, width: 160, height: 160 },
    { id: 'right-5', x: 1760, y: 730, width: 160, height: 160 },
    { id: 'right-bottom', x: 1760, y: 890, width: 160, height: 100 },

    // --- RODAPÉ (Altura: 90px) ---
    { id: 'bottom-corner-left', x: 0, y: 990, width: 160, height: 90 },
    { id: 'bottom-1', x: 160, y: 990, width: 400, height: 90 },
    { id: 'bottom-2', x: 560, y: 990, width: 400, height: 90 },
    { id: 'bottom-3', x: 960, y: 990, width: 400, height: 90 },
    { id: 'bottom-4', x: 1360, y: 990, width: 400, height: 90 },
    { id: 'bottom-corner-right', x: 1760, y: 990, width: 160, height: 90 },
  ],
};