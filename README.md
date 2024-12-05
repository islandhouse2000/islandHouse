# Island House - Deployment Guide

## Project Overview
A Next.js 14 application with real-time features, authentication, and payment processing capabilities.

## Prerequisites
- Node.js 18.x or later
- A Vercel account
- MongoDB Atlas account

## Environment Variables Setup
1. In your Vercel project settings, add the following environment variables:

```env
# Frontend URL (Update with your Vercel domain)
NEXT_PUBLIC_FRONTEND_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_SOCKET_URL=https://your-vercel-domain.vercel.app

# NextAuth Configuration
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# MongoDB Configuration
MONGODB_URI=your-mongodb-connection-string
```

## Deployment Steps

1. Push your code to GitHub

2. In Vercel Dashboard:
   - Create a new project
   - Import your GitHub repository
   - Configure environment variables
   - Deploy the project

3. After deployment:
   - Update MongoDB Network Access to allow connections from Vercel's IP addresses
   - Add your Vercel deployment URL to MongoDB Atlas IP whitelist
   - Update your application's CORS settings if necessary

## Important Notes

1. WebSocket Configuration:
   - WebSocket connections are handled through Next.js API routes
   - Socket.IO path is set to `/api/socket`
   - Make sure your client connects to the WebSocket endpoint using the correct URL

2. Authentication:
   - The application uses NextAuth.js for authentication
   - Credentials provider is configured for email/password login
   - Google OAuth can be added by configuring the provider in your Google Cloud Console

3. Database:
   - MongoDB connection is handled through Mongoose
   - Connection pooling is configured for optimal performance
   - Make sure your MongoDB Atlas cluster is properly configured for production use

## Troubleshooting

1. If WebSocket connections fail:
   - Check that your environment variables are correctly set
   - Verify that the Socket.IO path matches in both client and server code
   - Ensure your Vercel domain is properly configured in CORS settings

2. If database connections fail:
   - Verify your MongoDB connection string
   - Check MongoDB Atlas network access settings
   - Ensure your database user has proper permissions

3. For authentication issues:
   - Verify NextAuth secret is properly set
   - Check that your JWT secret is configured
   - Ensure your authentication callbacks are properly handling user sessions

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with your environment variables

3. Run the development server:
```bash
npm run dev
```

## Support
For any deployment issues or questions, please contact support at fazeenlancer@gmail.com