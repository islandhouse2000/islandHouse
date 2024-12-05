# Island House Project

A Next.js application with real-time WebSocket functionality.

## Deployment Guide for Vercel

### Prerequisites

- A Vercel account
- Git installed on your machine
- Node.js 18+ installed
- MongoDB database setup

### Step 1: Prepare for Deployment

1. Make sure all changes are committed to your Git repository
2. Ensure your `.env.production` file is properly configured but not committed
3. Verify that `vercel.json` and `next.config.js` are properly set up

### Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 3: Deploy to Vercel

1. Login to Vercel:
```bash
vercel login
```

2. Deploy the project:
```bash
vercel
```

### Step 4: Configure Environment Variables

Set the following environment variables in your Vercel project settings:

- `NEXT_PUBLIC_FRONTEND_URL`: Your Vercel deployment URL
- `NEXT_PUBLIC_SOCKET_URL`: Your WebSocket URL (same as frontend URL)
- `MONGODB_URI`: Your MongoDB connection string
- `NEXTAUTH_URL`: Your Vercel deployment URL
- `NEXTAUTH_SECRET`: Your NextAuth secret key
- `JWT_SECRET`: Your JWT secret key

### Step 5: Enable WebSocket Support

1. Make sure your `vercel.json` configuration is correct
2. Verify that the WebSocket endpoint is properly configured
3. Check that CORS settings are properly set in `next.config.js`

### Step 6: Verify Deployment

1. Visit your deployed application
2. Check the browser console for WebSocket connection status
3. Test real-time functionality
4. Monitor Vercel logs for any issues

### Troubleshooting

If WebSocket connection fails:

1. Check environment variables in Vercel dashboard
2. Verify WebSocket endpoint configuration
3. Check browser console for connection errors
4. Review Vercel deployment logs

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file with required environment variables

4. Run the development server:
```bash
npm run dev
```

### Important Notes

- WebSocket connections require proper SSL configuration in production
- Make sure all environment variables are properly set in Vercel
- The custom server setup requires specific Vercel configuration
- MongoDB connection should be properly configured for production

## Project Structure

```
├── app/                  # Next.js app directory
├── components/          # React components
├── lib/                 # Utility functions and configurations
├── public/             # Static assets
├── server.ts           # Custom server configuration
├── vercel.json         # Vercel deployment configuration
└── next.config.js      # Next.js configuration
```

## Environment Variables

Required environment variables for production:

```env
NEXT_PUBLIC_FRONTEND_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SOCKET_URL=wss://your-domain.vercel.app
MONGODB_URI=your-mongodb-connection-string
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
JWT_SECRET=your-jwt-secret
```

## Support

For any deployment issues:
1. Check Vercel documentation
2. Review project issues
3. Contact project maintainers