
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
    amenities: ['WiFi', 'Air conditioning', 'TV'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945'
  },
  {
    id: 'hotel_002',
    name: 'Taj Gateway Hotel',
    destinationId: 'dest_001',
    pricePerPerson: 1000,
    rating: 4.2,
    type: 'standard',
    amenities: ['WiFi', 'Swimming pool', 'Restaurant', 'Room service', 'Air conditioning'],
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'
  },
  {
    id: 'hotel_003',
    name: 'Oberoi Amarvilas',
    destinationId: 'dest_001',
    pricePerPerson: 2500,
    rating: 4.9,
    type: 'luxury',
    amenities: ['WiFi', 'Swimming pool', 'Spa', 'Restaurant', 'Room service', 'Gym', 'View of Taj Mahal'],
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d'
  },

  // Jaipur City Palace Hotels
  {
    id: 'hotel_004',
    name: 'Jaipur Stay Inn',
    destinationId: 'dest_002',
    pricePerPerson: 450,
    rating: 3.4,
    type: 'budget',
    amenities: ['WiFi', 'Air conditioning', 'TV'],
    image: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be'
  },
  {
    id: 'hotel_005',
    name: 'Royal Heritage Inn',
    destinationId: 'dest_002',
    pricePerPerson: 1100,
    rating: 4.1,
    type: 'standard',
    amenities: ['WiFi', 'Swimming pool', 'Restaurant', 'Room service', 'Air conditioning'],
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'
  },
  {
    id: 'hotel_006',
    name: 'Taj Rambagh Palace',
    destinationId: 'dest_002',
    pricePerPerson: 2200,
    rating: 4.8,
    type: 'luxury',
    amenities: ['WiFi', 'Swimming pool', 'Spa', 'Restaurant', 'Room service', 'Gym', 'Heritage property'],
    image: 'https://images.unsplash.com/photo-1549638441-b787d2e11f14'
  },

  // Goa Beaches Hotels
  {
    id: 'hotel_007',
    name: 'Beachside Huts',
    destinationId: 'dest_003',
    pricePerPerson: 600,
    rating: 3.7,
    type: 'budget',
    amenities: ['Beach access', 'WiFi', 'Fan'],
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6'
  },
  {
    id: 'hotel_008',
    name: 'Sunset Beach Resort',
    destinationId: 'dest_003',
    pricePerPerson: 1500,
    rating: 4.3,
    type: 'standard',
    amenities: ['Beach access', 'Swimming pool', 'Restaurant', 'WiFi', 'Air conditioning'],
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd'
  },
  {
    id: 'hotel_009',
    name: 'Taj Exotica Goa',
    destinationId: 'dest_003',
    pricePerPerson: 3000,
    rating: 4.9,
    type: 'luxury',
    amenities: ['Private beach', 'Swimming pool', 'Spa', 'Multiple restaurants', 'Room service', 'Gym', 'Water sports'],
    image: 'https://images.unsplash.com/photo-1602002418082-dd4a8c5b0d77'
  },

  // Varanasi Ghats Hotels
  {
    id: 'hotel_010',
    name: 'Ganga View Guesthouse',
    destinationId: 'dest_004',
    pricePerPerson: 400,
    rating: 3.6,
    type: 'budget',
    amenities: ['Ganga view', 'WiFi', 'Air conditioning'],
    image: 'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6'
  },
  {
    id: 'hotel_011',
    name: 'BrijRama Palace',
    destinationId: 'dest_004',
    pricePerPerson: 1200,
    rating: 4.4,
    type: 'standard',
    amenities: ['Ganga view', 'Restaurant', 'WiFi', 'Air conditioning', 'Heritage property'],
    image: 'https://images.unsplash.com/photo-1578898887932-dce23a595ad4'
  },
  {
    id: 'hotel_012',
    name: 'Taj Nadesar Palace',
    destinationId: 'dest_004',
    pricePerPerson: 2000,
    rating: 4.7,
    type: 'luxury',
    amenities: ['Swimming pool', 'Spa', 'Restaurant', 'Room service', 'Gym', 'Horse carriage ride', 'Heritage property'],
    image: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d'
  },

  // Darjeeling Hills Hotels
  {
    id: 'hotel_013',
    name: 'Mountain View Lodge',
    destinationId: 'dest_005',
    pricePerPerson: 550,
    rating: 3.5,
    type: 'budget',
    amenities: ['Mountain view', 'WiFi', 'Tea service'],
    image: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864'
  },
  {
    id: 'hotel_014',
    name: 'Darjeeling Heights Resort',
    destinationId: 'dest_005',
    pricePerPerson: 1300,
    rating: 4.2,
    type: 'standard',
    amenities: ['Mountain view', 'Restaurant', 'WiFi', 'Room service', 'Fireplace'],
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'
  },
  {
    id: 'hotel_015',
    name: 'Glenburn Tea Estate',
    destinationId: 'dest_005',
    pricePerPerson: 2400,
    rating: 4.8,
    type: 'luxury',
    amenities: ['Tea estate', 'Panoramic views', 'Gourmet dining', 'Tea tasting', 'Guided walks', 'Vintage decor'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945'
  }
];
