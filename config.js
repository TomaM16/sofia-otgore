/* Регистър на визуализациите.
 *
 * Всеки показател се описва тук и с нищо друго. app.js не знае нищо за
 * конкретните полета.
 *
 *   level   — 'ge' (564 квартала) или 'rayon' (24 района)
 *   group   — темата, в която попада (това са табовете)
 *   field   — име на атрибута в слоя
 *   breaks  — праговете на цветовата стълбица (възходящо)
 *   years   — (по избор) префикс на широките колони за плъзгача по години
 *   note    — уточнение под легендата
 */

// Секвенциална скала: един тон, светло -> тъмно.
const RAMP = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#2a78d6',
  '#256abf', '#184f95', '#0d366b'];
// Дивергентна: синьо <-> червено с неутрален сив център.
const DIVERGE = ['#184f95', '#3987e5', '#9ec5f4', '#f0efec',
  '#f2a6a6', '#e06666', '#c23636'];
// Скала за несъответствията — червена, за да не се бърка с останалите.
const REDS = ['#f3f2ee', '#f7d5d5', '#f2b3b3', '#e88f8f', '#dc6a6a',
  '#d03b3b', '#a72c2c', '#7d1f1f'];

const nf = (d = 0) => (v) =>
  v == null || Number.isNaN(v) ? '–' :
    v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d });

/* Актуалност на всеки източник — единственото място, където се пази.
 * Стойностите идват от полето „Актуален към" в метаданните на
 * urbandata.sofia.bg (виж data/raw/urbandata/*.meta.json). */
export const AS_OF = {
  ceni:      '2020',
  ocenka:    'оценка, 2026 кв.1',
  sgradi_pl: 'сателит, 08.2026',
  razr_nsi:  'НСИ, 2026 кв.2',
  prebroyavane: '2011',
  kadastur:  'кадастър, 04.2021',
  jil_fond:  '01.2020',
  razresheniya: '2010 – 11.2020',
  oup:       'ОУП 2009',
  sgradi:    'сателит, 08.2026',
  kkkr:      'кадастър КККР, 09.2026',
  nag:       'регистри НАГ, 09.2026',
  oup_par:   'ОУП, прил. чл.3 ал.2',
  grao:      'ГРАО, 06.2026',
  nsi_fond:  'НСИ, 2025',
  zapovedi:  'регистър по чл. 225 ЗУТ, 2008 – 06.2026',
};

export const LEVELS = [
  { id: 'ge', label: 'Квартали', sub: '564 градоустройствени единици', detailSub: '',
    source: 'ge', sourceLayer: 'ge', key: 'ge_id', name: 'regname',
    parent: 'rajon', json: 'data/ge.json' },
  { id: 'rayon', label: 'Райони', sub: '24 административни района', detailSub: 'Столична община',
    source: 'rayoni', sourceLayer: 'rayoni', key: 'rayon', name: 'rayon',
    parent: null, json: 'data/rayoni.json' },
];

/* Разделите на сайта. Всеки отговаря на един въпрос и събира само
 * показателите, които го отговарят. Показва се по един раздел наведнъж. */
export const SECTIONS = [
  {
    id: 'sgradi', num: 1, title: 'Сгради и законност',
    q: 'Колко са сградите, за колко има влязла в сила заповед за премахване '
      + 'и колко стоят там, където планът не допуска застрояване.',
    hero: ['sgradi_obshto', 'zap_obshto', 'st_visoka_obshto',
      'v_kadastur_obshto'],
    overlays: { rayoni: true, signal: true, zapovedi: true,
      buildings: false, census: false },
  },
  {
    id: 'hora', num: 2, title: 'Хора и жилища',
    q: 'Колко души живеят в София, колко жилища има и колко от тях стоят '
      + 'празни.',
    hero: ['grao_nastoyasht', 'nsi_jilishta_2025', 'neobitavani_pr'],
    overlays: { rayoni: true, signal: false, zapovedi: false,
      buildings: false, census: true },
  },
  {
    id: 'pazar', num: 3, title: 'Пазар и наеми',
    q: 'Колко струва квадратът, колко се дава под наем и каква е доходността.',
    hero: ['cena_med', 'dohodnost_med'],
    overlays: { rayoni: true, signal: false, zapovedi: false,
      buildings: false, census: false },
  },
  {
    id: 'analiz', num: 4, title: 'Застрояване и потенциал',
    q: 'Как е застроен градът, къде се строи сега и къде има капацитет.',
    hero: ['razr_12m', 'plytnost_med'],
    overlays: { rayoni: true, signal: false, zapovedi: false,
      buildings: true, census: false },
  },
];

