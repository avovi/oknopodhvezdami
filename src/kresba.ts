/**
 * Vygeneruje kresbu do patičky: Cimburk na kopci, pod ním Městečko Trnávka
 * a stranou dům, ve kterém se svítí.
 *
 * Ruční charakter obstarává rough.js — každou čáru rozechvěje a obtáhne
 * dvakrát, jako když kreslí tužka. Běží jen při buildu, do prohlížeče se
 * nic z knihovny nedostane; výsledkem je obyčejné statické SVG.
 *
 * Spouští `npm run build`. Zapisuje sablony/cimburk.svg.
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import rough, { type Kresba } from 'roughjs/bundled/rough.esm.js';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const kresli = rough.generator();

type Bod = [number, number];

/** Nastavení tahu. Seed drží výsledek stejný při každém buildu. */
type Ruka = { roughness: number; bowing: number; seed: number };

const dalka: Ruka = { roughness: 0.9, bowing: 1.1, seed: 11 };
const stred: Ruka = { roughness: 1.2, bowing: 1.3, seed: 22 };
const popredi: Ruka = { roughness: 1.5, bowing: 1.6, seed: 33 };
const klid: Ruka = { roughness: 0.6, bowing: 1.8, seed: 44 };

/** Z rough.js si bereme jen tvar cesty, barvu si řídíme sami přes currentColor. */
const cesty = (kresba: Kresba): string[] => kresli.toPaths(kresba).map((cesta) => cesta.d);

const cara = (a: Bod, b: Bod, ruka: Ruka): string[] =>
  cesty(kresli.line(a[0], a[1], b[0], b[1], ruka));

const krivka = (d: string, ruka: Ruka): string[] =>
  cesty(kresli.path(d, { ...ruka, fill: 'none' }));

const lomena = (body: Bod[], ruka: Ruka): string[] =>
  cesty(kresli.linearPath(body, ruka));

/**
 * Plocha vykreslená šrafou — tón, který dělá z obrysu malbu.
 * Vrací zvlášť šrafu a zvlášť obrys, aby šlo každé dát jinou sytost.
 */
function plocha(body: Bod[], ruka: Ruka, mezera = 4.5): { sraf: string[]; obrys: string[] } {
  const sraf = cesty(
    kresli.polygon(body, {
      ...ruka,
      fill: '#000',
      fillStyle: 'hachure',
      hachureGap: mezera,
      hachureAngle: -41,
      fillWeight: 0.55,
      stroke: 'none',
    }),
  );
  return { sraf, obrys: cesty(kresli.polygon(body, { ...ruka, fill: 'none' })) };
}

/** Chalupa: stěny, okapní hrana a sedlová střecha. */
function domek(x: number, sirka: number, vyska: number, zaklad: number, strecha: number, ruka: Ruka): string[] {
  const v = zaklad - vyska;
  const presah = Math.max(2.5, sirka * 0.11);
  return [
    ...lomena([[x, zaklad], [x, v], [x + sirka, v], [x + sirka, zaklad]], ruka),
    ...lomena([[x - presah, v], [x + sirka / 2, v - strecha], [x + sirka + presah, v]], ruka),
  ];
}

