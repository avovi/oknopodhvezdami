"use strict";
/**
 * Okno pod hvězdami — chování stránky.
 * Kompiluje se do script.js (npm run build), aby web běžel rovnou z gitu bez buildu.
 */
/**
 * Průhledná hlavička nad hero fotkou po odscrollování zesvětlá.
 * Na podstránkách žádné hero není a hlavička je světlá rovnou ze šablony.
 */
function hlavicka() {
    const el = document.querySelector('.hlavicka');
    if (!el || !document.querySelector('.hero'))
        return;
    const prekresli = () => {
        el.classList.toggle('prilepena', window.scrollY > 40);
    };
    prekresli();
    window.addEventListener('scroll', prekresli, { passive: true });
}
/** Mobilní menu. */
function menu() {
    const tlacitko = document.querySelector('.menu-tlacitko');
    const navigace = document.querySelector('.navigace');
    const hlava = document.querySelector('.hlavicka');
    if (!tlacitko || !navigace || !hlava)
        return;
    const zavri = () => {
        tlacitko.setAttribute('aria-expanded', 'false');
        navigace.classList.remove('otevrena');
        hlava.classList.remove('menu-otevrene');
        document.body.style.removeProperty('overflow');
    };
    tlacitko.addEventListener('click', () => {
        const otevreno = tlacitko.getAttribute('aria-expanded') === 'true';
        if (otevreno) {
            zavri();
            return;
        }
        tlacitko.setAttribute('aria-expanded', 'true');
        navigace.classList.add('otevrena');
        hlava.classList.add('menu-otevrene');
        document.body.style.overflow = 'hidden';
    });
    navigace.querySelectorAll('a').forEach((odkaz) => odkaz.addEventListener('click', zavri));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape')
            zavri();
    });
}
/**
 * Dokud chybí fotka, ukáže se místo ní popis toho, co sem patří.
 * Stačí nahrát soubor pod stejným jménem a zástupná plocha zmizí sama.
 */
function chybejiciFotky() {
    const mista = document.querySelectorAll('[data-popis]');
    mista.forEach((misto) => {
        const obrazek = misto.querySelector('img');
        if (!obrazek)
            return;
        const oznac = () => misto.classList.add('chybi-foto');
        if (obrazek.complete) {
            if (obrazek.naturalWidth === 0)
                oznac();
        }
        else {
            obrazek.addEventListener('error', oznac);
            obrazek.addEventListener('load', () => {
                if (obrazek.naturalWidth === 0)
                    oznac();
            });
        }
    });
}
/**
 * Fotogalerie se zvětšením přes celou obrazovku. Šipky listují jen fotkami
 * z téže galerie — v přízemí se tak nepřeskočí na zahradu.
 */
function galerie() {
    const lupa = document.querySelector('#lupa');
    const lupaFoto = document.querySelector('#lupa-foto');
    const lupaPopis = document.querySelector('#lupa-popis');
    if (!lupa || !lupaFoto || !lupaPopis)
        return;
    let seznam = [];
    let aktualni = 0;
    let vyvolal = null;
    const snimky = (galerie) => Array.from(galerie.querySelectorAll('button.polozka'))
        .filter((p) => !p.classList.contains('chybi-foto'))
        .map((p) => ({
        src: p.querySelector('img')?.getAttribute('src') ?? '',
        popis: p.dataset.popis ?? '',
    }));
    const ukaz = (index) => {
        if (seznam.length === 0)
            return;
        aktualni = (index + seznam.length) % seznam.length;
        const snimek = seznam[aktualni];
        if (!snimek)
            return;
        lupaFoto.src = snimek.src;
        lupaFoto.alt = snimek.popis;
        lupaPopis.textContent = snimek.popis;
    };
    const otevri = (index, spousti) => {
        vyvolal = spousti;
        ukaz(index);
        lupa.hidden = false;
        document.body.style.overflow = 'hidden';
        lupa.querySelector('.lupa-zavrit')?.focus();
    };
    const zavri = () => {
        lupa.hidden = true;
        document.body.style.removeProperty('overflow');
        vyvolal?.focus();
        vyvolal = null;
    };
    document.querySelectorAll('.galerie button.polozka').forEach((polozka) => {
        polozka.addEventListener('click', () => {
            const galerie = polozka.closest('.galerie');
            if (!galerie || polozka.classList.contains('chybi-foto'))
                return;
            seznam = snimky(galerie);
            const src = polozka.querySelector('img')?.getAttribute('src');
            const index = seznam.findIndex((s) => s.src === src);
            otevri(index < 0 ? 0 : index, polozka);
        });
    });
    lupa.querySelector('.lupa-zavrit')?.addEventListener('click', zavri);
    lupa.querySelector('.lupa-predchozi')?.addEventListener('click', () => ukaz(aktualni - 1));
    lupa.querySelector('.lupa-dalsi')?.addEventListener('click', () => ukaz(aktualni + 1));
    lupa.addEventListener('click', (e) => {
        if (e.target === lupa)
            zavri();
    });
    document.addEventListener('keydown', (e) => {
        if (lupa.hidden)
            return;
        if (e.key === 'Escape')
            zavri();
        if (e.key === 'ArrowLeft')
            ukaz(aktualni - 1);
        if (e.key === 'ArrowRight')
            ukaz(aktualni + 1);
    });
}
/**
 * Fotky domu ve složkách — přízemí, podkroví, zahrada. Bez skriptu jsou
 * vidět všechny pod sebou s nadpisy, se skriptem se přepínají záložkami.
 */
