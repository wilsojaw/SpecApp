import type { AssemblyStep, Part } from "../types";
import type { WallPanelInputs } from "./defaults";

export function generateAssembly(
  inputs: WallPanelInputs,
  parts: Part[]
): AssemblyStep[] {
  const steps: AssemblyStep[] = [];
  let order = 1;
  const panelLabel =
    inputs.panelCount === 1 ? "panel" : `each of the ${inputs.panelCount} panels`;

  steps.push({
    order: order++,
    instruction: "Cut all parts to size per cut sheet. Label each piece and group by panel.",
    parts: parts.map((p) => p.id),
  });

  steps.push({
    order: order++,
    instruction: `Assemble the frame for ${panelLabel}: lay out stiles and rails flat, check for square, then screw together with pocket screws or half-lap joints.`,
    parts: ["frame-stile", "frame-rail"],
    joinery: "Pocket screw or half-lap",
    hardware: [
      "Pocket hole jig",
      '2-1/2" pocket screws',
      "Wood glue",
      "Framing square",
    ],
  });

  const crossPart = parts.find((p) => p.id === "frame-cross");
  if (crossPart && crossPart.quantity > 0) {
    steps.push({
      order: order++,
      instruction: `Install cross members inside the frame, spaced evenly (~24" apart). These prevent racking and provide fastening points for skins.`,
      parts: ["frame-cross"],
      joinery: "Pocket screw",
      hardware: ['2-1/2" pocket screws', "Wood glue"],
    });
  }

  if (inputs.monitorCutouts > 0) {
    steps.push({
      order: order++,
      instruction: `Install monitor mount cleats inside the frame at the desired monitor height. Center the ${inputs.monitorWidth}" x ${inputs.monitorHeight}" opening. Attach the backer plate to the cleats.`,
      parts: ["monitor-cleat", "monitor-backer"],
      joinery: "Screwed to frame",
      hardware: [
        '#8 x 2" screws',
        `VESA mount bracket (qty ${inputs.monitorCutouts})`,
      ],
    });
  }

  steps.push({
    order: order++,
    instruction:
      "Attach the front skin to the frame. Start from one edge and work across, checking alignment. Use construction adhesive and staples or screws.",
    parts: ["front-skin"],
    joinery: "Adhesive and fastener",
    hardware: [
      "Construction adhesive (PL Premium or similar)",
      '1" staples or #6 x 3/4" screws',
    ],
  });

  if (inputs.monitorCutouts > 0) {
    steps.push({
      order: order++,
      instruction: `Cut the monitor opening(s) in the front skin using a router or jigsaw. Use the frame cleats as a guide. Clean up edges.`,
      parts: ["front-skin"],
      hardware: [
        "Jigsaw or router with flush-trim bit",
        "Masking tape (prevent tearout)",
      ],
    });
  }

  steps.push({
    order: order++,
    instruction:
      "Attach the back skin to the frame. If the back will be visible, ensure the finish side faces out.",
    parts: ["back-skin"],
    joinery: "Adhesive and fastener",
    hardware: [
      "Construction adhesive",
      '1" staples or #6 x 3/4" screws',
    ],
  });

  if (inputs.shelfCleats > 0) {
    steps.push({
      order: order++,
      instruction: `Install ${inputs.shelfCleats} shelf cleat(s) on the front face at desired heights. Use a level and pre-drill.`,
      parts: ["shelf-cleat"],
      joinery: "Screwed through skin into frame",
      hardware: [
        '#8 x 2" screws',
        "Level",
        '1/8" drill bit for pre-drill',
      ],
    });
  }

  steps.push({
    order: order++,
    instruction:
      "Attach the base plate to the bottom of the frame. Install adjustable leveler feet.",
    parts: ["base-plate"],
    joinery: "Screwed to frame",
    hardware: [
      '#8 x 1-1/2" screws',
      `Adjustable leveler feet (qty ${inputs.panelCount * 4})`,
      "T-nut inserts",
    ],
  });

  if (inputs.panelCount > 1) {
    steps.push({
      order: order++,
      instruction:
        "Connect panels together using barrel bolts or panel connectors. Pre-drill alignment holes on the shop floor before crating.",
      parts: ["frame-stile"],
      hardware: [
        `Panel connector bolts (qty ${(inputs.panelCount - 1) * 3})`,
        '3/8" drill bit',
        "Allen wrench",
      ],
    });
  }

  steps.push({
    order: order++,
    instruction:
      "Final inspection: check all joints, test levelers, verify monitor fit if applicable. Apply touch-up paint or edge banding as needed. Mark panels for field assembly order.",
    parts: [],
    hardware: ["Touch-up paint", "Painter's tape", "Sharpie for labeling"],
  });

  return steps;
}
