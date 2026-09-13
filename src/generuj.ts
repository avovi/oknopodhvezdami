/**
 * Složí statické stránky ze šablon ve složce sablony/.
 * Spouští se přes `npm run build`; výsledné HTML se commituje, aby web běžel
 * rovnou z gitu bez buildu na serveru.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

type Stranka = {
  /** cesta výsledného souboru vůči kořeni webu */
  soubor: string;
  /** adresa, na které stránka poběží — zároveň klíč pro zvýraznění v menu */
  adresa: string;
  sablona: string;
  titulek: string;
  popis: string;
  /** kolikrát je potřeba jít nahoru, aby se trefily společné soubory */
  zaklad: string;
  vMenu: boolean;
  nazevVMenu: string;
  /** domovská stránka má hero, hlavička nad ním je průhledná */
  sHerem: boolean;
};

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Kontaktní údaje na jednom místě — až je majitelka dodá, mění se jen tady
 * a propíšou se do všech stránek i do formulářů.
 */
const kontakt = {
  email: 'doplnit@e-mail.cz',
  telefon: '+420 000 000 000',
  telefonOdkaz: '+420000000000',
};

const stranky: Stranka[] = [
  {
    soubor: 'index.html',
    adresa: '',
    sablona: 'domu',
    titulek: 'Okno pod hvězdami – prázdninový dům v Městečku Trnávka',
    popis:
      'Celý prázdninový dům jen pro vás v Městečku Trnávka. Příroda, klid a společné chvíle — krb, terasa, dětský koutek a hvězdná obloha. Pejsci vítáni.',
    zaklad: '',
    vMenu: false,
    nazevVMenu: 'Domů',
    sHerem: true,
  },
  {
    soubor: 'dum/index.html',
    adresa: 'dum/',
    sablona: 'dum',
    titulek: 'Dům a vybavení – Okno pod hvězdami',
    popis:
      'Dispozice a vybavení prázdninového domu: obývák s krbem, plně vybavená kuchyně, dětský koutek, terasa a zahrada s ohništěm.',
    zaklad: '../',
    vMenu: true,
    nazevVMenu: 'Dům',
    sHerem: false,
  },
  {
    soubor: 'galerie/index.html',
    adresa: 'galerie/',
    sablona: 'galerie',
    titulek: 'Fotogalerie – Okno pod hvězdami',
    popis: 'Fotky prázdninového domu v Městečku Trnávka: interiér, ložnice, terasa, zahrada i okolí.',
    zaklad: '../',
    vMenu: true,
    nazevVMenu: 'Galerie',
    sHerem: false,
  },
  {
    soubor: 'rezervace/index.html',
    adresa: 'rezervace/',
    sablona: 'rezervace',
    titulek: 'Rezervace – Okno pod hvězdami',
    popis: 'Jak si zamluvit termín v prázdninovém domě Okno pod hvězdami. Poptávka bez poplatků, odpovídáme do 24 hodin.',
    zaklad: '../',
    vMenu: true,
    nazevVMenu: 'Rezervace',
    sHerem: false,
  },
  {
    soubor: 'voucher/index.html',
    adresa: 'voucher/',
    sablona: 'voucher',
    titulek: 'Dárkový voucher – Okno pod hvězdami',
    popis: 'Darujte pobyt v prázdninovém domě v Městečku Trnávka. Voucher na vybranou částku, zaslaný e-mailem.',
    zaklad: '../',
    vMenu: true,
    nazevVMenu: 'Voucher',
    sHerem: false,
  },
  {
    soubor: 'pro-hosty/index.html',
    adresa: 'pro-hosty/',
    sablona: 'pro-hosty',
    titulek: 'Pro hosty – ceník, cesta a výlety – Okno pod hvězdami',
    popis: 'Ceník pobytu, cesta do Městečka Trnávka, tipy na výlety v okolí a odpovědi na časté otázky.',
    zaklad: '../',
    vMenu: true,
    nazevVMenu: 'Pro hosty',
    sHerem: false,
  },
  {
    soubor: 'podminky/index.html',
    adresa: 'podminky/',
    sablona: 'podminky',
    titulek: 'Podmínky a ochrana údajů – Okno pod hvězdami',
    popis: 'Kdo zpracovává osobní údaje zadané na webu, proč a jak dlouho. Podmínky pobytu a dárkových voucherů.',
    zaklad: '../',
    vMenu: false,
    nazevVMenu: 'Podmínky',
    sHerem: false,
  },
  {
    soubor: 'kontakt/index.html',
    adresa: 'kontakt/',
    sablona: 'kontakt',
    titulek: 'Kontakt – Okno pod hvězdami',
    popis: 'Telefon, e-mail a adresa prázdninového domu Okno pod hvězdami v Městečku Trnávka.',
    zaklad: '../',
    vMenu: true,
    nazevVMenu: 'Kontakt',
    sHerem: false,
  },
];

const sablona = (jmeno: string): string => readFileSync(join(koren, 'sablony', `${jmeno}.html`), 'utf8');

/** Odkazy v menu — aktuální stránka se označí atributem aria-current. */
function menu(aktualni: Stranka): string {
  return stranky
    .filter((s) => s.vMenu)
    .map((s) => {
      const aktivni = s.adresa === aktualni.adresa;
      const atribut = aktivni ? ' class="aktivni" aria-current="page"' : '';
      return `<a href="${aktualni.zaklad}${s.adresa}"${atribut}>${s.nazevVMenu}</a>`;
    })
    .join('\n      ');
}

function slozka(cesta: string): void {
  const nadrazena = dirname(cesta);
  if (nadrazena && nadrazena !== '.') mkdirSync(nadrazena, { recursive: true });
}

const kostra = sablona('layout');

for (const stranka of stranky) {
  const obsah = sablona(stranka.sablona).replaceAll('{{zaklad}}', stranka.zaklad);
  const odkazy = menu(stranka);

  const html = kostra
    .replaceAll('{{titulek}}', stranka.titulek)
    .replaceAll('{{popis}}', stranka.popis)
    .replaceAll('{{telo}}', stranka.sHerem ? 'domu' : 'podstranka')
    .replaceAll('{{hlavicka}}', stranka.sHerem ? '' : 'prilepena')
    .replaceAll('{{navigace-paticka}}', odkazy)
    .replaceAll('{{navigace}}', odkazy)
    .replaceAll('{{obsah}}', obsah)
    .replaceAll('{{email}}', kontakt.email)
    .replaceAll('{{telefon}}', kontakt.telefon)
    .replaceAll('{{telefon-odkaz}}', kontakt.telefonOdkaz)
    .replaceAll('{{zaklad}}', stranka.zaklad);

  const cil = join(koren, stranka.soubor);
  slozka(cil);
  writeFileSync(cil, html, 'utf8');
  console.log(`hotovo: ${stranka.soubor}`);
}
