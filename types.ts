
export type Role = 'admin' | 'user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  role: Role;
}

export interface Client {
  id: string;
  uniqueId: string; // The official unique ID Number requested
  name: string;
  email: string;
  address?: string; // Optional physical address
  fuelCardNumbers: string[];
  marginPerLiter: number; // The margin to add to the cost
}

export interface FuelTransaction {
  id: string;
  clientId: string;
  fuelCardNumber: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  fuelType: string;
  stationName: string;
  stationAddress: string;
  liters: number;
  costPerLiter: number;
  showCostToClient: boolean;
}

export type ViewType = 'dashboard' | 'clients' | 'transactions' | 'users';
