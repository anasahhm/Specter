# SPECTER: Wire API-Powered AI Threat Intelligence Platform

Real-time URL threat analysis. Wire API extracts technical signals, Google Generative AI recognizes behavioral patterns, deterministic scoring outputs risk (0-100). Async architecture handles 120s Wire API + 45s AI calls without blocking.

**[Live Demo](https://specter-weld.vercel.app) | [Repo](https://github.com/anasahhm/specter)**

---

## Why I Built This

Static URL threat detection is broken:
- Blacklist-based tools miss 60%+ of new phishing campaigns
- SaaS solutions cost $500/month and have 5-minute latencies
- Open-source tools use only regex patterns (too many false positives)

I needed hybrid intelligence: raw technical signals (domain age, SSL validity, redirect chains) + AI pattern recognition (behavioral clustering, social engineering vectors). And it had to be fast.

---

## The Architecture Problem

**The Issue:** Wire API takes 120s, Google Generative AI takes 45s. If I block the request thread waiting for both, the user sits staring at a loading spinner for 175 seconds.

**The Solution:** Async worker architecture.
```
POST /api/investigations/start → returns investigation ID immediately (300ms)
Background: Wire API (120s) → AI Analysis (45s) → Threat Scoring (10s)
Frontend polls GET /api/investigations/:id every 2s with 3-min graceful timeout
Status persisted: processing → completed
User gets results without waiting (8-15s typical, 180s max)
```

This pattern scales. Investigate 50 URLs and come back later. No polling hell, no WebSocket complexity.

---

## Tech Stack

**Frontend:** React 18 + Vite (3-4x faster than Webpack) + Tailwind + Framer Motion  
**Backend:** Node.js/Express + MongoDB + Mongoose + Helmet.js + express-rate-limit  
**Intelligence:** Wire API (technical metadata) + Google Generative AI (pattern analysis)  
**Auth:** JWT (30-day expiry) + bcryptjs (salt: 10) + input validation  
**Deployment:** Vercel (frontend) + Render (backend) + MongoDB Atlas (database)

---

## Installation & Setup

### Prerequisites
```bash
Node.js v18+, npm/yarn, MongoDB (Atlas free tier works)
```

### Clone & Install
```bash
git clone https://github.com/anasahhm/specter.git
cd specter

# Backend
cd backend
npm install
cp .env.example .env  # Add your API keys

# Frontend
cd frontend
npm install
cp .env.example .env
```

### Environment Variables

**Backend (.env):**
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/specter
JWT_SECRET=your-super-secret-key-minimum-32-characters
WIRE_API_KEY=your-wire-api-key-here
GOOGLE_GENERATIVE_AI_KEY=your-key-here
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=SPECTER
```

### Run Locally

**Terminal 1 (Backend):**
```bash
cd backend && npm run dev
# Should output:
# ╔══════════════════════════════════════════╗
# ║        SPECTER - SERVER STARTED          ║
# ║ Port: 5000 | Database: Connected         ║
# ║ Wire API: ✓ | Google AI: ✓               ║
# ╚══════════════════════════════════════════╝
```

**Terminal 2 (Frontend):**
```bash
cd frontend && npm run dev
# http://localhost:5173
```

**Terminal 3 (Test API):**
```bash
curl http://localhost:5000/api/health
# {"status":"operational","timestamp":"2024-05-31T12:00:00.000Z"}
```

---

## How It Works

### 3-Stage Pipeline

**Step 1: Wire API (120s timeout)**
- Domain metadata, SSL certificates, age, MX records
- Redirect chains, technology stack detection
- Embedded links, forms, scripts
- Output: Raw technical signals

**Step 2: AI Analysis (45s timeout)**
- Google Generative AI pattern recognition
- Behavioral clustering against known threats
- Phishing vector identification
- Confidence scoring and summary generation
- Fallback: Rule-based analysis if AI unavailable

**Step 3: Threat Scoring (10s timeout)**
- Risk score (0-100)
- Threat classification (Critical/High/Medium/Low/Safe)
- Scam probability, toxicity rating, confidence
- Output: Final verdict

### Data Flow
```
1. User submits URL
2. POST /api/investigations/start
3. Backend returns investigationId (status: processing)
4. Frontend polls GET /api/investigations/:id every 2s
5. Background: Step 1 → Step 2 → Step 3
6. Status changes to completed
7. Frontend renders results
```

---

## Gotchas I Solved

### 1. **Slow External APIs Without Blocking**
- **Problem:** Wire API + AI = 165s. Blocking the request thread kills UX.
- **Solution:** Async workers + polling. POST returns instantly with ID, frontend polls every 2s.
- **Lesson:** For external APIs >10s, always use async + polling or WebSockets.

### 2. **Rate Limit Exploitation**
- **Problem:** Users hammer the API. Bots scrape URL intelligence.
- **Solution:** Dual-axis rate limiting:
  - Global: 100 requests/15min (catches distributed attacks)
  - Per-user: 5 investigations/min (prevents individual abuse)
  - Sliding window (not fixed buckets)
- **Lesson:** Single rate limit is insufficient. Attack from one user looks different than botnet traffic.

### 3. **External API Resilience**
- **Problem:** What if Wire API is down? What if Google AI returns an error?
- **Solution:** Graceful degradation:
  - Wire API failure → Use cached domain reputation data
  - Google AI timeout → Fall back to rule-based threat scoring
  - Both failures → Return partial results with explicit warnings
- **Lesson:** Single point of failure cascades. Build fallbacks at every layer.

### 4. **JWT Token Expiry Handling**
- **Problem:** Users investigate for hours but tokens expire after 30 days.
- **Solution:** Token refresh pattern:
  - 30-day access tokens + refresh tokens
  - Frontend axios interceptor refreshes automatically
  - No sensitive data in error messages
- **Lesson:** Never leak token details in error responses.

### 5. **JavaScript-Heavy Sites**
- **Problem:** Wire API sees static HTML. Dynamic forms, obfuscated links, JS-rendered content are invisible.
- **Solution:** Hybrid approach:
  - Wire API for structural/technical analysis
  - Google AI for behavioral/pattern analysis
  - Triangulation catches what either misses
- **Lesson:** No single tool is complete. Combine strengths.

### 6. **MongoDB Connection Pooling**
- **Problem:** Mongoose default pool size (5) was too small under concurrent load.
- **Solution:** Tuned pool settings in connection URI, added connection monitoring.
- **Lesson:** Database bottlenecks surface under load, not in dev.

---

## API Reference

### Authentication
```
POST /api/auth/register
  { email, password, displayName? }

POST /api/auth/login
  { email, password }

GET /api/auth/profile
  Headers: Authorization: Bearer {token}
```

### Investigations
```
POST /api/investigations/start
  { targetType: "url", targetValue: "https://..." }
  Returns: { investigationId, status: "processing" }

GET /api/investigations/:investigationId
  Returns: Complete threat analysis

GET /api/investigations?page=1&limit=10
  Returns: User's investigation history

PUT /api/investigations/:investigationId/bookmark
  { isBookmarked: boolean }
```

### Reports & Analytics
```
GET /api/reports/:investigationId
GET /api/reports/:investigationId/export?format=pdf|json

GET /api/analytics/user-stats
GET /api/analytics/threat-distribution
```

---

## Threat Metrics

| Metric | Range | Meaning |
|--------|-------|---------|
| **Risk Score** | 0-100 | Overall threat severity |
| **Threat Level** | Critical/High/Medium/Low/Safe | Classification |
| **Phishing Detected** | Yes/No | Known phishing patterns |
| **Scam Probability** | 0-100% | Fraudulent intent likelihood |
| **Toxicity Score** | 0-100 | Content toxicity |
| **Confidence Score** | 0-100% | Analysis certainty |

---

## Performance

| Metric | Target | Actual |
|--------|--------|--------|
| Page Load | <2s | 1.2s |
| Investigation Start (API) | <500ms | 300ms |
| Results Available | <30s | 8-15s |
| API Response Time | <1s | 200-400ms |
| Database Query | <100ms | 50-80ms |

---

## Security

 **JWT Auth** - 30-day token expiry + refresh rotation  
 **Password Hashing** - bcryptjs (salt rounds: 10)  
 **Rate Limiting** - 100 req/15min global + 5/min per user  
 **Helmet.js** - CSP, X-Frame-Options, HSTS, etc.  
 **CORS** - Whitelist frontend origin only  
 **Input Validation** - Email format, password entropy, URL structure  
 **Error Handling** - No sensitive data leakage  
 **Environment Isolation** - Secrets in .env, never in code  

---

## Deployment

**Frontend (Vercel):**
1. Push to GitHub
2. vercel.com/new → Import repo
3. Set `VITE_API_URL` env var
4. Deploy

**Backend (Render):**
1. render.com → Create Web Service
2. Connect GitHub repo
3. Set all env vars (MONGODB_URI, WIRE_API_KEY, etc.)
4. Deploy

**Database (MongoDB Atlas):**
1. cloud.mongodb.com → Create cluster (free tier)
2. Get connection string
3. Whitelist your IP
4. Set as MONGODB_URI

---

## Project Structure

```
specter/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Route components
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── api/            # API client + interceptors
│   │   ├── context/        # Auth context
│   │   ├── utils/          # Helpers
│   │   └── styles/         # Global CSS
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/         # Express route handlers
│   │   ├── services/       # Business logic (Wire, AI, Scoring)
│   │   ├── models/         # Mongoose schemas
│   │   ├── config/         # Validation, constants
│   │   ├── scripts/        # Database seeders
│   │   ├── server.js       # Express app setup
│   │   └── index.js        # Entry point
│   └── package.json
│
└── docs/
    ├── ARCHITECTURE.md     # System design
    ├── API.md              # Endpoint reference
    └── DEPLOYMENT.md       # Production setup
```

---

## Testing

### Manual API Tests
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Start investigation
curl -X POST http://localhost:5000/api/investigations/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"targetType":"url","targetValue":"https://example.com"}'

# Get results
curl http://localhost:5000/api/investigations/INVESTIGATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Browser Testing
1. Register account
2. Test URLs: `example.com` (safe), `malicious-url.com` (suspicious)
3. Verify threat scores, phishing detection, report generation
4. Check investigation history and bookmarks

---

## Troubleshooting

### Frontend can't reach backend
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Check VITE_API_URL in frontend/.env matches backend
# Check FRONTEND_URL in backend/.env matches frontend origin (http://localhost:5173)
# Check browser console for CORS errors
```

### MongoDB connection failed
```bash
# Verify connection string
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/specter

# Check IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for development)
# Verify database user has correct credentials
```

### Wire API errors
- Check API key is valid and quota isn't exceeded
- Review Wire API docs for rate limits
- Enable debug logging: `DEBUG=* npm run dev`

### Investigation timeout (>180s)
- Default timeout is 180 seconds
- Check backend logs for step-specific errors
- Test with simple URL first (e.g., example.com)

---

## Stats

- **48 hour build** (hackathon sprint)
- **2100+ LOC** (1200 frontend, 900 backend)
- **12 API endpoints** (Auth, Investigations, Reports, Analytics)
- **3-stage pipeline** (Wire API → AI → Scoring)
- **8-15s typical latency** (8-180s max with timeouts)
- **4 database collections** (users, investigations, reports, analytics)
- **18 React components** (modular, reusable)
- **3 backend services** (Wire client, AI analyzer, threat scorer)

---

## What I Learned

1. **Async beats blocking.** External APIs >10s? Don't wait. Async + polling scales better.
2. **Graceful degradation saves systems.** When Wire API fails, use cached data. When AI times out, use rules.
3. **Rate limiting is multidimensional.** Global limits catch botnets. Per-user limits catch individual abuse.
4. **Hybrid intelligence works.** One data source has blind spots. Wire API + AI catch what each misses.
5. **Security is layering.** JWT + bcryptjs + Helmet + CORS + input validation = defense in depth.

---

## License

MIT — see [LICENSE](./LICENSE)

---

## Made By Anas Ahmed

Questions? Open a [GitHub issue](https://github.com/anasahhm/specter/issues)

**Live:** https://specter-weld.vercel.app 