function slozky() {
    const lista = document.querySelector('.slozky');
    if (!lista)
        return;
    const zalozky = Array.from(lista.querySelectorAll('[role="tab"]'));
    const panel = (zalozka) => document.getElementById(zalozka.getAttribute('aria-controls') ?? '');
    const vyber = (vybrana) => {
        zalozky.forEach((zalozka) => {
            const ano = zalozka === vybrana;
            zalozka.setAttribute('aria-selected', String(ano));
            zalozka.tabIndex = ano ? 0 : -1;
            const obsah = panel(zalozka);
            if (obsah)
                obsah.hidden = !ano;
        });
    };
    zalozky.forEach((zalozka, index) => {
        zalozka.addEventListener('click', () => vyber(zalozka));
        zalozka.addEventListener('keydown', (e) => {
            const posun = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
            if (!posun)
                return;
            e.preventDefault();
            const dalsi = zalozky[(index + posun + zalozky.length) % zalozky.length];
            if (!dalsi)
                return;
            vyber(dalsi);
            dalsi.focus();
        });
    });
    lista.parentElement?.classList.add('slozky-zapnute');
    const prvni = zalozky[0];
    if (prvni)
        vyber(prvni);
}
const MESICE = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];
const MESICE_GENITIV = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
const DNY = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
/** Kolik měsíců dopředu kalendář ukazuje. */
const MESICU_DOPREDU = 18;
/** Datum jako 2026-12-24 v místním čase — přes UTC by se den mohl posunout. */
function klicDne(den) {
    const mesic = String(den.getMonth() + 1).padStart(2, '0');
    const cislo = String(den.getDate()).padStart(2, '0');
    return `${den.getFullYear()}-${mesic}-${cislo}`;
}
/**
 * Noci, které jsou obsazené. Den příjezdu je první obsazená noc, den odjezdu
 * už ne — ten den odpoledne může přijet někdo další.
 */
