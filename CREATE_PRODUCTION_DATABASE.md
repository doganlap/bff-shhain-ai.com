# Creating Database from Vercel Production Environment

## Step-by-Step Guide

### 1. Access Vercel Dashboard
```
Open: https://vercel.com/dashboard
```

### 2. Select Your Project
- Find your Shahin-AI project
- Click on it to enter the project dashboard

### 3. Navigate to Storage
- Click on the **"Storage"** tab in the left sidebar
- This shows all your databases and storage solutions

### 4. Create New Database
- Click the **"Create Database"** button
- Select **"Postgres"** as the database type
- Choose your preferred region (closest to your users)

### 5. Configure Database
- **Database Name**: Choose one:
  - `shahin-main-db` (recommended first)
  - `shahin-compliance-db`
  - `shahin-vector-db`
  - `shahin-controls-db`

- **Plan**: Start with Free tier (512MB)
- Click **"Create"**

### 6. Wait for Creation
- Vercel will take 2-3 minutes to create the database
- You'll see a progress indicator

### 7. Copy Connection String
- Once created, click on your new database
- Go to the **".env.local"** tab
- Copy the `DATABASE_URL` value
- It will look like:
```
postgresql://username:password@host:5432/database_name
```

### 8. Set Environment Variables
- Go back to your project dashboard
- Click **"Settings"** → **"Environment Variables"**
- Add new environment variable:
  - **Name**: `DATABASE_URL` (or specific name like `SHAHIN_MAIN_DB_URL`)
  - **Value**: Paste the connection string
  - **Environment**: Select **"Production"**
- Click **"Save"**

### 9. Redeploy Application
```bash
# Redeploy to apply new environment variables
vercel --prod
```

### 10. Verify Database Connection
After redeployment:
- Check Vercel function logs
- Test database connection
- Verify tables are created (if using migrations)

## Database Specifications

### shahin-main-db (Recommended First)
- **Purpose**: Core GRC application
- **Tables**: 300+ enterprise tables
- **Data**: User management, assessments, frameworks
- **Size Estimate**: 1-5 GB depending on usage

### shahin-compliance-db
- **Purpose**: Saudi compliance tracking
- **Tables**: 20+ compliance-specific tables
- **Data**: SAMA, NCA, MOH compliance data
- **Size Estimate**: 500MB - 2GB

### shahin-vector-db
- **Purpose**: AI/ML embeddings
- **Tables**: 6 vector-specific tables
- **Data**: AI-generated embeddings
- **Size Estimate**: 5-20 GB (depends on content)

### shahin-controls-db
- **Purpose**: Security controls library
- **Tables**: 1 main table
- **Data**: 5000+ security controls
- **Size Estimate**: 100-500 MB

## Troubleshooting

### Database Creation Fails
- Check if you have available Vercel credits
- Try a different region
- Contact Vercel support

### Connection Issues
- Verify DATABASE_URL format
- Check firewall settings
- Ensure environment variables are set correctly

### Migration Issues
- Run migrations locally first
- Check Prisma schema validity
- Verify database permissions

## Cost Information

- **Free Tier**: 512MB storage
- **Paid Tier**: $0.0005 per GB per hour
- **Example**: 1GB database = ~$0.36/day
- **Monitoring**: Use Vercel's billing dashboard

## Next Steps After Creation

1. **Test Connection**: Verify app can connect
2. **Run Migrations**: Create database tables
3. **Import Data**: Add initial/seed data
4. **Monitor Usage**: Check storage and performance
5. **Scale Up**: Upgrade plan as needed
