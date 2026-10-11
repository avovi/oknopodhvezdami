/**
 * Okno pod hvězdami — chování stránky.
 * Kompiluje se do script.js (npm run build), aby web běžel rovnou z gitu bez buildu.
 */

type Snimek = { src: string; popis: string };

/**
 * Průhledná hlavička nad hero fotkou po odscrollování zesvětlá.
 * Na podstránkách žádné hero není a hlavička je světlá rovnou ze šablony.
 */
function hlavicka(): void {
  const el = document.querySelector<HTMLElement>('.hlavicka');
  if (!el || !document.querySelector('.hero')) return;

  const prekresli = (): void => {
    el.classList.toggle('prilepena', window.scrollY > 40);
  };

  prekresli();
  window.addEventListener('scroll', prekresli, { passive: true });
}

/** Mobilní menu. */
function menu(): void {
  const tlacitko = document.querySelector<HTMLButtonElement>('.menu-tlacitko');
  const navigace = document.querySelector<HTMLElement>('.navigace');
  const hlava = document.querySelector<HTMLElement>('.hlavicka');
  if (!tlacitko || !navigace || !hlava) return;

  const zavri = (): void => {
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
    if (e.key === 'Escape') zavri();
  });
}

/**
 * Dokud chybí fotka, ukáže se místo ní popis toho, co sem patří.
 * Stačí nahrát soubor pod stejným jménem a zástupná plocha zmizí sama.
 */
function chybejiciFotky(): void {
  const mista = document.querySelectorAll<HTMLElement>('[data-popis]');

  mista.forEach((misto) => {
    const obrazek = misto.querySelector('img');
    if (!obrazek) return;

    const oznac = (): void => misto.classList.add('chybi-foto');

    if (obrazek.complete) {
      if (obrazek.naturalWidth === 0) oznac();
    } else {
      obrazek.addEventListener('error', oznac);
      obrazek.addEventListener('load', () => {
        if (obrazek.naturalWidth === 0) oznac();
      });
    }
  });
}

/**
 * Fotogalerie se zvětšením přes celou obrazovku. Šipky listují jen fotkami
 * z téže galerie — v přízemí se tak nepřeskočí na zahradu.
 */
