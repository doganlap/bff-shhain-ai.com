-- ================================================================
-- SQL SCRIPT TO COUNT ROWS IN ALL GRC DATABASE TABLES
-- ================================================================
-- This script will query the database's internal schema to get the
-- row count for every table in the 'public' schema.

DO $$
DECLARE
    table_rec RECORD;
    row_count BIGINT;
BEGIN
    RAISE NOTICE '--- Starting Row Count for All Tables ---';
    FOR table_rec IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM public.%I', table_rec.tablename) INTO row_count;
        RAISE NOTICE 'Table: % | Rows: %', table_rec.tablename, row_count;
    END LOOP;
    RAISE NOTICE '--- Row Count Complete ---';
END $$;
