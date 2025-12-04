export interface Dimensions {
  thickness: number;
  width: number;
  length: number;
}

export interface FinishedPart extends Dimensions {
  id: string;
  name: string;
  quantity: number;
}

export interface RawStock extends Dimensions {
  id: string;
  name: string; // e.g., "2x4", "1x6 rough"
}

export interface Settings {
  thicknessAllowance: number; // How much thicker raw stock must be
  widthAllowance: number; // How much wider raw stock must be
  kerf: number; // Saw blade thickness
  unit: 'mm' | 'inch';
}

export interface Cut {
  partName: string;
  length: number;
  count: number;
}

export interface RawBoardResult {
  rawStockName: string;
  dimensions: Dimensions;
  cuts: Cut[];
  waste: number;
  quantityNeeded: number;
}

export interface OptimizationResult {
  plan: RawBoardResult[];
  unmatchableParts: string[]; // Names of parts that couldn't fit anywhere
  totalRawVolume: number;
}