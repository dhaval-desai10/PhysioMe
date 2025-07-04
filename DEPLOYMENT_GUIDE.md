# PhysioMe Deployment Guide

## Quick Deployment Options

### Option 1: Railway (Recommended - Easy and Free)

1. **Setup MongoDB Atlas (Database)**

   - Go to https://www.mongodb.com/atlas
   - Create free account
   - Create cluster
   - Create database user
   - Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/physiome`

2. **Deploy to Railway**
   - Go to https://railway.app
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your PhysioMe repository
   - Set root directory: `Backend`
   - Add environment variables:
     ```
     NODE_ENV=production
     MONGODB_URI=your-mongodb-atlas-connection-string
     JWT_SECRET=your-super-secret-key-here
     JWT_EXPIRE=7d
     JWT_COOKIE_EXPIRE=7
     CLOUDINARY_CLOUD_NAME=dv3yn0q6f
     CLOUDINARY_API_KEY=421592261941143
     CLOUDINARY_API_SECRET=MHajWwMIwf8uzJdZEsAqnpuBEMQ
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your-email@gmail.com
     SMTP_PASS=your-gmail-app-password
     FROM_NAME=PhysioMe
     FROM_EMAIL=your-email@gmail.com
     ```
   - Deploy and get your Railway URL

### Option 2: Render (Alternative)

1. **Deploy to Render**
   - Go to https://render.com
   - Connect GitHub
   - Create "Web Service"
   - Select PhysioMe repository
   - Set root directory: `Backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Add same environment variables as Railway

### Option 3: Heroku (If you have account)

1. **Deploy to Heroku**
   - Install Heroku CLI
   - `heroku create your-app-name`
   - Set environment variables: `heroku config:set MONGODB_URI=...`
   - `git subtree push --prefix Backend heroku main`

## Pre-Deployment Checklist

✅ Frontend is built (dist/ folder exists)
✅ Backend serves frontend files
✅ MongoDB Atlas database ready
✅ Environment variables configured
✅ Gmail app password ready
✅ Cloudinary credentials ready

## After Deployment

1. Test the deployed URL
2. Create admin user
3. Test all features
4. Monitor logs for errors

## Security Notes

- Use strong JWT_SECRET (32+ characters)
- Enable MongoDB Atlas IP whitelist
- Use Gmail App Passwords (not regular password)
- Enable 2FA on all service accounts

## Support

If you encounter issues:

1. Check deployment logs
2. Verify environment variables
3. Test database connection
4. Check CORS settings