function obsazeneNoci(pobyty) {
    const noci = new Set();
    pobyty.forEach(({ prijezd, odjezd }) => {
        const den = new Date(`${prijezd}T12:00:00`);
        const konec = new Date(`${odjezd}T12:00:00`);
        if (Number.isNaN(den.getTime()) || Number.isNaN(konec.getTime()))
            return;
        for (; den < konec; den.setDate(den.getDate() + 1))
            noci.add(klicDne(den));
    });
    return noci;
}
function mesicKalendare(rok, mesic, noci, dnes) {
    const pocetDni = new Date(rok, mesic + 1, 0).getDate();
    const odsazeni = (new Date(rok, mesic, 1).getDay() + 6) % 7;
    const bunky = Array.from({ length: odsazeni }, () => '<td></td>');
    for (let cislo = 1; cislo <= pocetDni; cislo++) {
        const klic = klicDne(new Date(rok, mesic, cislo, 12));
        const noc = noci.has(klic);
        const predchoziNoc = noci.has(klicDne(new Date(rok, mesic, cislo - 1, 12)));
        let stav = 'volno';
        let popis = 'volno';
        if (klic < dnes) {
            stav = 'minulost';
            popis = 'uplynulo';
        }
        else if (noc && predchoziNoc) {
            stav = 'obsazeno';
            popis = 'obsazeno';
        }
        else if (noc) {
            stav = 'prijezd';
            popis = 'do 11:00 volno, pak obsazeno';
        }
        else if (predchoziNoc) {
            stav = 'odjezd';
            popis = 'od 15:00 volno';
        }
        const titulek = `${cislo}. ${MESICE_GENITIV[mesic]} – ${popis}`;
        bunky.push(`<td><span class="den ${stav}" title="${titulek}">${cislo}<span class="skryte"> ${MESICE_GENITIV[mesic]}, ${popis}</span></span></td>`);
    }
    while (bunky.length % 7 !== 0)
        bunky.push('<td></td>');
    const radky = [];
    for (let i = 0; i < bunky.length; i += 7)
        radky.push(`<tr>${bunky.slice(i, i + 7).join('')}</tr>`);
    return `<table class="mesic">
    <caption>${MESICE[mesic]} ${rok}</caption>
    <thead><tr>${DNY.map((den) => `<th scope="col">${den}</th>`).join('')}</tr></thead>
    <tbody>${radky.join('')}</tbody>
  </table>`;
}
/**
 * Kalendář obsazenosti. Obsazené termíny se čtou z obsazenost.json, takže
 * zapsat novou rezervaci znamená upravit jen ten soubor — bez buildu.
 */
async function kalendar() {
    const misto = document.querySelector('.kalendar');
    const mesice = misto?.querySelector('.kalendar-mesice');
    const zprava = misto?.querySelector('.kalendar-zprava');
    if (!misto || !mesice || !zprava)
        return;
    let pobyty;
    try {
        const odpoved = await fetch(misto.dataset.zdroj ?? '', { cache: 'no-cache' });
        if (!odpoved.ok)
            throw new Error(`HTTP ${odpoved.status}`);
        const data = (await odpoved.json());
        pobyty = Array.isArray(data.obsazeno) ? data.obsazeno : [];
    }
    catch {
        zprava.textContent = 'Kalendář se teď nepodařilo načíst. Volný termín vám rádi ověříme e-mailem.';
        return;
    }
    const noci = obsazeneNoci(pobyty);
    const dnes = new Date();
    const dnesKlic = klicDne(dnes);
    const tabulky = [];
    for (let i = 0; i < MESICU_DOPREDU; i++) {
        const prvni = new Date(dnes.getFullYear(), dnes.getMonth() + i, 1);
        tabulky.push(mesicKalendare(prvni.getFullYear(), prvni.getMonth(), noci, dnesKlic));
    }
    mesice.innerHTML = tabulky.join('');
    zprava.hidden = true;
    const sipky = Array.from(misto.querySelectorAll('.kalendar-sip'));
    const plynule = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const krok = () => {
        const sirka = mesice.querySelector('table')?.getBoundingClientRect().width ?? mesice.clientWidth;
        return sirka + (parseFloat(getComputedStyle(mesice).columnGap) || 0);
    };
    const prekresliSipky = () => {
        sipky.forEach((sipka) => {
            const dopredu = sipka.dataset.smer === '1';
            sipka.disabled = dopredu
                ? mesice.scrollLeft + mesice.clientWidth >= mesice.scrollWidth - 2
                : mesice.scrollLeft <= 2;
        });
    };
    sipky.forEach((sipka) => {
        sipka.addEventListener('click', () => {
            mesice.scrollBy({ left: Number(sipka.dataset.smer) * krok(), behavior: plynule ? 'smooth' : 'auto' });
        });
    });
    mesice.addEventListener('scroll', prekresliSipky, { passive: true });
    window.addEventListener('resize', prekresliSipky);
    prekresliSipky();
}
/** Tlačítko pro tisk domovního řádu. */
function tisk() {
    document.querySelectorAll('[data-tisk]').forEach((tlacitko) => {
        tlacitko.addEventListener('click', () => window.print());
    });
}
/**
 * Poptávka pobytu otevře e-mailový program
 * s předvyplněnou zprávou. Zpráva se skládá z popisků polí, takže přidat
 * do formuláře další pole znamená jen doplnit ho v šabloně.
 */
