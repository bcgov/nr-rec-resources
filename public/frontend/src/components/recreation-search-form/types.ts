export interface City {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  rank?: number;
  option_type: 'city' | 'current_location';
}