export const VIEWS = [
  /* ============================ КВАРТАЛИ ============================ */
  {
    level: 'ge', section: 'pazar', id: 'cena_now', asof: AS_OF.ocenka,
    field: 'cena_ocenka',
    label: 'Цена на кв.м — оценка днес', unit: 'EUR/m²',
    breaks: [800, 1200, 1600, 2000, 2400, 3000, 3800], ramp: RAMP, fmt: nf(0),
    note: 'ОЦЕНКА, не измерена цена: цената от 2020 г., умножена по 2,05 — ' +
      'индексът на цените на жилищата на НСИ за Югозападен район, ' +
      '2020 → 2026 кв.1. Показва къде е скъпо, не колко точно струва. ' +
      'Медианата излиза 2 334 EUR/m², което съвпада с пазарните отчети за ' +
      '2026 г., но горният край е несигурен.',
  },
  {
    level: 'ge', section: 'pazar', id: 'naem_now', asof: AS_OF.ocenka,
    field: 'naem_ocenka',
    label: 'Наем на кв.м — оценка днес', unit: 'EUR/m²/мес.',
    breaks: [4, 6, 8, 10, 12, 14, 18], ramp: RAMP, fmt: nf(2),
    note: 'Същият метод и същата уговорка като при цената.',
  },
  {
    level: 'ge', section: 'pazar', id: 'cena', asof: AS_OF.ceni, field: 'cena_kv_m',
    label: 'Цена на кв.м (2020, измерена)', unit: 'EUR/m²',
    years: { prefix: 'cena', from: 2002, to: 2020 },
    breaks: [400, 600, 800, 1000, 1200, 1500, 1900], ramp: RAMP, fmt: nf(0),
    note: 'Данни на Столична община, налични за 148 от 564 квартала. ' +
      'Редицата спира на 2020 — по-нови цени по квартал няма публично.',
  },
  {
    level: 'ge', section: 'pazar', id: 'naem', asof: AS_OF.ceni, field: 'naem_kv_m',
    label: 'Наем на кв.м (2020, измерен)', unit: 'EUR/m²/мес.',
    years: { prefix: 'naem', from: 2002, to: 2020 },
    breaks: [2, 3, 4, 5, 6, 7, 9], ramp: RAMP, fmt: nf(2),
    note: 'Няколко квартала имат явно сгрешени стойности в източника — ' +
      'маркирани са в панела вдясно.',
  },
  {
    level: 'ge', section: 'pazar', id: 'dohodnost', asof: AS_OF.ceni, field: 'dohodnost_pr',
    label: 'Брутна доходност от наем', unit: '% годишно',
    breaks: [3, 4, 4.5, 5, 5.5, 6, 7], ramp: RAMP, fmt: nf(2),
    note: 'наем × 12 ÷ цена, състояние 2020. Брутна — без данъци и незаетост.',
  },
  {
    level: 'ge', section: 'pazar', id: 'rast', asof: AS_OF.ceni, field: 'cena_rast_pr',
    label: 'Ръст на цената 2002 → 2020', unit: '%',
    breaks: [0, 100, 200, 300, 400, 500, 700], ramp: DIVERGE, fmt: nf(0),
  },

  {
    level: 'ge', section: 'hora', id: 'jil_kad', asof: AS_OF.kkkr,
    field: 'jilishta_kad', label: 'Жилища — кадастър днес', unit: 'бр.',
    breaks: [200, 800, 2000, 4000, 7000, 12000, 20000], ramp: RAMP, fmt: nf(0),
    note: 'Самостоятелни обекти с жилищно предназначение по КККР. ' +
      'Надежден за многофамилни сгради; за къщи ЗАНИЖАВА — еднофамилната ' +
      'къща често не е разделена на самостоятелни обекти и се брои нула.',
  },
  {
    level: 'ge', section: 'hora', id: 'jil_2011',
    asof: 'преброяване ' + AS_OF.prebroyavane,
    field: 'jilishta_2011', label: 'Жилища — преброяване 2011', unit: 'бр.',
    breaks: [200, 800, 2000, 4000, 7000, 12000, 20000], ramp: RAMP, fmt: nf(0),
    note: 'Старо, но брои и къщите. Сравни го с реда за кадастъра — ' +
      'разликата показва къде фондът е нараснал и къде кадастърът занижава.',
  },
  {
    level: 'ge', section: 'hora', id: 'jil_na_jitel',
    asof: 'преброяване ' + AS_OF.prebroyavane,
    field: 'jil_na_jitel_2011', label: 'Жилища на жител (2011)', unit: 'бр.',
    breaks: [0.35, 0.42, 0.47, 0.52, 0.58, 0.65, 0.75], ramp: RAMP, fmt: nf(3),
    note: 'ЗАМЕСТИТЕЛ за незает фонд, не измерена необитаемост. Висока ' +
      'стойност значи дребни домакинства ИЛИ празни жилища — двете не се ' +
      'различават от тези данни. За цялата област НСИ дава 30,3% ' +
      'необитавани (преброяване 2021); по квартал такова число няма.',
  },
  {
    level: 'ge', section: 'hora', id: 'jiteli', asof: 'преброяване ' + AS_OF.prebroyavane, field: 'jiteli_2011',
    label: 'Жители', unit: 'души',
    breaks: [500, 2000, 5000, 8000, 12000, 17000, 24000], ramp: RAMP,
    fmt: nf(0),
    note: 'Преброяване 2011. За актуално население виж ниво „Райони".',
  },
  {
    level: 'ge', section: 'hora', id: 'plytnost_nas', asof: 'преброяване ' + AS_OF.prebroyavane,
    field: 'nasel_plytnost_kvkm', label: 'Плътност на населението',
    unit: 'души/km²',
    breaks: [500, 2000, 5000, 10000, 15000, 20000, 25000], ramp: RAMP,
    fmt: nf(0),
  },
  {
    level: 'ge', section: 'hora', id: 'lica', asof: 'преброяване ' + AS_OF.prebroyavane, field: 'lica_na_jilishte',
    label: 'Лица на жилище', unit: 'души',
    breaks: [1.2, 1.5, 1.8, 2.0, 2.2, 2.5, 2.8], ramp: RAMP, fmt: nf(2),
    note: 'Ниска стойност = дребни домакинства или незает фонд.',
  },
  {
    level: 'ge', section: 'hora', id: 'v65', asof: 'преброяване ' + AS_OF.prebroyavane, field: 'dial_65_pr',
    label: 'Дял на 65+', unit: '%',
    breaks: [8, 12, 15, 18, 21, 25, 30], ramp: RAMP, fmt: nf(1),
  },
  {
    level: 'ge', section: 'hora', id: 'deca', asof: 'преброяване ' + AS_OF.prebroyavane, field: 'dial_deca_pr',
    label: 'Дял на децата 0–14', unit: '%',
    breaks: [8, 10, 12, 14, 16, 18, 22], ramp: RAMP, fmt: nf(1),
  },

  {
    level: 'ge', section: 'analiz', id: 'prevish',
    asof: AS_OF.kkkr + ' ⨯ ' + AS_OF.oup_par,
    field: 'prevish_kint_pr', label: 'Имоти с превишен Кинт', unit: '%',
    breaks: [1, 2, 4, 7, 11, 16, 25], ramp: REDS, fmt: nf(1),
    note: 'Кинт по кадастър (застроена площ × етажи ÷ площ на имота) над ' +
      'допустимия за зоната с повече от 20%. Показателите са от ' +
      'Приложението към чл.3 ал.2 на ОУП. Не отчита ПУП с други параметри ' +
      'и приближава РЗП — превишение за проверка, не нарушение.',
  },
  {
    level: 'ge', section: 'analiz', id: 'med_kint',
    asof: AS_OF.kkkr, field: 'median_kint',
    label: 'Медианен Кинт по имот', unit: 'РЗП / площ',
    breaks: [0.1, 0.2, 0.3, 0.45, 0.7, 1.0, 1.5], ramp: RAMP, fmt: nf(2),
  },
  {
    level: 'ge', section: 'analiz', id: 'plytnost_now',
    asof: AS_OF.sgradi_pl, field: 'plytnost_2026_zastr',
    label: 'Плътност на застрояване (днес)', unit: 'дял от площта',
    breaks: [0.03, 0.06, 0.10, 0.15, 0.20, 0.26, 0.33], ramp: RAMP, fmt: nf(3),
    note: 'Сума от сателитните очертания на сградите върху площта на ' +
      'единицата. Не се сравнява пряко с реда от кадастъра 2021 — обхватът ' +
      'е различен (корелация 0,98, но систематично ×1,26 по-високо).',
  },
  {
    level: 'ge', section: 'analiz', id: 'plytnost', asof: AS_OF.kadastur,
    field: 'zastr_plytnost', label: 'Плътност на застрояване (2021)',
    unit: 'дял от площта',
    breaks: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4], ramp: RAMP, fmt: nf(3),
  },
  {
    level: 'ge', section: 'analiz', id: 'kint', asof: AS_OF.kadastur,
    field: 'zastr_intenzivnost', label: 'Интензивност (Кинт)',
    unit: 'РЗП / площ',
    breaks: [0.2, 0.4, 0.6, 0.9, 1.2, 1.6, 2.2], ramp: RAMP, fmt: nf(2),
  },
  {
    level: 'ge', section: 'analiz', id: 'etajnost', asof: AS_OF.kadastur,
    field: 'sredna_etajnost', label: 'Средна етажност', unit: 'етажа',
    breaks: [1.5, 2, 2.5, 3, 4, 5, 6], ramp: RAMP, fmt: nf(2),
  },
  {
    level: 'ge', section: 'analiz', id: 'panel', asof: AS_OF.jil_fond, field: 'dial_panel',
    label: 'Дял панелно строителство', unit: '% от РЗП',
    breaks: [1, 5, 15, 30, 50, 70, 85], ramp: RAMP, fmt: nf(1),
  },
  {
    level: 'ge', section: 'analiz', id: 'razr', asof: AS_OF.razresheniya,
    field: 'razreshenia_sled_2010', label: 'Разрешения за строеж след 2010',
    unit: 'бр.', breaks: [5, 15, 30, 60, 100, 160, 250], ramp: RAMP,
    fmt: nf(0), note: 'Жилищни сгради. Показва къде е новото строителство.',
  },

  {
    level: 'ge', section: 'sgradi', id: 'visoka',
    asof: AS_OF.sgradi + ' ⨯ ' + AS_OF.kkkr,
    field: 'd_visoka', label: 'Висока степен — брой', unit: 'сгради',
    breaks: [1, 2, 4, 8, 15, 30, 60], ramp: REDS, fmt: nf(0),
    note: 'Сгради над 40 m², които ЛИПСВАТ в кадастъра И са в зона по ОУП ' +
      'без право на застрояване. Двете независими проверки заедно. ' +
      '1 554 за цяла София — това е списъкът за преглед.',
  },
  {
    level: 'ge', section: 'sgradi', id: 'kadastur',
    asof: AS_OF.kkkr, field: 'v_kadastur_pr',
    label: 'Дял отразени в кадастъра', unit: '% от сградите',
    breaks: [50, 65, 75, 82, 88, 93, 97],
    ramp: ['#7d1f1f', '#a72c2c', '#d03b3b', '#e88f8f', '#cde2fb',
      '#6da7ec', '#2a78d6', '#0d366b'],
    fmt: nf(1),
    note: 'Каква част от сградите имат разрешение за строеж или УПИ в ' +
      'публичния регистър на НАГ. 20 562 за цяла София.',
  },
  {
    level: 'ge', section: 'sgradi', id: 'nesotv', asof: AS_OF.sgradi + ' ⨯ ' + AS_OF.oup,
    field: 'nesotv_broi', label: 'Несъответствия — брой', unit: 'сгради',
    breaks: [1, 3, 6, 12, 25, 50, 90], ramp: REDS, fmt: nf(0),
    note: 'Сгради над 40 m² в зона по ОУП 2009 без право на застрояване. ' +
      'НЕ са установени незаконни строежи — виж „Как се чете".',
  },
  {
    level: 'ge', section: 'sgradi', id: 'nesotv_dial', asof: AS_OF.sgradi + ' ⨯ ' + AS_OF.oup,
    field: 'nesotv_dial_pr', label: 'Несъответствия — дял',
    unit: '% от сградите', breaks: [0.5, 1, 2, 4, 8, 15, 30], ramp: REDS,
    fmt: nf(1),
  },
  {
    level: 'ge', section: 'sgradi', id: 'satelit', asof: AS_OF.sgradi,
    field: 'samo_satelit_pr', label: 'Сгради само от сателит',
    unit: '% от сградите', breaks: [5, 10, 20, 35, 50, 70, 90], ramp: RAMP,
    fmt: nf(1),
    note: 'Засечени от сателит, но липсващи в OSM. Високата стойност ' +
      'показва слабо картиране, не непременно ново строителство.',
  },

  /* ============================= РАЙОНИ ============================= */
  {
    level: 'rayon', section: 'hora', id: 'r_jil_kad', asof: AS_OF.kkkr,
    field: 'jilishta_kad', label: 'Жилища — кадастър днес', unit: 'бр.',
    breaks: [5000, 15000, 25000, 35000, 45000, 60000, 67000], ramp: RAMP,
    fmt: nf(0),
  },
  {
    level: 'rayon', section: 'hora', id: 'r_jil_2011',
    asof: 'преброяване ' + AS_OF.prebroyavane,
    field: 'jilishta_2011', label: 'Жилища — преброяване 2011', unit: 'бр.',
    breaks: [5000, 15000, 25000, 35000, 45000, 60000, 67000], ramp: RAMP,
    fmt: nf(0),
  },
  {
    level: 'rayon', section: 'hora', id: 'r_prirast',
    asof: AS_OF.kkkr + ' срещу 2011',
    field: 'prirast_jil_pr', label: 'Прираст на жилищния фонд', unit: '%',
    breaks: [-40, -10, 15, 30, 50, 75, 110], ramp: DIVERGE, fmt: nf(0),
    note: 'Кадастър днес срещу преброяване 2011. Отрицателните стойности ' +
      'в Панчарево, Нови Искър, Кремиковци и Банкя НЕ значат изчезнали ' +
      'жилища — там преобладават къщи, които кадастърът не брои като ' +
      'самостоятелни обекти.',
  },
  {
    level: 'rayon', section: 'hora', id: 'r_jil_jitel_now', asof: AS_OF.grao,
    field: 'jil_na_jitel_2026', label: 'Жилища на жител (днес)', unit: 'бр.',
    breaks: [0.2, 0.3, 0.45, 0.55, 0.65, 0.75, 0.9], ramp: RAMP, fmt: nf(3),
    note: 'Кадастрални жилища ÷ жители по настоящ адрес (ГРАО 2026). ' +
      'Лозенец излиза 0,96 — почти по едно жилище на регистриран жител. ' +
      'Занижен е там, където преобладават къщи. Сравни с реда за 2011.',
  },
  {
    level: 'rayon', section: 'hora', id: 'r_jil_jitel_2011',
    asof: 'преброяване ' + AS_OF.prebroyavane,
    field: 'jil_na_jitel_2011', label: 'Жилища на жител (2011)', unit: 'бр.',
    breaks: [0.42, 0.45, 0.48, 0.51, 0.55, 0.59, 0.63], ramp: RAMP, fmt: nf(3),
    note: 'Същият показател по преброяването. Корелацията с версията за ' +
      '2026 е само 0,60 — двата източника броят различни неща.',
  },
  {
    level: 'rayon', section: 'hora', id: 'r_nast', asof: AS_OF.grao, field: 'nastoyasht',
    label: 'Население — настоящ адрес', unit: 'души',
    breaks: [15000, 30000, 45000, 60000, 75000, 90000, 110000], ramp: RAMP,
    fmt: nf(0),
    note: 'ГРАО, 15.06.2026. Настоящият адрес е този, който човек е заявил ' +
      'че обитава — най-близкото до „кой живее тук" в публичен източник.',
  },
  {
    level: 'rayon', section: 'hora', id: 'r_post', asof: AS_OF.grao, field: 'postoyanen',
    label: 'Население — постоянен адрес', unit: 'души',
    breaks: [15000, 30000, 45000, 60000, 75000, 90000, 110000], ramp: RAMP,
    fmt: nf(0),
    note: 'Постоянният адрес е регистрацията, не задължително мястото на ' +
      'живеене. За София надценява — виж „Как се чете".',
  },
  {
    level: 'rayon', section: 'hora', id: 'r_razlika', asof: AS_OF.grao, field: 'razlika_pr',
    label: 'Настоящ спрямо постоянен адрес', unit: '%',
    breaks: [-80, -12, -8, -5, 0, 5, 50], ramp: DIVERGE, fmt: nf(1),
    note: 'Положително = повече хора живеят тук, отколкото са регистрирани ' +
      '(Студентски). Силно отрицателно за Средец е артефакт от адресните ' +
      'регистрации „на общината".',
  },
  {
    level: 'rayon', section: 'hora', id: 'r_plytnost', asof: AS_OF.grao, field: 'plytnost_2026',
    label: 'Плътност на населението 2026', unit: 'души/km²',
    breaks: [200, 1000, 2500, 5000, 7500, 10000, 13000], ramp: RAMP,
    fmt: nf(0),
  },

  {
    level: 'rayon', section: 'analiz', id: 'r_prevish',
    asof: AS_OF.kkkr + ' ⨯ ' + AS_OF.oup_par,
    field: 'prevish_kint_pr', label: 'Имоти с превишен Кинт', unit: '%',
    breaks: [1, 2, 3, 4, 6, 8, 12], ramp: REDS, fmt: nf(1),
  },
  {
    level: 'rayon', section: 'analiz', id: 'r_plytnost_now',
    asof: AS_OF.sgradi_pl, field: 'plytnost_2026_zastr',
    label: 'Плътност на застрояване (днес)', unit: 'дял от площта',
    breaks: [0.005, 0.02, 0.05, 0.09, 0.13, 0.18, 0.24], ramp: RAMP,
    fmt: nf(3),
  },
  {
    level: 'rayon', section: 'sgradi', id: 'r_sgradi', asof: AS_OF.sgradi, field: 'sgradi',
    label: 'Заснети сгради', unit: 'бр. > 40 m²',
    breaks: [1000, 2500, 4000, 6000, 8000, 13000, 20000], ramp: RAMP,
    fmt: nf(0),
  },
  {
    level: 'rayon', section: 'sgradi', id: 'r_ploshch', asof: AS_OF.sgradi,
    field: 'zastr_ploshch_ha', label: 'Застроена площ', unit: 'ха',
    breaks: [50, 100, 150, 200, 300, 450, 600], ramp: RAMP, fmt: nf(0),
  },

  {
    level: 'rayon', section: 'sgradi', id: 'r_visoka',
    asof: AS_OF.sgradi + ' ⨯ ' + AS_OF.kkkr,
    field: 'd_visoka', label: 'Висока степен — брой', unit: 'сгради',
    breaks: [20, 40, 60, 100, 150, 250, 380], ramp: REDS, fmt: nf(0),
  },
  {
    level: 'rayon', section: 'sgradi', id: 'r_kadastur',
    asof: AS_OF.kkkr, field: 'v_kadastur_pr',
    label: 'Дял отразени в кадастъра', unit: '% от сградите',
    breaks: [50, 65, 75, 82, 88, 93, 97],
    ramp: ['#7d1f1f', '#a72c2c', '#d03b3b', '#e88f8f', '#cde2fb',
      '#6da7ec', '#2a78d6', '#0d366b'],
    fmt: nf(1),
  },
  {
    level: 'rayon', section: 'sgradi', id: 'r_nesotv', asof: AS_OF.sgradi + ' ⨯ ' + AS_OF.oup,
    field: 'nesotv', label: 'Несъответствия — брой', unit: 'сгради',
    breaks: [20, 50, 100, 150, 250, 400, 600], ramp: REDS, fmt: nf(0),
  },
  {
    level: 'rayon', section: 'sgradi', id: 'r_nesotv_dial', asof: AS_OF.sgradi + ' ⨯ ' + AS_OF.oup,
    field: 'dial_nesotv_pr', label: 'Несъответствия — дял',
    unit: '% от сградите', breaks: [0.5, 1, 1.5, 2, 3, 3.5, 4.5], ramp: REDS,
    fmt: nf(2),
  },
  {
    level: 'rayon', section: 'sgradi', id: 'r_satelit', asof: AS_OF.sgradi,
    field: 'dial_samo_satelit_pr', label: 'Сгради само от сателит',
    unit: '% от сградите', breaks: [5, 10, 15, 25, 45, 70, 90], ramp: RAMP,
    fmt: nf(1),
  },
];

