# Tradio - Stock Trading Analytics Dashboard

# Tradio -

A stock analytics platform built with Next.js, TailwindCSS, Zustand, and Angel One SmartAPI.

## 🛠️ Tech Stack
- Next.js (App Router)
- TailwindCSS
- Zustand
- Firebase Admin SDK
- dotenv
- Angel One SmartAPI

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone <repo-url>
cd stock_analyzer
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root:

```
ANGEL_API_KEY=your_api_key
ANGEL_SECRET_KEY=your_secret_key
ANGEL_CLIENT_CODE=your_client_code
ANGEL_REDIRECT_URL=http://localhost:3000/angelone/callback
```

### 3. Run Locally
```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000)

## 🔐 Angel One SmartAPI Login Flow
1. User clicks AngelOne connect button on dashboard/connect.
2. Redirects to AngelOne login:
   `https://smartapi.angelone.in/publisher-login?api_key=...&state=...`
3. After login, AngelOne redirects to:
   `http://localhost:3000/angelone/callback?auth_token=...&feed_token=...`
4. Frontend extracts tokens and POSTs to `/api/angelone/session` with `client_code` and `totp`.
5. Backend calls SmartAPI `generateSession` and stores tokens securely (Firebase or in-memory).
6. Use `/api/angelone/ltp` and `/api/angelone/candles` for data.

## 📦 API Routes
- `POST /api/angelone/session` — Login and store session
- `GET /api/angelone/ltp?symbol=SBIN-EQ` — Get latest price
- `GET /api/angelone/candles?symbol=RELIANCE-EQ&interval=ONE_MINUTE&from=...&to=...` — Get historical data
- `POST /api/angelone/logout` — Logout

## 🏗️ Extending Functionality
- To place orders: Add `/api/angelone/order` route and use SmartAPI order endpoints.
- To stream market data: Use WebSocket with `feed_token` and SmartAPI streaming docs.

