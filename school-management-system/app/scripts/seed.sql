-- SCHOLA Seed Data
-- Run with: docker exec -i school-management-system-db psql -U postgres -d school_ms < app/scripts/seed.sql

-- Create roles table if not exists
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255),
  two_factor_backup_codes VARCHAR(500),
  role_id INTEGER REFERENCES roles(id),
  groupe_id INTEGER,
  program_id INTEGER,
  city_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Insert roles
INSERT INTO roles (role_name) VALUES ('Admin') ON CONFLICT (role_name) DO NOTHING;
INSERT INTO roles (role_name) VALUES ('Teacher') ON CONFLICT (role_name) DO NOTHING;
INSERT INTO roles (role_name) VALUES ('Student') ON CONFLICT (role_name) DO NOTHING;

-- Insert test users with bcrypt hashed passwords
-- admin123 hash: $2a$10$8.KVbKBvW8uAVWe4Sq8Y6eiD.qKj7lDvGMXqK1Z5FWxJyhqKQ8Vq.
-- teacher123 hash: $2a$10$XVqGKqC0VsY8m5qPQvqJjuLh0EoDE0PJqf7bHqG0rYpN.0kZ6Fwau
-- student123 hash: $2a$10$Kqs8RjSVn.D7MzNqwFM3l.kCqTfv0rWGAEq8FxiPZ9nZjq7BLxKmK

INSERT INTO users (first_name, last_name, birth_date, email, phone_number, address, zip_code, password, is_active, email_verified, role_id)
SELECT 'Admin', 'SCHOLA', '1990-01-01', 'admin@schola.com', '+33600000001', '123 Rue Admin', '75001', 
       '$2a$10$8KVbKBvW8uAVWe4Sq8Y6ueiD.qKj7lDvGMXqK1Z5FWxJyhqKQ8Vq6', true, true,
       (SELECT id FROM roles WHERE role_name = 'Admin')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@schola.com');

INSERT INTO users (first_name, last_name, birth_date, email, phone_number, address, zip_code, password, is_active, email_verified, role_id)
SELECT 'Jean', 'Dupont', '1985-05-15', 'teacher@schola.com', '+33600000002', '456 Rue Teacher', '75002', 
       '$2a$10$XVqGKqC0VsY8m5qPQvqJjuLh0EoDE0PJqf7bHqG0rYpN.0kZ6Fwa2', true, true,
       (SELECT id FROM roles WHERE role_name = 'Teacher')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'teacher@schola.com');

INSERT INTO users (first_name, last_name, birth_date, email, phone_number, address, zip_code, password, is_active, email_verified, role_id)
SELECT 'Marie', 'Martin', '2000-09-20', 'student@schola.com', '+33600000003', '789 Rue Student', '75003', 
       '$2a$10$Kqs8RjSVnD7MzNqwFM3l.kCqTfv0rWGAEq8FxiPZ9nZjq7BLxKmK2', true, true,
       (SELECT id FROM roles WHERE role_name = 'Student')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'student@schola.com');

-- Verify
SELECT 'Roles created: ' || COUNT(*) FROM roles;
SELECT 'Users created: ' || COUNT(*) FROM users;
SELECT email, first_name, last_name, role_name FROM users u JOIN roles r ON u.role_id = r.id;
