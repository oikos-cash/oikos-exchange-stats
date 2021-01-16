# oikos-exchange-stats

API endpoints for CMC and Coingecko

- `/api/total-supply`: SNX total supply
- `api/pairs/:category`: Available synths pairs for a specified category in `['all', 'crypto', 'forex', 'commodity', 'index', 'equities']`
- `api/ticker/:pair`: Returns `rate, bid, ask, volume24hFrom, volume24hTo, low24hRate, high24hRate` for a specified synth pair
