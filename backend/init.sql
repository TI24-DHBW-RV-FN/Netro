-- Initialization script for PostgreSQL in Docker
-- This runs automatically in the database specified by POSTGRES_DB environment variable
-- The database is already created by Docker, so we don't need CREATE DATABASE
SET timezone = 'UTC';
-- --------------------------------------------------------
-- USERS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_name VARCHAR(100),
    current_location VARCHAR(100),
    bio VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- --------------------------------------------------------
-- CATEGORIES TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Index for faster category name lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
-- --------------------------------------------------------
-- USER_CATEGORIES (Many-to-Many Junction Table)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_categories (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, category_id)
);
-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_categories_user_id ON user_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_categories_category_id ON user_categories(category_id);
-- --------------------------------------------------------
-- SEED CATEGORIES (Only if table is empty)
-- --------------------------------------------------------
INSERT INTO categories (name)
SELECT *
FROM (
        VALUES ('basketball'),
            ('football'),
            ('soccer'),
            ('tennis'),
            ('swimming'),
            ('running'),
            ('cycling'),
            ('gaming'),
            ('reading'),
            ('cooking'),
            ('music'),
            ('photography'),
            ('painting'),
            ('writing'),
            ('hiking'),
            ('yoga'),
            ('dancing'),
            ('programming'),
            ('gardening'),
            ('traveling')
    ) AS v(name)
WHERE NOT EXISTS (
        SELECT 1
        FROM categories
        LIMIT 1
    );
-- --------------------------------------------------------
-- DATABASE ROLES & PERMISSIONS
-- --------------------------------------------------------
-- Grant permissions to netro_app user (created by POSTGRES_USER env var)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'netro_app'
) THEN
GRANT SELECT,
    INSERT,
    UPDATE ON users TO netro_app;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON categories TO netro_app;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON user_categories TO netro_app;
GRANT USAGE,
    SELECT ON SEQUENCE users_id_seq TO netro_app;
GRANT USAGE,
    SELECT ON SEQUENCE categories_id_seq TO netro_app;
END IF;
END $$;
-- Admin role (optional - for migrations and maintenance)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'netro_admin'
) THEN CREATE ROLE netro_admin WITH LOGIN PASSWORD 'netro_admin_password';
END IF;
END $$;
-- Grant admin privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO netro_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO netro_admin;
-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT,
    INSERT,
    UPDATE ON TABLES TO netro_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE,
    SELECT ON SEQUENCES TO netro_app;