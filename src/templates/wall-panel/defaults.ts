export interface WallPanelInputs {
  width: number;
  height: number;
  panelCount: number;
  frameWidth: number;
  skinThickness: number;
  skinMaterial: "lam-ply" | "mdf" | "sintra";
  monitorCutouts: number;
  monitorWidth: number;
  monitorHeight: number;
  shelfCleats: number;
}

export const wallPanelDefaults: WallPanelInputs = {
  width: 96,
  height: 96,
  panelCount: 1,
  frameWidth: 1.5,
  skinThickness: 0.25,
  skinMaterial: "lam-ply",
  monitorCutouts: 0,
  monitorWidth: 28,
  monitorHeight: 18,
  shelfCleats: 0,
};
