"""
Kresba do patičky: Cimburk na kopci, pod ním Městečko Trnávka a stranou
dům, ve kterém se svítí.

Kreslí se skriptem kvůli jediné věci — ruka nekreslí rovně. Každá úsečka
projde funkcí `tah()`, která ji mírně prohne, konce nechá přetáhnout přes
roh a u výraznějších prvků tah zopakuje, jako když se čára obtahuje.
Bez toho vypadá kresba jako z pravítka.

Spuštění:  python3 nastroje/kresba.py
Zapíše:    sablony/cimburk.svg
"""

import math
import random
from pathlib import Path

random.seed(4242)


def tah(body, chveni=2.2, presah=3.6, zavrit=False):
    """
    Polyline nakreslená od ruky: segmenty jsou mírně prohnuté,
    konce přetahují přes roh.
    """
    b = [tuple(map(float, p)) for p in body]
    if zavrit:
        b = b + [b[0]]

    # přetažení na začátku a na konci
    def posun(od, k, o):
        dx, dy = k[0] - od[0], k[1] - od[1]
        d = math.hypot(dx, dy) or 1
        return (od[0] - dx / d * o, od[1] - dy / d * o)

    if not zavrit and presah:
        b[0] = posun(b[0], b[1], presah * random.uniform(0.5, 1.2))
        b[-1] = posun(b[-1], b[-2], presah * random.uniform(0.5, 1.2))

    d = f"M{b[0][0]:.1f} {b[0][1]:.1f}"
    for i in range(len(b) - 1):
        p0, p1 = b[i], b[i + 1]
        dx, dy = p1[0] - p0[0], p1[1] - p0[1]
        delka = math.hypot(dx, dy) or 1
        # kolmice, o kterou se střed segmentu vychýlí
        nx, ny = -dy / delka, dx / delka
        odchylka = random.uniform(-chveni, chveni) * min(1.5, 0.35 + delka / 45)
        cx = (p0[0] + p1[0]) / 2 + nx * odchylka
        cy = (p0[1] + p1[1]) / 2 + ny * odchylka
        d += f" Q{cx:.1f} {cy:.1f} {p1[0]:.1f} {p1[1]:.1f}"
    return d


def dvakrat(body, **kw):
    """Dva tahy přes sebe — obtažená linka, jak vzniká při kreslení."""
    return [tah(body, **kw), tah(body, **kw)]


def hvezda(x, y, r):
    """Čtyřcípá hvězda s prohnutými rameny."""
    m = r * 0.22
    return (f"M{x} {y-r} C{x+m} {y-m} {x+m} {y-m} {x+r} {y} "
            f"C{x+m} {y+m} {x+m} {y+m} {x} {y+r} "
            f"C{x-m} {y+m} {x-m} {y+m} {x-r} {y} "
            f"C{x-m} {y-m} {x-m} {y-m} {x} {y-r} Z")


def koruna(x, y, r, hrbolku=8):
    """Koruna stromu — uzavřená vlnitá křivka, žádné kolečko."""
    body = []
    for i in range(hrbolku):
        uhel = 2 * math.pi * i / hrbolku - math.pi / 2
        rr = r * random.uniform(0.84, 1.14)
        body.append((x + math.cos(uhel) * rr, y + math.sin(uhel) * rr * 0.9))
    d = f"M{body[0][0]:.1f} {body[0][1]:.1f}"
    for i in range(1, hrbolku + 1):
        a, p = body[i % hrbolku], body[i - 1]
        stred = math.atan2((a[1] + p[1]) / 2 - y, (a[0] + p[0]) / 2 - x)
        vypouklost = r * random.uniform(0.22, 0.4)
        cx = (a[0] + p[0]) / 2 + math.cos(stred) * vypouklost
        cy = (a[1] + p[1]) / 2 + math.sin(stred) * vypouklost
        d += f" Q{cx:.1f} {cy:.1f} {a[0]:.1f} {a[1]:.1f}"
    return d + " Z"


def strom(x, zem, vyska, r):
    kmen = tah([(x, zem), (x + random.uniform(-1.5, 1.5), zem - vyska)], chveni=1.4, presah=0.8)
    return [koruna(x, zem - vyska - r * 0.35, r), kmen]


def domek(x, sirka, vyska, zaklad, strecha, presah=3):
    """
    Chalupa nakreslená po tazích — každá hrana zvlášť, rohy se kříží.
    Přetažení je úměrné velikosti domku, aby drobné chalupy nebyly
    roztřepenější než dům v popředí.
    """
    v = zaklad - vyska
    mira = min(sirka, vyska) / 26          # 1.0 zhruba u největší chalupy
    p = max(0.8, 1.8 * mira)
    ch = max(0.5, 1.0 * mira)
    vrchol = (x + sirka / 2 + random.uniform(-0.8, 0.8), v - strecha)
    return [
        tah([(x, zaklad), (x, v)], chveni=ch, presah=p),
        tah([(x + sirka, zaklad), (x + sirka, v)], chveni=ch, presah=p),
        tah([(x - presah, v), (x + sirka + presah, v)], chveni=ch, presah=p * 0.7),
        tah([(x - presah + 1, v + 0.8), vrchol], chveni=ch, presah=p),
        tah([vrchol, (x + sirka + presah - 1, v + 0.8)], chveni=ch, presah=p),
    ]


