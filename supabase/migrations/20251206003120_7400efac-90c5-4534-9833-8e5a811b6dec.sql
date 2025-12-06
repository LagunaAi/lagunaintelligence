-- Allow NULL for total_investment_usd since many verified projects don't have this data yet
ALTER TABLE financials ALTER COLUMN total_investment_usd DROP NOT NULL;