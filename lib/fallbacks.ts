export interface FallbackCategory {
  id: number;
  name: string;
  createdAt: Date;
}

export interface FallbackLocation {
  id: number;
  name: string;
  createdAt: Date;
}

export const FALLBACK_CATEGORIES: FallbackCategory[] = [
  { id: -99, name: "All Categories", createdAt: new Date() },
  { id: 1, name: "Sorkar Hna (Government Job)", createdAt: new Date() },
  { id: 2, name: "Private Sector", createdAt: new Date() },
  { id: 3, name: "Office Assistant / Clerk", createdAt: new Date() },
  { id: 4, name: "Driver / Delivery", createdAt: new Date() },
  { id: 5, name: "Hotel / Restaurant", createdAt: new Date() },
  { id: 6, name: "Retail / Shop Assistant", createdAt: new Date() },
  { id: 7, name: "Security Guard", createdAt: new Date() },
  { id: 8, name: "Teaching / Education", createdAt: new Date() },
  { id: 9, name: "Healthcare / Nurse", createdAt: new Date() },
  { id: 10, name: "Domestic Help / Maid", createdAt: new Date() },
];

export const FALLBACK_DISTRICTS: FallbackLocation[] = [
  { id: 1, name: "Aizawl", createdAt: new Date() },
  { id: 2, name: "Lunglei", createdAt: new Date() },
  { id: 3, name: "Siaha", createdAt: new Date() },
  { id: 4, name: "Champhai", createdAt: new Date() },
  { id: 5, name: "Kolasib", createdAt: new Date() },
  { id: 6, name: "Serchhip", createdAt: new Date() },
  { id: 7, name: "Lawngtlai", createdAt: new Date() },
  { id: 8, name: "Mamit", createdAt: new Date() },
  { id: 9, name: "Saitual", createdAt: new Date() },
  { id: 10, name: "Khawzawl", createdAt: new Date() },
  { id: 11, name: "Hnahthial", createdAt: new Date() },
];