## 📝 Notes
- Tokens are never exposed to the client.
- Use Zustand for session state on frontend.
- Use Firebase or in-memory store for backend session tokens.

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm/yarn**: Package manager
- **Firebase Project**: For authentication and database
- **Zerodha Account**: For broker integration (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/writer-nitesh/stock_analyzer.git
cd stock_analyzer
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create environment variables (Firebase credentials are already configured):
```bash
# Required for production
BASE_URL=http://localhost:3000
ADMIN_SECRET=your_firebase_admin_credentials
```

4. **Start development server**
```bash
npm run dev
```

5. **Access the application**
Open [http://localhost:3000](http://localhost:3000)

### Development Workflow

```bash
# Start development with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 🔧 Core Components & Features

### Trading Dashboard (`/dashboard`)
- **Metrics Cards**: Real-time P&L, win rates, trade statistics
- **Performance Charts**: Cumulative and daily P&L visualization
- **Advanced Filters**: Strategy, timeframe, and performance filtering
- **Data Tables**: Sortable trading history with detailed breakdowns
- **Demo Data Integration**: Realistic sample data for testing

### Authentication System
- **Firebase Auth**: Email/password and Google OAuth
- **Session Management**: Secure HTTP-only cookies
- **Protected Routes**: Middleware-based route protection
- **User State**: Persistent authentication across page reloads

### Broker Integration
- **Zerodha API**: KiteConnect SDK integration
- **Automated Import**: Real-time trade and order fetching
- **Connection Management**: OAuth flow for broker authorization
- **Data Processing**: Trade data normalization and analysis

### UI Components Architecture
```
src/components/ui/
├── trading-metrics-cards.jsx    # Performance metrics display
├── trading-chart.jsx           # Interactive charts with Recharts
├── trading-filters.jsx         # Advanced filtering system
├── trading-data-table.jsx      # Sortable data tables
├── trading-summary.jsx         # Daily trading summary
├── chart.jsx                   # Chart infrastructure
├── tabs.jsx                    # Navigation tabs
├── table.jsx                   # Data table foundation
└── badge.jsx                   # Status indicators
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue variants (`oklch(0.488 0.243 264.376)`)
- **Success**: Green for profits and positive metrics
- **Danger**: Red for losses and negative metrics
- **Neutral**: Gray scale for secondary information
- **Sidebar**: Custom sidebar color scheme

### Typography
- **Font Family**: Geist (Vercel's optimized font)
- **Hierarchical Structure**: Clear heading levels (h1-h6)
- **Metric Display**: Large, prominent numbers for key data
- **Body Text**: Optimized for readability and contrast

## 🔐 Security & Authentication

### Firebase Security
- **Client-side**: Firebase Auth SDK for user authentication
- **Server-side**: Firebase Admin SDK for session validation
- **Session Cookies**: HTTP-only, secure cookies for persistence
- **Route Protection**: Middleware-based authentication checks

### Data Security
- **User Isolation**: Firestore security rules for user data
- **API Protection**: Authenticated endpoints for sensitive operations
- **Input Validation**: Zod schemas for form validation
- **Error Handling**: Comprehensive error boundaries and fallbacks

## 📊 Data Architecture

### Firestore Collections
```javascript
// User trading data structure
{
  journal: {
    trades: [...],        // Array of trade objects
    userId: "user_uid",   // User identifier
    created_at: Date,     // Creation timestamp
    updated_at: Date      // Last update timestamp
  }
}

// Trade object structure
{
  order_timestamp: "ISO_DATE",
  transaction_type: "BUY|SELL",
  quantity: Number,
  price: Number,
  average_price: Number,
  tradingsymbol: String,
  // ... additional fields
}
```

### Data Processing Pipeline
1. **Raw Data Import**: Broker API or manual entry
2. **Data Normalization**: Standardized format conversion
3. **Trade Grouping**: Completed trade set identification
4. **Metrics Calculation**: Real-time performance analytics
5. **Chart Data Generation**: Time-series data for visualization

## 🌐 Internationalization

The application supports multiple languages using next-intl:

- **English (Default)**: Complete translation coverage
- **Hindi**: Planned for Indian market
- **Extensible**: Easy addition of new languages

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables (Production)
```env
BASE_URL=https://your-domain.com
ADMIN_SECRET={"type":"service_account",...}
NODE_ENV=production
```

### Recommended Platforms
- **Vercel**: Optimal for Next.js applications
- **Netlify**: Alternative deployment option
- **Railway/Render**: For full-stack deployments

## 📈 Performance Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Geist font with next/font
- **Bundle Analysis**: Turbopack for faster builds
- **Lazy Loading**: React.lazy for heavy components

## 🔮 Future Enhancements

### Planned Features
- **TypeScript Migration**: Enhanced type safety
- **Real-time Updates**: WebSocket integration
- **Mobile Application**: React Native companion app
- **AI Trading Insights**: Machine learning recommendations
- **Advanced Analytics**: Portfolio optimization tools
- **Social Features**: Community trading insights

### Technical Improvements
- **PWA Support**: Offline functionality
- **Advanced Testing**: Unit and integration tests
- **API Documentation**: OpenAPI/Swagger specs
- **Performance Monitoring**: Error tracking and analytics
- **Database Optimization**: Caching and indexing strategies

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write descriptive commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Contact

- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: Comprehensive guides in `/docs`
- **Demo Data**: Sample format in `src/lib/demoData.json`

## 🙏 Acknowledgments

- **Next.js Team**: For the incredible framework
- **shadcn/ui**: For beautiful, accessible components
- **Recharts**: For excellent data visualization
- **Firebase**: For robust backend services
- **Radix UI**: For accessible component primitives
- **Tailwind CSS**: For utility-first styling
- **Vercel**: For deployment and font optimization

---

**Built with ❤️ for the trading community by [Tradio Team](https://github.com/writer-nitesh/stock_analyzer)**
