# Roles

## User Roles

### `public`

- Unauthenticated users.
- Can browse the landing page.
- Can search for businesses (limited view).

### `resident` (Default Authenticated User)

- Authenticated city residents.
- Can view full business profiles.
- Can follow businesses.
- Can write reviews.
- Can manage their own profile and preferences.

### `business_owner`

- Users who have registered a business.
- Inherits all privileges of `resident`.
- Can manage their own business profiles.
- Can post special offers.
- Can post to the feed as their business.

### `admin`

- System administrators.
- Can manage all users and businesses.
- Can moderate content (reviews, feed items).
