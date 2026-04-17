# 🚀 Deployment Guide: Netlify + Render

## Overview
- **Frontend**: Deployed to Netlify  
- **Backend**: Deployed to Render  
- **Database**: MongoDB Atlas (Cloud)

---

## ✅ FRONTEND DEPLOYMENT (Netlify)

### Step 1: Sign up on Netlify
1. Go to https://app.netlify.com
2. Sign up with GitHub (recommended)

### Step 2: Connect Repository
1. Click "Add new site" → "Import an existing project"
2. Select GitHub → Choose your repository

### Step 3: Configure Build
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`
- **Base directory**: `frontend/`

### Step 4: Add Environment Variables
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add variable:
   ```
   VITE_API_URL=https://italuverse-api.onrender.com/api
   ```
   (Replace with your actual Render backend URL)

### Step 5: Deploy
- Click **Deploy site**
- You'll get a URL like: `https://your-site-name.netlify.app`

✅ **Frontend is now live!**

---

## ✅ BACKEND DEPLOYMENT (Render)

### Step 1: Sign up on Render
1. Go to https://render.com
2. Sign up with GitHub (recommended)

### Step 2: Create Web Service
1. Click **New+** → **Web Service**
2. Connect your GitHub repository
3. Choose your repo

### Step 3: Configure Service
| Setting | Value |
|---------|-------|
| Name | `italuverse-api` |
| Environment | `Node` |
| Region | `Oregon` (or closest to you) |
| Branch | `main` |
| Build Command | `cd backend3 && npm install` |
| Start Command | `cd backend3 && npm start` |
| Root Directory | (leave empty) |

### Step 4: Add Environment Variables
Click **Environment** and add these from your `.env`:

```
MONGODB_URI=mongodb+srv://dolumakwana93_db_user:Kashis%4093dolu@cluster0.aukjhjl.mongodb.net/alumni?retryWrites=true&w=majority
JWT_SECRET=mysecret123
FRONTEND_URL=https://your-netlify-url.netlify.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ldalumniportal@gmail.com
SMTP_PASS=nwsx ljcv efyv pdep
CLOUDINARY_CLOUD_NAME=dv0heb3cz
CLOUDINARY_API_KEY=319783391542449
CLOUDINARY_API_SECRET=VKeGt-LWn5fqk7Fc_XosDOXhK3g
```

### Step 5: Deploy
1. Click **Create Web Service**
2. Wait 5-10 minutes for deployment
3. You'll get a URL like: `https://italuverse-api.onrender.com`

✅ **Backend is now live!**

---

## 🔗 Connect Frontend to Backend

### After Backend is Deployed:
1. Get your Render backend URL (e.g., `https://italuverse-api.onrender.com`)
2. Go to your Netlify site settings
3. Update environment variable:
   ```
   VITE_API_URL=https://italuverse-api.onrender.com/api
   ```
4. Trigger redeploy via Netlify dashboard

---

## 📝 Testing After Deployment

1. Open your Netlify frontend URL
2. Try logging in (should now work with MongoDB)
3. Try accessing alumni directory
4. Check browser console for any errors

---

## ⚠️ Common Issues & Solutions

### Issue: Frontend can't connect to backend
**Solution**: 
- Check VITE_API_URL is correct
- Verify Render backend is running (check Render logs)
- Check CORS settings in backend

### Issue: Database not connecting on Render
**Solution**:
- Verify MONGODB_URI is exactly correct
- Add Render IP to MongoDB Atlas whitelist
- Check MongoDB user credentials

### Issue: "Port already in use" on Render
**Solution**:
- Render auto-manages ports (not 4001)
- Backend will run on assigned port
- No configuration needed

---

## 💾 After Deployment

### Update Your .env Files:

**Frontend (.env.production)**
```
VITE_API_URL=https://italuverse-api.onrender.com/api
```

**Backend (via Render dashboard)**
```
MONGODB_URI=...
JWT_SECRET=...
FRONTEND_URL=https://your-netlify-site.netlify.app
...
```

---

## 🎯 Final URLs

After deployment you'll have:

- **Frontend**: `https://your-site.netlify.app`
- **Backend API**: `https://italuverse-api.onrender.com/api`
- **Live app**: `https://your-site.netlify.app` → connects to backend

---

## 📱 Testing Flows

### Test Authentication:
1. Go to login page
2. Enter credentials
3. Should authenticate with Render backend + MongoDB

### Test Alumni Directory:
1. Go to Directory
2. Filter by department and batch
3. Should show alumni from MongoDB

### Test Messages:
1. Send message to another user
2. Should store in MongoDB via Render backend

---

## ✅ Success!
When everything works:
- Authentication ✅
- Alumni directory showing ✅
- Messages sending ✅
- Database connected ✅

Your app is now **LIVE IN THE CLOUD**! 🎉
