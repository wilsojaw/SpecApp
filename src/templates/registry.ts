import { baseCabinetTemplate } from "./base-cabinet";
import { displayCounterTemplate } from "./display-counter";
import { wallPanelTemplate } from "./wall-panel";
import type { Template } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const templateRegistry: Record<string, Template<any>> = {
  "base-cabinet": baseCabinetTemplate,
  "display-counter": displayCounterTemplate,
  "wall-panel": wallPanelTemplate,
};

export const templateList = Object.values(templateRegistry);
