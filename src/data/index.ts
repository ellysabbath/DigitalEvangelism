import { MenuItem, NewsItem, SlideItem, SocialLink, FooterLink } from '../types';

export const topNavMenu: MenuItem[] = [
  {
    label: 'Gallery',
    subItems: [
      { label: 'Tanzania Video Gallery', href: '#' },
      { label: 'Tanzania Photo Gallery', href: '#' }
    ]
  },
  { label: 'Global Travel News', href: '#' },
  { label: 'Contact Us', href: '#' }
];

export const mainMenu: MenuItem[] = [
  {
    label: 'About Tanzania',
    subItems: [
      { label: 'Fast Facts', href: '#' },
      { label: 'History', href: '#' },
      { label: 'Geography', href: '#' }
    ]
  },
  { label: 'Destinations', href: '#' },
  { label: 'Discover', href: '#' },
  {
    label: 'Activities',
    subItems: [
      { label: 'Sports Tourism', href: '#' },
      { label: 'Safaris', href: '#' },
      { label: 'Festivals', href: '#' }
    ]
  },
  { label: 'Accommodation', href: '#' }
];

export const heroSlides: SlideItem[] = [
  {
    id: 1,
    title: 'Welcome to Tanzania',
    subtitle: 'Land of Kilimanjaro, Serengeti and Zanzibar',
    image: 'https://www.visittanzania.org/wp-content/uploads/2020/04/visit-tanzania-mount-kilimanjaro-with-elephants-visittanzania4.jpg'
  },
  {
    id: 2,
    image: 'https://www.visittanzania.org/wp-content/uploads/2020/04/visit-tanzania-cheetah-seregenti-visittanzania.jpg'
  },
  {
    id: 3,
    image: 'https://www.visittanzania.org/wp-content/uploads/2020/04/visit-tanzania-luxury-tented-camp-selous-visittanzania.jpg'
  },
  {
    id: 4,
    image: 'https://www.visittanzania.org/wp-content/uploads/2020/04/visit-tanzania-dar-es-salam-city-visittanzania.jpg'
  },
  {
    id: 5,
    image: 'https://www.visittanzania.org/wp-content/uploads/2020/04/visit-tanzania-dhow-zanzibar-visittanzania.jpg'
  },
  {
    id: 6,
    image: 'https://www.visittanzania.org/wp-content/uploads/2020/04/visit-tanzania-mnemba-beach-visittanzania.jpg'
  }
];

export const scrollingSlides: SlideItem[] = [
  {
    id: 1,
    title: 'Mwaka Kogwa Festival',
    image: 'https://www.visittanzania.org/wp-content/uploads/2016/02/Mwaka-Kogwa-Festival-Visit-Tanzania-Zanzibar-390x220.jpg',
    link: '#'
  },
  {
    id: 2,
    title: 'Geography',
    image: 'https://www.visittanzania.org/wp-content/uploads/2019/10/visit-tanzania-waterfall-kalambo-falls-390x220.jpg',
    link: '#'
  },
  {
    id: 3,
    title: 'History',
    image: 'https://www.visittanzania.org/wp-content/uploads/2019/10/visit-tanzania-waterfront-at-zanzibar-tanzania-390x220.jpg',
    link: '#'
  },
  {
    id: 4,
    title: 'Tinga Tinga',
    image: 'https://www.visittanzania.org/wp-content/uploads/2020/04/tinga-tinga-390x220.jpg',
    link: '#'
  }
];

export const newsItems: NewsItem[] = [
  {
    id: 1,
    title: 'TAT Strengthens Thai Tourism',
    excerpt: 'The Tourism Authority of Thailand (TAT) is advancing its tourism data management...',
    date: 'July 17, 2026',
    image: 'https://www.visittanzania.org/wp-content/uploads/2026/07/TAT-Upgrading-Festival-Database-and-Expanding-the-Sukjai-Chatbot-AI-Assistant-1-220x150.jpg',
    views: 4,
    link: '#'
  },
  {
    id: 2,
    title: "Fred Finn, the World's Most Travelled Man, to Receive Prestigious Award",
    excerpt: 'Alicante, Spain, July 17, 2026 / TRAVELINDEX / Clevenard is proud to...',
    date: 'July 17, 2026',
    image: 'https://www.visittanzania.org/wp-content/uploads/2026/07/Fred-Finn-the-Worlds-Most-Traveled-Man-to-Receive-Prestigious-Award-220x150.jpg',
    views: 3,
    link: '#'
  },
  {
    id: 3,
    title: 'Dusit Thani College Takes International Program Students on Culinary Study Tour',
    excerpt: 'Bangkok, Thailand, July 17, 2026 / TRAVELINDEX / Recently, Dusit Thani College...',
    date: 'July 17, 2026',
    image: 'https://www.visittanzania.org/wp-content/uploads/2026/07/SG-FT-2-220x150.jpg',
    views: 3,
    link: '#'
  },
  {
    id: 4,
    title: "Europe's Largest Hostel Chain Publishes Annual Sustainability Report",
    excerpt: 'Berlin, Germany, July 16, 2026 / TRAVELINDEX / a&o Hostels has released...',
    date: 'July 16, 2026',
    image: 'https://www.visittanzania.org/wp-content/uploads/2026/07/Sustainability-220x150.jpg',
    views: 4,
    link: '#'
  }
];

export const socialLinks: SocialLink[] = [
  { name: 'Facebook', url: 'https://facebook.com/travelindex/', icon: 'facebook' },
  { name: 'Twitter', url: 'https://twitter.com/travelindex/', icon: 'twitter' },
  { name: 'Pinterest', url: 'https://pinterest.com/travelindex/', icon: 'pinterest' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/company/travelindex-network/', icon: 'linkedin' },
  { name: 'YouTube', url: 'https://youtube.com/bestdestination', icon: 'youtube' },
  { name: 'Instagram', url: 'https://instagram.com/travelindex', icon: 'instagram' }
];

export const footerLinks: FooterLink[] = [
  { label: 'Contact Us', url: '#' },
  { label: 'About Us', url: '#' },
  { label: 'Terms of Service', url: '#' },
  { label: 'Privacy Statement', url: '#' },
  { label: 'Newsletter', url: '#' },
  { label: 'Advertise with Us', url: '#' },
  { label: 'Help/FAQ', url: '#' },
  { label: 'Site Map', url: '#' }
];