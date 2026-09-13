# Okno pod hvězdami

Web prázdninového domu **Okno pod hvězdami** v Městečku Trnávka.

Statická stránka bez frameworku. Chování je psané v TypeScriptu, stránky se
skládají ze šablon — výsledné HTML i `script.js` jsou verzované, takže web běží
rovnou z gitu (GitHub Pages) bez buildu na serveru.

## Stránky

| Adresa | Obsah |
| --- | --- |
| `/` | úvod, rozcestník, pro koho je dům, náhled galerie |
| `/dum/` | dispozice a vybavení |
| `/galerie/` | fotogalerie se zvětšováním |
| `/rezervace/` | jak zamluvit termín + poptávkový formulář |
| `/pro-hosty/` | ceník, kudy k nám, výlety, časté otázky |
| `/kontakt/` | telefon, e-mail, adresa, provozovatel |

## Struktura

```
sablony/layout.html   společná kostra — hlavička, patička, menu
sablony/*.html        obsah jednotlivých stránek
src/generuj.ts        generátor, který z šablon poskládá HTML
src/main.ts           chování stránky v prohlížeči
styles.css            vizuální styl podle barevné typologie
script.js             zkompilovaný výstup z main.ts — needituj ručně
index.html, dum/…     vygenerované stránky — needituj ručně
img/                  fotky, viz FOTKY.md
podklady/             logo a brand manuál
```

## Vývoj

```bash
npm install     # jednou
npm run build   # přeloží TypeScript a vygeneruje stránky
npm start       # http://localhost:8123
```

Texty se upravují v `sablony/`, ne ve vygenerovaných `index.html`. Po každé
změně v `sablony/` nebo `src/` spusť `npm run build` a **zacommituj i výstup** —
jinak se změna na web nepropíše.

## Barvy a písma

| | |
| --- | --- |
| šalvějová | `#A7B19A` |
| tlumená cihlová | `#A65A4E` |
| béžová | `#D9C9B7` |
| bílá | `#F9F7F5` |
| doplňková černá | `#2B2B2B` |

Nadpisy Playfair Display, texty Montserrat, akcenty skriptem (Parisienne jako
náhrada za Alluna, která na Google Fonts není).

## Co ještě doplnit

Na stránkách jsou místa označená cihlovou barvou s přerušovaným podtržením —
to jsou údaje k doplnění: kapacita a dispozice, ceník, adresa a GPS, telefon,
e-mail, IČO a jméno provozovatele, časy příjezdu, podmínky pro psy, storno
a vzdálenosti k výletům. V šablonách je najdeš podle `class="doplnit"`.
