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
    image: 'https://www.google.com/imgres?q=golden%20temple%20amritsar%204k%20wallpaper&imgurl=https%3A%2F%2Fmedia.istockphoto.com%2Fid%2F504746394%2Fphoto%2Fawsome-sikh-golden-temple-at-night-amritsar-india.jpg%3Fs%3D612x612%26w%3D0%26k%3D20%26c%3D2sY9VHVtd3StSvE-x3MmRLMvElJ2CBQweVD0jwZQMJc%3D&imgrefurl=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Fthe-golden-temple-at-night&docid=TTnSvioQxfNxZM&tbnid=rtWPksGcaPqJIM&vet=12ahUKEwi1nIjOy9mMAxWRUGwGHSiyPQsQM3oECBUQAA..i&w=612&h=408&hcb=2&ved=2ahUKEwi1nIjOy9mMAxWRUGwGHSiyPQsQM3oECBUQAA',
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
    image: 'data:image/jpeg;base64,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',
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