/** Koruna stromu — uzavřená vlnitá křivka, rough.js ji rozechvěje. */
function koruna(x: number, y: number, r: number): string {
  const body: Bod[] = [];
  const hrbolku = 9;
  for (let i = 0; i < hrbolku; i += 1) {
    const uhel = (Math.PI * 2 * i) / hrbolku - Math.PI / 2;
    body.push([x + Math.cos(uhel) * r, y + Math.sin(uhel) * r * 0.9]);
  }
  const [prvni, ...zbytek] = body;
  if (!prvni) return '';
  let d = `M${prvni[0].toFixed(1)} ${prvni[1].toFixed(1)}`;
  [...zbytek, prvni].forEach((bod, i) => {
    const predchozi = i === 0 ? prvni : (zbytek[i - 1] ?? prvni);
    const sx = (predchozi[0] + bod[0]) / 2;
    const sy = (predchozi[1] + bod[1]) / 2;
    const smer = Math.atan2(sy - y, sx - x);
    const cx = sx + Math.cos(smer) * r * 0.3;
    const cy = sy + Math.sin(smer) * r * 0.3;
    d += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bod[0].toFixed(1)} ${bod[1].toFixed(1)}`;
  });
  return `${d} Z`;
}

const strom = (x: number, zem: number, vyska: number, r: number, ruka: Ruka): string[] => [
  ...krivka(koruna(x, zem - vyska - r * 0.3, r), ruka),
  ...cara([x, zem], [x, zem - vyska], ruka),
];

/** Čtyřcípá hvězda — ta zůstává hladká, je to znak z loga, ne kresba. */
const hvezda = (x: number, y: number, r: number): string => {
  const m = r * 0.22;
  return (
    `M${x} ${y - r} C${x + m} ${y - m} ${x + m} ${y - m} ${x + r} ${y} ` +
    `C${x + m} ${y + m} ${x + m} ${y + m} ${x} ${y + r} ` +
    `C${x - m} ${y + m} ${x - m} ${y + m} ${x - r} ${y} ` +
    `C${x - m} ${y - m} ${x - m} ${y - m} ${x} ${y - r} Z`
  );
};

// ── kompozice ────────────────────────────────────────────────────────────────

const hvezdy: Bod[] = [[430, 68], [479, 104], [389, 109], [467, 33], [105, 68]];
const velikosti = [18, 10, 7, 6, 8.5];

/**
 * Cimburk podle dobové rekonstrukce: mohutný palác s vysokou valbovou
 * střechou, z jehož pravé části vyrůstá válcová věž s vysokou špičkou.
 * Vpravo přes nádvoří nižší křídlo s věžicí, celé obehnané palisádou.
 */
const palacStrecha = plocha([[140, 117], [157, 95], [191, 95], [208, 117]], dalka, 3.8);
const vezSpicka = plocha([[181, 83], [196, 51], [211, 83]], dalka, 3.4);
const kridloStrecha = plocha([[206, 127], [220, 111], [234, 127]], dalka, 3.4);
const vezicSpicka = plocha([[232, 123], [243, 103], [254, 123]], dalka, 3.2);

const hrad = [
  // nižší křídlo vlevo, přisazené k paláci
  ...lomena([[126, 151], [126, 133], [146, 131]], dalka),
  ...cara([122, 133], [150, 126], dalka),
  // palác
  ...lomena([[146, 150], [146, 117], [202, 117], [202, 149]], dalka),
  ...palacStrecha.obrys,
  // válcová věž s vysokou špičkou
  ...lomena([[185, 121], [185, 83], [207, 83], [207, 121]], dalka),
  ...vezSpicka.obrys,
  // východní křídlo a věžice hned vedle
  ...lomena([[206, 149], [206, 127], [234, 127], [234, 151]], dalka),
  ...kridloStrecha.obrys,
  ...lomena([[234, 151], [234, 123], [254, 123], [254, 153]], dalka),
  ...vezicSpicka.obrys,
  // hradba kopíruje hranu ostrohu
  ...krivka('M110 152 C130 148 160 146 196 146 C226 146 250 149 270 155', dalka),
];

/** Palisáda na hradbě — kůly posazené podle sklonu terénu. */
const palisada = [116, 121, 126, 131, 258, 263, 268].flatMap((x) => {
  const y = x < 140 ? 150 - (x - 112) * 0.22 : 152 + (x - 254) * 0.3;
  return cara([x, y], [x, y - 7], dalka);
});
hrad.push(...palisada);

const hradSraf = [
  ...palacStrecha.sraf,
  ...vezSpicka.sraf,
  ...kridloStrecha.sraf,
  ...vezicSpicka.sraf,
];

const kopec = krivka(
  'M0 214 C34 210 60 186 92 164 C118 146 142 140 176 139 C214 138 248 142 276 152'
  + ' C312 165 344 194 396 212',
  klid,
);

const mestecko = [
  ...domek(58, 32, 22, 208, 17, stred),
  ...domek(106, 26, 18, 208, 14, stred),
  ...domek(150, 40, 26, 208, 19, stred),
  ...domek(216, 28, 20, 208, 15, stred),
  ...domek(264, 24, 16, 208, 13, stred),
  ...lomena([[197, 208], [197, 166], [217, 166], [217, 208]], stred),
  ...lomena([[193, 166], [207, 142], [221, 166]], stred),
];

const dum = [
  ...lomena([[391, 214], [391, 172], [469, 172], [469, 214]], popredi),
  ...lomena([[382, 172], [430, 137], [478, 172]], popredi),
  ...cara([453, 148], [453, 131], popredi),
  ...cara([453, 131], [462, 131], popredi),
  ...cara([462, 131], [462, 155], popredi),
  ...lomena([[422, 214], [422, 196], [431, 190], [440, 196], [440, 214]], popredi),
];

const zeme = krivka('M0 215 C90 210 170 208 250 208 C330 208 420 212 520 217', klid);

const stromyPopredi = strom(35, 214, 24, 15, popredi);
const stromyPozadi = [...strom(501, 216, 17, 11, stred), ...strom(339, 210, 13, 8, stred)];

// ── složení SVG ──────────────────────────────────────────────────────────────

const skupina = (cesty: string[], sirka: number, opacita = 1): string => {
  const pruhlednost = opacita < 1 ? ` opacity="${opacita}"` : '';
  const radky = cesty.map((d) => `      <path d="${d}"/>`).join('\n');
  return `    <g stroke-width="${sirka}"${pruhlednost}>\n${radky}\n    </g>`;
};

const svg = `<svg class="cimburk" viewBox="0 0 520 250" role="img" aria-label="Hrad Cimburk nad Městečkem Trnávka a prázdninový dům pod hvězdami">
  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">

    <!-- hvězdy nad domem -->
    <g fill="currentColor" stroke="none">
${hvezdy.map((h, i) => `      <path d="${hvezda(h[0], h[1], velikosti[i] ?? 6)}"/>`).join('\n')}
    </g>

    <!-- Cimburk na hřebeni -->
${skupina(hradSraf, 0.5, 0.28)}
${skupina(hrad, 0.9, 0.62)}

    <!-- kopec -->
${skupina(kopec, 1.15, 0.8)}

    <!-- Městečko Trnávka -->
${skupina(mestecko, 1, 0.6)}

    <!-- náš dům -->
${skupina(dum, 1.5)}
    <g fill="currentColor" stroke="none">
      <path d="M400.4 182.6 Q407 181.6 413.4 182.4 Q414 189.6 413 197.2 Q406.6 198 400 197.2 Q399.4 189.8 400.4 182.6 Z"/>
      <path d="M449.6 182.4 Q456.4 181.4 462.8 182.6 Q463.4 190 462.6 197 Q456 198.2 449.4 197 Q448.8 189.8 449.6 182.4 Z"/>
    </g>

    <!-- země -->
${skupina(zeme, 1.15, 0.8)}

    <!-- stromy -->
${skupina(stromyPopredi, 1.3)}
${skupina(stromyPozadi, 1.05, 0.65)}
  </g>
</svg>
`;

writeFileSync(join(koren, 'sablony', 'cimburk.svg'), svg, 'utf8');
console.log('hotovo: sablony/cimburk.svg');
