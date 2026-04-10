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

  // Toe kick platform with ribs
  steps.push({
    order: order++,
    instruction:
      'Build the toe kick frame. Attach front, back, side pieces, and ribs to form a reinforced rectangular frame. Frame sits back 2-1/2" from cabinet edges all around.',
    parts: ["toe-kick-fb", "toe-kick-side", "toe-kick-rib"],
    joinery: "Glue and staple",
    hardware: ["Wood glue", '1-1/4" staples'],
  });

  // Box assembly — top/bottom run full length, sides inset
  steps.push({
    order: order++,
    instruction:
      "Lay bottom panel flat. Attach both side panels between the bottom panel, inset flush to the edges. Top and bottom run the full length of the cabinet.",
    parts: ["bottom-panel", "side-panel"],
    joinery: "Glue and staple",
    hardware: ["Wood glue", '1-1/4" staples'],
  });

  steps.push({
    order: order++,
    instruction:
      "Attach the top panel over the side panels, flush with all edges. Verify the case is square.",
    parts: ["top-panel", "side-panel"],
    joinery: "Glue and staple",
    hardware: ["Wood glue", '1-1/4" staples'],
  });

  // Back panel — inset for smooth back
  steps.push({
    order: order++,
    instruction:
      "Slide the back panel into place between the top, bottom, and side panels for a completely flush back. Staple every 6 inches.",
    parts: ["back-panel"],
    joinery: "Glue and staple",
    hardware: ["Wood glue", '1-1/4" staples'],
  });

  // Door stops (frameless only)
  if (inputs.construction === "frameless") {
    steps.push({
      order: order++,
      instruction:
        'Attach door stops to the inside of the cabinet on each side, set back 7/8" from the front edge. Door stops allow for door adjustment.',
      parts: ["door-stop"],
      joinery: "Glue and staple",
      hardware: ["Wood glue", '1-1/4" staples'],
    });
  }

  // Face frame
  if (inputs.construction === "faceframe") {
    steps.push({
      order: order++,
      instruction:
        "Assemble the face frame (stiles and rails). Attach to the cabinet case with glue and staples.",
      parts: ["ff-stile", "ff-rail"],
      joinery: "Glue and staple",
      hardware: ["Wood glue", '1-1/4" staples'],
    });
  }

  // Shelves
  if (inputs.shelfCount > 0) {
    const shelfNote =
      inputs.construction === "frameless"
        ? " Shelves are set back to clear the 3\" door stops."
        : "";
    steps.push({
      order: order++,
      instruction: `Drill shelf pin holes using 32mm system on both side panels. Install ${inputs.shelfCount} adjustable shelf/shelves.${shelfNote}`,
      parts: ["shelf"],
      hardware: [
        `1/4" shelf pins (qty ${inputs.shelfCount * 4})`,
        "5mm drill bit",
      ],
    });
  }

  // Attach toe kick to cabinet bottom
  steps.push({
    order: order++,
    instruction:
      "Flip cabinet upside down. Attach the toe kick frame to the bottom of the cabinet by screwing through the bottom of the toe kick into the cabinet bottom panel.",
    parts: ["toe-kick-fb", "toe-kick-side", "toe-kick-rib"],
    hardware: ['#8 x 1-1/4" screws'],
  });

  // Riser frame
  steps.push({
    order: order++,
    instruction:
      'Assemble riser frame from long and short pieces. Attach to the top of the cabinet with screws, set back 1" from all edges. Creates a 1/2" gap between cabinet and countertop.',
    parts: ["riser-long", "riser-short"],
    hardware: ['#8 x 1-1/4" screws'],
  });

  // Countertop build-up strips
  steps.push({
    order: order++,
    instruction:
      'Attach build-up strips to the underside of the countertop around all edges. This creates a 1-1/2" visual thickness when laminated.',
    parts: ["counter-top", "ct-buildup-long", "ct-buildup-short"],
    joinery: "Glue and staple",
    hardware: ["Wood glue", '1" staples'],
  });

  // Laminate and set countertop
  steps.push({
    order: order++,
    instruction:
      "Apply laminate to the countertop assembly covering all visible surfaces and joints. Set the finished countertop onto the riser frame.",
    parts: ["counter-top"],
    hardware: ["Contact cement", "Laminate sheets", "J-roller"],
  });

  // Doors
  steps.push({
    order: order++,
    instruction: `Hang ${inputs.doorCount === 1 ? "door" : "doors"} using European concealed hinges. Adjust for even reveal${inputs.construction === "frameless" ? " against door stops" : ""}.`,
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
      "Install door pulls/knobs. Final sand and finish as desired.",
    parts: ["door"],
    hardware: [
      `Door pulls or knobs (qty ${inputs.doorCount})`,
      "Mounting screws",
    ],
  });

  return steps;
}
