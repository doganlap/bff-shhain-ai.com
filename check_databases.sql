-- List all databases
SELECT datname as database_name, 
       pg_size_pretty(pg_database_size(datname)) as size,
       datcollate as collation,
       datctype as character_type
FROM pg_database 
WHERE datistemplate = false 
ORDER BY datname;
