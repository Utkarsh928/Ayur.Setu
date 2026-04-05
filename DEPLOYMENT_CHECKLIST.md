# Ayur Setu - Deployment Checklist

Use this checklist before deploying to production.

---

## 🔐 Security Checklist

### API Key & Authentication
- [ ] Generated strong API_KEY using `secrets.token_urlsafe(32)`
- [ ] Set `USE_AUTH=True` in `.env`
- [ ] API key is not hardcoded anywhere
- [ ] API key is stored securely (environment variables only)
- [ ] API key is rotated regularly (every 90 days)

### Database Security
- [ ] Using production MongoDB cluster (not free tier)
- [ ] Database user has strong password (16+ characters)
- [ ] IP whitelist is restricted (not 0.0.0.0/0)
- [ ] Database backups are enabled
- [ ] Database encryption is enabled
- [ ] Connection string uses SSL/TLS

### Frontend Security
- [ ] FRONTEND_ORIGINS is set to your domain only
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] No sensitive data in localStorage
- [ ] Content Security Policy headers are set

### API Security
- [ ] All endpoints require API key (except `/health`)
- [ ] Rate limiting is implemented
- [ ] Input validation is in place
- [ ] SQL injection prevention (using MongoDB)
- [ ] XSS protection enabled
- [ ] CSRF protection enabled

---

## 🗄️ Database Checklist

### MongoDB Setup
- [ ] Production cluster created
- [ ] Database user created with strong password
- [ ] Collections created: `patients`, `diagnoses`, `treatments`
- [ ] Indexes created for performance
- [ ] Backups configured (daily)
- [ ] Monitoring enabled
- [ ] Alerts configured

### Data Integrity
- [ ] All data files validated (NAMASTE, TM2, BIO, conceptmap)
- [ ] No orphaned mappings in conceptmap.json
- [ ] All codes are unique
- [ ] Data is properly formatted (CSV/JSON)

---

## 🤖 AI Configuration Checklist

### Gemini API
- [ ] API key obtained from Google AI Studio
- [ ] API is enabled in Google Cloud Console
- [ ] API key has appropriate permissions
- [ ] Rate limits are understood
- [ ] Billing is configured
- [ ] Error handling is in place

### AI Insights
- [ ] AI overview caching is working
- [ ] Multi-language support is tested
- [ ] Fallback behavior is configured
- [ ] API errors are handled gracefully

---

## 🚀 Deployment Checklist

### Backend Deployment
- [ ] All dependencies installed: `pip install -r requirements.txt`
- [ ] `.env` file is configured with production values
- [ ] `.env` file is NOT committed to git
- [ ] `.gitignore` includes `.env`
- [ ] Database migrations are run
- [ ] Static files are collected
- [ ] Logging is configured
- [ ] Error tracking is enabled (Sentry, etc.)

### Frontend Deployment
- [ ] All dependencies installed: `npm install`
- [ ] Build is successful: `npm run build`
- [ ] Environment variables are configured
- [ ] API endpoint is set to production URL
- [ ] API key is configured for frontend requests
- [ ] Static files are optimized
- [ ] Service worker is configured (if using PWA)

### Server Configuration
- [ ] Server has sufficient resources (CPU, RAM, disk)
- [ ] Server is behind a firewall
- [ ] Server has DDoS protection
- [ ] Server has SSL/TLS certificate
- [ ] Server has automatic backups
- [ ] Server has monitoring and alerts

---

## 📊 Performance Checklist

### Backend Performance
- [ ] Database indexes are created
- [ ] Query performance is optimized
- [ ] Caching is implemented (AI overview cache)
- [ ] Connection pooling is configured
- [ ] Load testing is completed
- [ ] Response times are acceptable (<500ms)

### Frontend Performance
- [ ] Bundle size is optimized
- [ ] Images are compressed
- [ ] Code splitting is implemented
- [ ] Lazy loading is used
- [ ] CDN is configured (if applicable)
- [ ] Page load time is acceptable (<3s)

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Backend unit tests pass
- [ ] Frontend unit tests pass
- [ ] Code coverage is >80%

### Integration Tests
- [ ] API integration tests pass
- [ ] Database integration tests pass
- [ ] Frontend-backend integration tests pass

### End-to-End Tests
- [ ] User workflows are tested
- [ ] Error scenarios are tested
- [ ] Edge cases are tested

### Security Tests
- [ ] SQL injection tests pass
- [ ] XSS tests pass
- [ ] CSRF tests pass
- [ ] Authentication tests pass
- [ ] Authorization tests pass

### Performance Tests
- [ ] Load testing completed
- [ ] Stress testing completed
- [ ] Response times are acceptable
- [ ] Database performance is acceptable

