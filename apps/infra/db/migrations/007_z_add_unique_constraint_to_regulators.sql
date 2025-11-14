-- Migration 012: Add unique constraint to regulators table

ALTER TABLE regulators ADD CONSTRAINT regulators_code_unique UNIQUE (code);