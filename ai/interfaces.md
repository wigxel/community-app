# Interfaces - Local Community Business Connector App

These interfaces define the core data structures for the application as outlined in the `app-description.md`.

## User

### `UserProfile`

Represents a city resident or a business owner.

```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  profileImage?: string;
  interests: string[]; // e.g., ["Dining", "Fitness", "Tech"]
  preferences: {
    notificationsEnabled: boolean;
    discoveryRadius: number; // in kilometers
  };
  followedBusinesses: string[]; // Array of BusinessProfile IDs
  favoriteBusinesses: string[]; // Array of BusinessProfile IDs
  createdAt: string;
  updatedAt: string;
}
```

## Business

### `BusinessProfile`

Represents a local business entity.

```typescript
interface BusinessProfile {
  id: string;
  ownerId: string; // Reference to UserProfile ID
  name: string;
  description: string;
  category: BusinessCategory;
  services: string[];
  products: string[];
  operatingHours: {
    [key in
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday"]: {
      open: string; // e.g., "09:00"
      close: string; // e.g., "17:00"
      closed: boolean;
    };
  };
  location: {
    address: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  photos: string[]; // URLs
  specialOffers: string[]; // Array of SpecialOffer IDs
  rating: number; // 0 to 5
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

type BusinessCategory =
  | "Retail"
  | "Services"
  | "Hospitality"
  | "Health & Wellness"
  | "Food & Beverage"
  | "Entertainment"
  | "Other";
```

## Engagement

### `Review`

A user's feedback for a business.

```typescript
interface Review {
  id: string;
  userId: string;
  businessId: string;
  rating: number; // 1 to 5
  content: string;
  createdAt: string;
}
```

### `SpecialOffer`

Promotions or deals posted by businesses.

```typescript
interface SpecialOffer {
  id: string;
  businessId: string;
  title: string;
  description: string;
  discountCode?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}
```

## Content Feed

### `FeedItem`

Dynamic content for the community feed.

```typescript
interface FeedItem {
  id: string;
  businessId: string;
  type: "promotion" | "event" | "news";
  title: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
}
```