---

## 📝 Documentation Checklist

### Code Documentation
- [ ] Code comments are clear
- [ ] Functions have docstrings
- [ ] Complex logic is explained
- [ ] API endpoints are documented

### User Documentation
- [ ] Setup guide is complete
- [ ] API documentation is complete
- [ ] Troubleshooting guide is complete
- [ ] FAQ is available

### Operational Documentation
- [ ] Deployment guide is complete
- [ ] Monitoring guide is complete
- [ ] Backup/restore procedures are documented
- [ ] Incident response procedures are documented

---

## 🔍 Pre-Deployment Testing

### Health Checks
- [ ] Backend health endpoint responds: `GET /health`
- [ ] Database connection is working
- [ ] Gemini API is working
- [ ] Frontend loads without errors

### API Testing
- [ ] All endpoints are tested
- [ ] Error responses are correct
- [ ] API key validation works
- [ ] CORS is working

### Database Testing
- [ ] Patient creation works
- [ ] Patient retrieval works
- [ ] Disease code mapping works
- [ ] Diagnosis/treatment storage works

### AI Testing
- [ ] AI overview generation works
- [ ] Multi-language support works
- [ ] Caching works
- [ ] Error handling works

---

## 📋 Deployment Steps

### 1. Pre-Deployment
- [ ] All checklist items above are completed
- [ ] Code review is completed
- [ ] Tests are passing
- [ ] Documentation is updated

### 2. Backup
- [ ] Database backup is created
- [ ] Code backup is created
- [ ] Configuration backup is created

### 3. Deploy Backend
```bash
cd backend
pip install -r requirements.txt
# Set environment variables
export MONGODB_URI=...
export GEMINI_API_KEY=...
export API_KEY=...
# Run server
python start_server.py
```

### 4. Deploy Frontend
```bash
cd frontend
npm install
npm run build
# Deploy build directory to web server
```

### 5. Post-Deployment
- [ ] Health checks pass
- [ ] API endpoints respond
- [ ] Frontend loads
- [ ] Database is accessible
- [ ] Monitoring is active
- [ ] Alerts are configured

### 6. Verification
- [ ] Users can access the application
- [ ] All features work correctly
- [ ] Performance is acceptable
- [ ] No errors in logs

---

## 🚨 Rollback Plan

### If Deployment Fails
1. [ ] Stop the new deployment
2. [ ] Restore from backup
3. [ ] Verify system is working
4. [ ] Investigate the issue
5. [ ] Fix the issue
6. [ ] Test thoroughly
7. [ ] Retry deployment

### Rollback Commands
```bash
# Restore database
mongorestore --uri "mongodb+srv://..." --archive=backup.archive

# Restore code
git checkout previous-tag

# Restart services
systemctl restart ayur-setu-backend
systemctl restart ayur-setu-frontend
```

---

## 📞 Post-Deployment Support

### Monitoring
- [ ] Set up application monitoring (New Relic, DataDog, etc.)
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up log aggregation (ELK, Splunk, etc.)
- [ ] Set up uptime monitoring (Pingdom, etc.)

### Alerts
- [ ] High error rate alert
- [ ] High response time alert
- [ ] Database connection alert
- [ ] API key expiration alert
- [ ] Disk space alert
- [ ] Memory usage alert

### Support
- [ ] Support team is trained
- [ ] Documentation is available
- [ ] Escalation procedures are defined
- [ ] On-call rotation is set up

---

## 📊 Production Environment Variables

```bash
# API Configuration
API_KEY=<strong-random-key>
USE_AUTH=True

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=AyurSetu

# Gemini AI
GEMINI_API_KEY=<your-gemini-api-key>

# Frontend Origins (production domain only)
FRONTEND_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# ABDM OAuth (if applicable)
ABDM_AUTH_URL=https://abdm-production/auth
ABDM_TOKEN_URL=https://abdm-production/token
ABDM_JWKS_URL=https://abdm-production/jwks
ABDM_ISSUER=https://abdm-production
ABDM_CLIENT_ID=<your-client-id>
ABDM_CLIENT_SECRET=<your-client-secret>
ABDM_REDIRECT_URI=https://yourdomain.com/auth/callback

# Session Encryption
SESSION_ENC_KEY=<strong-random-key>
```

---

## ✅ Final Sign-Off

- [ ] All checklist items completed
- [ ] All tests passing
- [ ] All documentation updated
- [ ] Backup verified
- [ ] Rollback plan tested
- [ ] Team trained
- [ ] Monitoring configured
- [ ] Support ready

**Deployment Approved By**: _________________ **Date**: _________

---

**Last Updated**: April 2026
**Version**: 1.0
