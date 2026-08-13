# Minzero Data Dictionary

| Column Name | Data Type | Description | Range / Values |
|---|---|---|---|
| `year` | int | Observation year | 2015 – 2026 |
| `mineral` | string | Critical mineral or rare-earth element name | 24 unique minerals |
| `country` | string | Producing nation | 35 unique countries |
| `is_rare_earth` | int | 1 if Rare Earth Element, 0 otherwise | 0 or 1 |
| `end_use` | string | Primary end-use application (battery, magnet, etc.) | Categorical |
| `mine_production_tonnes` | float | Annual mine production in metric tonnes | $> 0$ |
| `production_share_pct` | float | Country share of global annual mine production | 0 – 100% |
| `reserves_tonnes` | float | Estimated reserves in metric tonnes | $\ge 0$ |
| `years_of_reserves` | float | Reserves / annual production | Years of supply |
| `refined_share_pct` | float | Country share of refining/processing capacity | 0 – 100% |
| `price_usd_per_tonne` | float | Mineral price in USD per tonne | $> 0$ |
| `demand_growth_pct` | float | Annual growth rate of end-use demand | % |
| `export_control_active` | int | 1 if country enforced trade export restrictions that year | 0 or 1 |
| `hhi` | float | Herfindahl-Hirschman Index of global production concentration | 0.0 – 1.0 |
| `top_country_share_pct` | float | Production share of the largest single producer nation | 0 – 100% |
| `supply_risk_score` | float | Synthetic analytical supply-risk index | 0 – 100 |
| `high_supply_risk` | int | 1 if supply risk score is in top 30% | 0 or 1 |
| `disruption` | int | 1 if supply disruption occurred that year | 0 or 1 |
| `disruption_next_year` | float | ML TARGET: 1 if disruption occurs next year (NaN for 2026) | 0, 1, or NaN |
