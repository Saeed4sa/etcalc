/**
 * Scientific Calculator Types & Interfaces
 */

export type CalculatorMode = 'scientific' | 'graphing' | 'programmer' | 'units' | 'stats';

export type AngleUnit = 'RAD' | 'DEG' | 'GRAD';

export type NotationFormat = 'norm' | 'sci' | 'eng' | 'fix';

export type ProgrammerBase = 'HEX' | 'DEC' | 'OCT' | 'BIN';

export type BitWordSize = 64 | 32 | 16 | 8;

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  formattedResult?: string;
  timestamp: number;
  angleUnit: AngleUnit;
}

export interface ScientificConstant {
  symbol: string;
  name: string;
  value: number;
  formatted: string;
  unit: string;
  category: 'Physics' | 'Chemistry' | 'Universal' | 'Astronomy' | 'Mathematics';
  description: string;
}

export interface UnitCategory {
  id: string;
  name: string;
  iconName: string;
  units: {
    id: string;
    name: string;
    symbol: string;
    toBase: (val: number) => number;
    fromBase: (val: number) => number;
  }[];
}

export type ThemeName = 'obsidian' | 'midnight' | 'emerald' | 'cyber';