function galerie(): void {
  const lupa = document.querySelector<HTMLElement>('#lupa');
  const lupaFoto = document.querySelector<HTMLImageElement>('#lupa-foto');
  const lupaPopis = document.querySelector<HTMLElement>('#lupa-popis');
  if (!lupa || !lupaFoto || !lupaPopis) return;

  let seznam: Snimek[] = [];
  let aktualni = 0;
  let vyvolal: HTMLElement | null = null;

  const snimky = (galerie: Element): Snimek[] =>
    Array.from(galerie.querySelectorAll<HTMLButtonElement>('button.polozka'))
      .filter((p) => !p.classList.contains('chybi-foto'))
      .map((p) => ({
        src: p.querySelector('img')?.getAttribute('src') ?? '',
        popis: p.dataset.popis ?? '',
      }));

  const ukaz = (index: number): void => {
    if (seznam.length === 0) return;
    aktualni = (index + seznam.length) % seznam.length;
    const snimek = seznam[aktualni];
    if (!snimek) return;
    lupaFoto.src = snimek.src;
    lupaFoto.alt = snimek.popis;
    lupaPopis.textContent = snimek.popis;
  };

  const otevri = (index: number, spousti: HTMLElement): void => {
    vyvolal = spousti;
    ukaz(index);
    lupa.hidden = false;
    document.body.style.overflow = 'hidden';
    lupa.querySelector<HTMLButtonElement>('.lupa-zavrit')?.focus();
  };

  const zavri = (): void => {
    lupa.hidden = true;
    document.body.style.removeProperty('overflow');
    vyvolal?.focus();
    vyvolal = null;
  };

  document.querySelectorAll<HTMLButtonElement>('.galerie button.polozka').forEach((polozka) => {
    polozka.addEventListener('click', () => {
      const galerie = polozka.closest('.galerie');
      if (!galerie || polozka.classList.contains('chybi-foto')) return;
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
    if (e.target === lupa) zavri();
  });

  document.addEventListener('keydown', (e) => {
    if (lupa.hidden) return;
    if (e.key === 'Escape') zavri();
    if (e.key === 'ArrowLeft') ukaz(aktualni - 1);
    if (e.key === 'ArrowRight') ukaz(aktualni + 1);
  });
}

/**
 * Fotky domu ve složkách — přízemí, podkroví, zahrada. Bez skriptu jsou
 * vidět všechny pod sebou s nadpisy, se skriptem se přepínají záložkami.
 */
function slozky(): void {
  const lista = document.querySelector<HTMLElement>('.slozky');
  if (!lista) return;

  const zalozky = Array.from(lista.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panel = (zalozka: HTMLButtonElement): HTMLElement | null =>
    document.getElementById(zalozka.getAttribute('aria-controls') ?? '');

  const vyber = (vybrana: HTMLButtonElement): void => {
    zalozky.forEach((zalozka) => {
      const ano = zalozka === vybrana;
      zalozka.setAttribute('aria-selected', String(ano));
      zalozka.tabIndex = ano ? 0 : -1;
      const obsah = panel(zalozka);
      if (obsah) obsah.hidden = !ano;
    });
  };

  zalozky.forEach((zalozka, index) => {
    zalozka.addEventListener('click', () => vyber(zalozka));
    zalozka.addEventListener('keydown', (e) => {
      const posun = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!posun) return;
      e.preventDefault();
      const dalsi = zalozky[(index + posun + zalozky.length) % zalozky.length];
      if (!dalsi) return;
      vyber(dalsi);
      dalsi.focus();
    });
  });

  lista.parentElement?.classList.add('slozky-zapnute');
  const prvni = zalozky[0];
  if (prvni) vyber(prvni);
}

/** Jeden pobyt v obsazenost.json — odjezd je den, kdy hosté odjíždějí. */
type Pobyt = { prijezd: string; odjezd: string };

const MESICE = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];
const MESICE_GENITIV = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
const DNY = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

/** Kolik měsíců dopředu kalendář ukazuje. */
const MESICU_DOPREDU = 18;

/** Datum jako 2026-12-24 v místním čase — přes UTC by se den mohl posunout. */
function klicDne(den: Date): string {
  const mesic = String(den.getMonth() + 1).padStart(2, '0');
  const cislo = String(den.getDate()).padStart(2, '0');
  return `${den.getFullYear()}-${mesic}-${cislo}`;
}

/**
 * Noci, které jsou obsazené. Den příjezdu je první obsazená noc, den odjezdu
 * už ne — ten den odpoledne může přijet někdo další.
 */
function obsazeneNoci(pobyty: Pobyt[]): Set<string> {
  const noci = new Set<string>();
  pobyty.forEach(({ prijezd, odjezd }) => {
    const den = new Date(`${prijezd}T12:00:00`);
    const konec = new Date(`${odjezd}T12:00:00`);
    if (Number.isNaN(den.getTime()) || Number.isNaN(konec.getTime())) return;
    for (; den < konec; den.setDate(den.getDate() + 1)) noci.add(klicDne(den));
  });
  return noci;
}

function mesicKalendare(rok: number, mesic: number, noci: Set<string>, dnes: string): string {
  const pocetDni = new Date(rok, mesic + 1, 0).getDate();
  const odsazeni = (new Date(rok, mesic, 1).getDay() + 6) % 7;
  const bunky: string[] = Array.from({ length: odsazeni }, () => '<td></td>');

  for (let cislo = 1; cislo <= pocetDni; cislo++) {
    const klic = klicDne(new Date(rok, mesic, cislo, 12));
    const noc = noci.has(klic);
    const predchoziNoc = noci.has(klicDne(new Date(rok, mesic, cislo - 1, 12)));

    let stav = 'volno';
    let popis = 'volno';
    if (klic < dnes) {
      stav = 'minulost';
      popis = 'uplynulo';
    } else if (noc && predchoziNoc) {
      stav = 'obsazeno';
      popis = 'obsazeno';
    } else if (noc) {
      stav = 'prijezd';
      popis = 'do 11:00 volno, pak obsazeno';
    } else if (predchoziNoc) {
      stav = 'odjezd';
      popis = 'od 15:00 volno';
    }

    const titulek = `${cislo}. ${MESICE_GENITIV[mesic]} – ${popis}`;
    bunky.push(`<td><span class="den ${stav}" title="${titulek}">${cislo}<span class="skryte"> ${MESICE_GENITIV[mesic]}, ${popis}</span></span></td>`);
  }
  while (bunky.length % 7 !== 0) bunky.push('<td></td>');

  const radky: string[] = [];
  for (let i = 0; i < bunky.length; i += 7) radky.push(`<tr>${bunky.slice(i, i + 7).join('')}</tr>`);

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
async function kalendar(): Promise<void> {
  const misto = document.querySelector<HTMLElement>('.kalendar');
  const mesice = misto?.querySelector<HTMLElement>('.kalendar-mesice');
  const zprava = misto?.querySelector<HTMLElement>('.kalendar-zprava');
  if (!misto || !mesice || !zprava) return;

  let pobyty: Pobyt[];
  try {
    const odpoved = await fetch(misto.dataset.zdroj ?? '', { cache: 'no-cache' });
    if (!odpoved.ok) throw new Error(`HTTP ${odpoved.status}`);
    const data = (await odpoved.json()) as { obsazeno?: Pobyt[] };
    pobyty = Array.isArray(data.obsazeno) ? data.obsazeno : [];
  } catch {
    zprava.textContent = 'Kalendář se teď nepodařilo načíst. Volný termín vám rádi ověříme e-mailem.';
    return;
  }

  const noci = obsazeneNoci(pobyty);
  const dnes = new Date();
  const dnesKlic = klicDne(dnes);
  const tabulky: string[] = [];
  for (let i = 0; i < MESICU_DOPREDU; i++) {
    const prvni = new Date(dnes.getFullYear(), dnes.getMonth() + i, 1);
    tabulky.push(mesicKalendare(prvni.getFullYear(), prvni.getMonth(), noci, dnesKlic));
  }
  mesice.innerHTML = tabulky.join('');
  zprava.hidden = true;

  const sipky = Array.from(misto.querySelectorAll<HTMLButtonElement>('.kalendar-sip'));
  const plynule = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const krok = (): number => {
    const sirka = mesice.querySelector('table')?.getBoundingClientRect().width ?? mesice.clientWidth;
    return sirka + (parseFloat(getComputedStyle(mesice).columnGap) || 0);
  };
  const prekresliSipky = (): void => {
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
function tisk(): void {
  document.querySelectorAll('[data-tisk]').forEach((tlacitko) => {
    tlacitko.addEventListener('click', () => window.print());
  });
}

/**
 * Poptávka pobytu otevře e-mailový program
 * s předvyplněnou zprávou. Zpráva se skládá z popisků polí, takže přidat
 * do formuláře další pole znamená jen doplnit ho v šabloně.
 */
function formulare(): void {
  const prijemce = document.body.dataset.email ?? '';

  document.querySelectorAll<HTMLFormElement>('form[data-predmet]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const radky: string[] = [];
      let zprava = '';

      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea').forEach((pole) => {
        if (!pole.name) return;

        const zaskrtavatko = pole.type === 'radio' || pole.type === 'checkbox';
        if (zaskrtavatko && !(pole as HTMLInputElement).checked) return;

        const text = pole.type === 'checkbox' ? 'ano' : pole.value.trim();
        if (!text) return;

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
function popisekPole(form: HTMLFormElement, pole: HTMLInputElement | HTMLTextAreaElement): string {
  if (pole.type === 'checkbox') return 'Souhlas se zpracováním údajů';

  if (pole.type === 'radio') {
    const legenda = pole.closest('fieldset')?.querySelector('legend')?.textContent?.trim();
    if (legenda) return legenda;
  }

  const podleId = pole.id ? form.querySelector(`label[for="${pole.id}"]`)?.textContent?.trim() : '';
  return podleId || pole.name;
}

/** Jemné naplouvání sekcí při scrollu. */
function naplouvani(): void {
  const prvky = document.querySelectorAll<HTMLElement>(
    '.karta, .sekce h2, .sekce > .obal > p, .dvousloupec > *, .motivace-obsah > *, .polozka, .panel, .trojice article'
  );
  prvky.forEach((prvek) => prvek.classList.add('prijde'));

  if (!('IntersectionObserver' in window)) {
    prvky.forEach((prvek) => prvek.classList.add('videt'));
    return;
  }

  const hlidac = new IntersectionObserver(
    (zaznamy) => {
      zaznamy.forEach((zaznam) => {
        if (!zaznam.isIntersecting) return;
        zaznam.target.classList.add('videt');
        hlidac.unobserve(zaznam.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );

  prvky.forEach((prvek) => hlidac.observe(prvek));
}

/**
 * Hero fotky se pomalu prostřídají. Když je nahraná jen jedna,
 * nic se neděje; kdo má v systému vypnuté animace, uvidí první.
 */
function heroStridani(): void {
  const misto = document.querySelector<HTMLElement>('.hero-foto');
  if (!misto) return;

  const fotky = Array.from(misto.querySelectorAll('img')).filter(
    (obrazek) => obrazek.complete && obrazek.naturalWidth > 0
  );
  if (fotky.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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
function rok(): void {
  const el = document.querySelector<HTMLElement>('#rok');
  if (el) el.textContent = String(new Date().getFullYear());
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
