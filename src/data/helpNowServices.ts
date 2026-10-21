import { Bath, ChefHat, Fan, Home, Shirt, Sparkles, Utensils, type LucideIcon } from "lucide-react";

// Help Now services, from the "Category-HelpNow" sheet of Beauty & HelpNow.xlsx:
// each task is a service name (column G) with what the helper is trained to do
// (column F); notIncluded is column H.
//
// ratePerHour is per helper, in rupees. The backend charges its own copy
// (backend src/modules/websites/help-now/bookings/helpNowPricing.ts) — keep
// the two in step.

export type HelpNowServiceSlug =
  | "house-cleaning"
  | "dish-washing"
  | "kitchen-assistance"
  | "bathroom-cleaning"
  | "laundry-ironing"
  | "dusting-wiping"
  | "everyday-home-help";

export interface HelpNowTask {
  name: string;
  // One- or two-word label for the booking form's task chips.
  short: string;
  detail: string;
}

export interface HelpNowService {
  slug: HelpNowServiceSlug;
  name: string;
  icon: LucideIcon;
  image: string;
  // Large photo for the service page's hero (a wide banner where we have one).
  heroImage: string;
  ratePerHour: number;
  // Suggested length of one visit, pre-selected in the booking form.
  defaultHours: number;
  tagline: string;
  short: string;
  description: string;
  tasks: HelpNowTask[];
  notIncluded: string[];
  faqs: { q: string; a: string }[];
}

const sharedFaqs = [
  {
    q: "Are Help Now helpers verified?",
    a: "Yes. Every helper is background-verified and trained by CityCalls before their first visit.",
  },
  {
    q: "How is the price calculated?",
    a: "You pay per helper, per hour. Pick the number of helpers and hours in the booking form and the total updates instantly — no hidden charges.",
  },
  {
    q: "How can I pay?",
    a: "Pay online securely with Razorpay (UPI, cards, net banking, wallets) while booking, or choose to pay after the service.",
  },
  {
    q: "Can I use a coupon?",
    a: "Yes. Enter your coupon code in the last step of the booking form and tap Apply — the discount shows before you pay.",
  },
  {
    q: "How do I reschedule or cancel?",
    a: "Call or WhatsApp us on +91 74288 08884 with your booking ID and we'll take care of it.",
  },
];

