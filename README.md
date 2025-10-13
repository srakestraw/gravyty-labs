# 🚀 Gravyty Labs Platform

A comprehensive Next.js 14 platform for admissions management, student information systems, and AI-powered automation.

## ✨ Features

### 🔐 **Authentication**
- **Google OAuth**: Secure Google sign-in integration
- **Domain Restrictions**: Limited to `gravyty.com` and `rakestraw.com` domains
- **Firebase Integration**: Robust authentication with Firebase Auth
- **Protected Routes**: Middleware-based route protection

### 🎨 **User Interface**
- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Responsive Layout**: Mobile-first responsive design
- **Font Awesome Icons**: Comprehensive icon library via CDN
- **Dark Theme Support**: Built-in dark mode capabilities
- **Component Library**: Reusable UI components with Radix UI

### 🏢 **Multi-App Platform**
- **Admissions Management**: Streamlined admissions process
- **Student Information System (SIS)**: Comprehensive student data management
- **AI Teammates**: AI-powered automation and workflows
- **App Switcher**: Seamless navigation between applications
- **Unified Navigation**: Consistent header and sidebar across apps

### 🔧 **Technical Stack**
- **Next.js 14**: Latest App Router with TypeScript
- **Firebase**: Authentication and backend services
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Firebase project setup

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gravyty-labs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 **Project Structure**

```
gravyty-labs/
├── app/                          # Next.js App Router
│   ├── (shell)/                 # Protected shell layout
│   │   ├── components/          # Shell components
│   │   │   ├── app-header.tsx   # Main header
│   │   │   ├── app-sidebar.tsx  # Navigation sidebar
│   │   │   └── app-switcher.tsx # App switching component
│   │   ├── admissions/          # Admissions app pages
│   │   ├── sis/                 # SIS app pages
│   │   ├── ai-teammates/        # AI Teammates app pages
│   │   └── layout.tsx           # Shell layout
│   ├── api/                     # API routes
│   │   ├── auth/sync/           # Authentication sync
│   │   └── health/              # Health check
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/                   # Reusable components
│   ├── ui/                      # UI component library
│   │   ├── button.tsx           # Button component
│   │   ├── input.tsx            # Input component
│   │   ├── dropdown-menu.tsx    # Dropdown menu
│   │   └── avatar.tsx           # Avatar component
│   └── shared/                  # Shared components
├── lib/                         # Utility libraries
│   ├── firebase/                # Firebase configuration
│   │   ├── config.ts            # Firebase setup
│   │   └── auth-context.tsx     # Auth context provider
│   ├── store.ts                 # Zustand store
│   ├── types.ts                 # TypeScript types
│   └── utils.ts                 # Utility functions
├── public/                      # Static assets
│   └── assets/                  # Brand assets
│       ├── logos/               # Company logos
│       ├── favicons/            # Favicon files
│       └── icons/               # App icons
├── scripts/                     # Build scripts
├── package.json                 # Dependencies
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── next.config.js               # Next.js configuration
```

---

## 🎨 **Brand Guidelines**

### **Color Palette**
- **Primary Blue**: `#0052CC` (Jira blue)
- **Secondary Purple**: `#6554C0`
- **Accent Teal**: `#00B8D9`
- **Dark Navy**: `#0A1A2F` (Sidebar background)

### **Typography**
- **Font Family**: Inter (Google Fonts)
- **Weights**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### **Icons**
- **Font Awesome**: CDN-based icon library
- **App Icons**: Custom icons for each application
- **Consistent Sizing**: Standardized icon sizes

---

## 🔧 **Development**

### **Available Scripts**

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

### **Key Features**

#### **Authentication Flow**
1. User clicks "Sign In" or "Sign Up"
2. Redirected to Google OAuth
3. Domain validation (gravyty.com, rakestraw.com)
4. Firebase user creation/authentication
5. Redirect to appropriate app

#### **App Switching**
1. Click grid icon in header
2. Select desired application
3. Update active app state
4. Navigate to app-specific route

#### **Responsive Design**
- **Mobile**: Collapsible sidebar, touch-friendly interface
- **Tablet**: Optimized layout for medium screens
- **Desktop**: Full sidebar, multi-column layouts

---

## 🚀 **Deployment**

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Docker**
```bash
# Build Docker image
docker build -t gravyty-labs .

# Run container
docker run -p 3000:3000 gravyty-labs
```

### **Environment Variables**
Ensure all Firebase environment variables are set in production:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## 📱 **Browser Support**

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 **License**

This project is proprietary software owned by Gravyty Labs.

---

## 📞 **Support**

For technical support or questions:
- **Email**: support@gravyty.com
- **Documentation**: [Internal Wiki]
- **Issues**: [GitHub Issues]

---

**Built with ❤️ by the Gravyty Labs Team**
