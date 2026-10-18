-- KB enrichment: farm baseline + evidence classes/maturity
ALTER TABLE farms ADD COLUMN agricultural_area_m2 REAL;
ALTER TABLE farms ADD COLUMN lifecycle_state TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE farms ADD COLUMN privacy_class TEXT NOT NULL DEFAULT 'public';
ALTER TABLE farms ADD COLUMN baseline TEXT;
ALTER TABLE farms ADD COLUMN schema_version TEXT NOT NULL DEFAULT '1.0';
ALTER TABLE farms ADD COLUMN jobs INTEGER;
ALTER TABLE farms ADD COLUMN founders TEXT;
ALTER TABLE farms ADD COLUMN framework_phase TEXT;
ALTER TABLE farms ADD COLUMN funding_ref TEXT;
ALTER TABLE farms ADD COLUMN public_goods_allocation REAL;

ALTER TABLE evidence ADD COLUMN evidence_class TEXT NOT NULL DEFAULT 'measurement';
ALTER TABLE evidence ADD COLUMN maturity TEXT NOT NULL DEFAULT 'structured';

-- Update Adelphi farm with correct KB data
UPDATE farms SET
  name = 'Adelphi Regenerative Farm',
  country = 'Dominican Republic',
  region = 'Gonzalo, Sabana Grande de Boyá, Monte Plata',
  latitude = 18.9388,
  longitude = -69.7350,
  area_m2 = 15725,
  agricultural_area_m2 = 13838,
  description = 'Women-led syntropic farm in Gonzalo, Monte Plata, DR. First live Kokonut reference farm.',
  status = 'active',
  lifecycle_state = 'published',
  founders = 'Yanny & Neury Hernández',
  jobs = 7,
  framework_phase = 'Phase II — Production & Regeneration',
  funding_ref = 'Public Nouns Proposal #69',
  public_goods_allocation = 10,
  baseline = '{"project_date":"2022-01-01","project_location":{"coordinates":"18.9388,-69.7350","region":"Gonzalo, Sabana Grande de Boyá, Monte Plata","country":"Dominican Republic"},"land_size":15725,"revenue_streams":["lettuce","passion_fruit","coconut","poultry_eggs"],"target_market":["direct_community_sales","local_markets"],"forecasted_budget":null,"source_of_funding":"Public Nouns Proposal #69","public_goods_allocation":10,"governance_mechanism":"local_operator; moloch_capital_governance; guild_contribution_coordination","token_allocation":"not_applicable","project_summary":"Women-led syntropic farm in Gonzalo, Monte Plata, DR. First live Kokonut reference farm implementing the Kokonut Framework.","local_problem":"Capital and infrastructure gap for locally operated regenerative farms in Monte Plata, DR.","proposed_solution":"Regenerative syntropic farm with diversified production, community infrastructure, and public-goods alignment."}'
WHERE slug = 'adelphi';
