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
/** Fotogalerie se zvětšením přes celou obrazovku. */
function galerie() {
    const lupa = document.querySelector('#lupa');
    const lupaFoto = document.querySelector('#lupa-foto');
    const lupaPopis = document.querySelector('#lupa-popis');
    if (!lupa || !lupaFoto || !lupaPopis)
        return;
    const polozky = Array.from(document.querySelectorAll('.galerie .polozka'));
    let aktualni = 0;
    let vyvolal = null;
    const snimky = () => polozky
        .filter((p) => !p.classList.contains('chybi-foto'))
        .map((p) => {
        const obrazek = p.querySelector('img');
        return {
            src: obrazek?.getAttribute('src') ?? '',
            popis: p.dataset.popis ?? '',
        };
    });
    const ukaz = (index) => {
        const seznam = snimky();
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
    polozky.forEach((polozka) => {
        polozka.addEventListener('click', () => {
            if (polozka.classList.contains('chybi-foto'))
                return;
            const index = snimky().findIndex((s) => s.popis === (polozka.dataset.popis ?? ''));
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
 * Poptávka pobytu i objednávka voucheru — obojí otevře e-mailový program
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
                if (pole.type === 'radio' && !pole.checked)
                    return;
                const text = pole.value.trim();
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
    const prvky = document.querySelectorAll('.karta, .sekce h2, .sekce > .obal > p, .dvousloupec > *, .motivace-obsah > *, .polozka, .panel, .kroky li, .trojice article');
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
galerie();
formulare();
naplouvani();
rok();
