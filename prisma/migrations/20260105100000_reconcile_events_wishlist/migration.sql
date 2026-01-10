-- Align precision and defaults without touching prior applied migrations

-- Product: drop default on sizeOptions if present
ALTER TABLE "Product" ALTER COLUMN "sizeOptions" DROP DEFAULT;

-- EventRecommendation: set createdAt precision
ALTER TABLE "EventRecommendation" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- UserEvent: set timestamp precision and remove updatedAt default
ALTER TABLE "UserEvent"
  ALTER COLUMN "startTime" SET DATA TYPE TIMESTAMP(3),
  ALTER COLUMN "endTime" SET DATA TYPE TIMESTAMP(3),
  ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
  ALTER COLUMN "updatedAt" DROP DEFAULT,
  ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- WishlistItem: set createdAt precision
ALTER TABLE "WishlistItem" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);