export const helpNowServices: HelpNowService[] = [
  {
    slug: "house-cleaning",
    name: "House Cleaning",
    icon: Home,
    image: "/assets/Images/h5.png",
    heroImage: "/assets/Banner/h1.png",
    ratePerHour: 179,
    defaultHours: 2,
    tagline: "Daily & weekly home upkeep",
    short: "Floors, furniture, fans and bedrooms kept neat and dust-free.",
    description:
      "A trained Help Now helper sweeps and mops your floors, dusts furniture, wardrobes, fans and reachable ceilings, tidies bedrooms and clears household waste — so your home stays fresh every day.",
    tasks: [
      { name: "Floor Sweeping & Mopping", short: "Sweep & Mop", detail: "Sweep and mop accessible floors" },
      { name: "Furniture & Wardrobe Dusting", short: "Furniture Dusting", detail: "Dust and wipe furniture and wardrobes" },
      { name: "Fan & Ceiling Dusting", short: "Fans & Ceiling", detail: "Dust reachable walls, fans and ceilings" },
      { name: "Bedroom Tidying & Bed Linen", short: "Bedroom & Linen", detail: "Change or rearrange existing bedding" },
      { name: "Household Waste Disposal", short: "Waste Disposal", detail: "Dispose of wet and dry household waste" },
    ],
    notIncluded: [
      "Cleaning unsafe or inaccessible areas",
      "Any tasks involving ladders or stools",
      "Moving heavy furniture or appliances",
      "Cleaning outside home areas",
      "Child, elderly, pet or medical care",
    ],
    faqs: sharedFaqs,
  },
  {
    slug: "dish-washing",
    name: "Dish Washing",
    icon: Utensils,
    image: "/assets/Images/h1.png",
    heroImage: "/assets/Banner/h2.png",
    ratePerHour: 159,
    defaultHours: 1,
    tagline: "Sparkling utensils, spotless sink",
    short: "Utensils washed, sink scrubbed, stove wiped and kitchen waste cleared.",
    description:
      "Your helper washes everyday utensils, scrubs the kitchen sink, cleans burners and the stove top, clears wet and dry kitchen waste and leaves the sink area clean and dry.",
    tasks: [
      { name: "Kitchen Utensil Washing", short: "Utensils", detail: "Wash regular household utensils" },
      { name: "Kitchen Sink Cleaning & Scrubbing", short: "Sink Scrub", detail: "Scrub and clean the kitchen sink" },
      { name: "Gas Stove & Burner Cleaning", short: "Stove & Burners", detail: "Clean burners and wipe the stove top" },
      { name: "Kitchen Waste Collection & Disposal", short: "Kitchen Waste", detail: "Dispose of wet and dry kitchen waste" },
      { name: "Sink Area Cleaning & Drying", short: "Sink Area", detail: "Leave the sink area clean and dry" },
    ],
    notIncluded: [
      "Chimney, degreasing or duct cleaning",
      "Cleaning inside electrical appliances",
      "Heavy scrubbing of burnt or old utensils",
      "Handling broken glass or sharp waste",
      "Specialised cookware handling",
    ],
    faqs: sharedFaqs,
  },
  {
    slug: "kitchen-assistance",
    name: "Kitchen Assistance",
    icon: ChefHat,
    image: "/assets/Images/h2.png",
    heroImage: "/assets/Images/h2.png",
    ratePerHour: 199,
    defaultHours: 2,
    tagline: "Prep help for your kitchen",
    short: "Vegetables chopped, dough kneaded and ingredients prepped for cooking.",
    description:
      "Get a helping hand with the prep work: washing and chopping vegetables, kneading dough, preparing batter and marination, then cleaning the prep area and storing everything properly.",
    tasks: [
      { name: "Vegetable Washing & Cutting", short: "Veg Cutting", detail: "Wash and chop vegetables" },
      { name: "Dough Kneading & Batter Preparation", short: "Dough & Batter", detail: "Knead dough and prep batter" },
      { name: "Ingredient Preparation & Marination", short: "Marination", detail: "Marinate and do basic ingredient prep" },
      { name: "Kitchen Prep Area Cleaning", short: "Prep Area", detail: "Clean and organise the prep area" },
      { name: "Prepared Ingredient Storage", short: "Storage", detail: "Store prepped items properly" },
    ],
    notIncluded: [
      "Full meal cooking or plating",
      "Non-vegetarian meat preparation",
      "Specialised or gourmet recipes",
      "Grocery shopping or sourcing",
      "Operating unfamiliar appliances",
    ],
    faqs: sharedFaqs,
  },
  {
    slug: "bathroom-cleaning",
    name: "Bathroom Cleaning",
    icon: Bath,
    image: "/assets/Images/ab2.png",
    heroImage: "/assets/Banner/h3.png",
    ratePerHour: 189,
    defaultHours: 1,
    tagline: "Fresh, hygienic bathrooms",
    short: "Mirrors, WC, washbasin, fittings and floor cleaned and dried.",
    description:
      "Your helper cleans mirrors and reachable walls, the toilet rim, seat and lid, scrubs the washbasin and fittings, and mops and dries the bathroom floor for a fresh, hygienic finish.",
    tasks: [
      { name: "Bathroom Mirror & Wall Cleaning", short: "Mirror & Walls", detail: "Clean mirrors and reachable walls" },
      { name: "Toilet Bowl & Seat Cleaning", short: "Toilet", detail: "Clean the WC rim, seat and lid" },
      { name: "Washbasin & Fittings Cleaning", short: "Washbasin", detail: "Scrub sinks and wipe fittings" },
      { name: "Bathroom Floor Cleaning & Drying", short: "Floor", detail: "Mop and dry the bathroom floor" },
      { name: "General Bathroom Surface Cleaning", short: "Surfaces", detail: "Basic surface clean of the bathroom" },
    ],
    notIncluded: [
      "Hard stains, grout or acid wash",
      "Cleaning ceilings and exhausts",
      "Drain unclogging or dismantling",
      "Handling biohazard waste",
      "Electrical or open wiring work",
    ],
    faqs: sharedFaqs,
  },
  {
    slug: "laundry-ironing",
    name: "Laundry & Ironing",
    icon: Shirt,
    image: "/assets/Images/h4.png",
    heroImage: "/assets/Images/h4.png",
    ratePerHour: 169,
    defaultHours: 2,
    tagline: "Washed, dried, ironed & folded",
    short: "Clothes sorted, machine-washed, dried, ironed and arranged in cupboards.",
    description:
      "Hand over the laundry: your helper sorts and machine-washes clothes, dries them on a line or rack, irons everyday wear, folds and arranges them in your cupboards and tidies the laundry area.",
    tasks: [
      { name: "Clothes Sorting & Machine Washing", short: "Machine Wash", detail: "Sort clothes and machine wash" },
      { name: "Clothesline & Rack Drying", short: "Drying", detail: "Dry clothes on a line or rack" },
      { name: "Clothes Folding & Wardrobe Organisation", short: "Folding", detail: "Fold and arrange in cupboards" },
      { name: "Everyday Garment Ironing", short: "Ironing", detail: "Iron regular daily-wear clothes" },
      { name: "Laundry Area Cleaning & Organisation", short: "Laundry Area", detail: "Tidy the laundry area after work" },
    ],
    notIncluded: [
      "Ironing delicate or designer wear",
      "Handling biohazard-stained clothes",
      "Cleaning the washing machine",
      "Advanced stain treatments",
      "Hand-washing bed sheets or heavy linen",
    ],
    faqs: sharedFaqs,
  },
  {
    slug: "dusting-wiping",
    name: "Dusting & Wiping",
    icon: Fan,
    image: "/assets/Images/h3.png",
    heroImage: "/assets/Images/h3.png",
    ratePerHour: 149,
    defaultHours: 1,
    tagline: "Dust-free shelves, sills & surfaces",
    short: "Shelves, tables, window sills, grills and cobwebs dusted and wiped.",
    description:
      "Your helper dusts shelves and furniture, wipes counters, tables and décor, cleans window sills and grills, removes reachable cobwebs and wipes down the outside of your appliances.",
    tasks: [
      { name: "Furniture Dusting, Shelf Cleaning, Cabinet Wiping", short: "Shelves & Furniture", detail: "Dust shelves and furniture" },
      { name: "Table Wiping, Countertop Cleaning, Décor Dusting", short: "Tables & Décor", detail: "Wipe counters, tables and décor" },
      { name: "Window Frame Cleaning, Window Sill Dusting, Window Grill Cleaning", short: "Windows & Grills", detail: "Clean window sills and grills" },
      { name: "Cobweb Removal, Ceiling Corner Dusting, Wall Corner Cleaning", short: "Cobwebs", detail: "Remove reachable cobwebs" },
      { name: "Appliance Exterior Cleaning", short: "Appliances", detail: "Clean the outside of home appliances" },
    ],
    notIncluded: [
      "Dusting ceilings or high areas",
      "Using unstable stools or ladders",
      "Chandeliers or fragile items",
      "Exterior grills and windows",
      "Stain removal or restoration",
    ],
    faqs: sharedFaqs,
  },
  {
    slug: "everyday-home-help",
    name: "Everyday Home Help",
    icon: Sparkles,
    image: "/assets/Images/ab3.png",
    heroImage: "/assets/Images/ab3.png",
    ratePerHour: 169,
    defaultHours: 2,
    tagline: "All the little jobs, done",
    short: "Fans, fridge, wardrobes, kitchen slab, windows and more — mix and match.",
    description:
      "Pick the odd jobs you need help with — fans and cobwebs, a fridge clean-out, wardrobe organising, kitchen slab and stove top, interior windows, cushions, tabletops and mirrors — and your helper takes care of them.",
    tasks: [
      { name: "Ceiling Fan Cleaning & Cobweb Removal", short: "Fans & Cobwebs", detail: "Clean reachable fans and cobwebs" },
      { name: "Vegetable Washing, Peeling & Chopping", short: "Veg Prep", detail: "Basic meal prep (washing and chopping)" },
      { name: "Refrigerator Cleaning", short: "Fridge", detail: "Clean refrigerator shelves, drawers and interior" },
      { name: "Wardrobe Organisation", short: "Wardrobe", detail: "Organise wardrobes" },
      { name: "Kitchen Slab & Stovetop Cleaning", short: "Slab & Stove", detail: "Clean the kitchen slab and stove top" },
      { name: "Interior Window Cleaning", short: "Windows", detail: "Clean windows (interior areas)" },
      { name: "Bedding Change & Arrangement", short: "Bedding", detail: "Change or rearrange existing bedding" },
      { name: "Sofa Cushion Arrangement", short: "Cushions", detail: "Arrange sofa cushions" },
      { name: "Tabletop Arrangement", short: "Tabletops", detail: "Arrange tabletops" },
      { name: "Mirror Cleaning & Shine", short: "Mirrors", detail: "Clean and shine mirrors" },
      { name: "Appliance Exterior Cleaning", short: "Appliances", detail: "Clean appliance exteriors" },
    ],
    notIncluded: [
      "Deep cleaning or acid wash",
      "Work at heights or on ladders",
      "Full meal cooking",
      "Child, elderly, pet or medical care",
    ],
    faqs: sharedFaqs,
  },
];

export function findHelpNowService(slug: string) {
  return helpNowServices.find((service) => service.slug === slug);
}
