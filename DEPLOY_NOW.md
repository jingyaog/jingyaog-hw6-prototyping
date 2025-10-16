# Deploy to Vercel Now - Quick Guide

The frontend is now ready to deploy to Vercel with **zero configuration needed**. No backend or database required!

## ✅ What's Ready

- Frontend builds successfully
- Mock data system fully functional
- All features work (upload, progress tracking, retry, cancel)
- Real-time updates via custom events
- Production-ready configuration

## 🚀 Deploy in 2 Minutes

### Option 1: Vercel Dashboard (Easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository: `jingyaog/jingyaog-hw6-prototyping`
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Branch**: `prototype_A`
4. Click **Deploy**
5. Done! Your app is live 🎉

### Option 2: Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

That's it!

## 🎯 What You Get

When deployed, you'll have a fully functional job queue manager:

1. **Drag & Drop Upload** - Upload multiple files
2. **Live Job Queue** - See jobs process in real-time
3. **Progress Tracking** - Visual progress bars (0% → 100%)
4. **Job Actions** - Retry failed jobs, cancel running jobs
5. **Status Updates** - Jobs update every 2 seconds
6. **80% Success Rate** - Some jobs fail for testing

## 🔧 Environment Variables

**No environment variables needed!** The app is pre-configured to use mock data.

If you want to customize:
- `VITE_USE_MOCK=true` (already set in vercel.json)

## 📱 Testing Your Deployment

After deployment:

1. **Upload Files**: Drag any files onto the upload area
2. **Watch Processing**: Jobs go from PENDING → PROCESSING → COMPLETED/FAILED
3. **Try Actions**:
   - Click ❌ to cancel a processing job
   - Click 🔄 to retry a failed job
4. **Multiple Jobs**: Upload multiple times to see the queue in action

## 🔄 How Mock Data Works

The frontend simulates a complete backend:

- **File Upload**: Creates job with file names
- **Processing**:
  - Starts at 0%, increases 20% every 2 seconds
  - Reaches 100% after 10 seconds
- **Success Rate**: 80% complete successfully, 20% fail
- **Real-time Updates**: Custom events update the UI automatically
- **Persistent**: Jobs stay in memory during the session

## 🌐 Example Deployment

Once deployed, your URL will look like:
```
https://your-app-name.vercel.app
```

Share it! Everything works without a backend.

## 🔌 Want to Connect a Real Backend?

If you want to add a real backend later:

1. Deploy backend to Railway/Render/Fly.io
2. Set these environment variables in Vercel:
   ```
   VITE_USE_MOCK=false
   VITE_API_URL=https://your-backend.railway.app/api
   VITE_WS_URL=wss://your-backend.railway.app/ws
   ```
3. Redeploy frontend

The app will automatically switch to using the real backend!

## 📊 Build Stats

- **Build Time**: ~6 seconds
- **Bundle Size**: 427 KB (137 KB gzipped)
- **No Build Errors**: ✓
- **TypeScript**: ✓
- **Production Ready**: ✓

## 🐛 Troubleshooting

**Build fails?**
- Check that `VITE_USE_MOCK=true` is set
- Verify you're deploying from the `frontend` directory
- Make sure framework is set to Vite

**Jobs not updating?**
- Check browser console for errors
- Refresh the page
- Jobs update every 2 seconds (be patient!)

**Nothing happens when uploading?**
- Make sure you clicked "Upload Files" button
- Check that mock mode is enabled (console will say "Using mock data")

## 🎉 That's It!

Your app is production-ready and will work perfectly on Vercel. No backend setup, no database configuration, no complex deployment. Just deploy and it works!

---

**Need Help?** Check the main [DEPLOYMENT.md](./DEPLOYMENT.md) for more details.
