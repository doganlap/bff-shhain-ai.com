-- Update partner user passwords with correct hashes
UPDATE users SET password_hash = '$2a$12$Tvl82fo1hZVdTnx.ZEJhVuj3tb7wWITe0rtjBe17Qa51a9MQ2pHOu' WHERE email = 'ahmet@doganconsult.com';
UPDATE users SET password_hash = '$2a$12$lOrbzkmKpuZOFksyh/5T7ugrtwZ8qrpYepgXXY7gXPoeURRkQpbSi' WHERE email = 'amr@doganconsult.com';

-- Insert 3 additional partner users
INSERT INTO users (id, email, password_hash, full_name, role, tenant_id, is_partner, created_at, updated_at) 
VALUES ('14231ef0-1c18-4390-88ea-d125b7678aec', 'manager@doganconsult.com', '$2a$12$MqCcoLDxQCX7oP0p8p3Xp.zzc90.Z91TfWCiG/im23nDe5SiTnQ2e', 'Partner Manager', 'partner-admin', '75688778-0cf1-4a5c-9536-9acd2e5c9a0e', true, now(), now());

INSERT INTO users (id, email, password_hash, full_name, role, tenant_id, is_partner, created_at, updated_at) 
VALUES ('c5d73441-b7f7-4028-a1df-bbbef4a7979f', 'analyst@doganconsult.com', '$2a$12$h.6iYgb3zIy0Kwb8/bRuEOXGQJPp.y3KeMlTJfWMndZkgk.67WnwK', 'Partner Analyst', 'partner-user', '75688778-0cf1-4a5c-9536-9acd2e5c9a0e', true, now(), now());

INSERT INTO users (id, email, password_hash, full_name, role, tenant_id, is_partner, created_at, updated_at) 
VALUES ('d177cc41-defb-4f6d-9983-b8c63a16dd57', 'consultant@doganconsult.com', '$2a$12$ueEk4O7piPmiB7dU2gQrnuS1c.DCHB3Vo4AbTsRK4Fz3HImn3pfgG', 'Partner Consultant', 'partner-user', '75688778-0cf1-4a5c-9536-9acd2e5c9a0e', true, now(), now());