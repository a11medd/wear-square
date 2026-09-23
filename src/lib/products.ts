import type { Lang } from "./i18n";

export type Category = "men" | "women" | "kids";
export type GarmentType =
  | "tee" | "shirt" | "jeans" | "trousers" | "hoodie"
  | "jacket" | "dress" | "sweater" | "skirt" | "shorts";
export type View = "front" | "back" | "detail";

export interface ColorVariant {
  id: string;
  name: { en: string; ar: string };
  hex: string;
  family: string;
  stock: Record<string, number>; // size -> qty
}

export interface Product {
  id: string;
  category: Category;
  type: GarmentType;
  name: { en: string; ar: string };
  desc: { en: string; ar: string };
  fabric: { en: string; ar: string };
  care: { en: string; ar: string };
  price: number;
  oldPrice?: number;
  colors: ColorVariant[];
  sizes: string[];
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  keywords: { en: string; ar: string };
}

export const SIZES = ["S", "M", "L", "XL"];

// ---------- shipping / coupon rules (client-side demo) ----------
export const FREE_SHIP = 1500;
export const SHIP_FEE = 50;
export const COUPONS: Record<string, number> = { FAMILY10: 0.1 };

export const getCoupon = (): string | null => {
  try { return sessionStorage.getItem("ws_coupon"); } catch { return null; }
};
export const setCoupon = (code: string | null) => {
  try {
    if (code) sessionStorage.setItem("ws_coupon", code);
    else sessionStorage.removeItem("ws_coupon");
  } catch { /* ignore */ }
};

const C = {
  black: { en: "Black", ar: "أسود", hex: "#211f24", family: "black" },
  white: { en: "White", ar: "أبيض", hex: "#f3f0e9", family: "white" },
  beige: { en: "Beige", ar: "بيج", hex: "#cdbb98", family: "beige" },
  cream: { en: "Cream", ar: "كريمي", hex: "#e6dcc8", family: "cream" },
  stone: { en: "Stone", ar: "حجري", hex: "#a9a294", family: "beige" },
  khaki: { en: "Khaki", ar: "كاكي", hex: "#b3a27e", family: "beige" },
  indigo: { en: "Indigo", ar: "نيلي", hex: "#33415c", family: "blue" },
  sky: { en: "Sky Blue", ar: "أزرق سماوي", hex: "#9fb6c6", family: "blue" },
  navy: { en: "Navy", ar: "كحلي", hex: "#2b3550", family: "blue" },
  lightBlue: { en: "Light Blue", ar: "أزرق فاتح", hex: "#6e87a5", family: "blue" },
  steel: { en: "Steel Blue", ar: "أزرق رمادي", hex: "#8fa6b8", family: "blue" },
  charcoal: { en: "Charcoal", ar: "رمادي فحمي", hex: "#3a3a40", family: "grey" },
  graphite: { en: "Graphite", ar: "جرافيت", hex: "#4a4a50", family: "grey" },
  forest: { en: "Forest Green", ar: "أخضر غامق", hex: "#3a5245", family: "green" },
  olive: { en: "Olive", ar: "زيتوني", hex: "#6b6b45", family: "green" },
  oliveDeep: { en: "Deep Olive", ar: "زيتوني غامق", hex: "#565a3d", family: "green" },
  teal: { en: "Teal", ar: "فيروزي داكن", hex: "#3e7c7b", family: "green" },
  terracotta: { en: "Terracotta", ar: "تراكوتا", hex: "#b4593a", family: "terracotta" },
  rust: { en: "Rust", ar: "صدئي", hex: "#9c4a2f", family: "terracotta" },
  sunYellow: { en: "Sun Yellow", ar: "أصفر شمس", hex: "#e3b341", family: "yellow" },
  mustard: { en: "Mustard", ar: "خردلي", hex: "#c9973b", family: "yellow" },
  dustyPink: { en: "Dusty Pink", ar: "وردي ترابي", hex: "#c89a96", family: "pink" },
};

