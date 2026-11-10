# Guia do Desenvolvedor: Criação de Gadgets para o ETS2 Overlay System

Este guia estabelece os padrões arquiteturais, especificações técnicas e boas práticas para o desenvolvimento de módulos visuais (gadgets) destinados ao sistema de overlay para transmissões ao vivo do Euro Truck Simulator 2 (ETS2). O objetivo deste ecossistema é oferecer um ambiente modular, extensível e agnóstico à origem dos dados, no qual qualquer desenvolvedor possa criar novos componentes de interface de maneira isolada e independente.

---

## 1. Arquitetura Geral e Filosofia de Desacoplamento

A arquitetura do ETS2 Overlay foi projetada sob o princípio da separação estrita de responsabilidades. A engine de exibição é completamente desacoplada da lógica de captura e tratamento de telemetria do jogo. Os gadgets funcionam como componentes visuais puramente receptores (*render-only / stateless*), garantindo que a renderização no OBS Studio permaneça leve e resiliente.

| Camada da Arquitetura | Responsabilidade Principal | Artefato / Arquivo de Origem |
| :--- | :--- | :--- |
| **Camada de Configuração** | Define as coordenadas X/Y dos slots e a resolução total do canvas (1920x1080). | `src/config/layouts/defaultLayout.ts` |
| **Camada de Mapeamento** | Faz a associação direta entre o ID do Slot e a chave do Gadget cadastrado. | `src/config/slotMapping.config.ts` |
| **Engine do Overlay** | Renderiza a grade de slots e a janela transparente para captura do jogo (1600x900). | `src/components/layout/OverlayEngine.tsx` |
| **Contêiner de Slot** | Posiciona o gadget de forma absoluta e injeta o estado do sistema (`isDemoMode`). | `src/components/layout/SlotContainer.tsx` |
| **Camada de Gadgets** | Componente React modular que consome dados ou executa seu modo simulado. | `src/components/gadgets/` |

### Princípios Fundamentais

1. **Renderização Unidirecional (Read-Only)**: Os gadgets recebem dados via propriedades (`props`) e renderizam a interface correspondente. Eles não executam chamadas diretas de rede nem gerenciam conexões WebSocket.
2. **Independência Geométrica**: O gadget é projetado para preencher 100% da área do slot onde for alocado. As dimensões e o posicionamento absoluto na tela são gerenciados exclusivamente pela configuração de layout.
3. **Autonomia de Teste (Modo Demo Nativo)**: Todo gadget deve ser capaz de operar e se autodemonstrar de forma totalmente funcional sem necessitar de um backend ativo ou do simulador em execução.

---

## 2. O Contrato de Interface do Gadget (Gadget Contract)

Para garantir a interoperabilidade no catálogo do sistema, cada gadget deve obedecer estritamente à especificação de tipagem TypeScript definida em `src/types/gadget.ts`.

### Definição dos Tipos (`src/types/gadget.ts`)

```typescript
import React from 'react';

/**
 * Propriedades obrigatórias que todo Gadget aceita da Engine.
 */
export interface GadgetProps {
  /**
   * Quando true, indica que o gadget deve utilizar seu estado interno simulado (Mock Data).
   */
  isDemoMode?: boolean;

  /**
   * Payload de dados brutos da telemetria repassado quando o sistema está em produção.
   */
  data?: unknown;
}

/**
 * Tipo genérico para componentes de Gadget.
 */
export type GadgetComponent = React.ComponentType<GadgetProps>;
```

### Responsabilidades de Entrada

*   **Flag `isDemoMode`**: Propriedade booleana injetada pelo `SlotContainer`. Quando for `true`, o gadget deve ignorar qualquer valor nulo ou indefinido da propriedade `data` e utilizar seus próprios dados de demonstração.
*   **Propriedade `data`**: Objeto genérico repassado em tempo de execução quando o servidor de telemetria estiver conectado.

---

## 3. Implementação Obrigatória do Modo Demo (`isDemoMode`)

O Modo Demo é um requisito contratual essencial. Ele permite que designers e desenvolvedores visualizem e ajustem o layout no navegador ou no OBS Studio sem a necessidade de abrir o jogo ou subir um servidor local.

### Estrutura Padrão de um Gadget

Abaixo está o padrão recomendado para a implementação do suporte ao Modo Demo em qualquer novo componente:

```tsx
import React from 'react';
import { GadgetProps } from '@/types/gadget';

// 1. Dados mockados definidos internamente pelo desenvolvedor do Gadget
const MOCK_DATA = {
  speed: 80,
  speedLimit: 90,
  unit: 'km/h',
};

export const SpeedometerGadget: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // 2. Seleção da fonte de dados de acordo com o modo de execução
  const activeData = isDemoMode || !data ? MOCK_DATA : (data as typeof MOCK_DATA);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/80 border border-slate-700 rounded p-2 text-white">
      <span className="text-2xl font-bold font-mono">{activeData.speed}</span>
      <span className="text-[10px] uppercase text-slate-400">{activeData.unit}</span>
    </div>
  );
};
```

---

## 4. Organização do Código e Estrutura de Diretórios

Para permitir que o ecossistema suporte tanto gadgets nativos do sistema básico quanto pacotes de expansão de terceiros, a pasta `src/components/gadgets/` é organizada de forma modular.

### Árvore de Diretórios

