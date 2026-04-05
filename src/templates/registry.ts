import { baseCabinetTemplate } from "./base-cabinet";
import type { Template } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const templateRegistry: Record<string, Template<any>> = {
  "base-cabinet": baseCabinetTemplate,
};

export const templateList = Object.values(templateRegistry);