type CKey = keyof typeof C;
const cv = (k: CKey, id: string, stock: Record<string, number>): ColorVariant => ({
  id,
  name: { en: C[k].en, ar: C[k].ar },
  hex: C[k].hex,
  family: C[k].family,
  stock,
});

const st = (s = 8, m = 12, l = 6, xl = 0) => ({ S: s, M: m, L: l, XL: xl });
const zero = () => ({ S: 0, M: 0, L: 0, XL: 0 });

const F = {
  tee: {
    en: "100% combed cotton, 180 gsm — soft hand, holds its shape wash after wash.",
    ar: "قطن ممشط 100٪ بوزن 180 جم/م² — ملمس ناعم ويحافظ على شكله مع الغسيل.",
  },
  shirt: {
    en: "Breathable oxford cotton with a half-soft wash finish.",
    ar: "قطن أوكسفورد جيد التهوية بلمسة غسيل نصف ناعم.",
  },
  jeans: {
    en: "12.1 oz cotton denim with 2% elastane for everyday stretch.",
    ar: "دنيم قطن 12.1 أونصة مع 2٪ إลานستين لمرونة يومية.",
  },
  trousers: {
    en: "Cotton twill with a soft brushed finish and natural drape.",
    ar: "تويل قطن بلمسة مموّهّة وتدرج طبيعي.",
  },
  hoodie: {
    en: "320 gsm brushed cotton fleece, reinforced hood and cuffs.",
    ar: "فليس قطن مموّه بوزن 320 جم/م²، قبة وأكمام مقوّاة.",
  },
  jacket: {
    en: "Sturdy cotton-canvas blend, brushed interior.",
    ar: "مزيج قطن وكانفس متين، بطانة داخلية مموّهة.",
  },
  dress: {
    en: "Soft viscose-cotton blend with a fluid, skin-friendly drape.",
    ar: "مزيج فيسكوز وقطن ناعم بتدفق مريح على البشرة.",
  },
  sweater: {
    en: "Chunky cotton-wool knit, 8-gauge, gently warm.",
    ar: "تريكو قطن وصوف كثيف، خامة 8، دفء لطيف.",
  },
  skirt: {
    en: "Cotton crepe with subtle stretch that survives the school run.",
    ar: "كريب قطن مع لمسة مرونة تتحمل ريوحة المدرسة.",
  },
  shorts: {
    en: "Stretch cotton twill, double-stitched pockets.",
    ar: "تويل قطن مرن بجيوب مخيطة بخيوط مزدوجة.",
  },
};

const careWash = {
  en: "Machine wash cold (30°) with similar colors. Tumble dry low or hang. Warm iron if needed.",
  ar: "غسيل آلي بماء بارد (30°) مع ألوان مماثلة. نضح خفيف أو تُنشر. كي معتدل عند الحاجة.",
};
const careDenim = {
  en: "Wash cold inside-out, sparingly. Hang to dry in the shade. Do not bleach.",
  ar: "يُغسل باردًا مقلوبًا وبانتظام قليل. يُنشر في الظل. بدون مبيض.",
};
const careKnit = {
  en: "Hand wash or delicate cycle. Lay flat to dry. Store folded, not hung.",
  ar: "غسيل يدوي أو دورة لطيفة. يُنشر مسطحًا. يُحفظ مطويًا وليس معلقًا.",
};

