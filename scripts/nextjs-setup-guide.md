# Next.js Setup with Prisma Postgres

A complete automation script for setting up Next.js applications with Prisma Postgres and deploying to Vercel.

## Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the complete automated setup
node scripts/vercel-cli.js setup-nextjs
```

### Option 2: Manual Step-by-Step
```bash
# 1. Create Next.js project with Prisma template
npx create-next-app@latest --template prisma-postgres my-prisma-postgres-app
cd my-prisma-postgres-app
npm install

# 2. Connect to Vercel
vercel link

# 3. Pull database URL from Vercel
vercel env pull .env.development.local

# 4. Run migrations and seed database
npx prisma migrate dev --name init
npx prisma db seed

# 5. Deploy to Vercel
vercel deploy
```

## What the Automation Does

### 🚀 **setup-nextjs** Command
1. **Creates Next.js Project**
   - Uses official `prisma-postgres` template
   - Installs all dependencies
   - Sets up project structure

2. **Vercel Integration**
   - Links project to Vercel
   - Pulls environment variables
   - Configures deployment settings

3. **Database Setup**
   - Runs Prisma migrations
   - Seeds database with sample data
   - Configures database connection

4. **Deployment**
   - Deploys to Vercel
   - Sets up production environment
   - Provides deployment URLs

### 🔧 **setup-nextjs-vercel** Command
- Configures Vercel project settings via API
- Sets up environment variables
- Configures domains
- Manages deployment settings

## Project Structure

The created project includes:

```
my-prisma-postgres-app/
├── app/
│   ├── api/          # API routes
│   ├── posts/        # Posts CRUD pages
│   └── page.tsx      # Home page
├── prisma/
│   ├── schema.prisma # Database schema
│   └── seed.ts       # Database seeding
├── components/       # React components
├── lib/             # Utilities and database config
└── package.json     # Dependencies and scripts
```

## Environment Variables

The setup automatically configures:

```env
DATABASE_URL=postgres://...         # Prisma Postgres connection
NEXTAUTH_SECRET=...                 # Authentication secret
NEXTAUTH_URL=https://...           # App URL
NODE_ENV=production                # Environment
```

## Available Scripts

After setup, you can use:

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Open Prisma Studio
npx prisma migrate dev   # Run database migrations
npx prisma db seed       # Seed database
npx prisma generate      # Generate Prisma client

# Deployment
vercel deploy           # Deploy to preview
vercel --prod          # Deploy to production
```

## Features Included

### 📝 **CRUD Operations**
- Create, read, update, delete posts
- User management
- Database relationships

### 🎨 **Modern Stack**
- Next.js 14 with App Router
- TypeScript support
- Tailwind CSS for styling
- Prisma ORM with PostgreSQL

### 🔐 **Production Ready**
- Environment configuration
- Database migrations
- Error handling
- SEO optimization

### 🚀 **Deployment**
- Vercel integration
- Automatic deployments
- Environment management
- Domain configuration

## Troubleshooting

### Common Issues

1. **Vercel Authentication**
   ```bash
   vercel login  # Authenticate if needed
   ```

2. **Database Connection**
   - Ensure DATABASE_URL is correctly set
   - Check Vercel environment variables
   - Verify Prisma Postgres setup

3. **Migration Errors**
   ```bash
   npx prisma db push    # Alternative to migrate dev
   npx prisma generate   # Regenerate client
   ```

4. **Deployment Issues**
   ```bash
   vercel logs           # Check deployment logs
   vercel env ls         # List environment variables
   ```

### Manual Recovery

If automation fails, you can:

1. **Continue from any step** by running commands manually
2. **Check specific errors** in the console output
3. **Use Vercel dashboard** for environment variable management
4. **Run individual scripts** as needed

## Advanced Configuration

### Custom Environment Variables
```bash
# Add custom variables via CLI
node scripts/vercel-cli.js setup-env

# Or manually via Vercel
vercel env add CUSTOM_VAR
```

### Custom Domains
```bash
# Configure domains
node scripts/vercel-cli.js setup-domains my-prisma-postgres-app
```

### Team Management
```bash
# Manage team access
node scripts/vercel-cli.js team
```

## Integration with Existing Projects

To integrate with your existing GRC project:

1. **Copy generated components** to your project
2. **Adapt Prisma schema** for GRC use cases
3. **Modify API routes** for compliance data
4. **Update styling** to match your design system

## Next Steps

After successful setup:

1. **Customize the schema** in `prisma/schema.prisma`
2. **Add your business logic** to API routes
3. **Style components** to match your design
4. **Configure authentication** if needed
5. **Set up monitoring** and analytics

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Postgres](https://vercel.com/docs/storage/vercel-postgres)
