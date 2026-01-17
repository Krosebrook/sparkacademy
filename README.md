# 🎓 SparkAcademy - AI-Powered Learning Platform

**An innovative learning management system powered by artificial intelligence**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/vite-6.1.0-646cff.svg)](https://vitejs.dev)

---

## 📚 Overview

SparkAcademy is a modern learning management system that leverages AI to revolutionize online education. The platform enables creators to build courses in minutes using AI generation, while learners benefit from personalized AI tutoring and progress tracking.

### ✨ Key Features

- 🤖 **AI Course Generator** - Create professional courses in minutes
- 👨‍🏫 **AI Tutor** - Personalized learning assistance
- 📚 **Course Marketplace** - Discover and enroll in courses
- 💳 **Integrated Payments** - Stripe-powered monetization
- 📊 **Analytics Dashboard** - Track progress and performance
- 🎨 **Modern UI** - Beautiful, accessible interface with Radix UI
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- ⚡ **Fast & Scalable** - Built on modern serverless architecture

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.x or 20.x LTS
- **npm**: 9.0.0 or higher
- **Git**: 2.30 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/Krosebrook/sparkacademy.git
cd sparkacademy

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📖 Documentation

Comprehensive documentation is available in the [`docs/`](./docs) directory:

### Getting Started
- 📘 [**Quick Start Guide**](./docs/QUICK_START.md) - Get up and running in 5 minutes
- 💻 [**Development Guide**](./docs/DEVELOPMENT_GUIDE.md) - Complete developer setup and workflow
- 🏗️ [**Architecture**](./docs/ARCHITECTURE.md) - Technical architecture overview

### Deployment & Operations
- 🚀 [**Production Readiness Roadmap**](./docs/PRODUCTION_READINESS_ROADMAP.md) - Path to production
- 📦 [**Deployment Guide**](./docs/DEPLOYMENT_GUIDE.md) - Deployment procedures and best practices

### Quality & Security
- 🧪 [**Testing Guide**](./docs/TESTING_GUIDE.md) - Testing strategy and examples
- 🔒 [**Security Guide**](./docs/SECURITY_GUIDE.md) - Security best practices

### API & Contributing
- 📋 [**API Documentation**](./docs/API_DOCUMENTATION.md) - Complete API reference
- 🤝 [**Contributing Guide**](./docs/CONTRIBUTING.md) - How to contribute

### Project Planning
- 📊 [**Executive Summary**](./docs/EXECUTIVE_SUMMARY.md) - High-level project overview
- 🔍 [**High-Level Audit**](./docs/HIGH_LEVEL_AUDIT.md) - Architecture audit
- 🔬 [**Low-Level Audit**](./docs/LOW_LEVEL_AUDIT.md) - Detailed code analysis
- 🛣️ [**MVP Development Path**](./docs/MVP_DEVELOPMENT_PATH.md) - Roadmap to MVP

---

## 🛠️ Technology Stack

### Frontend
- **React 18.2** - UI library
- **Vite 6.1** - Build tool and dev server
- **React Router 7.2** - Client-side routing
- **React Query 5.84** - Server state management
- **Tailwind CSS 3.4** - Utility-first CSS
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animations

### Backend
- **Base44 SDK** - Backend-as-a-Service
- **Serverless Functions** - 17 custom functions
- **Stripe** - Payment processing
- **OpenAI** - AI-powered features

### Development Tools
- **Vitest** - Unit and integration testing
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **Git** - Version control

---

## 📁 Project Structure

```
sparkacademy/
├── docs/                  # Documentation
├── functions/             # Serverless functions (17)
├── src/
│   ├── api/              # API client functions
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components (62)
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Root component
│   └── main.jsx          # Entry point
├── .env                   # Environment variables (not in git)
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
└── README.md             # This file
```

---

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run test            # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:ui         # Run tests with UI
npm run test -- --coverage  # Run tests with coverage

# Code Quality
npm run lint            # Run ESLint
npm run typecheck       # Run type checking
```

### Development Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes and commit: `git commit -m "feat: add feature"`
3. Run tests: `npm run test`
4. Push and create a Pull Request

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for detailed guidelines.

---

## 🚀 Deployment

SparkAcademy can be deployed to various platforms:

- **Vercel** (Recommended) - Automatic deployments from GitHub
- **Netlify** - Alternative frontend hosting
- **Base44** - Backend and serverless functions

See [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📊 Current Status

### Project Health

- **Version**: 0.0.0 (Pre-release)
- **Status**: 🟡 In Development (MVP Phase)
- **Test Coverage**: 🔴 0% (Needs attention)
- **Documentation**: 🟢 Complete
- **Production Ready**: 🟡 60% (See [Production Roadmap](./docs/PRODUCTION_READINESS_ROADMAP.md))

### Key Metrics

- **Pages**: 62 components
- **Components**: 148+ UI components
- **Code**: ~32,500 lines
- **Dependencies**: 76 production, 16 dev
- **Serverless Functions**: 17 functions

### Roadmap

**MVP (6 weeks)**:
1. ✅ Core features implementation
2. 🟡 Testing infrastructure
3. 🟡 Security hardening
4. ⏳ Beta testing
5. ⏳ Production launch

See [MVP_DEVELOPMENT_PATH.md](./docs/MVP_DEVELOPMENT_PATH.md) for detailed roadmap.

---

## 🔒 Security

Security is a top priority. Key measures include:

- ✅ Base44 authentication & authorization
- ✅ HTTPS-only in production
- ✅ Environment variable management
- ⚠️ Rate limiting (in progress)
- ⚠️ Input validation (in progress)
- ⚠️ XSS protection (in progress)

See [SECURITY_GUIDE.md](./docs/SECURITY_GUIDE.md) for complete security documentation.

**Found a vulnerability?** Please report it responsibly by emailing security@sparkacademy.com (not via public issues).

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

- 🐛 **Report bugs** - Create an issue with bug details
- 💡 **Suggest features** - Share your ideas
- 📝 **Improve documentation** - Help make docs better
- 🔧 **Submit pull requests** - Fix bugs or add features
- ⭐ **Star the repo** - Show your support

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with amazing open-source tools:

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Base44](https://base44.io/) - Backend platform
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Stripe](https://stripe.com/) - Payment processing
- [OpenAI](https://openai.com/) - AI capabilities

---

## 📞 Contact & Support

- **Website**: [sparkacademy.com](https://sparkacademy.com)
- **Documentation**: [docs/](./docs)
- **Issues**: [GitHub Issues](https://github.com/Krosebrook/sparkacademy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Krosebrook/sparkacademy/discussions)

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Made with ❤️ by the SparkAcademy Team**