export const PRODUCTS: Product[] = [
  // ---------------- MEN ----------------
  {
    id: "m-tee-classic",
    category: "men",
    type: "tee",
    name: { en: "Classic Crew Tee", ar: "تيشيرت كلاسيك" },
    desc: {
      en: "The tee that lives in every rotation — a clean crew neck, a straight everyday cut, and cotton that gets softer with age. Wear it with jeans, chinos, or under the weekend overshirt.",
      ar: "التيشيرت الذي لا يغيب عن أي إطلالة — كروب دائري أنيق، قصّ يومي مستقيم، وقطن يزداد نعومة مع الوقت. ارتده مع الجينز أو التشينو أو تحت جاكيت نهاية الأسبوع.",
    },
    fabric: F.tee, care: careWash,
    price: 449,
    colors: [
      cv("black", "mtee-black", st(10, 14, 8, 4)),
      cv("white", "mtee-white", st(6, 10, 8, 0)),
      cv("beige", "mtee-beige", st(4, 8, 6, 6)),
    ],
    sizes: SIZES,
    featured: true,
    bestseller: true,
    keywords: { en: "tshirt tee top cotton basic casual", ar: "تيشيرت توب قطن أساسي كاجوال" },
  },
  {
    id: "m-shirt-oxford",
    category: "men",
    type: "shirt",
    name: { en: "Oxford Shirt", ar: "قميص أوكسفورد" },
    desc: {
      en: "A crisp-but-comfortable oxford that moves from the office table to Friday dinner without an iron. Structured shoulders, a soft collar break, a cut that layers well.",
      ar: "قميص أوكسفورد أنيق ومريح ينتقل من المكتب لعشاء الجمعة بدون كي. كتفان ببنية، ياقة مريحة، وقصّ مثالي للتسليك.",
    },
    fabric: F.shirt, care: careWash,
    price: 749,
    colors: [
      cv("white", "msh-white", st(8, 10, 8, 6)),
      cv("sky", "msh-sky", st(6, 8, 6, 0)),
    ],
    sizes: SIZES,
    featured: true,
    newArrival: true,
    keywords: { en: "shirt oxford office formal button", ar: "قميص أوكسفورد رسمي أزرار" },
  },
  {
    id: "m-jeans-straight",
    category: "men",
    type: "jeans",
    name: { en: "Straight Jeans", ar: "جينز مستقيم" },
    desc: {
      en: "A true straight leg in 12-ounce denim — room at the thigh, clean at the ankle, and just enough stretch to survive a full day of errands.",
      ar: "جينز مستقيم حقيقي بخامة 12 أونصة — مرونة في الفخذ وانسدال نظيف عند الكاحل، وراحة تكفي ليومًا كاملًا من المشاوير.",
    },
    fabric: F.jeans, care: careDenim,
    price: 899,
    oldPrice: 1099,
    colors: [
      cv("indigo", "mj-indigo", st(10, 12, 8, 6)),
      cv("navy", "mj-navy", st(6, 8, 4, 0)),
    ],
    sizes: SIZES,
    bestseller: true,
    keywords: { en: "jeans denim straight pants", ar: "جينز دنيم بنطال مستقيم" },
  },
  {
    id: "m-trousers-chino",
    category: "men",
    type: "trousers",
    name: { en: "Chino Trousers", ar: "بنطال تشينو" },
    desc: {
      en: "Soft cotton twill chinos with a natural drape and a mid-rise that actually sits right. The quiet upgrade every casual outfit deserves.",
      ar: "تشينو من تويل قطن ناعم بتدرج طبيعي وقصّ وسط مريح. اللمسة الهادئة التي تستحقها أي إطلالة كاجوال.",
    },
    fabric: F.trousers, care: careWash,
    price: 699,
    colors: [
      cv("beige", "mc-beige", st(8, 10, 6, 4)),
      cv("navy", "mc-navy", st(4, 6, 6, 0)),
    ],
    sizes: SIZES,
    newArrival: true,
    keywords: { en: "chinos trousers pants work", ar: "تشينو بنطال عمل" },
  },
  {
    id: "m-hoodie-essential",
    category: "men",
    type: "hoodie",
    name: { en: "Essential Hoodie", ar: "هودي إيسنشال" },
    desc: {
      en: "Heavyweight brushed fleece, a double-layer hood, and cuffs that don't fold. The hoodie your family keeps asking to borrow.",
      ar: "فليس ثقيل مموّه، قبة مزدوجة الطبقات، وأكمام لا تنطوي. الهودي الذي لن يتوقف أفراد عائلتك عن الاستعارة منه.",
    },
    fabric: F.hoodie, care: careKnit,
    price: 799,
    oldPrice: 949,
    colors: [
      cv("charcoal", "mh-char", st(12, 10, 8, 6)),
      cv("forest", "mh-forest", st(6, 8, 4, 0)),
    ],
    sizes: SIZES,
    bestseller: true,
    keywords: { en: "hoodie sweatshirt fleece winter cozy", ar: "هودي سويت شيرت شتوي دافئ" },
  },
  {
    id: "m-jacket-overshirt",
    category: "men",
    type: "jacket",
    name: { en: "Weekend Overshirt", ar: "جاكيت نهاية الأسبوع" },
    desc: {
      en: "A sturdy cotton-canvas overshirt with flap pockets — light enough for a spring day, structured enough to stand in for a jacket in October.",
      ar: "جاكيت كانفس متين بجيوب عملية — خفيف ليوم ربيعي، ومهيأ ليحل محل الجاكيت في أكتوبر.",
    },
    fabric: F.jacket, care: careWash,
    price: 1199,
    colors: [
      cv("oliveDeep", "mo-olive", zero()),
      cv("charcoal", "mo-char", zero()),
    ],
    sizes: SIZES,
    keywords: { en: "jacket overshirt flannel outerwear", ar: "جاكيت ملابس خارجية" },
  },

  // ---------------- WOMEN ----------------
  {
    id: "w-tee-essential",
    category: "women",
    type: "tee",
    name: { en: "Essential Tee", ar: "تيشيرت إيسنشال" },
    desc: {
      en: "A softer, slightly longer cut of the everyday tee — enough coverage under a blazer, roomy enough for a full day, soft enough to sleep in (don't tell).",
      ar: "قصّ أنعم وأطول قليلًا من التيشيرت اليومي — تغطية كافية تحت الجاكيت، ورحابة تكفي يومًا كاملًا، ونعومة لا تحتاج تعليقًا.",
    },
    fabric: F.tee, care: careWash,
    price: 399,
    colors: [
      cv("white", "wtee-white", st(10, 12, 10, 6)),
      cv("black", "wtee-black", st(8, 10, 6, 0)),
    ],
    sizes: SIZES,
    bestseller: true,
    keywords: { en: "tshirt tee top basic", ar: "تيشيرت توب أساسي" },
  },
  {
    id: "w-dress-wrap",
    category: "women",
    type: "dress",
    name: { en: "Midi Wrap Dress", ar: "فستان ميدي" },
    desc: {
      en: "A fluid midi with a gentle wrap line that skims, never clings. Pairs with sneakers on the school run and heels when the week lets you off.",
      ar: "فستان ميدي بتدفق رشيق وخط غطاء يتبع الجسم دون إحكام. مع السنيكرز لريوحة المدرسة، ومع الكعب حين تسمح الأسبوع بذلك.",
    },
    fabric: F.dress, care: careWash,
    price: 949,
    colors: [
      cv("terracotta", "wd-terra", st(6, 8, 6, 4)),
      cv("black", "wd-black", st(8, 6, 4, 0)),
      cv("rust", "wd-rust", zero()),
    ],
    sizes: SIZES,
    featured: true,
    keywords: { en: "dress midi wrap occasion office", ar: "فستان ميدي سهرة عمل" },
  },
  {
    id: "w-trousers-wide",
    category: "women",
    type: "trousers",
    name: { en: "Wide-Leg Trousers", ar: "بنطال واسع" },
    desc: {
      en: "High-rise, wide-leg, and impossibly fluid — the trousers that make a blouse and a flat feel like an outfit on purpose.",
      ar: "قصّ مرتفع وسيقان واسعة بتدفق استثنائي — البنطال الذي يجعل البلوزة والفلت تبدو إطلالة مدروسة.",
    },
    fabric: F.trousers, care: careWash,
    price: 849,
    colors: [
      cv("black", "wt-black", st(10, 12, 8, 8)),
      cv("cream", "wt-cream", st(4, 6, 6, 0)),
    ],
    sizes: SIZES,
    featured: true,
    newArrival: true,
    keywords: { en: "trousers pants wide office elegant", ar: "بنطال واسع أنيق عمل" },
  },
  {
    id: "w-sweater-knit",
    category: "women",
    type: "sweater",
    name: { en: "Chunky Knit Sweater", ar: "سترة تريكو" },
    desc: {
      en: "An 8-gauge knit that looks warm, is warm, and still fits under a coat. The Sunday-morning-to-errands layering hero.",
      ar: "تريكو خامة 8 يبدو دافئًا وهو دافئ فعلًا، ويتسع تحت المعطف. قطعة الطبقات من صباح الأحد إلى المشاوير.",
    },
    fabric: F.sweater, care: careKnit,
    price: 899,
    oldPrice: 1099,
    colors: [
      cv("cream", "ws-cream", st(8, 10, 6, 4)),
      cv("forest", "ws-forest", st(4, 6, 4, 0)),
    ],
    sizes: SIZES,
    bestseller: true,
    keywords: { en: "sweater knit wool winter cardigan", ar: "سترة تريكو شتوية صوف" },
  },
  {
    id: "w-skirt-midi",
    category: "women",
    type: "skirt",
    name: { en: "Pleated Midi Skirt", ar: "تنورة ميدي" },
    desc: {
      en: "Softly pleated, knee-to-ankle length, with a waistband that stays put through a full day of bending, reaching, and hugging.",
      ar: "تنورة مطوية بنعومة بطول الميدي، بخصر ثابت يصمد طوال اليوم من الانحناء والتقاط والأحضان.",
    },
    fabric: F.skirt, care: careWash,
    price: 599,
    colors: [
      cv("olive", "wk-olive", st(8, 10, 8, 4)),
      cv("black", "wk-black", st(6, 6, 4, 0)),
    ],
    sizes: SIZES,
    newArrival: true,
    keywords: { en: "skirt midi pleated office", ar: "تنورة ميدي عمل" },
  },
  {
    id: "w-shirt-linen",
    category: "women",
    type: "shirt",
    name: { en: "Linen Shirt", ar: "قميص كتان" },
    desc: {
      en: "Airy linen-cotton with a relaxed shoulder and deep pockets. Belted or untucked, it does the summer talking for you.",
      ar: "كتان قطني تهوية عالية بكتف مريح وجيوب عميقة. مع الحزام أو منسدلًا، يتحدث عن صيفك بدلًا منك.",
    },
    fabric: { en: "Linen-cotton blend, breathable and light.", ar: "مزيج كتان وقطن، خفيف وجيد التهوية." },
    care: careWash,
    price: 699,
    colors: [
      cv("cream", "wls-cream", st(10, 8, 6, 4)),
      cv("steel", "wls-steel", st(4, 6, 6, 0)),
    ],
    sizes: SIZES,
    featured: true,
    keywords: { en: "linen shirt summer casual blouse", ar: "قميص كتان صيفي كاجوال" },
  },

  // ---------------- KIDS ----------------
  {
    id: "k-tee-crew",
    category: "kids",
    type: "tee",
    name: { en: "Kids Crew Tee", ar: "تيشيرت أطفال" },
    desc: {
      en: "Scrappy, soft, and pre-washed so it's soft from day one. Reinforced collar, side-seam pockets for the pocket-sized treasures.",
      ar: "قطن ناعم مغلّس مسبقًا ليكون مريحًا من اليوم الأول. ياقة مقوّاة وجيوب جانبية للكنوز الصغيرة.",
    },
    fabric: F.tee, care: careWash,
    price: 249,
    colors: [
      cv("teal", "kt-teal", st(12, 14, 10, 6)),
      cv("navy", "kt-navy", st(10, 12, 8, 8)),
      cv("sunYellow", "kt-yellow", st(6, 8, 8, 4)),
    ],
    sizes: SIZES,
    bestseller: true,
    newArrival: true,
    keywords: { en: "kids tshirt tee boy girl cotton", ar: "تيشيرت أطفال قطن بنات ولاد" },
  },
  {
    id: "k-jeans-comfy",
    category: "kids",
    type: "jeans",
    name: { en: "Comfy Kids Jeans", ar: "جينز أطفال مريح" },
    desc: {
      en: "Extra stretch, cuffed hems for growing ankles, and flat seams that stay put under backpacks and playgrounds.",
      ar: "مرونة إضافية، أطراف قابلة للطي لنمو الكاحلين، ودرزات مسطحة تصمد تحت الشنطة وساحة اللعب.",
    },
    fabric: F.jeans, care: careDenim,
    price: 449,
    colors: [
      cv("lightBlue", "kj-blue", st(10, 12, 10, 6)),
      cv("stone", "kj-stone", st(4, 0, 0, 0)),
    ],
    sizes: SIZES,
    keywords: { en: "kids jeans denim pants stretch", ar: "جينز أطفال بنطال مرن" },
  },
  {
    id: "k-hoodie-cozy",
    category: "kids",
    type: "hoodie",
    name: { en: "Cozy Kids Hoodie", ar: "هودي أطفال" },
    desc: {
      en: "Brushed fleece inside, a hood that fits real heads (not helmets), and a kangaroo pocket big enough for the family snack bag.",
      ar: "فليس مموّه من الداخل، قبة تناسب الرؤوس الحقيقية، وجيب كبير يكفي كيس سناك العائلة كله.",
    },
    fabric: F.hoodie, care: careKnit,
    price: 499,
    oldPrice: 599,
    colors: [
      cv("mustard", "kh-mustard", st(8, 10, 8, 6)),
      cv("graphite", "kh-graphite", st(6, 8, 6, 0)),
    ],
    sizes: SIZES,
    bestseller: true,
    keywords: { en: "kids hoodie sweater fleece school", ar: "هودي أطفال شتوي مدرسة" },
  },
  {
    id: "k-dress-play",
    category: "kids",
    type: "dress",
    name: { en: "Play Dress", ar: "فستان لعب" },
    desc: {
      en: "A twirl-proof silhouette in skin-soft cotton — built for playground summers, birthday parties, and everything in between.",
      ar: "شكل عملي بالدوران بخامة قطن ناعمة على البشرة — صيف ساحة اللعب، الحفلات، وكل ما بينهما.",
    },
    fabric: F.dress, care: careWash,
    price: 399,
    colors: [
      cv("dustyPink", "kd-pink", st(8, 10, 8, 4)),
      cv("black", "kd-black", st(4, 6, 4, 0)),
    ],
    sizes: SIZES,
    newArrival: true,
    keywords: { en: "kids dress girl party summer", ar: "فستان بنات حفلة صيف" },
  },
  {
    id: "k-shorts-everyday",
    category: "kids",
    type: "shorts",
    name: { en: "Everyday Shorts", ar: "شورت يومي" },
    desc: {
      en: "Stretch twill shorts with deep pockets and a drawcord waist that kids can actually tie themselves. Summer's workhorse.",
      ar: "شورت تويل مرن بجيوب عميقة وحزام سحبة يستطيع الأطفال ربطه بأنفسهم. حصان صيف العمل.",
    },
    fabric: F.shorts, care: careWash,
    price: 299,
    colors: [
      cv("khaki", "ks-khaki", st(10, 12, 10, 6)),
      cv("navy", "ks-navy", st(6, 8, 6, 0)),
    ],
    sizes: SIZES,
    newArrival: true,
    keywords: { en: "kids shorts summer boy", ar: "شورت أطفال صيف" },
  },
];

