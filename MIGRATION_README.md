# Shahin-AI Production Migration

## 🚀 Quick Start

### Windows
```cmd
# Run full migration
.\migrate-to-production.bat

# Or run specific steps
.\migrate-to-production.bat check     # Prerequisites
.\migrate-to-production.bat databases # Database guide
.\migrate-to-production.bat migrate   # Migrations only
.\migrate-to-production.bat deploy    # Deploy only
```

### Linux/Mac
```bash
# Make executable
chmod +x migrate-to-production.sh

# Run full migration
./migrate-to-production.sh

# Or run specific steps
./migrate-to-production.sh check     # Prerequisites
./migrate-to-production.sh databases # Database guide
./migrate-to-production.sh migrate   # Migrations only
./migrate-to-production.sh deploy    # Deploy only
```

## 📋 What the Script Does

1. **Prerequisites Check** - Node.js, npm, Vercel CLI
2. **Vercel Setup** - Login and project configuration
3. **Database Guide** - Instructions for manual DB creation
4. **Environment Setup** - Configure production variables
5. **Prisma Migrations** - Migrate all 4 databases
6. **Data Import** - Seed data and controls
7. **Vercel Deployment** - Deploy to production
8. **Verification** - Test production endpoints

## ⚠️ Manual Steps Required

The script will prompt you to:
1. **Create 4 Vercel Postgres databases manually**
2. **Provide connection strings**
3. **Add API keys** (OpenAI, Azure, etc.)

## 🎯 Production Databases

- `shahin-vector-db` - AI/ML embeddings
- `shahin-compliance-db` - Saudi GRC compliance
- `shahin-main-db` - Main application (300+ tables)
- `shahin-controls-db` - Enterprise security controls

## 📄 Files Created

- `.env.production` - Production environment variables
- Migration logs and status updates

## 🚨 Important Notes

- **Costs**: Vercel Postgres charges ~$0.0005/GB/hour
- **Manual DB Creation**: Required due to Vercel CLI limitations
- **API Keys**: Add your keys to `.env.production` before deployment
- **Backups**: Consider backup strategy for production data

## 🎊 Success Checklist

After running the script successfully:
- [ ] Vercel project deployed
- [ ] All 4 databases created and migrated
- [ ] Environment variables configured
- [ ] Production URL available
- [ ] Health checks passing
- [ ] Ready for production use

## 🆘 Troubleshooting

If the script fails:
1. Check Vercel login status: `vercel whoami`
2. Verify database connection strings
3. Check Prisma schema files
4. Review Vercel function logs
5. Test API endpoints manually

## 📞 Support

- Check `MANUAL_MIGRATION_GUIDE.md` for detailed steps
- Review Vercel dashboard for deployment status
- Test endpoints: `curl https://your-app.vercel.app/api/health`
