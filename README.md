# 🚚 ETS2 & ATS Modular Overlay

Um sistema de overlay moderno, modular e personalizavel para **Euro Truck Simulator 2** e **American Truck Simulator**, desenvolvido com **Next.js**, **TypeScript** e **Tailwind CSS**. Projetado especificamente para transmissoes ao vivo no **OBS Studio** e para integracao com hubs de telemetria em tempo real.

---

## 🌟 Destaques do Projeto

* **Arquitetura 100% Modular**: Grade visual baseada em *slots* independentes. Adicione, remova ou reordene elementos visuais facilmente.
* **Geometria & Layouts Flexiveis**: Posicionamento via arquivos de configuracao (`LayoutConfig`). Suporta resolucoes personalizadas mantendo a janela do jogo (1600x900) completamente transparente para captura no OBS.
* **Contrato de Gadgets Autonomos (`isDemoMode`)**: Todo gadget e um componente isolado que possui seu proprio modo de demonstracao com dados simulados internos. Permite testar a interface sem ter o jogo ou o servidor rodando.
* **Desacoplamento Total de Dados**: A interface de usuario (*UI*) e puramente receptora e declarativa (read-only), separada da logica de envio de comandos ao simulador.
* **Catalogo Expansivel (`GADGET_REGISTRY`)**: Registro simples de componentes permitindo criar pacotes basicos (*core*) e pacotes de expansao da comunidade (*packs*).

---

## 📐 Visao Geral da Arquitetura

O overlay opera em uma tela base de **1920x1080 Full HD**, reservando uma area central de **1600x900 (Viewport)** transparente para a captura da tela do jogo. Ao redor do jogo, slots predefinidos abrigam os **Gadgets**:

```text
+-------------------------------------------------------------------------+
|  TOP-LEFT  |   TOP-1   |   TOP-2   | TOP-CENTER |   TOP-3   | TOP-RIGHT |
+------------+------------------------------------------------+-----------+
| LEFT-1     |                                                |  RIGHT-1  |
| LEFT-2     |                                                |  RIGHT-2  |
| LEFT-3     |         AREA TRANSPARENTE DO JOGO              |  RIGHT-3  |
| LEFT-4     |                 (1600 x 900)                   |  RIGHT-4  |
| LEFT-5     |                                                |  RIGHT-5  |
| LEFT-BOT   |                                                | RIGHT-BOT |
+------------+------------------------------------------------+-----------+
| BOT-LEFT   |  BOTTOM-1  |  BOTTOM-2  | BOTTOM-3  | BOTTOM-4 | BOT-RIGHT |
+-------------------------------------------------------------------------+
```

---

## 📁 Estrutura de Diretorios

```text
src/
├── app/                        # Ponto de entrada do Next.js (App Router)
│   └── page.tsx
├── components/
│   ├── gadgets/
│   │   ├── core/               # Gadgets padrao (SystemStatus, SpeedAlert, etc.)
│   │   │   ├── SystemStatus.tsx
│   │   │   └── SpeedAlert.tsx
│   │   ├── registry.tsx        # Catalogo central de Gadgets & Placeholder visual
│   ├── layout/
│   │   ├── OverlayEngine.tsx   # Motor principal de renderizacao do canvas
│   │   └── SlotContainer.tsx   # Conteiner generico e posicionador de slots
├── config/
│   ├── layouts/
│   │   └── defaultLayout.ts    # Definicao geometrica da grade (1920x1080)
│   └── slotMapping.config.ts   # Mapeamento (Slot ID -> Gadget Key)
└── types/
    ├── gadget.ts               # Contrato de interface para Gadgets (GadgetProps)
    └── layout.ts               # Tipagem de Layouts e Slots
```

---

## 🛠️ Instalacao e Execucao

### Pre-requisitos
* **Node.js**: Versao 18.17 ou superior.
* **npm** ou **yarn**.

### Passo a Passo

1. **Clone o repositorio:**
   ```bash
   git clone https://github.com/pedroandre82/ets2-overlay
   cd ets2-overlay
   ```

2. **Instale as dependencias:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   Abra `http://localhost:3000` para visualizar o overlay em execucao.

---

## 📺 Configuracao no OBS Studio

1. No OBS Studio, adicione uma nova fonte do tipo **Navegador (Browser Source)**.
2. Defina a URL para `http://localhost:3000` (ou o endereco do seu servidor).
3. Configure a **Largura (Width)** para `1920` e **Altura (Height)** para `1080`.
4. Posicione a fonte do jogo por baixo da fonte do Navegador no painel de fontes do OBS.

---

## 🧩 Como Criar um Novo Gadget

Todos os gadgets devem respeitar a interface `GadgetProps` (`src/types/gadget.ts`).

### 1. Crie o componente do Gadget
Crie um novo arquivo em `src/components/gadgets/core/`:

```tsx
import React from 'react';
import { GadgetProps } from '@/types/gadget';

export const MyCustomGadget: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  const demoData = { value: 100 };
  const currentData = isDemoMode || !data ? demoData : data;

  return (
    <div className="w-full h-full bg-slate-900 border border-slate-700 p-2 rounded">
      {/* Seu layout visual aqui */}
    </div>
  );
};
```

### 2. Registre no Catalogo (`src/components/gadgets/registry.tsx`)
```tsx
import { MyCustomGadget } from './core/MyCustomGadget';

export const GADGET_REGISTRY: Record<string, GadgetComponent> = {
  'core:my-custom-gadget': MyCustomGadget,
};
```

### 3. Mapeie no Slot Desejado (`src/config/slotMapping.config.ts`)
```typescript
export const slotMapping: Record<string, string | null> = {
  'left-2': 'core:my-custom-gadget',
};
```

---

## 🔌 Integracao com o Servidor de Telemetria

O overlay foi projetado para consumir dados do backend Node.js baseado no plugin SCS SDK e na biblioteca TruckSim-Telemetry.

---

## 📄 Licenca

Este projeto esta sob a licenca **MIT**.