function formulare() {
    const prijemce = document.body.dataset.email ?? '';
    document.querySelectorAll('form[data-predmet]').forEach((form) => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const radky = [];
            let zprava = '';
            form.querySelectorAll('input, textarea').forEach((pole) => {
                if (!pole.name)
                    return;
                const zaskrtavatko = pole.type === 'radio' || pole.type === 'checkbox';
                if (zaskrtavatko && !pole.checked)
                    return;
                const text = pole.type === 'checkbox' ? 'ano' : pole.value.trim();
                if (!text)
                    return;
                if (pole.tagName === 'TEXTAREA') {
                    zprava = text;
                    return;
                }
                radky.push(`${popisekPole(form, pole)}: ${text}`);
            });
            const telo = zprava ? [...radky, '', zprava].join('\n') : radky.join('\n');
            const predmet = form.dataset.predmet ?? 'Zpráva z webu';
            window.location.href =
                `mailto:${prijemce}?subject=${encodeURIComponent(predmet)}&body=${encodeURIComponent(telo)}`;
        });
    });
}
/** Popisek pole — z jeho <label>, u přepínačů z legendy skupiny. */
function popisekPole(form, pole) {
    if (pole.type === 'checkbox')
        return 'Souhlas se zpracováním údajů';
    if (pole.type === 'radio') {
        const legenda = pole.closest('fieldset')?.querySelector('legend')?.textContent?.trim();
        if (legenda)
            return legenda;
    }
    const podleId = pole.id ? form.querySelector(`label[for="${pole.id}"]`)?.textContent?.trim() : '';
    return podleId || pole.name;
}
/** Jemné naplouvání sekcí při scrollu. */
function naplouvani() {
    const prvky = document.querySelectorAll('.karta, .sekce h2, .sekce > .obal > p, .dvousloupec > *, .motivace-obsah > *, .polozka, .panel, .trojice article');
    prvky.forEach((prvek) => prvek.classList.add('prijde'));
    if (!('IntersectionObserver' in window)) {
        prvky.forEach((prvek) => prvek.classList.add('videt'));
        return;
    }
    const hlidac = new IntersectionObserver((zaznamy) => {
        zaznamy.forEach((zaznam) => {
            if (!zaznam.isIntersecting)
                return;
            zaznam.target.classList.add('videt');
            hlidac.unobserve(zaznam.target);
        });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    prvky.forEach((prvek) => hlidac.observe(prvek));
}
/**
 * Hero fotky se pomalu prostřídají. Když je nahraná jen jedna,
 * nic se neděje; kdo má v systému vypnuté animace, uvidí první.
 */
function heroStridani() {
    const misto = document.querySelector('.hero-foto');
    if (!misto)
        return;
    const fotky = Array.from(misto.querySelectorAll('img')).filter((obrazek) => obrazek.complete && obrazek.naturalWidth > 0);
    if (fotky.length < 2)
        return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        return;
    fotky.forEach((obrazek, index) => {
        obrazek.classList.toggle('vepredu', index === 0);
        obrazek.classList.toggle('vzadu', index !== 0);
    });
    let ukazuje = 0;
    window.setInterval(() => {
        const stara = fotky[ukazuje];
        ukazuje = (ukazuje + 1) % fotky.length;
        const nova = fotky[ukazuje];
        stara?.classList.replace('vepredu', 'vzadu');
        nova?.classList.replace('vzadu', 'vepredu');
    }, 7000);
}
/** Rok v patičce. */
function rok() {
    const el = document.querySelector('#rok');
    if (el)
        el.textContent = String(new Date().getFullYear());
}
hlavicka();
menu();
chybejiciFotky();
heroStridani();
slozky();
galerie();
void kalendar();
tisk();
formulare();
naplouvani();
rok();
