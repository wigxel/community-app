# Privileges

## User Management

- `user:create`: Create a new user account.
- `user:read`: View user profile (self).
- `user:update`: Update user profile (self).
- `user:delete`: Delete user account (self or admin).

## Business Management

- `business:create`: Register a new business.
- `business:read`: View business details.
- `business:update`: Update business details (owner or admin).
- `business:delete`: Delete a business (owner or admin).

## Engagement

- `review:create`: Write a review.
- `review:read`: Read reviews.
- `review:update`: Edit a review (author only).
- `review:delete`: Delete a review (author or admin).
- `follow:create`: Follow a business.
- `follow:delete`: Unfollow a business.

## Content & Feed

- `offer:create`: Create a special offer (business owner).
- `offer:read`: View offers.
- `offer:update`: Update an offer (business owner).
- `offer:delete`: Delete an offer (business owner or admin).
- `feed:post`: Post a feed item (business owner).
- `feed:read`: View the community feed.
