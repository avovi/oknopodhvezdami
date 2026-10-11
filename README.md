# Okno pod hvězdami

Web prázdninového domu **Okno pod hvězdami** v Městečku Trnávka.

Statická stránka bez frameworku. Chování je psané v TypeScriptu, stránky se
skládají ze šablon — výsledné HTML i `script.js` jsou verzované, takže web běží
rovnou z gitu (GitHub Pages) bez buildu na serveru.

## Stránky

| Adresa | Obsah |
| --- | --- |
| `/` | úvod, rozcestník, pro koho je dům, náhled fotek |
| `/dum/` | dispozice, vybavení, fotky ve složkách Přízemí / Podkroví / Zahrada |
| `/rezervace/` | kalendář obsazenosti, důležité informace, ceník, storno, poptávkový formulář |
| `/pro-hosty/` | kudy k nám, o okolí, výlety, koupání, lyžování, časté otázky |
| `/domovni-rad/` | domovní řád — samostatná stránka, jde i vytisknout |
| `/podminky/` | rozcestník dokumentů, podmínky pobytu, ochrana údajů |
| `/kontakt/` | e-mail a adresa |

V hlavním menu jsou jen Dům, Rezervace a ceník a Informace pro hosty —
tak to chce majitelka. Kontakt je jen v patičce.

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
obsazenost.json       obsazené termíny pro kalendář, viz níž
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

## Kalendář obsazenosti

Kalendář na stránce Rezervace a ceník si při načtení přečte `obsazenost.json`.
Novou rezervaci zapíšeš jako další řádek — build není potřeba, stačí commit:

```json
{
  "obsazeno": [
    { "prijezd": "2026-12-23", "odjezd": "2026-12-30" }
  ]
}
```

`odjezd` je den, kdy hosté odjíždějí. Ten den kalendář ukáže napůl volný,
protože odpoledne může přijet někdo další. Když se soubor nepodaří načíst,
kalendář nic nevymýšlí a napíše, že volno ověříme e-mailem.

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

Údaje od majitelky jsou doplněné — kapacita, vybavení, ceník po sezónách,
záloha, storno, časy příjezdu, podmínky pro psy i vzdálenosti k výletům.

Zbývají tři pole označená cihlovou barvou s přerušovaným podtržením, všechna
na stránce s podmínkami: jméno provozovatelky, IČO a sídlo, plus doba uchování
osobních údajů. V šablonách je najdeš podle `class="doplnit"`.

Dál se čeká na ulici a číslo popisné (po kolaudaci), na fotky a na právní
dokumenty — obchodní podmínky a zásady ochrany údajů dodá majitelka po
kolaudaci a patří na stránku Podmínky. Kalendář je hotový, jen zatím nemá
žádné obsazené termíny.

Logo už je opravené — verze s háčkem v nápisu „HVĚZDAMI". Jedna hvězda v okně
zůstává, majitelka ji bere jako ilustrativní. 
