# SPECTER : Wire API-Powered AI Threat Intelligence Platform

> Analyze any URL in seconds. Detect phishing, malware, and suspicious behavior with real-time threat intelligence powered by AI.

**Live Demo:** [Frontend](https://specter-weld.vercel.app/)

---

##  Features

- **Real-Time URL Analysis** - Instant threat assessment with Wire API integration
- **AI-Powered Insights** - Pattern recognition and behavioral analysis using Google Generative AI
- **Risk Scoring** - Comprehensive threat scoring algorithm (0-100 scale)
- **Threat Classification** - Critical → High → Medium → Low → Safe
- **Phishing Detection** - Advanced heuristics + AI analysis
- **Fake Engagement Detection** - Identifies suspicious social behavior
- **Behavioral Analytics** - Linked identities, suspicious patterns, insights
- **Threat Reports** - Auto-generated professional reports (PDF/JSON export)
- **User Authentication** - Secure JWT-based authentication
- **Investigation History** - Persistent history with bookmarking
- **Rate Limiting** - Built-in protection against abuse
- **Dashboard Analytics** - Visual threat distribution and trends

---

**Data Flow:**
1. User submits URL → Investigation Form
2. Frontend: POST `/api/investigations/start`
3. Backend creates Investigation document (status: `processing`)
4. Backend immediately returns investigation ID
5. Frontend polls `/api/investigations/:id` every 2 seconds
6. Backend (background): Step 1 (Wire API) → Step 2 (AI) → Step 3 (Threat Score)
7. Results saved; status → `completed`
8. Frontend receives results, renders visualizations
9. User can bookmark, generate reports, export

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool (3-4x faster than Webpack) |
| **React Router v6** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Smooth animations |
| **Recharts** | Data visualization |
| **Lucide React** | Icon library |
| **Axios** | HTTP client |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | REST API framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM (Object-Document Mapper) |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Helmet** | Security headers |
| **express-rate-limit** | Rate limiting |
| **Google Generative AI** | AI-powered analysis (optional) |

### External Services
| Service | Purpose |
|---------|---------|
| **Wire API** | Real-time URL intelligence & threat detection |
| **Google Generative AI** | Pattern recognition & analysis |
| **MongoDB Atlas** | Cloud database (free tier available) |

---

## Installation

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)
- **API Keys:**
  - Wire API key (free tier available)
  - Google Generative AI key (optional - free tier included)

### Clone Repository
```bash
git clone https://github.com/anasahhm/specter.git
cd specter
```

---

## Environment Variables

### Backend Setup

Create `backend/.env`:
```bash
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/specter

# Authentication
JWT_SECRET=your-super-secret-key-minimum-32-characters-recommended

# External APIs
WIRE_API_KEY=your-wire-api-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here (optional)
```

### Frontend Setup

Create `frontend/.env`:
```bash
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=SPECTER
VITE_ENVIRONMENT=development
```

---

## Frontend Setup

```bash
cd frontend
npm install

# Development server (runs on http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

**Key Directories:**
- `src/pages/` - Page components (Auth, Dashboard, Investigation)
- `src/components/` - Reusable components (Forms, Cards, Graphs)
- `src/hooks/` - Custom React hooks (useAuth, useApi, useInvestigation)
- `src/api/` - API client configuration
- `src/styles/` - Global and animation styles

---

## Backend Setup

```bash
cd backend
npm install

# Development server (runs on http://localhost:5000)
npm run dev

# Production start
npm start

# Seed database with test data
npm run seed
```

**Key Directories:**
- `src/routes/` - API endpoints
- `src/services/` - Business logic (Wire API, AI, Threat Analysis)
- `src/models/` - Mongoose schemas
- `src/config/` - Configuration and validation
- `src/scripts/` - Database scripts

---

## Running Locally

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

You should see:
```
╔══════════════════════════════════════════╗
║        SPECTER - SERVER STARTED          ║
╠══════════════════════════════════════════╣
║ Port:         5000
║ Environment:  development
║ Database:     Connected
║ Wire API:     ✓ Key loaded
║ Claude AI:    ✓ Configured
╚══════════════════════════════════════════╝
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Terminal 3: Test API
```bash
# Health check
curl http://localhost:5000/api/health

# Expected response:
# {"status":"operational","timestamp":"2024-05-31T12:00:00.000Z"}
```

