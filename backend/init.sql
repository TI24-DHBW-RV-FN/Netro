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
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
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