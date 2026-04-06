import type { AssemblyStep, Part } from "../types";
import type { DisplayCounterInputs } from "./defaults";

export function generateAssembly(
  inputs: DisplayCounterInputs,
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
      "Attach the bottom panel between the side panels, flush with the bottom edges. Check for square.",
    parts: ["side-panel", "bottom-panel"],
    joinery: "Glue and screw",
    hardware: ["Wood glue", '#6 x 1-1/4" screws'],
  });

  steps.push({
    order: order++,
    instruction:
      "Install the front and back top nailers between the side panels at the top edge. These support the counter top.",
    parts: ["top-nailer-front", "top-nailer-back"],
    joinery: "Glue and screw",
    hardware: ["Wood glue", '#6 x 1-1/4" screws'],
  });

  steps.push({
    order: order++,
    instruction:
      'Install the kick plate between the side panels at the bottom, recessed 2" from the front edge.',
    parts: ["kick-plate"],
    joinery: "Glue and staple",
    hardware: ["Wood glue", '1-1/4" staples'],
  });

  if (inputs.backStyle === "closed") {
    steps.push({
      order: order++,
      instruction:
        'Attach the back panel to the rear of the case. Staple every 6".',
      parts: ["back-panel"],
      joinery: "Stapled flush",
      hardware: ['3/4" staples'],
    });
  }

  if (inputs.shelfCount > 0) {
    steps.push({
      order: order++,
      instruction: `Drill shelf pin holes on both side panels. Install ${inputs.shelfCount} adjustable shelf/shelves.`,
      parts: ["shelf"],
      hardware: [
        `1/4" shelf pins (qty ${inputs.shelfCount * 4})`,
        "5mm drill bit",
      ],
    });
  }

  steps.push({
    order: order++,
    instruction:
      "Attach the front panel to the case front. For graphic panels, use spray adhesive or VHB tape. For laminate panels, use glue and pin nails.",
    parts: ["front-panel"],
    joinery:
      inputs.frontPanel === "graphic"
        ? "Adhesive / VHB tape"
        : "Glue and pin nail",
    hardware:
      inputs.frontPanel === "graphic"
        ? ["3M VHB tape or spray adhesive"]
        : ["Wood glue", '1" pin nails'],
  });

  if (inputs.hasdoor === "yes") {
    steps.push({
      order: order++,
      instruction:
        "Mount the access door on the rear side using concealed hinges. Install locking latch.",
      parts: ["door"],
      joinery: "European hinge bore",
      hardware: [
        "35mm concealed hinges (qty 2)",
        "35mm Forstner bit",
        "Cam lock or push latch",
      ],
    });
  }

  steps.push({
    order: order++,
    instruction:
      "Set the counter top on the case and secure from underneath through the nailers. Ensure overhang is even on all sides.",
    parts: ["counter-top"],
    joinery: "Screwed from below",
    hardware: ['#8 x 1-1/4" screws (qty 6-8)', "Drill/driver"],
  });

  steps.push({
    order: order++,
    instruction:
      "Install leveler feet on the bottom panel. Apply edge banding to any exposed plywood edges. Final inspection.",
    parts: ["bottom-panel"],
    hardware: [
      "Adjustable leveler feet (qty 4)",
      "Iron-on edge banding",
      "Edge trimmer",
    ],
  });

  return steps;
}