/* Полетата в детайлния панел. Групите са СПОРЕД АКТУАЛНОСТТА на данните,
 * а не само по тема — иначе панелът мълчаливо смесва 2011, 2020, 2021 и 2026
 * и се чете сякаш всичко е от една година. */
export const DETAIL_FIELDS = {
  ge: [
    ['Пазар — оценка към днес', AS_OF.ocenka, [
      ['cena_ocenka', 'Цена', 'EUR/m²', nf(0)],
      ['naem_ocenka', 'Наем', 'EUR/m²/мес.', nf(2)],
    ]],
    ['Пазар — последно измерено', AS_OF.ceni, [
      ['cena_kv_m', 'Цена', 'EUR/m²', nf(0)],
      ['naem_kv_m', 'Наем', 'EUR/m²/мес.', nf(2)],
      ['dohodnost_pr', 'Брутна доходност', '%', nf(2)],
      ['cena_rast_pr', 'Ръст 2002→2020', '%', nf(0)],
    ]],
    ['Жилища — два източника', AS_OF.kkkr + ' и 2011', [
      ['jilishta_kad', 'Кадастър днес', 'бр.', nf(0)],
      ['jilishta_2011', 'Преброяване 2011', 'бр.', nf(0)],
      ['prirast_jil_pr', 'Разлика', '%', nf(1)],
      ['jil_na_jitel_2011', 'Жилища на жител (2011)', '', nf(3)],
    ]],
    ['Устройствени показатели', AS_OF.kkkr + ' ⨯ ' + AS_OF.oup_par, [
      ['imoti_s_pokazateli', 'Имоти с известен режим', '', nf(0)],
      ['median_kint', 'Медианен Кинт', '', nf(2)],
      ['prevish_kint', 'С превишен Кинт', 'бр.', nf(0)],
      ['prevish_kint_pr', 'Дял превишени', '%', nf(1)],
    ]],
    ['Население', 'преброяване ' + AS_OF.prebroyavane, [
      ['jiteli_2011', 'Жители', '', nf(0)],
      ['jilishta_2011', 'Жилища', '', nf(0)],
      ['lica_na_jilishte', 'Лица на жилище', '', nf(2)],
      ['nasel_plytnost_kvkm', 'Плътност', 'д/km²', nf(0)],
      ['dial_deca_pr', 'Деца 0–14', '%', nf(1)],
      ['dial_65_pr', '65+', '%', nf(1)],
    ]],
    ['Застрояване — днес', AS_OF.sgradi_pl, [
      ['sgradi_2026', 'Сгради > 40 m²', '', nf(0)],
      ['plytnost_2026_zastr', 'Плътност на застрояване', '', nf(3)],
      ['zp_2026_ha', 'Застроена площ', 'ха', nf(2)],
    ]],
    ['Застрояване — кадастър', AS_OF.kadastur, [
      ['count_buildings', 'Сгради по кадастър', '', nf(0)],
      ['zastr_plytnost', 'Плътност', '', nf(3)],
      ['zastr_intenzivnost', 'Кинт', '', nf(2)],
      ['sredna_etajnost', 'Средна етажност', '', nf(2)],
    ]],
    ['Жилищен фонд по тип', AS_OF.jil_fond, [
      ['dial_mnfam', 'Многофамилни', '% РЗП', nf(0)],
      ['dial_ednfa', 'Еднофамилни', '% РЗП', nf(0)],
      ['dial_panel', 'Панелни', '% РЗП', nf(1)],
    ]],
    ['Разрешения за строеж', AS_OF.razresheniya, [
      ['razreshenia_sled_2010', 'Издадени', 'бр.', nf(0)],
    ]],
    ['Устройствен режим', AS_OF.oup, [
      ['zastr_potenc_txt', 'Потенциал за застрояване', '', (v) => v ?? '–'],
    ]],
    ['Законност на сградите', AS_OF.sgradi + ' ⨯ ' + AS_OF.kkkr, [
      ['d_obshto', 'Заснети сгради > 40 m²', '', nf(0)],
      ['d_dokument', 'С документ от НАГ', 'бр.', nf(0)],
      ['d_dokument_pr', 'Дял с документ', '%', nf(1)],
      ['d_visoka', 'Висока степен', 'бр.', nf(0)],
      ['d_sredna', 'Средна степен', 'бр.', nf(0)],
      ['d_niska', 'Ниска степен', 'бр.', nf(0)],
      ['d_chista', 'Чисти', 'бр.', nf(0)],
    ]],
    ['Спрямо ОУП 2009 (стара проверка)', AS_OF.sgradi, [
      ['sgradi_zasneti', 'Заснети сгради > 40 m²', '', nf(0)],
      ['nesotv_broi', 'Несъответствия', 'бр.', nf(0)],
      ['nesotv_dial_pr', 'Дял несъответствия', '%', nf(2)],
      ['nesotv_ploshch_ha', 'Площ на несъответствията', 'ха', nf(2)],
      ['samo_satelit_pr', 'Само от сателит', '%', nf(1)],
    ]],
  ],
  rayon: [
    ['Жилища — два източника', AS_OF.kkkr + ' и 2011', [
      ['jilishta_kad', 'Кадастър днес', 'бр.', nf(0)],
      ['jilishta_2011', 'Преброяване 2011', 'бр.', nf(0)],
      ['prirast_jil_pr', 'Разлика', '%', nf(1)],
      ['jil_na_jitel_2026', 'Жилища на жител (днес)', '', nf(3)],
      ['jil_na_jitel_2011', 'Жилища на жител (2011)', '', nf(3)],
      ['lica_na_jil_2026', 'Жители на жилище (днес)', '', nf(2)],
    ]],
    ['Устройствени показатели', AS_OF.kkkr + ' ⨯ ' + AS_OF.oup_par, [
      ['imoti_s_pokazateli', 'Имоти с известен режим', '', nf(0)],
      ['median_kint', 'Медианен Кинт', '', nf(2)],
      ['prevish_kint', 'С превишен Кинт', 'бр.', nf(0)],
      ['prevish_kint_pr', 'Дял превишени', '%', nf(1)],
    ]],
    ['Население', AS_OF.grao, [
      ['nastoyasht', 'По настоящ адрес', 'души', nf(0)],
      ['postoyanen', 'По постоянен адрес', 'души', nf(0)],
      ['razlika', 'Разлика', 'души', nf(0)],
      ['razlika_pr', 'Разлика', '%', nf(1)],
      ['plytnost_2026', 'Плътност', 'д/km²', nf(0)],
    ]],
    ['Територия и сгради', AS_OF.sgradi, [
      ['ploshch_kvkm', 'Площ', 'km²', nf(1)],
      ['plytnost_2026_zastr', 'Плътност на застрояване', '', nf(3)],
      ['sgradi', 'Заснети сгради > 40 m²', '', nf(0)],
      ['sgradi_na_kvkm', 'Сгради на km²', '', nf(0)],
      ['zastr_ploshch_ha', 'Застроена площ', 'ха', nf(1)],
      ['sredna_ploshch_m2', 'Средна площ на сграда', 'm²', nf(0)],
    ]],
    ['Законност на сградите', AS_OF.sgradi + ' ⨯ ' + AS_OF.kkkr, [
      ['d_obshto', 'Заснети сгради > 40 m²', '', nf(0)],
      ['d_dokument', 'С документ от НАГ', 'бр.', nf(0)],
      ['d_dokument_pr', 'Дял с документ', '%', nf(1)],
      ['d_visoka', 'Висока степен', 'бр.', nf(0)],
      ['d_sredna', 'Средна степен', 'бр.', nf(0)],
      ['d_niska', 'Ниска степен', 'бр.', nf(0)],
    ]],
    ['Спрямо ОУП 2009 (стара проверка)', AS_OF.sgradi, [
      ['nesotv', 'Несъответствия', 'бр.', nf(0)],
      ['dial_nesotv_pr', 'Дял несъответствия', '%', nf(2)],
      ['dial_samo_satelit_pr', 'Само от сателит', '%', nf(1)],
    ]],
  ],
};

export const SOURCES = [
  ['Население 2026', 'ГРАО — по постоянен и настоящ адрес, 15.06.2026'],
  ['Разрешения за строеж', 'НСИ — тримесечно по области, до 2026 кв.2'],
  ['Индекс на цените', 'НСИ ИЦЖ — Югозападен район, до 2026 кв.1'],
  ['Жилищен фонд', 'НСИ — област София (столица), годишна редица до 2025'],
  ['Очертания на сгради', 'Overture Maps 2026-08 (OSM + Microsoft ML)'],
  ['Устройствени зони', 'ОУП 2009, Столична община'],
  ['Цени, застрояване, население по квартал',
    'urbandata.sofia.bg / Софияплан'],
  ['Преброяване по сграда', 'НСИ 2011, геокодирано по адрес'],
  ['Заповеди за премахване',
    'чл. 225 ЗУТ — nss.gis-sofia.bg (2008–2021) и НАГ (след 2021)'],
  ['Базова карта', 'Protomaps / OpenStreetMap'],
];
