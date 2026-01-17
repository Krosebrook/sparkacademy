# 🚀 SparkAcademy - Deployment Guide

**Last Updated:** January 17, 2026  
**Version:** 1.0

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Build Process](#build-process)
5. [Deployment Platforms](#deployment-platforms)
6. [Production Configuration](#production-configuration)
7. [Deployment Procedures](#deployment-procedures)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Rollback Procedures](#rollback-procedures)
10. [Monitoring & Maintenance](#monitoring--maintenance)
11. [Troubleshooting](#troubleshooting)

---

## Deployment Overview

SparkAcademy uses a modern, serverless deployment architecture:

- **Frontend**: Static SPA deployed to CDN-backed hosting
- **Backend**: Base44 BaaS (managed serverless platform)
- **Functions**: Serverless functions on Base44
- **Database**: Base44 managed NoSQL database
- **Storage**: Base44 file storage

### Deployment Architecture

```
GitHub Repository
      ↓
   Git Push
      ↓
CI/CD Pipeline (GitHub Actions)
      ↓
   Build & Test
      ↓
Deploy to Vercel/Netlify (Frontend)
      ↓
Deploy to Base44 (Backend & Functions)
      ↓
Production Environment
```

### Supported Platforms

| Platform | Use Case | Recommended |
|----------|----------|-------------|
| **Vercel** | Frontend hosting | ✅ Yes (best for Vite) |
| **Netlify** | Frontend hosting | ✅ Yes (alternative) |
| **Base44** | Backend & Functions | ✅ Required |
| **Cloudflare Pages** | Frontend hosting | ⚠️ Alternative |

---

## Prerequisites

### Required Accounts

1. **GitHub Account** (for code repository)
2. **Vercel/Netlify Account** (for frontend hosting)
3. **Base44 Account** (for backend services)
4. **Stripe Account** (for payments)
5. **Domain Registrar** (for custom domain)

### Required Tools

```bash
# Node.js & npm
node --version  # Should be 18+ or 20+
npm --version   # Should be 9+

# Git
git --version   # Should be 2.30+

# Vercel CLI (optional)
npm install -g vercel

# Or Netlify CLI (optional)
npm install -g netlify-cli
```

### Access & Permissions

- Admin access to GitHub repository
- Deploy access to Vercel/Netlify
- Admin access to Base44 project
- Access to domain DNS settings

---

## Environment Setup

### Environment Variables

Create environment-specific configuration files:

**Development** (`.env.development`):
```bash
VITE_BASE44_APP_ID=dev_app_id
VITE_BASE44_API_KEY=dev_api_key
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:5173/api
NODE_ENV=development
```

**Staging** (`.env.staging`):
```bash
VITE_BASE44_APP_ID=staging_app_id
VITE_BASE44_API_KEY=staging_api_key
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_APP_URL=https://staging.sparkacademy.com
VITE_API_URL=https://staging.sparkacademy.com/api
NODE_ENV=staging
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_POSTHOG_KEY=phc_...
```

**Production** (`.env.production`):
```bash
VITE_BASE44_APP_ID=prod_app_id
VITE_BASE44_API_KEY=prod_api_key
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_APP_URL=https://sparkacademy.com
VITE_API_URL=https://sparkacademy.com/api
NODE_ENV=production
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_POSTHOG_KEY=phc_...
```

### Secrets Management

**Vercel**:
```bash
# Add environment variables via CLI
vercel env add VITE_BASE44_APP_ID production
vercel env add VITE_BASE44_API_KEY production
vercel env add VITE_STRIPE_PUBLIC_KEY production

# Or via Vercel Dashboard:
# Settings → Environment Variables → Add
```

**Netlify**:
```bash
# Add environment variables via CLI
netlify env:set VITE_BASE44_APP_ID prod_value
netlify env:set VITE_BASE44_API_KEY prod_value

# Or via Netlify Dashboard:
# Site settings → Build & deploy → Environment → Add variable
```

---

## Build Process

### Local Build

```bash
# Clean previous build
rm -rf dist

# Build for production
npm run build

# Output will be in /dist directory
# ├── assets/
# │   ├── index-[hash].js
# │   ├── index-[hash].css
# │   └── ...
# └── index.html
```

### Build Configuration

**vite.config.js**:
```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
  },
});
```

### Build Optimization

**1. Bundle Size Analysis**:
```bash
# Install analyzer
npm install -D rollup-plugin-visualizer

# Build with analysis
npm run build

# View bundle report
open dist/stats.html
```

**2. Code Splitting**:
```javascript
// Lazy load heavy components
const CourseViewer = lazy(() => import('./pages/CourseViewer'));
const CourseCreator = lazy(() => import('./pages/CourseCreator'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

**3. Asset Optimization**:
- Compress images (WebP format)
- Minify CSS and JavaScript
- Enable Gzip/Brotli compression
- Set proper cache headers

---

## Deployment Platforms

### Vercel Deployment (Recommended)

**One-Time Setup**:

1. **Connect Repository**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   
   # Link project
   vercel link
   ```

2. **Configure Build Settings**:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.production`
   - Ensure they're set for Production environment

**Automatic Deployments**:
```bash
# Push to main branch triggers automatic deployment
git push origin main

# Preview deployments for PRs
git push origin feature/my-feature
# Creates preview URL automatically
```

**Manual Deployment**:
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

### Netlify Deployment

**One-Time Setup**:

1. **Connect Repository**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Initialize site
   netlify init
   ```

2. **Configure Build Settings** (`netlify.toml`):
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Set Environment Variables**:
   - Go to Site settings → Build & deploy → Environment
   - Add all variables from `.env.production`

**Automatic Deployments**:
```bash
# Push to main branch triggers deployment
git push origin main
```

**Manual Deployment**:
```bash
# Deploy to production
netlify deploy --prod

# Deploy to preview
netlify deploy
```

### Base44 Deployment

**Backend & Functions**:

1. **Install Base44 CLI**:
   ```bash
   npm install -g @base44/cli
   ```

2. **Login to Base44**:
   ```bash
   base44 login
   ```

3. **Deploy Functions**:
   ```bash
   # Deploy all functions
   base44 deploy --functions
   
   # Deploy specific function
   base44 deploy --function createStripeCheckout
   ```

4. **Configure Base44**:
   - Set up database collections
   - Configure authentication rules
   - Set up storage buckets
   - Configure CORS settings

---

## Production Configuration

### DNS Configuration

**For Custom Domain**:

1. **Add CNAME Record** (Vercel):
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

2. **Add A Records** (for apex domain):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

3. **Verify Domain** in Vercel/Netlify dashboard

### SSL/TLS Configuration

- ✅ Vercel/Netlify provide automatic SSL (Let's Encrypt)
- ✅ Force HTTPS redirect
- ✅ HSTS header enabled
- ✅ SSL certificate auto-renewal

**Verify SSL**:
```bash
# Check SSL certificate
openssl s_client -connect sparkacademy.com:443 -servername sparkacademy.com
```

### CDN Configuration

**Vercel Edge Network** (automatic):
- Global CDN with 100+ locations
- Automatic asset caching
- Brotli compression
- HTTP/2 support

**Cache Headers** (in `vercel.json`):
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## Deployment Procedures

### Staging Deployment

**Purpose**: Test changes before production

**Process**:
```bash
# 1. Create staging branch
git checkout -b staging

# 2. Merge feature branches
git merge feature/new-feature

# 3. Push to staging
git push origin staging

# 4. Automatic deployment to staging URL
# Wait for deployment completion

# 5. Test staging environment
npm run test:e2e -- --baseUrl=https://staging.sparkacademy.com

# 6. Manual QA testing
# - Test all critical paths
# - Verify new features
# - Check for regressions
```

**Staging Checklist**:
- [ ] Build succeeds
- [ ] All tests pass
- [ ] Manual testing completed
- [ ] Performance acceptable
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Cross-browser tested

### Production Deployment

**Pre-Deployment Checklist**:
- [ ] All staging tests passed
- [ ] Code reviewed and approved
- [ ] Database migrations ready (if any)
- [ ] Monitoring configured
- [ ] Rollback plan prepared
- [ ] Team notified
- [ ] Maintenance window scheduled (if needed)

**Deployment Process**:

```bash
# 1. Create release branch
git checkout -b release/v1.0.0

# 2. Update version
npm version patch  # or minor, or major

# 3. Merge to main
git checkout main
git merge release/v1.0.0

# 4. Tag release
git tag -a v1.0.0 -m "Release version 1.0.0"

# 5. Push to trigger deployment
git push origin main
git push origin v1.0.0

# 6. Monitor deployment
# Check CI/CD pipeline
# Watch for errors in dashboard

# 7. Verify deployment
# Check production URL
# Run smoke tests
# Monitor error rates
```

**Deployment Timeline**:
```
T-30min: Team notification
T-15min: Final staging verification
T-10min: Database backup (if applicable)
T-5min:  Merge to main
T-0:     Push to production
T+5min:  Verify deployment
T+15min: Smoke tests
T+30min: Monitor metrics
T+1hr:   Deployment complete or rollback
```

### Hotfix Deployment

**For Critical Production Issues**:

```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-bug

# 2. Fix the issue
# Make minimal changes
# Add tests

# 3. Test locally
npm run test
npm run build

# 4. Create PR for review
git push origin hotfix/critical-bug

# 5. After approval, merge to main
git checkout main
git merge hotfix/critical-bug

# 6. Deploy immediately
git push origin main

# 7. Monitor closely
# Watch error rates
# Check user impact
```

---

## Post-Deployment Verification

### Smoke Tests

**Automated Smoke Tests**:
```bash
# Run critical path tests
npm run test:smoke

# Or manually test:
# 1. Homepage loads
curl -I https://sparkacademy.com

# 2. User can signup/login
# 3. Course browsing works
# 4. Course enrollment works
# 5. Payment processing works
```

**Manual Verification**:
```
✅ Homepage loads correctly
✅ Assets loading (no 404s)
✅ Authentication works
✅ Course catalog displays
✅ Course viewer functional
✅ Payment checkout works
✅ AI features operational
✅ Mobile responsive
✅ No console errors
✅ Analytics tracking
```

### Health Checks

**Application Health**:
```bash
# Check application status
curl https://sparkacademy.com/health

# Expected response:
# { "status": "ok", "timestamp": "2026-01-17T00:00:00Z" }
```

**Database Health**:
- Verify Base44 dashboard
- Check connection pool
- Monitor query performance

**API Health**:
- Test Base44 API endpoints
- Verify Stripe integration
- Check OpenAI API connection

### Metrics Monitoring

**Monitor for 1 hour post-deployment**:

1. **Error Rates** (Sentry):
   - Should be < 1% of requests
   - No new critical errors
   - No spike in errors

2. **Response Times** (Vercel Analytics):
   - Average < 3s page load
   - API responses < 500ms
   - No timeout errors

3. **User Activity** (PostHog):
   - Normal user flow
   - No drop in conversions
   - No unusual bounce rates

4. **Business Metrics**:
   - Course enrollments working
   - Payments processing
   - New user signups

---

## Rollback Procedures

### When to Rollback

Rollback immediately if:
- 🔴 Critical functionality broken
- 🔴 Payment processing failing
- 🔴 Data loss occurring
- 🔴 Security vulnerability exposed
- 🔴 Error rate > 5%
- 🔴 Site is down

### Rollback Process

**Vercel Rollback**:
```bash
# Via Dashboard:
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "..." → "Promote to Production"

# Via CLI:
vercel rollback
```

**Netlify Rollback**:
```bash
# Via Dashboard:
# 1. Go to Deploys
# 2. Find previous deploy
# 3. Click "Publish deploy"

# Via CLI:
netlify rollback
```

**Git Rollback**:
```bash
# Revert last commit
git revert HEAD
git push origin main

# Or reset to previous version
git reset --hard <previous-commit-hash>
git push --force origin main
```

**Database Rollback**:
```bash
# If database migrations were run:
# 1. Restore from backup
# 2. Run down migrations
# 3. Verify data integrity
```

### Post-Rollback Actions

1. **Notify Team**:
   - Alert all stakeholders
   - Explain the issue
   - Estimated fix time

2. **Investigate Root Cause**:
   - Check error logs
   - Review recent changes
   - Identify the problem

3. **Create Fix**:
   - Develop solution
   - Test thoroughly
   - Plan re-deployment

4. **Document Incident**:
   - What went wrong
   - Why it happened
   - How to prevent it

---

## Monitoring & Maintenance

### Continuous Monitoring

**Error Tracking** (Sentry):
- Real-time error alerts
- Error grouping and trending
- Stack traces and context
- User impact analysis

**Performance Monitoring**:
- Page load times
- API response times
- Core Web Vitals
- Bundle sizes

**Uptime Monitoring** (UptimeRobot):
- Ping every 5 minutes
- Alert on downtime
- Status page
- Historical uptime

**User Analytics** (PostHog):
- User behavior
- Feature usage
- Conversion funnels
- Session recordings

### Regular Maintenance

**Daily**:
- Check error dashboard
- Monitor performance metrics
- Review user feedback

**Weekly**:
- Dependency updates (patch versions)
- Performance review
- Security scan
- Backup verification

**Monthly**:
- Dependency updates (minor versions)
- Performance optimization
- Security audit
- Documentation updates

**Quarterly**:
- Major dependency updates
- Architecture review
- Load testing
- Disaster recovery drill

### Database Maintenance

**Backup Strategy**:
- Automatic daily backups (Base44)
- Retain for 30 days
- Test restore monthly

**Performance**:
- Monitor query performance
- Optimize slow queries
- Review indexes
- Clean up old data

---

## Troubleshooting

### Common Deployment Issues

**1. Build Fails**
```bash
# Check build logs
# Common causes:
# - Missing environment variables
# - Syntax errors
# - Dependency issues
# - Out of memory

# Solutions:
npm install
npm run lint
npm run typecheck
npm run build
```

**2. Environment Variables Not Working**
```bash
# Vercel:
# - Must start with VITE_
# - Set in dashboard
# - Redeploy after adding

# Netlify:
# - Check netlify.toml
# - Verify in dashboard
# - Redeploy
```

**3. Routing Issues (404 on refresh)**
```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

// netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**4. CORS Errors**
```javascript
// Configure in Base44 dashboard
// Add allowed origins:
// - https://sparkacademy.com
// - https://www.sparkacademy.com
```

**5. Slow Performance**
```bash
# Check bundle size
npm run build
du -sh dist/*

# Analyze with Lighthouse
lighthouse https://sparkacademy.com

# Check CDN cache
curl -I https://sparkacademy.com
# Look for cf-cache-status or x-cache headers
```

### Getting Support

**Vercel Support**:
- Dashboard: Help button
- Email: support@vercel.com
- Discord: vercel.com/discord

**Netlify Support**:
- Dashboard: Support chat
- Email: support@netlify.com
- Forum: answers.netlify.com

**Base44 Support**:
- Documentation: base44.io/docs
- Support: support@base44.io

---

## Conclusion

### Deployment Checklist

Pre-Deployment:
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Staging verified
- [ ] Monitoring configured
- [ ] Rollback plan ready

Deployment:
- [ ] Build succeeds
- [ ] Deploy to production
- [ ] Verify deployment
- [ ] Run smoke tests
- [ ] Monitor for 1 hour

Post-Deployment:
- [ ] No critical errors
- [ ] Performance acceptable
- [ ] Users can access
- [ ] Features working
- [ ] Document changes

### Best Practices

1. ✅ Always deploy to staging first
2. ✅ Test thoroughly before production
3. ✅ Deploy during low-traffic hours
4. ✅ Monitor closely after deployment
5. ✅ Have rollback plan ready
6. ✅ Document all changes
7. ✅ Communicate with team
8. ✅ Keep dependencies updated
9. ✅ Maintain good monitoring
10. ✅ Regular backups

---

*Last Updated: January 17, 2026*  
*For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md)*  
*For development info, see [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)*
