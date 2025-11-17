-- Update partner user passwords with correct hashes
UPDATE users SET password_hash = '$2a$12$Tvl82fo1hZVdTnx.ZEJhVuj3tb7wWITe0rtjBe17Qa51a9MQ2pHOu' WHERE email = 'ahmet@doganconsult.com';
UPDATE users SET password_hash = '$2a$12$lOrbzkmKpuZOFksyh/5T7ugrtwZ8qrpYepgXXY7gXPoeURRkQpbSi' WHERE email = 'amr@doganconsult.com';