# ── obloha ───────────────────────────────────────────────────────────────────
hvezdy = [(430, 68, 18), (479, 104, 10), (389, 109, 7), (467, 33, 6), (105, 68, 8.5)]

# ── hrad ─────────────────────────────────────────────────────────────────────
hrad = [
    tah([(150, 112), (150, 86)], chveni=0.6, presah=1.3),
    tah([(206, 112), (206, 86)], chveni=0.6, presah=1.3),
    tah([(143, 86), (213, 86)], chveni=0.6, presah=1.2),
    tah([(143, 87), (178, 64)], chveni=0.7, presah=1.3),
    tah([(178, 64), (213, 87)], chveni=0.7, presah=1.3),
    tah([(184, 88), (184, 55)], chveni=0.55, presah=1.2),
    tah([(205, 88), (205, 55)], chveni=0.55, presah=1.2),
    tah([(180, 55), (194.5, 28)], chveni=0.6, presah=1.2),
    tah([(194.5, 28), (209, 55)], chveni=0.6, presah=1.2),
]

# ── kopec ────────────────────────────────────────────────────────────────────
kopec = ["M0 203 C40 198 70 172 104 148 C136 125 166 110 194 108"
         " C224 106 252 126 282 152 C312 178 340 196 374 203"]

# ── městečko ─────────────────────────────────────────────────────────────────
mestecko = []
for a in [(58, 32, 22, 208, 17), (106, 26, 18, 208, 14), (150, 40, 26, 208, 19),
          (216, 28, 20, 208, 15), (264, 24, 16, 208, 13)]:
    mestecko += domek(*a)
mestecko += [
    tah([(197, 208), (197, 166)], chveni=0.7, presah=1.6),
    tah([(217, 208), (217, 166)], chveni=0.7, presah=1.6),
    tah([(193, 166), (221, 166)], chveni=0.7, presah=1.4),
    tah([(193, 167), (207, 142)], chveni=0.7, presah=1.3),
    tah([(207, 142), (221, 167)], chveni=0.7, presah=1.3),
]

# ── náš dům ──────────────────────────────────────────────────────────────────
dum = (dvakrat([(391, 214), (391, 172)], chveni=1.2, presah=3)
       + dvakrat([(469, 214), (469, 172)], chveni=1.2, presah=3)
       + [tah([(382, 172), (478, 172)], chveni=1.3, presah=2.6)]
       + dvakrat([(381, 173), (430, 137)], chveni=1.3, presah=3)
       + dvakrat([(430, 137), (479, 173)], chveni=1.3, presah=3)
       + [tah([(453, 150), (453, 130)], chveni=0.55, presah=1.2),
          tah([(453, 130), (462, 130)], chveni=0.8, presah=1.6),
          tah([(462, 130), (462, 157)], chveni=0.55, presah=1.2),
          tah([(440, 214), (440, 197), (431, 190), (422, 197), (422, 214)], chveni=1, presah=2)])

zeme = ["M0 215 C90 210 170 208 250 208 C330 208 420 212 520 217"]

stromy_popredi = strom(35, 214, 24, 15)
stromy_pozadi = strom(501, 216, 17, 11) + strom(339, 210, 13, 8)


def skupina(cesty, sirka, opacita=1.0, dalsi=""):
    radky = "\n".join(f'      <path d="{c}"/>' for c in cesty)
    o = f' opacity="{opacita}"' if opacita < 1 else ""
    return f'    <g stroke-width="{sirka}"{o}{dalsi}>\n{radky}\n    </g>'


svg = f'''<svg class="cimburk" viewBox="0 0 520 250" role="img" aria-label="Hrad Cimburk nad Městečkem Trnávka a prázdninový dům pod hvězdami">
  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">

    <!-- hvězdy nad domem -->
    <g fill="currentColor" stroke="none">
{chr(10).join(f'      <path d="{hvezda(*h)}"/>' for h in hvezdy)}
    </g>

    <!-- Cimburk na hřebeni -->
{skupina(hrad, 1.1, 0.5)}

    <!-- kopec -->
{skupina(kopec, 1.15, 0.8)}

    <!-- Městečko Trnávka -->
{skupina(mestecko, 1.2, 0.6)}

    <!-- náš dům -->
{skupina(dum, 1.7)}
    <g fill="currentColor" stroke="none">
      <path d="M400.4 182.6 Q407 181.6 413.4 182.4 Q414 189.6 413 197.2 Q406.6 198 400 197.2 Q399.4 189.8 400.4 182.6 Z"/>
      <path d="M449.6 182.4 Q456.4 181.4 462.8 182.6 Q463.4 190 462.6 197 Q456 198.2 449.4 197 Q448.8 189.8 449.6 182.4 Z"/>
    </g>

    <!-- země -->
{skupina(zeme, 1.15, 0.8)}

    <!-- stromy -->
{skupina(stromy_popredi, 1.3)}
{skupina(stromy_pozadi, 1.1, 0.68)}
  </g>
</svg>
'''

Path("sablony/cimburk.svg").write_text(svg)
print("zapsáno: sablony/cimburk.svg")
