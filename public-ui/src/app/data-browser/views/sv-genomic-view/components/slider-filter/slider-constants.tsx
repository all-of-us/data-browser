export const view = [1000, 150]; // ViewBox: Width, Height
export const trbl = [20, 50, 20, 50]; // Margins: Top, Right, Bottom, Left

export const dims = [
  view[0] - trbl[1] - trbl[3], // Adjusted dimensions width
  view[1] - trbl[0] - trbl[2] // Adjusted dimensions height
];
