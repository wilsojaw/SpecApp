export const TOE_KICK_HEIGHT = 4;
export const TOE_KICK_SETBACK = 2.5;
export const RISER_HEIGHT = 1.25;
export const RISER_SETBACK = 1;
export const DOOR_STOP_WIDTH = 3;
export const DOOR_STOP_SETBACK = 7 / 8; // 7/8"
export const FACE_FRAME_WIDTH = 1.5;
export const SHELF_CLEARANCE = 1 / 16;
export const DOOR_REVEAL = 1 / 8;
export const OVERLAY = 0.5;
export const CT_BUILDUP_HEIGHT = 0.75; // 3/4" tall strips for 1-1/2" visual edge

export function computeCaseHeight(
  height: number,
  materialThickness: number,
): number {
  return height - TOE_KICK_HEIGHT - RISER_HEIGHT - materialThickness;
}
