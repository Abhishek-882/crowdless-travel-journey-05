import { Destination } from '../types';

export const destinations: Destination[] = [
  {
    id: "dest_1",
    name: "Hidden Valley",
    description: "A serene valley tucked away in the mountains...",
    city: "Mountain Village",
    state: "Himachal Pradesh",
    coordinates: {
      lat: 45.4215,
      lng: -75.6972
    },
    images: ["valley1.jpg", "valley2.jpg"],
    image: "valley1.jpg",
    price: 299,
    attractions: ["Waterfall Trail", "Mountain View Point"],
    tags: ["nature", "hiking", "peaceful"],
    rating: 4.5,
    crowdData: {
      "6:00": 20,
      "8:00": 30,
      "10:00": 50,
      "12:00": 80,
      "14:00": 70,
      "16:00": 60,
      "18:00": 40
    },
    openingHours: "6:00 AM - 6:00 PM"
  },
  {
    id: "dest_2",
    name: "Crystal Lake",
    description: "A pristine lake surrounded by ancient forests...",
    city: "Lakeside Town",
    state: "Uttarakhand",
    coordinates: {
      lat: 34.0522,
      lng: -118.2437
    },
    images: ["lake1.jpg", "lake2.jpg"],
    price: 349,
    attractions: ["Boat Tours", "Lakeside Camping"],
    tags: ["lake", "camping", "fishing"],
    rating: 4.7,
    crowdData: {
      "6:00": 10,
      "8:00": 20,
      "10:00": 60,
      "12:00": 90,
      "14:00": 85,
      "16:00": 70,
      "18:00": 50
    }
  },
  {
    id: "dest_3",
    name: "Sunset Desert",
    description: "Experience the magic of the desert at sunset...",
    city: "Dune City",
    state: "Rajasthan",
    coordinates: {
      lat: 33.7294,
      lng: -116.3631
    },
    images: ["desert1.jpg", "desert2.jpg"],
    price: 499,
    attractions: ["Camel Rides", "Stargazing"],
    tags: ["desert", "adventure", "stargazing"],
    rating: 4.8,
    crowdData: {
      "6:00": 30,
      "8:00": 50,
      "10:00": 70,
      "12:00": 60,
      "14:00": 40,
      "16:00": 80,
      "18:00": 90
    }
  },
  {
    id: "dest_4",
    name: "Enchanted Forest",
    description: "A mystical forest filled with rare flora and fauna...",
    city: "Woodland",
    state: "Kerala",
    coordinates: {
      lat: 47.7511,
      lng: -120.7401
    },
    images: ["forest1.jpg", "forest2.jpg"],
    price: 399,
    attractions: ["Mushroom Picking", "Bird Watching"],
    tags: ["forest", "nature", "wildlife"],
    rating: 4.6,
    crowdData: {
      "6:00": 15,
      "8:00": 35,
      "10:00": 55,
      "12:00": 75,
      "14:00": 65,
      "16:00": 55,
      "18:00": 35
    }
  },
  {
    id: "dest_5",
    name: "Azure Coast",
    description: "Breathtaking coastal views and crystal-clear waters...",
    city: "Seaside",
    state: "Goa",
    coordinates: {
      lat: 35.6895,
      lng: 139.6917
    },
    images: ["coast1.jpg", "coast2.jpg"],
    price: 549,
    attractions: ["Snorkeling", "Beach Relaxation"],
    tags: ["beach", "ocean", "relaxation"],
    rating: 4.9,
    crowdData: {
      "6:00": 25,
      "8:00": 45,
      "10:00": 85,
      "12:00": 95,
      "14:00": 90,
      "16:00": 75,
      "18:00": 60
    }
  },
  {
    id: "dest_6",
    name: "Snowy Peaks",
    description: "Majestic snow-capped mountains perfect for skiing...",
    city: "Alpine City",
    state: "Jammu Kashmir",
    coordinates: {
      lat: 64.8151,
      lng: -147.7164
    },
    images: ["mountain1.jpg", "mountain2.jpg"],
    price: 699,
    attractions: ["Skiing", "Snowboarding"],
    tags: ["mountains", "skiing", "snow"],
    rating: 4.7,
    crowdData: {
      "6:00": 40,
      "8:00": 60,
      "10:00": 90,
      "12:00": 100,
      "14:00": 95,
      "16:00": 85,
      "18:00": 70
    }
  },
  {
    id: "dest_7",
    name: "Tropical Paradise",
    description: "Exotic island with white sandy beaches and lush greenery...",
    city: "Palm Beach",
    state: "Andaman",
    coordinates: {
      lat: -17.5000,
      lng: -149.5667
    },
    images: ["island1.jpg", "island2.jpg"],
    price: 799,
    attractions: ["Scuba Diving", "Island Hopping"],
    tags: ["island", "tropical", "diving"],
    rating: 4.9,
    crowdData: {
      "6:00": 20,
      "8:00": 40,
      "10:00": 70,
      "12:00": 85,
      "14:00": 80,
      "16:00": 65,
      "18:00": 50
    }
  },
  {
    id: "dest_8",
    name: "Ancient Ruins",
    description: "Explore the remnants of a lost civilization...",
    city: "Historical City",
    state: "Madhya Pradesh",
    coordinates: {
      lat: 27.986065,
      lng: 86.922623
    },
    images: ["ruins1.jpg", "ruins2.jpg"],
    price: 449,
    attractions: ["Historical Tours", "Archaeological Sites"],
    tags: ["history", "culture", "ancient"],
    rating: 4.6,
    crowdData: {
      "6:00": 30,
      "8:00": 50,
      "10:00": 80,
      "12:00": 90,
      "14:00": 85,
      "16:00": 65,
      "18:00": 45
    }
  },
  {
    id: "dest_9",
    name: "Vibrant City",
    description: "Experience the hustle and bustle of a modern metropolis...",
    city: "Mumbai",
    state: "Maharashtra",
    coordinates: {
      lat: 40.7128,
      lng: -74.0060
    },
    images: ["city1.jpg", "city2.jpg"],
    price: 599,
    attractions: ["Museums", "Shopping"],
    tags: ["city", "urban", "shopping"],
    rating: 4.5,
    crowdData: {
      "6:00": 50,
      "8:00": 70,
      "10:00": 80,
      "12:00": 85,
      "14:00": 90,
      "16:00": 95,
      "18:00": 85
    }
  },
  {
    id: "dest_10",
    name: "Rolling Hills",
    description: "Picturesque countryside with vineyards and farms...",
    city: "Wine Valley",
    state: "Himachal Pradesh",
    coordinates: {
      lat: 45.7597,
      lng: 4.8422
    },
    images: ["countryside1.jpg", "countryside2.jpg"],
    price: 349,
    attractions: ["Wine Tasting", "Farm Tours"],
    tags: ["countryside", "wine", "farming"],
    rating: 4.4,
    crowdData: {
      "6:00": 15,
      "8:00": 25,
      "10:00": 40,
      "12:00": 65,
      "14:00": 60,
      "16:00": 45,
      "18:00": 30
    }
  }
];

export type DestinationType = typeof destinations[number];
export type DestinationId = DestinationType["id"];
