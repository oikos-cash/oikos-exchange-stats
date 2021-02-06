# oikos-exchange-stats

API endpoints for CMC and Coingecko

API base URL:
 - `https://cmc-api.oikos.exchange or https://cmc-api.oikos.cash`

API endpoints:

 - `/api/total-supply`: OKS total supply
 - `/api/circulating-supply`: OKS circulating supply
 - `api/pairs/:category`: Available synths pairs for a specified category in ['all', 'crypto', 'forex']
 - `api/ticker/:pair`: Returns rate, bid, ask, volume24hFrom, volume24hTo, low24hRate, high24hRate for a specified synth pair