import type { AssemblyStep, Part } from "../types";
import type { BaseCabinetInputs } from "./defaults";

export function generateAssembly(
  inputs: BaseCabinetInputs,
  parts: Part[]
): AssemblyStep[] {
  const steps: AssemblyStep[] = [];
  let order = 1;

  steps.push({
    order: order++,
    instruction: "Cut all parts to size per cut sheet. Label each piece.",
    parts: parts.map((p) => p.id),
  });

  steps.push({
    order: order++,
    instruction:
      'Route a 1/4" x 1/4" rabbet on the back inside edges of both side panels for the back panel.',
    parts: ["side-panel"],
    joinery: "Rabbet joint",
    hardware: ['1/4" straight bit'],
  });

  steps.push({
    order: order++,
    instruction:
      "Attach the bottom panel between the side panels, flush with the bottom edges. Ensure square.",
    parts: ["side-panel", "bottom-panel"],
    joinery: "Glue and staple",
    hardware: ["Wood glue", '1/4" staples'],
  });

  steps.push({
    order: order++,
    instruction:
      "Attach the top stretcher between the side panels at the top, set back 1/2\" from the front edge.",
    parts: ["side-panel", "top-stretcher"],
    joinery: "Glue and staple",
    hardware: ["Wood glue", '1/4" staples'],
  });

  steps.push({
    order: order++,
    instruction:
      "Attach the toe kick between the side panels at the bottom front.",
    parts: ["side-panel", "toe-kick"],
    joinery: "Glue and staple",
    hardware: ["Wood glue", '1/4" staples'],
  });

  steps.push({
    order: order++,
    instruction:
      'Square the case and attach the back panel into the rabbets. Staple every 6 inches.',
    parts: ["back-panel"],
    joinery: "Glued into rabbet",
    hardware: ["Wood glue", '1/4" staples'],
  });

  if (inputs.shelfCount > 0) {
    steps.push({
      order: order++,
      instruction: `Drill shelf pin holes using 32mm system on both side panels. Install ${inputs.shelfCount} adjustable shelf/shelves.`,
      parts: ["shelf"],
      hardware: [
        `1/4" shelf pins (qty ${inputs.shelfCount * 4})`,
        "5mm drill bit",
      ],
    });
  }

  if (inputs.construction === "faceframe") {
    steps.push({
      order: order++,
      instruction:
        "Assemble the face frame (stiles and rails). Attach to the cabinet case with glue and staples.",
      parts: ["ff-stile", "ff-top-rail", "ff-bottom-rail"],
      joinery: "Glue and staple",
      hardware: ["Wood glue", '1/4" staples'],
    });
  }

  steps.push({
    order: order++,
    instruction:
      "Attach the riser to the top of the case with glue and staples.",
    parts: ["riser"],
    joinery: "Glue and staple",
    hardware: ["Wood glue", '1/4" staples'],
  });

  steps.push({
    order: order++,
    instruction:
      "Attach the counter top to the riser with glue and staples.",
    parts: ["counter-top", "riser"],
    joinery: "Glue and staple",
    hardware: ["Wood glue", '1/4" staples'],
  });

  steps.push({
    order: order++,
    instruction: `Hang ${inputs.doorCount === 1 ? "door" : "doors"} using European concealed hinges. Adjust for even reveal.`,
    parts: ["door"],
    joinery: "European hinge bore",
    hardware: [
      `35mm concealed hinges, 1/2" overlay (qty ${inputs.doorCount * 2})`,
      "35mm Forstner bit",
      '#6 x 5/8" screws',
    ],
  });

  steps.push({
    order: order++,
    instruction:
      "Install door pulls/knobs. Apply laminate to cover staples. Final sand and finish as desired.",
    parts: ["door"],
    hardware: [
      `Door pulls or knobs (qty ${inputs.doorCount})`,
      "Mounting screws",
      "Laminate",
    ],
  });

  return steps;
}