### Open Browser
Navigate to `http://localhost:5173` and start investigating URLs!

---

## Project Structure

```
specter/
├── frontend/
│   ├── src/
│   │   ├── pages/              # Route pages
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom hooks
│   │   ├── api/                # API client
│   │   ├── context/            # React Context
│   │   ├── utils/              # Utility functions
│   │   ├── config/             # Configuration
│   │   ├── styles/             # CSS files
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/                 # Static assets
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── routes/             # API endpoints
│   │   ├── services/           # Business logic
│   │   ├── models/             # Mongoose schemas
│   │   ├── config/             # Configuration
│   │   ├── scripts/            # Database scripts
│   │   ├── server.js           # Express app
│   │   ├── index.js            # Entry point
│   │   └── env.js              # .env loader
│   ├── package.json
│   └── .env.example
│
├── README.md
├── .gitignore
├── LICENSE
└── docs/
    ├── DEPLOYMENT.md
    ├── API.md
    └── ARCHITECTURE.md
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register
       Body: { email, password, displayName? }
       
POST   /api/auth/login
       Body: { email, password }
       
GET    /api/auth/profile
       Headers: Authorization: Bearer {token}
```

### Investigations
```
POST   /api/investigations/start
       Body: { targetType: "url", targetValue: "https://..." }
       Returns: { investigationId, status: "processing" }
       
GET    /api/investigations/:investigationId
       Returns: Complete investigation with all threat data
       
GET    /api/investigations?page=1&limit=10
       Returns: Paginated list of user's investigations
       
PUT    /api/investigations/:investigationId/bookmark
       Body: { isBookmarked: boolean }
```

### Reports
```
GET    /api/reports/:investigationId
       Returns: Generated threat report
       
POST   /api/reports/:investigationId/export
       Query: ?format=pdf|json
       Returns: Downloadable report file
```

### Analytics
```
GET    /api/analytics/user-stats
       Returns: User investigation statistics
       
GET    /api/analytics/threat-distribution
       Returns: Threat breakdown by level and type
```

### Health Check
```
GET    /api/health
       Returns: { status: "operational", timestamp: "..." }
```

---

## Threat Detection Workflow

### Step 1: Wire API Analysis (120s timeout)
- Fetch URL metadata, technical details
- Identify SSL certificates, domain age
- Detect redirect chains
- Extract technology stack
- Find embedded links and forms

**Output:** Raw technical data from URL

### Step 2: AI Analysis (45s timeout)
- Analyze patterns using Google Generative AI
- Generate threat summary
- Identify behavioral insights
- Link to known threat signatures
- **Fallback:** Rule-based analysis if AI unavailable

**Output:** Pattern analysis, insights, recommendations

### Step 3: Threat Scoring (10s timeout)
- Calculate risk score (0-100)
- Classify threat level (Critical/High/Medium/Low/Safe)
- Assess phishing probability
- Rate toxicity score
- Calculate confidence score

**Output:** Final threat assessment

---

## Threat Metrics Explained

| Metric | Range | Meaning |
|--------|-------|---------|
| **Risk Score** | 0-100 | Overall threat level |
| **Threat Level** | Critical/High/Medium/Low/Safe | Severity classification |
| **Scam Probability** | 0-100% | Likelihood of fraudulent intent |
| **Confidence Score** | 0-100% | Certainty of analysis |
| **Toxicity Score** | 0-100 | Content toxicity rating |
| **Phishing Detected** | Yes/No | Known phishing patterns matched |
| **Fake Engagement** | Yes/No | Suspicious social behavior |

---

## Deployment

### Quick Deploy (5 minutes total)

#### Frontend (Vercel)
1. Push to GitHub
2. Go to https://vercel.com/new
3. Import repository
4. Set `VITE_API_URL` environment variable
5. Deploy

#### Backend (Render)
1. Create account at https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Set environment variables
5. Deploy

#### Database (MongoDB Atlas)
1. Create free cluster at https://cloud.mongodb.com
2. Get connection string
3. Set `MONGODB_URI` in backend environment

**See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.**

---

