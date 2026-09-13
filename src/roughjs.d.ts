/**
 * Typy pro bundlovanou verzi rough.js. Balíček svoje .d.ts sice má, ale
 * u cesty s příponou .esm.js je TypeScript nenajde, tak si popíšeme
 * tu část API, kterou kresba používá.
 */
declare module 'roughjs/bundled/rough.esm.js' {
  export interface NastaveniTahu {
    roughness?: number;
    bowing?: number;
    seed?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    disableMultiStroke?: boolean;
    fillStyle?: 'hachure' | 'solid' | 'zigzag' | 'cross-hatch' | 'dots';
    hachureGap?: number;
    hachureAngle?: number;
    fillWeight?: number;
  }

  export interface Kresba {
    shape: string;
  }

  export interface Cesta {
    d: string;
    stroke: string;
    strokeWidth: number;
    fill: string;
  }

  export interface Generator {
    line(x1: number, y1: number, x2: number, y2: number, o?: NastaveniTahu): Kresba;
    path(d: string, o?: NastaveniTahu): Kresba;
    linearPath(body: [number, number][], o?: NastaveniTahu): Kresba;
    polygon(body: [number, number][], o?: NastaveniTahu): Kresba;
    toPaths(kresba: Kresba): Cesta[];
  }

  const rough: { generator(config?: unknown): Generator };
  export default rough;
}
