export const homePhotos = {
  primary: "/images/IMG_20250329_105130-scaled.jpg",
  secondary: "/images/IMG_20250330_121315-scaled.jpg",
};
export const partners = [
  {
    name: "TRACE Sri Lanka",
    image: "/images/logos/trace.png",
    url: "https://tracesrilanka.lk/",
  },
  {
    name: "IEEE Young Professionals Sri Lanka",
    image: "/images/logos/ieeeypsl.webp",
    url: "https://www.ieeeyp.lk/",
  },
  {
    name: "IIBA Colombo",
    image: "/images/logos/IIBA-Colombo.png",
    url: "https://colombo.iiba.org/",
  },
  {
    name: "ISC2 Colombo Sri Lanka Chapter",
    image: "/images/logos/isc-chapter-colombo-sri-lanka.png",
    url: "https://isc2colombochapter.lk/",
  },
];
export const homeAssetPaths = new Set(
  [
    ...Object.values(homePhotos),
    ...partners.map((partner) => partner.image),
  ].map((path) => path.slice(1)),
);
