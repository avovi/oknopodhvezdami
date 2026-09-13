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
sablony/cimburk.svg   kresba do patičky — generovaná, needituj ručně
src/kresba.ts         kreslí Cimburk, městečko a dům přes rough.js
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

Kresba v patičce se skládá při buildu knihovnou rough.js, která čáry
rozechvěje a obtáhne dvakrát, aby vypadaly kreslené tužkou. Do prohlížeče
se z knihovny nedostane nic — výsledkem je obyčejné statické SVG. Kompozice
i „nálada ruky" se ladí v `src/kresba.ts`; hodnoty `roughness` a `bowing`
říkají, jak moc se čára vlní, `seed` drží výsledek mezi buildy stejný.

Texty se upravují v `sablony/`, ne ve vygenerovaných `index.html`. Po každé
změně v `sablony/` nebo `src/` spusť `npm run build` a **zacommituj i výstup** —
jinak se změna na web nepropíše.

## Barvy a písma

| | |
| --- | --- |
| šalvějová | `#97A289` |
| tlumená cihlová | `#A8584D` |
| béžová | `#D9C9B7` |
| bílá | `#FFFFFF` |
| doplňková černá | `#000000` |

Z nich jsou odvozené dva pracovní odstíny, které v paletě nejsou: světlejší
béžová `#EDE4D9` na plochy sekcí a tmavší varianty zelené a cihlové na najetí
myší. Všechny jsou v `styles.css` nahoře jako proměnné.

Nadpisy Playfair Display, texty Montserrat, akcenty skriptem (Parisienne jako
náhrada za Alluna, která na Google Fonts není).

## Co ještě doplnit

Na stránkách jsou místa označená cihlovou barvou s přerušovaným podtržením —
to jsou údaje k doplnění: kapacita a dispozice, ceník, adresa a GPS, telefon,
e-mail, IČO a jméno provozovatele, časy příjezdu, podmínky pro psy, storno
a vzdálenosti k výletům. V šablonách je najdeš podle `class="doplnit"`.

Logo je potřeba upravit, to co jsme dostali má typografické a gramatické chybyy (chybějící háček a pod zvědzdami v logu je jen jedna hvězda). 