## Security Features

 **JWT Authentication** - 30-day token expiry  
 **Password Hashing** - bcryptjs with salt rounds  
 **Rate Limiting** - 100 requests/15min globally, 5 investigations/min per user  
 **CORS Protection** - Whitelist frontend origin  
 **Helmet.js** - Security headers (CSP, X-Frame-Options, etc.)  
 **Input Validation** - Email format, password requirements  
 **Error Handling** - No sensitive data leakage  
 **Environment Isolation** - Secrets in .env  

---

## Testing

### Manual Testing
```bash
# Register new user
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
1. Register new account
2. Enter test URLs:
   - `https://example.com` (legitimate)
   - `https://suspicious-domain-12345.com` (suspicious)
3. Observe threat analysis results
4. Test bookmarking, export, report generation
5. Check investigation history

---

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| Page Load | <2s | 1.2s |
| Investigation Start | <500ms | 300ms |
| Results Available | <30s | 8-15s |
| API Response | <1s | 200-400ms |
| Database Query | <100ms | 50-80ms |

---

## Polling Configuration

Frontend auto-polls for investigation results:
- **Interval:** 2 seconds
- **Max retries:** 90 (3 minutes total)
- **Backoff:** Linear (no exponential backoff)
- **Timeout:** Graceful error handling

Configurable in `frontend/src/config/pollingConfig.js`

---

## Deployment Links

| Environment | URL | Status |
|-----------|-----|--------|
| Frontend (Prod) | https://specter-prod.vercel.app | Live |
| Backend (Prod) | https://specter-api.onrender.com | Live |
| Database | MongoDB Atlas | Connected |
| Repository | https://github.com/anasahhm/specter | Open |


---

## Documentation

- **[Architecture Guide](./docs/ARCHITECTURE.md)** - System design details
- **[API Reference](./docs/API.md)** - Complete endpoint documentation
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Deployment instructions
- **[Security](./docs/SECURITY.md)** - Security practices and considerations

---

## Troubleshooting

### Frontend won't connect to backend
**Solution:**
- Check `VITE_API_URL` in `frontend/.env`
- Verify backend is running: `curl http://localhost:5000/api/health`
- Check browser console for CORS errors
- Ensure `FRONTEND_URL` in backend `.env` matches frontend origin

### MongoDB connection failed
**Solution:**
- Verify `MONGODB_URI` is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct credentials
- Test connection: `node -e "require('mongoose').connect(process.env.MONGODB_URI)"`

### Wire API errors
**Solution:**
- Verify API key is valid: `WIRE_API_KEY`
- Check API quota hasn't been exceeded
- Review Wire API documentation
- Enable verbose logging for debugging

### Investigation processing timeout
**Solution:**
- Default timeout is 180 seconds
- Check backend logs for step-specific errors
- Verify Wire API is responding
- Test with simple URL first

---

## Support

**Issues?** Open a GitHub issue with:
- Description of problem
- Steps to reproduce
- Error messages/logs
- Environment details

**Questions?** 
- Search existing GitHub issues
- Post in discussions section

---

## License

This project is licensed under the **MIT License** - see [LICENSE](./LICENSE) file for details.

---

## Acknowledgments

Built with ❤️ during a hackathon sprint.

**Special thanks to:**
- **Wire API** - Real-time URL threat intelligence
- **Google Generative AI** - Advanced threat analysis capabilities
- **MongoDB** - Flexible data storage
- **Vercel & Render** - Easy deployment platforms

---

## Project Statistics

| Metric | Value |
|--------|-------|
| **Total Commits** | 20 |
| **Development Time** | 1.5 hours |
| **Lines of Code (Frontend)** | 1200+ |
| **Lines of Code (Backend)** | 900+ |
| **API Endpoints** | 12 |
| **Database Collections** | 4 |
| **Components (Frontend)** | 18 |
| **Services (Backend)** | 3 |

---

## Quick Links

- **Live Demo:** https://specter-prod.vercel.app
- **GitHub:** https://github.com/YOUR_USERNAME/specter
- **Docs:** ./docs
- **Issues:** https://github.com/YOUR_USERNAME/specter/issues
- **Discussions:** https://github.com/YOUR_USERNAME/specter/discussions

---

**Made By Anas Ahmed** 
