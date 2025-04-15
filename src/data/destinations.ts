import { Destination } from '../types';

// Helper function to generate random crowd data
const generateCrowdData = () => {
  const times = ['00:00', '04:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  const crowdData: { [key: string]: number } = {};
  
  times.forEach(time => {
    let crowdLevel;
    const hour = parseInt(time.split(':')[0]);
    
    // Simulate realistic crowd patterns
    if (hour >= 10 && hour <= 16) {
      // Peak hours - higher crowds
      crowdLevel = Math.floor(Math.random() * 40) + 50; // 50-90%
    } else if ((hour >= 8 && hour < 10) || (hour > 16 && hour <= 20)) {
      // Moderate hours
      crowdLevel = Math.floor(Math.random() * 30) + 35; // 35-65%
    } else {
      // Off hours - lower crowds
      crowdLevel = Math.floor(Math.random() * 30) + 5; // 5-35%
    }
    
    crowdData[time] = crowdLevel;
  });
  
  return crowdData;
};

// Helper function for consistent pricing structure
const createPrice = (
  adult: number, 
  child: number = Math.floor(adult * 0.6), 
  foreigner: number = adult * 4,
  includes: string[] = []
) => ({
  adult,
  child,
  foreigner,
  includes
});

export const indiaDestinations: Destination[] = [
  {
    id: 'dest_001',
    name: 'Taj Mahal',
    city: 'Agra',
    state: 'Uttar Pradesh',
    description: 'One of the seven wonders of the world, this ivory-white marble mausoleum is a symbol of eternal love built by Emperor Shah Jahan in memory of his wife Mumtaz Mahal.',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop',
    crowdData: {
      '00:00': 5,
      '04:00': 10,
      '08:00': 65,
      '10:00': 90,
      '12:00': 95,
      '14:00': 85,
      '16:00': 70,
      '18:00': 50,
      '20:00': 20,
      '22:00': 10
    },
    price: createPrice(1100, 600, 2000, ['Main mausoleum', 'Gardens', 'Mosque']),
    rating: 4.8,
    coordinates: {
      lat: 27.1751,
      lng: 78.0421
    },
    bestTimeToVisit: 'Early Morning',
    tags: ['UNESCO', 'Historical', 'Architecture']
  },
  {
    id: 'dest_002',
    name: 'Jaipur City Palace',
    city: 'Jaipur',
    state: 'Rajasthan',
    description: 'A magnificent blend of Rajasthani and Mughal architecture, the City Palace is a historic royal residence that houses museums with an impressive collection of artifacts.',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop',
    crowdData: {
      '00:00': 0,
      '04:00': 5,
      '08:00': 30,
      '10:00': 75,
      '12:00': 80,
      '14:00': 85,
      '16:00': 60,
      '18:00': 40,
      '20:00': 15,
      '22:00': 5
    },
    price: createPrice(700, 400, 1500, ['Palace complex', 'Museum', 'Audio guide']),
    rating: 4.5,
    coordinates: {
      lat: 26.9258,
      lng: 75.8237
    },
    bestTimeToVisit: 'Morning',
    tags: ['Historical', 'Museum', 'Architecture']
  },
  {
    id: 'dest_003',
    name: 'Goa Beaches',
    city: 'Panaji',
    state: 'Goa',
    description: 'Famous for its pristine beaches, Goa offers a perfect blend of Indian and Portuguese cultures with its white sandy shores, vibrant nightlife, and delicious seafood.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop',
    crowdData: {
      '00:00': 30,
      '04:00': 5,
      '08:00': 25,
      '10:00': 50,
      '12:00': 70,
      '14:00': 75,
      '16:00': 80,
      '18:00': 60,
      '20:00': 65,
      '22:00': 50
    },
    price: createPrice(200, 100, 800, ['Beach access']),
    rating: 4.7,
    coordinates: {
      lat: 15.2993,
      lng: 74.1240
    },
    bestTimeToVisit: 'Early Morning',
    tags: ['Beach', 'Nightlife', 'Water Sports']
  },
  {
    id: 'dest_004',
    name: 'Varanasi Ghats',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    description: 'One of the oldest continuously inhabited cities in the world, Varanasi\'s ghats along the holy Ganges River offer a spiritual experience with daily rituals and ceremonies.',
    image: 'https://t4.ftcdn.net/jpg/04/08/25/05/360_F_408250543_MVaEVGeWxb4FiFy7mEGKj8nfYkwoAZON.jpg',
    crowdData: {
      '00:00': 15,
      '04:00': 60,
      '08:00': 40,
      '10:00': 35,
      '12:00': 30,
      '14:00': 25,
      '16:00': 35,
      '18:00': 85,
      '20:00': 90,
      '22:00': 50
    },
    price: createPrice(0, 0, 0, ['Ghat access', 'Evening aarti']),
    rating: 4.6,
    coordinates: {
      lat: 25.3176,
      lng: 83.0100
    },
    bestTimeToVisit: 'Early Morning',
    tags: ['Spiritual', 'Cultural', 'River']
  },
  {
    id: 'dest_005',
    name: 'Darjeeling Hills',
    city: 'Darjeeling',
    state: 'West Bengal',
    description: 'Known for its tea plantations and the panoramic views of the Himalayas, Darjeeling is a charming hill station with the iconic Darjeeling Himalayan Railway.',
    image: 'https://i.ytimg.com/vi/PDNZW8ZQuos/maxresdefault.jpg',
    crowdData: {
      '00:00': 5,
      '04:00': 15,
      '08:00': 40,
      '10:00': 65,
      '12:00': 75,
      '14:00': 70,
      '16:00': 60,
      '18:00': 45,
      '20:00': 30,
      '22:00': 15
    },
    price: createPrice(300, 150, 1200, ['Tea garden tours', 'Toy train ride']),
    rating: 4.5,
    coordinates: {
      lat: 27.0360,
      lng: 88.2627
    },
    bestTimeToVisit: 'Early Morning',
    tags: ['Hill Station', 'Tea', 'Scenic']
  },
  {
    id: 'dest_006',
    name: 'Kerala Backwaters',
    city: 'Alleppey',
    state: 'Kerala',
    description: 'A network of lagoons, lakes, and canals parallel to the Arabian Sea coast, the Kerala backwaters offer a serene experience on traditional houseboats.',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop',
    crowdData: {
      '00:00': 10,
      '04:00': 15,
      '08:00': 35,
      '10:00': 60,
      '12:00': 70,
      '14:00': 65,
      '16:00': 75,
      '18:00': 50,
      '20:00': 30,
      '22:00': 20
    },
    price: createPrice(1200, 600, 4800, ['Houseboat cruise', 'Meals']),
    rating: 4.9,
    coordinates: {
      lat: 9.4981,
      lng: 76.3388
    },
    bestTimeToVisit: 'Morning',
    tags: ['Backwaters', 'Houseboat', 'Nature']
  },
  {
    id: 'dest_007',
    name: 'Mysore Palace',
    city: 'Mysore',
    state: 'Karnataka',
    description: 'A historical palace that showcases Indo-Saracenic architecture, the Mysore Palace is known for its intricate ceilings, sculpted pillars, and the spectacular light show.',
    image: 'https://images.unsplash.com/photo-1600112356915-089abb8fc71a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bXlzb3JlJTIwcGFsYWNlfGVufDB8fDB8fHww',
    crowdData: {
      '00:00': 0,
      '04:00': 0,
      '08:00': 35,
      '10:00': 70,
      '12:00': 85,
      '14:00': 80,
      '16:00': 75,
      '18:00': 90,
      '20:00': 95,
      '22:00': 40
    },
    price: createPrice(200, 100, 800, ['Palace tour', 'Light show']),
    rating: 4.7,
    coordinates: {
      lat: 12.3052,
      lng: 76.6552
    },
    bestTimeToVisit: 'Morning',
    tags: ['Palace', 'Historical', 'Architecture']
  },
  {
    id: 'dest_008',
    name: 'Amritsar Golden Temple',
    city: 'Amritsar',
    state: 'Punjab',
    description: 'The holiest shrine of Sikhism, the Golden Temple is a spiritual sanctuary that welcomes people of all faiths and offers free meals to thousands of visitors daily.',
    image: 'https://images.unsplash.com/photo-1514222134-b57cbb8617da?w=800&auto=format&fit=crop',
    crowdData: {
      '00:00': 40,
      '04:00': 30,
      '08:00': 60,
      '10:00': 80,
      '12:00': 85,
      '14:00': 75,
      '16:00': 70,
      '18:00': 80,
      '20:00': 90,
      '22:00': 65
    },
    price: createPrice(0, 0, 0, ['Temple visit', 'Community kitchen']),
    rating: 4.9,
    coordinates: {
      lat: 31.6200,
      lng: 74.8765
    },
    bestTimeToVisit: 'Early Morning',
    tags: ['Temple', 'Spiritual', 'Free']
  },
  {
    id: 'dest_009',
    name: 'Rann of Kutch',
    city: 'Kutch',
    state: 'Gujarat',
    description: 'One of the largest salt deserts in the world, the Rann of Kutch transforms into a surreal landscape during the Rann Utsav festival with its white salt marsh.',
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&auto=format&fit=crop',
    crowdData: {
      '00:00': 5,
      '04:00': 10,
      '08:00': 20,
      '10:00': 30,
      '12:00': 15,
      '14:00': 10,
      '16:00': 25,
      '18:00': 60,
      '20:00': 40,
      '22:00': 15
    },
    price: createPrice(500, 250, 2000, ['Salt desert access', 'Cultural shows']),
    rating: 4.5,
    coordinates: {
      lat: 23.7337,
      lng: 69.8597
    },
    bestTimeToVisit: 'Evening',
    tags: ['Desert', 'Cultural', 'Festival']
  },
  {
    id: 'dest_010',
    name: 'Ladakh Lakes',
    city: 'Leh',
    state: 'Ladakh',
    description: 'Known for its high-altitude lakes like Pangong and Tso Moriri, Ladakh offers breathtaking landscapes with crystal clear blue waters set against rugged mountains.',
    image: 'https://images.unsplash.com/photo-1626015365107-9ebc07b8f276?w=800&auto=format&fit=crop',
    crowdData: {
      '00:00': 5,
      '04:00': 10,
      '08:00': 30,
      '10:00': 60,
      '12:00': 65,
      '14:00': 60,
      '16:00': 55,
      '18:00': 40,
      '20:00': 20,
      '22:00': 10
    },
    price: createPrice(300, 150, 1200, ['Lake access', 'Permit fees']),
    rating: 4.8,
    coordinates: {
      lat: 34.1526,
      lng: 77.5771
    },
    bestTimeToVisit: 'Morning',
    tags: ['Lakes', 'Mountains', 'Adventure']
  },
  {
    id: 'dest_011',
    name: 'Khajuraho Temples',
    city: 'Khajuraho',
    state: 'Madhya Pradesh',
    description: 'Famous for their nagara-style architectural symbolism and erotic sculptures, these Hindu and Jain temples are a UNESCO World Heritage site.',
    image: 'https://images.unsplash.com/photo-1600100399290-14c6048bd5a6?w=800&auto=format&fit=crop',
    crowdData: generateCrowdData(),
    price: createPrice(500, 250, 2000, ['Temple complex', 'Audio guide']),
    rating: 4.6,
    coordinates: {
      lat: 24.8318,
      lng: 79.9199
    },
    bestTimeToVisit: 'Morning',
    tags: ['UNESCO', 'Temple', 'Historical']
  },
  {
    id: 'dest_012',
    name: 'Sundarbans National Park',
    city: 'South 24 Parganas',
    state: 'West Bengal',
    description: 'Home to the Royal Bengal Tiger, the Sundarbans is the largest mangrove forest in the world, offering unique wildlife experiences and boat safaris.',
    image: 'https://images.unsplash.com/photo-1590177800442-6d546a88908a?w=800&auto=format&fit=crop',
    crowdData: generateCrowdData(),
    price: createPrice(1500, 750, 6000, ['Boat safari', 'Park entry']),
    rating: 4.7,
    coordinates: {
      lat: 21.9497,
      lng: 89.1833
    },
    bestTimeToVisit: 'Morning',
    tags: ['Wildlife', 'Tiger', 'Mangrove']
  },
  {
    id: 'dest_013',
    name: 'Valley of Flowers',
    city: 'Chamoli',
    state: 'Uttarakhand',
    description: 'A UNESCO World Heritage Site, this high-altitude valley is known for its meadows of endemic alpine flowers and rich biodiversity.',
    image: 'https://images.unsplash.com/photo-1580977251946-c5cf22d0f42f?w=800&auto=format&fit=crop',
    crowdData: generateCrowdData(),
    price: createPrice(600, 300, 2400, ['Park entry', 'Trekking permit']),
    rating: 4.8,
    coordinates: {
      lat: 30.7283,
      lng: 79.6050
    },
    bestTimeToVisit: 'Morning',
    tags: ['Flowers', 'Trekking', 'Nature']
  },
  {
    id: 'dest_014',
    name: 'Hampi Ruins',
    city: 'Hampi',
    state: 'Karnataka',
    description: 'The ancient ruins of Vijayanagara Empire, Hampi is a UNESCO World Heritage Site with stunning temple complexes, monolithic structures, and boulder-strewn landscapes.',
    image: 'https://images.unsplash.com/photo-1613467143018-03fd56bee88d?w=800&auto=format&fit=crop',
    crowdData: generateCrowdData(),
    price: createPrice(500, 250, 2000, ['Ruins access', 'Archaeological sites']),
    rating: 4.7,
    coordinates: {
      lat: 15.3350,
      lng: 76.4600
    },
    bestTimeToVisit: 'Morning',
    tags: ['UNESCO', 'Ruins', 'Historical']
  },
  {
    id: 'dest_015',
    name: 'Andaman Islands',
    city: 'Port Blair',
    state: 'Andaman & Nicobar',
    description: 'Known for their pristine beaches, crystal-clear waters, and fascinating marine life, the Andaman Islands offer excellent opportunities for water sports and relaxation.',
    image: 'https://images.unsplash.com/photo-1586076585588-526649731ae6?w=800&auto=format&fit=crop',
    crowdData: generateCrowdData(),
    price: createPrice(500, 250, 2000, ['Beach access', 'Permit fees']),
    rating: 4.9,
    coordinates: {
      lat: 11.7401,
      lng: 92.6586
    },
    bestTimeToVisit: 'Morning',
    tags: ['Beach', 'Island', 'Water Sports']
  },
  {
    id: 'dest_016',
    name: 'Kaziranga National Park',
    city: 'Golaghat',
    state: 'Assam',
    description: 'A UNESCO World Heritage Site, Kaziranga is home to the largest population of one-horned rhinoceroses in the world, along with tigers, elephants, and wild water buffaloes.',
    image: 'https://images.unsplash.com/photo-1605069574908-3bec890b61d5?w=800&auto=format&fit=crop',
    crowdData: generateCrowdData(),
    price: createPrice(1200, 600, 4800, ['Jeep safari', 'Park entry']),
    rating: 4.8,
    coordinates: {
      lat: 26.5775,
      lng: 93.1700
    },
    bestTimeToVisit: 'Morning',
    tags: ['Wildlife', 'Rhino', 'UNESCO']
  },
  {
    id: 'dest_017',
    name: 'Ajanta and Ellora Caves',
    city: 'Aurangabad',
    state: 'Maharashtra',
    description: 'These ancient rock-cut cave temples showcase Buddhist, Hindu, and Jain monuments with intricate carvings and paintings dating back to the 2nd century BCE.',
    image: 'https://images.unsplash.com/photo-1590080552494-dcda542194a4?w=800&auto=format&fit=crop',
    crowdData: generateCrowdData(),
    price: createPrice(600, 300, 2400, ['Cave access', 'Audio guide']),
    rating: 4.7,
    coordinates: {
      lat: 20.5518,
      lng: 75.7448
    },
    bestTimeToVisit: 'Morning',
    tags: ['UNESCO', 'Caves', 'Historical']
  },
  {
    id: 'dest_018',
    name: 'Coorg Hill Station',
    city: 'Madikeri',
    state: 'Karnataka',
    description: 'Known as the "Scotland of India," Coorg is a misty hill station with coffee plantations, waterfalls, and lush forests offering a peaceful retreat.',
    image: 'https://images.unsplash.com/photo-1577715694662-6a778a31a978?w=800&auto=format&fit=crop',
    crowdData: generateCrowdData(),
    price: createPrice(300, 150, 1200, ['Plantation tours', 'Nature walks']),
    rating: 4.6,
    coordinates: {
      lat: 12.4244,
      lng: 75.7382
    },
    bestTimeToVisit: 'Morning',
    tags: ['Hill Station', 'Coffee', 'Nature']
  },
  {
    id: 'dest_019',
    name: 'Munnar Tea Gardens',
    city: 'Munnar',
    state: 'Kerala',
    description: 'Famous for its sprawling tea plantations, misty hills, and cool climate, Munnar offers breathtaking views of the Western Ghats and diverse flora and fauna.',
    image: 'https://images.unsplash.com/photo-1590689860171-2e105100eac1?w=800&auto=format&fit=crop',
    crowdData: generateCrowdData(),
    price: createPrice(400, 200, 1600, ['Tea estate tours', 'Museum entry']),
    rating: 4.7,
    coordinates: {
      lat: 10.0889,
      lng: 77.0595
    },
    bestTimeToVisit: 'Morning',
    tags: ['Tea', 'Plantation', 'Hill Station']
  },
  {
    id: 'dest_020',
    name: 'Qutub Minar',
    city: 'Delhi',
    state: 'Delhi',
    description: 'A UNESCO World Heritage Site, this 73-meter tall tower of victory is an example of Indo-Islamic architecture with intricate carvings and verses from the Quran.',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop',
    crowdData: generateCrowdData(),
    price: createPrice(350, 175, 1400, ['Minar access', 'Archaeological complex']),
    rating: 4.5,
    coordinates: {
      lat: 28.5245,
      lng: 77.1855
    },
    bestTimeToVisit: 'Morning',
    tags: ['UNESCO', 'Monument', 'Historical']
  }
];
