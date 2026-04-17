# Italuverse - Alumni Portal 🎓

A modern full-stack MERN application for alumni networking, professional connections, opportunities, and community engagement.

## 🌟 Features

- **User Authentication** - Secure login and registration
- **Alumni Directory** - Browse and filter alumni by department and batch
- **Professional Profiles** - Showcase skills, experience, and achievements
- **Real-time Messaging** - Socket.IO powered instant messaging
- **Opportunities** - Post and discover internships, jobs, and partnerships
- **Events Management** - Create and attend alumni events
- **Challenges & Achievements** - Community engagement activities
- **Startup Connections** - Connect with entrepreneurial alumni
- **Activity Feed** - Share and discover updates from your network
- **Recommendations** - Get personalized connection suggestions

## 🏗️ Project Structure

```
italuverse-main/
├── frontend/                 # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── features/        # Feature modules (auth, profiles, etc.)
│   │   ├── contexts/        # React Context (auth, notifications, etc.)
│   │   ├── services/        # API & external services
│   │   └── utils/           # Helper utilities
│   ├── public/              # Static assets
│   └── package.json
│
├── backend3/                # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── models/          # MongoDB schemas
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper utilities
│   ├── scripts/             # Data import scripts
│   ├── data/                # CSV data files
│   └── package.json
│
├── DEPLOYMENT_GUIDE.md      # Deployment instructions
├── CLEANUP_AND_GITHUB_GUIDE.md  # GitHub setup guide
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)
- Git

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`

### Backend Setup

```bash
cd backend3
npm install
npm start
```
Backend will run on `http://localhost:4001`

## 🔧 Configuration

### Environment Variables

#### Frontend (`.env.local`)
```
VITE_API_URL=http://localhost:4001/api
```

#### Backend (`.env`)
```
MONGODB_URI=mongodb+srv://[user]:[password]@[cluster].mongodb.net/alumni
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
PORT=4001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📦 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time server
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image hosting
- **Nodemailer** - Email service

## 🌐 Deployment

### Frontend → Vercel
1. Push code to GitHub
2. Create account on Vercel
3. Connect GitHub repository
4. Configure build settings
5. Add environment variables
6. Deploy!

### Backend → Render
1. Create account on Render
2. New Web Service (connect GitHub)
3. Configure:
   - Root directory: `backend3`
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variables
5. Deploy!

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📖 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Alumni Directory
- `GET /api/alumni/directory` - Get all alumni
- `GET /api/alumni/profile/:id` - Get specific alumni profile
- `PUT /api/alumni/update-profile` - Update profile (protected)

### Messages
- `GET /api/chats` - Get all conversations
- `POST /api/chats/create` - Create new chat
- `POST /api/chats/:chatId/messages` - Send message

### Connections
- `GET /api/connections` - Get user connections
- `POST /api/connections/request` - Send connection request
- `POST /api/connections/:requestId/accept` - Accept request
- `DELETE /api/connections/:id` - Remove connection

### Posts & Feed
- `GET /api/posts` - Get feed posts
- `POST /api/posts/create` - Create post
- `POST /api/posts/:id/like` - Like post
- `POST /api/posts/:id/comment` - Comment on post

### Opportunities
- `GET /api/opportunities` - Get all opportunities
- `POST /api/opportunities/create` - Create opportunity
- `POST /api/opportunities/:id/apply` - Apply to opportunity

## 🔐 Security Features

- JWT-based authentication
- Password hashing with Bcrypt
- CORS protection
- Input validation
- SQL injection prevention (MongoDB)
- XSS protection
- Environment variable protection

## 🚧 Known Limitations

- Local MongoDB connection may fail on restricted networks
- Image uploads limited to 5MB
- Real-time features require WebSocket support

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Add your IP to MongoDB Atlas whitelist
- Check credentials in `.env`
- Verify database user permissions

### CORS Errors
- Ensure `FRONTEND_URL` is correct in backend
- Check port numbers match configuration

### Email Not Sending
- Configure SMTP credentials (Gmail App Password)
- Enable "Less secure app access" if using Gmail

## 🔄 Data Management

### Import Alumni Data
```bash
cd backend3
node scripts/importAlumni.js data/alumni.csv
```

### Force Reimport
```bash
node scripts/importAlumni.js data/alumni.csv --force
```

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

Created for LDCE Alumni Community

## 💡 Support

For issues or questions:
1. Check existing GitHub issues
2. Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. Review [CLEANUP_AND_GITHUB_GUIDE.md](./CLEANUP_AND_GITHUB_GUIDE.md)

---

**Status**: Ready for Production ✅
**Last Updated**: April 2026
**Version**: 1.0.0

Happy networking! 🚀
