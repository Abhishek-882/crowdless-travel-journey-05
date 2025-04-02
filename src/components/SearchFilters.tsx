
import React, { useState } from 'react';
import { Filter, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CrowdLevel } from '../types';
import { Slider } from '@/components/ui/slider';
import { useDestinations } from '../context/DestinationContext';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { formatPrice } from '../utils/helpers';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const indiaStates = [
  'All States',
  'Andaman & Nicobar',
  'Andhra Pradesh',
  'Assam',
  'Delhi',
  'Goa',
  'Gujarat',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Madhya Pradesh',
  'Maharashtra',
  'Punjab',
  'Rajasthan',
  'Uttarakhand',
  'Uttar Pradesh',
  'West Bengal',
];

const SearchFilters: React.FC = () => {
  const { searchQuery, setSearchQuery, filters, setFilters, clearFilters } = useDestinations();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleStateChange = (value: string) => {
    setFilters({ state: value === 'All States' ? null : value });
  };

  const handleCrowdLevelChange = (value: string) => {
    setFilters({ crowdLevel: value === 'any' ? null : value as CrowdLevel });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
    setFilters({ minPrice: value[0], maxPrice: value[1] });
  };

  const handleClearFilters = () => {
    clearFilters();
    setPriceRange([0, 5000]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Count active filters
  const activeFilterCount = 
    (filters.crowdLevel ? 1 : 0) + 
    (filters.minPrice || filters.maxPrice ? 1 : 0) + 
    (filters.state ? 1 : 0);

  const FilterControls = () => (
    <>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Search Destinations</label>
          <div className="relative mt-1">
            <Input
              type="text"
              placeholder="Search by name, city or state..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus={false}
              className="pl-10"
            />
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Crowd Level</label>
          <Select
            value={filters.crowdLevel || 'any'}
            onValueChange={handleCrowdLevelChange}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Any crowd level" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="any">Any crowd level</SelectItem>
                <SelectItem value="low">Low crowd</SelectItem>
                <SelectItem value="medium">Moderate crowd</SelectItem>
                <SelectItem value="high">High crowd</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">State</label>
          <Select
            value={filters.state || 'All States'}
            onValueChange={handleStateChange}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {indiaStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex justify-between">
            <label className="text-sm font-medium">Price Range</label>
            <span className="text-sm text-gray-500">
              {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
            </span>
          </div>
          <Slider
            defaultValue={[0, 5000]}
            value={[priceRange[0], priceRange[1]]}
            max={5000}
            step={100}
            minStepsBetweenThumbs={1}
            onValueChange={handlePriceChange}
            className="mt-3"
          />
        </div>

        <Button 
          onClick={handleClearFilters} 
          variant="outline" 
          className="w-full mt-2"
          disabled={activeFilterCount === 0 && searchQuery === ''}
        >
          Clear All Filters
        </Button>
      </div>
    </>
  );

  return (
    <div>
      {/* Desktop filters */}
      <div className="hidden md:block">
        <FilterControls />
      </div>

      {/* Mobile filters */}
      <div className="md:hidden">
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex items-center justify-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 bg-primary text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Search & Filters</SheetTitle>
              <SheetDescription>
                Find the perfect crowd-free destination
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FilterControls />
            </div>
          </SheetContent>
        </Sheet>

        {/* Simple search for mobile */}
        <div className="mt-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus={false}
              className="pl-10"
            />
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