```text
src/
└── components/
    └── gadgets/
        ├── registry.tsx          <-- Catálogo central onde os gadgets são registrados
        ├── core/                 <-- Pacote Básico (Nativo do Sistema)
        │   ├── Speedometer.tsx
        │   ├── FuelGauge.tsx
        │   └── GearIndicator.tsx
        └── packs/                <-- Pacotes de Expansão / Terceiros
            ├── job-info/         <-- Exemplo: Pacote de Carga e Rota
            │   ├── CargoDetails.tsx
            │   └── DestinationMap.tsx
            └── diagnostics/     <-- Exemplo: Pacote de Diagnóstico Mecânico
                └── TruckDamage.tsx
```

### Diretrizes para Agrupamento de Pacotes

*   **Pacotes Básicos (`core/`)**: Módulos fundamentais de leitura de condução (velocidade, RPM, combustível, luzes).
*   **Expansões (`packs/<nome-do-pacote>/`)**: Conjuntos temáticos de gadgets agrupados em suas respectivas pastas. Cada expansão deve manter seus componentes autocontidos.

---

## 5. Fluxo de Integração: Do Código ao Slot

Para que um novo gadget seja exibido no overlay, ele precisa passar por dois passos simples de configuração: o registro no catálogo e a atribuição a um slot.

### Passo 1: Registro no Catálogo (`src/components/gadgets/registry.tsx`)

Adicione o componente exportado ao dicionário `GADGET_REGISTRY`. O arquivo possui extensão `.tsx` pois também armazena o componente visual de *placeholder* padrão.

```tsx
import React from 'react';
import { GadgetComponent } from '@/types/gadget';
import { SpeedometerGadget } from './core/Speedometer';
import { TruckDamageGadget } from './packs/diagnostics/TruckDamage';

export const GADGET_REGISTRY: Record<string, GadgetComponent> = {
  // Pacote Básico
  'core:speedometer': SpeedometerGadget,

  // Pacotes de Expansão
  'diagnostics:damage': TruckDamageGadget,
};

export const PlaceholderGadget: React.FC<{ slotId: string }> = ({ slotId }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50 border border-dashed border-cyan-500/40 rounded text-cyan-400 p-1 text-center select-none backdrop-blur-sm">
      <span className="text-[9px] font-mono tracking-widest text-cyan-500/70 uppercase">SLOT</span>
      <span className="text-xs font-bold font-mono text-cyan-300">{slotId}</span>
    </div>
  );
};
```

### Passo 2: Atribuição no Mapeamento de Slots (`src/config/slotMapping.config.ts`)

Associe o ID do slot desejado à chave do gadget que foi cadastrada no registro:

```typescript
export const slotMapping: Record<string, string | null> = {
  'top-1': 'core:speedometer',
  'left-1': 'diagnostics:damage',
  'left-2': null, // Exibe o PlaceholderGadget por padrão quando nulo
};
```

---

## 6. Exemplo Prático: Passo a Passo na Criação de um Gadget

A seguir, demonstra-se a criação completa de um gadget de diagnóstico de danos (`TruckDamage.tsx`) do início ao fim.

### 1. Criação do Componente (`src/components/gadgets/packs/diagnostics/TruckDamage.tsx`)

```tsx
import React from 'react';
import { GadgetProps } from '@/types/gadget';

interface DamageData {
  engine: number; // Porcentagem de 0 a 100
  transmission: number;
  cabin: number;
}

const MOCK_DAMAGE: DamageData = {
  engine: 12,
  transmission: 4,
  cabin: 0,
};

export const TruckDamageGadget: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  const damage = isDemoMode || !data ? MOCK_DAMAGE : (data as DamageData);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-slate-900/90 border border-slate-800 rounded p-2 text-xs">
      <div className="text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800 pb-1">
        Danos do Veículo
      </div>
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-slate-300">Motor</span>
          <span className={`font-mono ${damage.engine > 20 ? 'text-red-400' : 'text-emerald-400'}`}>
            {damage.engine}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-300">Câmbio</span>
          <span className="font-mono text-emerald-400">{damage.transmission}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-300">Cabine</span>
          <span className="font-mono text-emerald-400">{damage.cabin}%</span>
        </div>
      </div>
    </div>
  );
};
```

### 2. Registro do Componente no Catálogo (`src/components/gadgets/registry.tsx`)

```tsx
import { TruckDamageGadget } from './packs/diagnostics/TruckDamage';

export const GADGET_REGISTRY: Record<string, GadgetComponent> = {
  'diagnostics:damage': TruckDamageGadget,
};
```

### 3. Posicionamento em um Slot (`src/config/slotMapping.config.ts`)

```typescript
export const slotMapping: Record<string, string | null> = {
  'left-1': 'diagnostics:damage',
};
```

---

## 7. Boas Práticas de Estilização e Performance

Para garantir a melhor experiência de transmissão ao vivo e máxima estabilidade visual, os desenvolvedores devem seguir as seguintes recomendações:

| Categoria | Recomendação Técnica | Motivo / Benefício |
| :--- | :--- | :--- |
| **Dimensões** | Usar sempre `w-full h-full` no elemento raiz do gadget. | O contêiner pai (`SlotContainer`) controla as dimensões absolutas X/Y do slot. |
| **Estilização** | Dar preferência a classes Utilitárias do Tailwind CSS. | Mantém a consistência visual e evita contaminação de CSS global entre pacotes. |
| **Fundo Visual** | Utilizar fundos semi-transparentes (ex: `bg-slate-900/80`). | Permite integração estética fluida com a janela do jogo visível ao fundo. |
| **Animações** | Evitar transições pesadas ou re-renderizações desnecessárias. | Reduz o consumo de CPU e GPU no OBS Studio durante a live stream. |
| **Tratamento de Erros** | Tratar dados ausentes ou malformados com fallbacks silenciosos. | Evita que o gadget quebre e exiba telas brancas de erro durante a transmissão. |