// ---------- helpers ----------

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

export const colorInStock = (c: ColorVariant) =>
  Object.values(c.stock).reduce((a, b) => a + b, 0) > 0;

export const productInStock = (p: Product) => p.colors.some(colorInStock);

export const firstAvailableColor = (p: Product) => p.colors.find(colorInStock);

export const related = (p: Product, n = 4) =>
  PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category)
    .sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0))
    .slice(0, n);

export const discountPct = (p: Product) =>
  p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

export const money = (n: number, lang: Lang) =>
  lang === "ar" ? `${n.toLocaleString("en-US")} ج.م` : `E£ ${n.toLocaleString("en-US")}`;

export const FILTER_COLORS = [
  { id: "black", hex: "#211f24", en: "Black", ar: "أسود" },
  { id: "white", hex: "#f3f0e9", en: "White", ar: "أبيض" },
  { id: "cream", hex: "#e6dcc8", en: "Cream", ar: "كريمي" },
  { id: "beige", hex: "#cdbb98", en: "Beige", ar: "بيج" },
  { id: "grey", hex: "#4a4a50", en: "Grey", ar: "رمادي" },
  { id: "blue", hex: "#4a6a92", en: "Blue", ar: "أزرق" },
  { id: "green", hex: "#3a5245", en: "Green", ar: "أخضر" },
  { id: "terracotta", hex: "#a8502f", en: "Terracotta", ar: "تراكوتا" },
  { id: "yellow", hex: "#c9973b", en: "Yellow", ar: "أصفر" },
  { id: "pink", hex: "#c89a96", en: "Pink", ar: "وردي" },
];

