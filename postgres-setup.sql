-- PostgreSQL Setup Commands
-- Run these in your psql terminal

-- 1. Create the database
CREATE DATABASE restaurant_db;

-- 2. Grant privileges to your user
GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO "akash.c@simformsolutions.com";

-- 3. Connect to the database
\c restaurant_db

-- 4. Grant schema privileges (important for Prisma)
GRANT ALL ON SCHEMA public TO "akash.c@simformsolutions.com";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "akash.c@simformsolutions.com";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "akash.c@simformsolutions.com";

-- 5. Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "akash.c@simformsolutions.com";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "akash.c@simformsolutions.com";

-- 6. Verify the setup
\l restaurant_db
\du "akash.c@simformsolutions.com"

-- You can now exit psql
\q
