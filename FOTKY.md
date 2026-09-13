# Kam nahrát fotky

Stránka počítá s těmito soubory. Dokud některý chybí, zobrazí se na jeho místě
béžová plocha s popisem toho, co sem patří — nic se nerozbije.

| Soubor | Kde se objeví |
| --- | --- |
| `img/hero.jpg` | velká fotka přes celou úvodní obrazovku (na šířku, ideálně 2400 px) |
| `img/hero-2.jpg`, `img/hero-3.jpg` | volitelné — pokud jsou, hero je po sedmi vteřinách prostřídá |
| `img/karta-dum.jpg` | karta „Co nabízíme" (na výšku) |
| `img/karta-rezervace.jpg` | karta „Rezervace" (na výšku) |
| `img/karta-hoste.jpg` | karta „Informace pro naše hosty" (na výšku) |
| `img/dum.jpg` | pohled na dům v sekci Dům (na výšku) |
| `img/motivace.jpg` | fotka u motivačního textu (na výšku) |
| `img/kontakt.jpg` | fotka u kontaktu (na výšku) |
| `img/galerie/01.jpg` … `08.jpg` | fotogalerie (čtverec nebo na výšku) |

| `img/okoli/01.jpg` | pozadí zelené sekce na úvodní stránce |
| `img/okoli/02.jpg` | pozadí zelené sekce na stránce Dům |
| `img/okoli/03.jpg` | pozadí cihlové sekce s formulářem |

Fotky okolí leží pod barevnou plochou, která je z 85 % zakryje — zbyde z nich
nálada, ne detaily. Hodí se krajina, louka, les, hrad v dálce; nehodí se nic
s drobnou kresbou nebo textem. Přidat další sekci s fotkou je jeden atribut
v šabloně: `class="sekce sekce-salvej sekce-foto" style="--foto: url('...')"`.
Sytost se ladí proměnnou `--kryti` v `styles.css`, pod 0,8 už text začne plavat.

Popisky v galerii se mění v šablonách u jednotlivých položek (`data-popis` a `alt`).

Majitelka fotky nahrává na Google Disk do sdílené složky a názvy řešit nemusí —
přejmenujeme si je sami podle tabulky výš.

Fotky před nasazením zmenši — na web stačí šířka do 2000 px a kvalita JPEG 80,
u hlavní fotky 2400 px.
