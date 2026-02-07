-- Initialization script for PostgreSQL in Docker
-- This runs automatically in the database specified by POSTGRES_DB environment variable
-- Do NOT include DROP/CREATE DATABASE or \c commands
SET timezone = 'UTC';
-- --------------------------------------------------------
-- USERS TABLE
-- --------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_name VARCHAR(100),
    current_location VATCHAR(100),
    bio VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
-- --------------------------------------------------------
-- CATEGORIES TABLE
-- --------------------------------------------------------
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Index for faster category name lookups
CREATE INDEX idx_categories_name ON categories(name);
-- --------------------------------------------------------
-- USER_CATEGORIES (Many-to-Many Junction Table)
-- --------------------------------------------------------
CREATE TABLE user_categories (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, category_id)
);
-- Indexes for faster lookups
CREATE INDEX idx_user_categories_user_id ON user_categories(user_id);
CREATE INDEX idx_user_categories_category_id ON user_categories(category_id);
-- --------------------------------------------------------
-- GRANT PERMISSIONS FOR NEW TABLES
-- --------------------------------------------------------
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON categories TO netro_app;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON user_categories TO netro_app;
GRANT USAGE,
    SELECT ON SEQUENCE categories_id_seq TO netro_app;
GRANT ALL PRIVILEGES ON categories TO netro_admin;
GRANT ALL PRIVILEGES ON user_categories TO netro_admin;
GRANT ALL PRIVILEGES ON SEQUENCE categories_id_seq TO netro_admin;
-- --------------------------------------------------------
-- SEED CATEGORIES (Optional)
-- --------------------------------------------------------
INSERT INTO categories (name)
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
    ('traveling');
-- --------------------------------------------------------
-- DATABASE ROLES
-- --------------------------------------------------------
-- Application role (for your Express backend)
CREATE ROLE netro_app WITH LOGIN PASSWORD 'netro_password';
GRANT CONNECT ON DATABASE netro TO netro_app;
GRANT SELECT,
    INSERT,
    UPDATE ON users TO netro_app;
GRANT USAGE,
    SELECT ON SEQUENCE users_id_seq TO netro_app;
-- Admin role (for migrations and maintenance)
CREATE ROLE netro_admin WITH LOGIN PASSWORD 'netro_admin_password';
GRANT ALL PRIVILEGES ON DATABASE netro TO netro_admin;
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
-- Grant privileges on existing tables
GRANT SELECT,
    INSERT,
    UPDATE ON ALL TABLES IN SCHEMA public TO netro_app;
GRANT USAGE,
    SELECT ON ALL SEQUENCES IN SCHEMA public TO netro_app;