import { HotelType } from '../types';

export const hotels: HotelType[] = [
  // Taj Mahal Hotels
  {
    id: 'hotel_001',
    name: 'Agra Budget Inn',
    destinationId: 'dest_001',
    pricePerPerson: 500,
    rating: 3.5,
    type: 'budget',
    amenities: ['Free WiFi', 'Air conditioning', 'TV', '24-hour front desk'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    location: {
      coordinates: { lat: 27.1767, lng: 78.0081 },
      address: 'Taj East Gate Road, Agra, Uttar Pradesh 282001',
      distanceFromCenter: 1.2,
      proximityScore: 8,
      nearbyAttractions: [
        { name: 'Taj Mahal', distance: 0.8 },
        { name: 'Agra Fort', distance: 2.5 },
        { name: 'Mehtab Bagh', distance: 3.1 }
      ]
    },
    checkInTime: '14:00',
    checkOutTime: '11:00',
    contact: '+91 9876543210'
  },
  {
    id: 'hotel_002',
    name: 'Taj Gateway Hotel',
    destinationId: 'dest_001',
    pricePerPerson: 1000,
    rating: 4.2,
    type: 'standard',
    amenities: [
      'Free WiFi', 
      'Swimming pool',
      'Restaurant',
      'Room service',
      'Air conditioning',
      'Fitness center'
    ],
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
    location: {
      coordinates: { lat: 27.1723, lng: 78.0156 },
      address: 'Fatehabad Road, Agra, Uttar Pradesh 282001',
      distanceFromCenter: 1.5,
      proximityScore: 7,
      nearbyAttractions: [
        { name: 'Taj Mahal', distance: 1.0 },
        { name: 'Agra Fort', distance: 2.8 },
        { name: 'Itmad-ud-Daulah', distance: 4.2 }
      ]
    },
    checkInTime: '12:00',
    checkOutTime: '10:00',
    contact: '+91 9876543211'
  },
  {
    id: 'hotel_003',
    name: 'Oberoi Amarvilas',
    destinationId: 'dest_001',
    pricePerPerson: 2500,
    rating: 4.9,
    type: 'luxury',
    amenities: [
      'Free WiFi',
      'Swimming pool',
      'Spa',
      'Multiple restaurants',
      '24/7 room service',
      'Gym',
      'View of Taj Mahal',
      'Concierge service',
      'Luxury toiletries'
    ],
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
    location: {
      coordinates: { lat: 27.1749, lng: 78.0078 },
      address: 'Taj East Gate Road, Agra, Uttar Pradesh 282001',
      distanceFromCenter: 0.9,
      proximityScore: 9,
      nearbyAttractions: [
        { name: 'Taj Mahal', distance: 0.5 },
        { name: 'Agra Fort', distance: 2.3 },
        { name: 'Mehtab Bagh', distance: 2.8 }
      ]
    },
    checkInTime: '14:00',
    checkOutTime: '12:00',
    contact: '+91 9876543212'
  },

  // Jaipur City Palace Hotels
  {
    id: 'hotel_004',
    name: 'Jaipur Stay Inn',
    destinationId: 'dest_002',
    pricePerPerson: 450,
    rating: 3.4,
    type: 'budget',
    amenities: ['Free WiFi', 'Air conditioning', 'TV', 'Laundry service'],
    image: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be',
    location: {
      coordinates: { lat: 26.9239, lng: 75.8267 },
      address: 'MI Road, Jaipur, Rajasthan 302001',
      distanceFromCenter: 2.1,
      proximityScore: 6,
      nearbyAttractions: [
        { name: 'City Palace', distance: 2.5 },
        { name: 'Hawa Mahal', distance: 1.8 },
        { name: 'Jantar Mantar', distance: 2.3 }
      ]
    },
    checkInTime: '13:00',
    checkOutTime: '11:00',
    contact: '+91 9876543213'
  },
  {
    id: 'hotel_005',
    name: 'Royal Heritage Inn',
    destinationId: 'dest_002',
    pricePerPerson: 1100,
    rating: 4.1,
    type: 'standard',
    amenities: [
      'Free WiFi',
      'Swimming pool',
      'Restaurant',
      'Room service',
      'Air conditioning',
      'Travel desk'
    ],
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
    location: {
      coordinates: { lat: 26.9215, lng: 75.8211 },
      address: 'Sansar Chandra Road, Jaipur, Rajasthan 302001',
      distanceFromCenter: 1.8,
      proximityScore: 7,
      nearbyAttractions: [
        { name: 'City Palace', distance: 2.1 },
        { name: 'Hawa Mahal', distance: 1.5 },
        { name: 'Albert Hall Museum', distance: 3.2 }
      ]
    },
    checkInTime: '12:00',
    checkOutTime: '10:00',
    contact: '+91 9876543214'
  },
  {
    id: 'hotel_006',
    name: 'Taj Rambagh Palace',
    destinationId: 'dest_002',
    pricePerPerson: 2200,
    rating: 4.8,
    type: 'luxury',
    amenities: [
      'Free WiFi',
      'Swimming pool',
      'Spa',
      'Multiple restaurants',
      '24/7 room service',
      'Gym',
      'Heritage property',
      'Butler service',
      'Luxury toiletries'
    ],
    image: 'https://images.unsplash.com/photo-1549638441-b787d2e11f14',
    location: {
      coordinates: { lat: 26.8994, lng: 75.8062 },
      address: 'Bhawani Singh Road, Jaipur, Rajasthan 302005',
      distanceFromCenter: 3.5,
      proximityScore: 5,
      nearbyAttractions: [
        { name: 'City Palace', distance: 4.0 },
        { name: 'Hawa Mahal', distance: 3.8 },
        { name: 'Galta Ji Temple', distance: 2.1 }
      ]
    },
    checkInTime: '14:00',
    checkOutTime: '12:00',
    contact: '+91 9876543215'
  },

  // Goa Beaches Hotels
  {
    id: 'hotel_007',
    name: 'Beachside Huts',
    destinationId: 'dest_003',
    pricePerPerson: 600,
    rating: 3.7,
    type: 'budget',
    amenities: ['Beach access', 'Free WiFi', 'Fan', 'Restaurant'],
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6',
    location: {
      coordinates: { lat: 15.2993, lng: 73.9080 },
      address: 'Calangute Beach Road, Goa 403516',
      distanceFromCenter: 0.2,
      proximityScore: 9,
      nearbyAttractions: [
        { name: 'Calangute Beach', distance: 0.1 },
        { name: 'Baga Beach', distance: 1.5 },
        { name: 'Anjuna Flea Market', distance: 4.2 }
      ]
    },
    checkInTime: '12:00',
    checkOutTime: '10:00',
    contact: '+91 9876543216'
  },
  {
    id: 'hotel_008',
    name: 'Sunset Beach Resort',
    destinationId: 'dest_003',
    pricePerPerson: 1500,
    rating: 4.3,
    type: 'standard',
    amenities: [
      'Beach access',
      'Swimming pool',
      'Restaurant',
      'Free WiFi',
      'Air conditioning',
      'Spa'
    ],
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd',
    location: {
      coordinates: { lat: 15.3012, lng: 73.9124 },
      address: 'Baga Beach Road, Goa 403516',
      distanceFromCenter: 1.3,
      proximityScore: 8,
      nearbyAttractions: [
        { name: 'Baga Beach', distance: 0.8 },
        { name: 'Calangute Beach', distance: 1.5 },
        { name: 'Chapora Fort', distance: 3.7 }
      ]
    },
    checkInTime: '14:00',
    checkOutTime: '11:00',
    contact: '+91 9876543217'
  },
  {
    id: 'hotel_009',
    name: 'Taj Exotica Goa',
    destinationId: 'dest_003',
    pricePerPerson: 3000,
    rating: 4.9,
    type: 'luxury',
    amenities: [
      'Private beach',
      'Swimming pool',
      'Spa',
      'Multiple restaurants',
      '24/7 room service',
      'Gym',
      'Water sports',
      'Kids club',
      'Luxury toiletries'
    ],
    image: 'https://images.unsplash.com/photo-1602002418082-dd4a8c5b0d77',
    location: {
      coordinates: { lat: 15.2854, lng: 73.9231 },
      address: 'Benaulim Beach, Goa 403716',
      distanceFromCenter: 5.2,
      proximityScore: 4,
      nearbyAttractions: [
        { name: 'Colva Beach', distance: 3.8 },
        { name: 'Margao City', distance: 6.5 },
        { name: 'Dudhsagar Falls', distance: 42.0 }
      ]
    },
    checkInTime: '15:00',
    checkOutTime: '12:00',
    contact: '+91 9876543218'
  },

  // Varanasi Ghats Hotels
  {
    id: 'hotel_010',
    name: 'Ganga View Guesthouse',
    destinationId: 'dest_004',
    pricePerPerson: 400,
    rating: 3.6,
    type: 'budget',
    amenities: ['Ganga view', 'Free WiFi', 'Air conditioning', 'Terrace'],
    image: 'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6',
    location: {
      coordinates: { lat: 25.3176, lng: 83.0039 },
      address: 'Dashashwamedh Ghat Road, Varanasi, Uttar Pradesh 221001',
      distanceFromCenter: 0.3,
      proximityScore: 9,
      nearbyAttractions: [
        { name: 'Dashashwamedh Ghat', distance: 0.1 },
        { name: 'Kashi Vishwanath Temple', distance: 0.5 },
        { name: 'Manikarnika Ghat', distance: 0.7 }
      ]
    },
    checkInTime: '12:00',
    checkOutTime: '10:00',
    contact: '+91 9876543219'
  },
  {
    id: 'hotel_011',
    name: 'BrijRama Palace',
    destinationId: 'dest_004',
    pricePerPerson: 1200,
    rating: 4.4,
    type: 'standard',
    amenities: [
      'Ganga view',
      'Restaurant',
      'Free WiFi',
      'Air conditioning',
      'Heritage property',
      'Yoga classes'
    ],
    image: 'https://images.unsplash.com/photo-1578898887932-dce23a595ad4',
    location: {
      coordinates: { lat: 25.3162, lng: 83.0053 },
      address: 'Darbhanga Ghat, Varanasi, Uttar Pradesh 221001',
      distanceFromCenter: 0.4,
      proximityScore: 8,
      nearbyAttractions: [
        { name: 'Dashashwamedh Ghat', distance: 0.3 },
        { name: 'Manikarnika Ghat', distance: 0.5 },
        { name: 'Assi Ghat', distance: 1.2 }
      ]
    },
    checkInTime: '14:00',
    checkOutTime: '11:00',
    contact: '+91 9876543220'
  },
  {
    id: 'hotel_012',
    name: 'Taj Nadesar Palace',
    destinationId: 'dest_004',
    pricePerPerson: 2000,
    rating: 4.7,
    type: 'luxury',
    amenities: [
      'Swimming pool',
      'Spa',
      'Restaurant',
      '24/7 room service',
      'Gym',
      'Horse carriage ride',
      'Heritage property',
      'Butler service'
    ],
    image: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d',
    location: {
      coordinates: { lat: 25.3201, lng: 82.9873 },
      address: 'Nadesar Palace Grounds, Varanasi, Uttar Pradesh 221002',
      distanceFromCenter: 1.8,
      proximityScore: 7,
      nearbyAttractions: [
        { name: 'Kashi Vishwanath Temple', distance: 2.1 },
        { name: 'Sarnath', distance: 8.5 },
        { name: 'Banaras Hindu University', distance: 3.2 }
      ]
    },
    checkInTime: '15:00',
    checkOutTime: '12:00',
    contact: '+91 9876543221'
  },

  // Darjeeling Hills Hotels
  {
    id: 'hotel_013',
    name: 'Mountain View Lodge',
    destinationId: 'dest_005',
    pricePerPerson: 550,
    rating: 3.5,
    type: 'budget',
    amenities: ['Mountain view', 'Free WiFi', 'Tea service', 'Garden'],
    image: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864',
    location: {
      coordinates: { lat: 27.0419, lng: 88.2633 },
      address: 'Gandhi Road, Darjeeling, West Bengal 734101',
      distanceFromCenter: 0.5,
      proximityScore: 8,
      nearbyAttractions: [
        { name: 'Darjeeling Mall', distance: 0.3 },
        { name: 'Tiger Hill', distance: 5.2 },
        { name: 'Batasia Loop', distance: 2.1 }
      ]
    },
    checkInTime: '13:00',
    checkOutTime: '10:00',
    contact: '+91 9876543222'
  },
  {
    id: 'hotel_014',
    name: 'Darjeeling Heights Resort',
    destinationId: 'dest_005',
    pricePerPerson: 1300,
    rating: 4.2,
    type: 'standard',
    amenities: [
      'Mountain view',
      'Restaurant',
      'Free WiFi',
      'Room service',
      'Fireplace',
      'Tea lounge'
    ],
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
    location: {
      coordinates: { lat: 27.0382, lng: 88.2601 },
      address: 'Observatory Hill, Darjeeling, West Bengal 734101',
      distanceFromCenter: 0.8,
      proximityScore: 7,
      nearbyAttractions: [
        { name: 'Darjeeling Mall', distance: 0.6 },
        { name: 'Himalayan Mountaineering Institute', distance: 1.2 },
        { name: 'Padmaja Naidu Himalayan Zoo', distance: 1.3 }
      ]
    },
    checkInTime: '12:00',
    checkOutTime: '10:00',
    contact: '+91 9876543223'
  },
  {
    id: 'hotel_015',
    name: 'Glenburn Tea Estate',
    destinationId: 'dest_005',
    pricePerPerson: 2400,
    rating: 4.8,
    type: 'luxury',
    amenities: [
      'Tea estate',
      'Panoramic views',
      'Gourmet dining',
      'Tea tasting',
      'Guided walks',
      'Vintage decor',
      'Butler service',
      'Spa'
    ],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    location: {
      coordinates: { lat: 27.0521, lng: 88.2418 },
      address: 'Glenburn Tea Estate, Darjeeling, West Bengal 734101',
      distanceFromCenter: 3.2,
      proximityScore: 6,
      nearbyAttractions: [
        { name: 'Tiger Hill', distance: 8.1 },
        { name: 'Happy Valley Tea Estate', distance: 2.5 },
        { name: 'Japanese Peace Pagoda', distance: 4.3 }
      ]
    },
    checkInTime: '14:00',
    checkOutTime: '11:00',
    contact: '+91 9876543224'
  }
];
