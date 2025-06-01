
export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  price: number;
  currencyCode: string;
  imageUrl: string;
  imageAlt?: string;
  available: boolean;
  tags: string[];
}

// Mock products for the shop
export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Blood Pressure Monitor',
    handle: 'blood-pressure-monitor',
    description: 'Digital blood pressure monitor with large display and memory storage. HSA/FSA eligible medical device for home health monitoring.',
    price: 89.99,
    currencyCode: 'USD',
    imageUrl: '/placeholder.svg',
    imageAlt: 'Blood Pressure Monitor',
    available: true,
    tags: ['category:Medical Devices', 'HSA', 'FSA', 'health-monitoring']
  },
  {
    id: '2',
    title: 'First Aid Kit',
    handle: 'first-aid-kit',
    description: 'Complete first aid kit with bandages, antiseptics, and emergency supplies. Perfect for home and travel use.',
    price: 24.99,
    currencyCode: 'USD',
    imageUrl: '/placeholder.svg',
    imageAlt: 'First Aid Kit',
    available: true,
    tags: ['category:First Aid', 'HSA', 'emergency-care']
  },
  {
    id: '3',
    title: 'Digital Thermometer',
    handle: 'digital-thermometer',
    description: 'Fast and accurate digital thermometer with fever indicator. Essential medical device for health monitoring.',
    price: 12.99,
    currencyCode: 'USD',
    imageUrl: '/placeholder.svg',
    imageAlt: 'Digital Thermometer',
    available: true,
    tags: ['category:Medical Devices', 'HSA', 'FSA', 'temperature']
  },
  {
    id: '4',
    title: 'Reading Glasses',
    handle: 'reading-glasses',
    description: 'Prescription reading glasses for vision correction. Available in multiple strengths and styles.',
    price: 45.00,
    currencyCode: 'USD',
    imageUrl: '/placeholder.svg',
    imageAlt: 'Reading Glasses',
    available: true,
    tags: ['category:Vision Care', 'vision', 'glasses']
  },
  {
    id: '5',
    title: 'Compression Socks',
    handle: 'compression-socks',
    description: 'Medical grade compression socks for improved circulation and leg support. Ideal for travel and daily wear.',
    price: 19.99,
    currencyCode: 'USD',
    imageUrl: '/placeholder.svg',
    imageAlt: 'Compression Socks',
    available: true,
    tags: ['category:Medical Devices', 'HSA', 'FSA', 'circulation']
  },
  {
    id: '6',
    title: 'Heating Pad',
    handle: 'heating-pad',
    description: 'Electric heating pad for pain relief and muscle relaxation. Multiple heat settings with auto shut-off.',
    price: 34.99,
    currencyCode: 'USD',
    imageUrl: '/placeholder.svg',
    imageAlt: 'Heating Pad',
    available: true,
    tags: ['category:Pain Relief', 'HSA', 'FSA', 'therapy']
  }
];

export const fetchProducts = async (): Promise<Product[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockProducts;
};