export const GOVERNORATES: { en: string; ar: string }[] = [
  { en: "Cairo", ar: "القاهرة" },
  { en: "Giza", ar: "الجيزة" },
  { en: "Alexandria", ar: "الإسكندرية" },
  { en: "Qalyubia", ar: "القليوبية" },
  { en: "Sharqia", ar: "الشرقية" },
  { en: "Gharbia", ar: "الغربية" },
  { en: "Dakahlia", ar: "الدقهلية" },
  { en: "Kafr El Sheikh", ar: "كفر الشيخ" },
  { en: "Beheira", ar: "البحيرة" },
  { en: "Port Said", ar: "بورسعيد" },
  { en: "Suez", ar: "السويس" },
  { en: "Ismailia", ar: "الإسماعيلية" },
  { en: "Damietta", ar: "دمياط" },
  { en: "Faiyum", ar: "الفيوم" },
  { en: "Beni Suef", ar: "بني سويف" },
  { en: "Minya", ar: "المنيا" },
  { en: "Assiut", ar: "أسيوط" },
  { en: "Sohag", ar: "سوهاج" },
  { en: "Qena", ar: "قنا" },
  { en: "Luxor", ar: "الأقصر" },
  { en: "Aswan", ar: "أسوان" },
  { en: "Red Sea", ar: "البحر الأحمر" },
  { en: "Matrouh", ar: "مطروح" },
  { en: "North Sinai", ar: "شمال سيناء" },
  { en: "South Sinai", ar: "جنوب سيناء" },
  { en: "New Valley", ar: "وادي الجديد" },
];

export function searchProducts(q: string): Product[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return PRODUCTS.filter((p) => {
    const hay = [
      p.name.en, p.name.ar,
      p.desc.en, p.desc.ar,
      p.keywords.en, p.keywords.ar,
      p.category === "men" ? "men رجال رجالي" : p.category === "women" ? "women نسائي نساء" : "kids أطفال أطفال",
      ...p.colors.map((c) => `${c.name.en} ${c.name.ar}`),
    ]
      .join(" ")
      .toLowerCase();
    return s.split(/\s+/).every((tok) => hay.includes(tok));
  });
}
