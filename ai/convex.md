# Convex Integration Plan for Local Community Business Connector App

This document outlines the plan for setting up the database schema and business logic in Convex to support the Community Business Connector application.

## 1. Goal

To establish a scalable backend in Convex that manages user profiles, business listings, community engagement (reviews, follows), and a dynamic local content feed.

## 2. Database Schema Design

The following tables will be created in Convex.

### `users` Table

Stores information about city residents and business owners.

- `_id`: Convex ID (Primary Key)
- `tokenIdentifier`: String (from Auth provider, e.g., Clerk)
- `email`: String
- `name`: String
- `username`: String (Unique)
- `profileImage`: String (Optional, URL)
- `interests`: Array of Strings
- `preferences`: Object
  - `notificationsEnabled`: Boolean
  - `discoveryRadius`: Float64
- `followedBusinesses`: Array of `v.id("businesses")`
- `favoriteBusinesses`: Array of `v.id("businesses")`
- `createdAt`: String (ISO 8601)
- `updatedAt`: String (ISO 8601)

### `businesses` Table

Comprehensive profiles for local businesses.

- `_id`: Convex ID (Primary Key)
- `ownerId`: `v.id("users")`
- `name`: String
- `description`: String
- `category`: String (e.g., "Retail", "Services")
- `services`: Array of Strings
- `products`: Array of Strings
- `operatingHours`: Object (Structured per day)
- `location`: Object
  - `address`: String
  - `city`: String
  - `coordinates`: Object (`lat`: Float64, `lng`: Float64) (Optional)
- `contactInfo`: Object
  - `phone`: String
  - `email`: String
  - `website`: String (Optional)
- `photos`: Array of Strings (URLs)
- `rating`: Float64 (Cached average)
- `reviewCount`: Float64 (Cached count)
- `createdAt`: String (ISO 8601)
- `updatedAt`: String (ISO 8601)

### `reviews` Table

User feedback for businesses.

- `_id`: Convex ID (Primary Key)
- `userId`: `v.id("users")`
- `businessId`: `v.id("businesses")`
- `rating`: Float64 (1-5)
- `content`: String
- `createdAt`: String (ISO 8601)

### `special_offers` Table

Promotions posted by businesses.

- `_id`: Convex ID (Primary Key)
- `businessId`: `v.id("businesses")`
- `title`: String
- `description`: String
- `discountCode`: String (Optional)
- `startDate`: String (ISO 8601)
- `endDate`: String (ISO 8601)
- `createdAt`: String (ISO 8601)

### `feed_items` Table

Dynamic content for the community feed.

- `_id`: Convex ID (Primary Key)
- `businessId`: `v.id("businesses")`
- `type`: String ("promotion", "event", "news")
- `title`: String
- `content`: String
- `imageUrl`: String (Optional)
- `timestamp`: String (ISO 8601)

## 3. Convex Functions (Business Logic)

### User Management

- `users.create`: Registers a new user.
- `users.update`: Updates user profile, interests, and preferences.
- `users.get`: Retrieves current user details.
- `users.toggleFollowBusiness`: Adds/removes a business from the followed list.
- `users.toggleFavoriteBusiness`: Adds/removes a business from the favorites list.

### Business Management

- `businesses.create`: Creates a new business profile (User becomes owner).
- `businesses.update`: Updates business details (Owner only).
- `businesses.get`: Retrieves a single business profile.
- `businesses.list`: Lists businesses with filtering (category, search text) and pagination.
- `businesses.getByOwner`: Lists businesses owned by the current user.

### Engagement & Reviews

- `reviews.create`: Submits a review. Triggers an internal mutation to update `business.rating` and `business.reviewCount`.
- `reviews.listByBusiness`: Lists reviews for a specific business.
- `reviews.listByUser`: Lists reviews written by a specific user.

### Feed & Offers

- `specialOffers.create`: Creates a new offer. Triggers creation of a `feed_item`.
- `specialOffers.listByBusiness`: Lists active offers for a business.
- `feed.getGlobal`: Retrieves the main feed (paginated), sorted by timestamp.
- `feed.getFollowing`: Retrieves feed items only from businesses the user follows.

## 4. Authentication

- Uses Clerk for authentication.
- Convex functions access `ctx.auth.getUserIdentity()` to verify identity and ownership.

## 5. Next Steps

- Generate `convex/schema.ts` based on this design.
- Implement the defined functions in `convex/users.ts`, `convex/businesses.ts`, etc.
