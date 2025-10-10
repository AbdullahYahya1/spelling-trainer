# Spelling Trainer

A full-stack spelling practice application with React frontend and .NET Core API backend.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- .NET 9 SDK
- PowerShell (for deployment)

### Project Structure
```
spelling-trainer/
├── backend/SpellingTrainer.API/     # .NET Core API
├── src/                             # React frontend
├── public/                          # Static assets
├── deploy-api.ps1                   # API deployment script
├── upload.ps1                       # Legacy uploader
└── README.md                        # This file
```

## 🛠️ Development Setup

### 1. Backend API Setup
```bash
# Navigate to API directory
cd backend/SpellingTrainer.API

# Restore packages
dotnet restore

# Run database migrations
dotnet ef database update

# Start the API (runs on http://localhost:5009)
dotnet run
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm start
```

## 📦 Build & Deploy

### API Deployment

The API is deployed to `https://apiforspelling.somee.com` using FTP.

#### Option 1: Automated Deployment (Recommended)
```powershell
# Build and deploy everything
.\deploy-api.ps1

# Only build (don't upload)
.\deploy-api.ps1 -BuildOnly

# Only upload existing build
.\deploy-api.ps1 -UploadOnly

# Show help
.\deploy-api.ps1 -Help
```

#### Option 2: Manual Steps
```bash
# 1. Build the API
cd backend/SpellingTrainer.API
dotnet publish -c Release -o publish --self-contained false

# 2. Upload using the legacy script
cd ../..
.\upload.ps1
```

### Frontend Deployment

The frontend is deployed to Vercel at `https://spelling-trainer-ruby.vercel.app`.

```bash
# Build for production
npm run build

# Deploy to Vercel (if you have Vercel CLI)
vercel --prod
```

## 🔧 Configuration

### API Configuration
- **Database**: SQL Server (configured in `appsettings.json`)
- **Authentication**: JWT tokens
- **CORS**: Configured for frontend domains
- **Swagger**: Available at `/swagger` endpoint

### Frontend Configuration
- **API Endpoint**: `https://apiforspelling.somee.com`
- **Theme**: Dark/Light mode support
- **Storage**: Local storage with online sync

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/validate` - Validate JWT token

### Words
- `GET /api/words` - Get all words
- `POST /api/words` - Add new word
- `PUT /api/words/{id}` - Update word
- `DELETE /api/words/{id}` - Delete word

### Streaks
- `GET /api/streak` - Get user streak
- `PUT /api/streak` - Update streak

## 🗄️ Database

The application uses Entity Framework Core with SQL Server:

### Models
- **User**: User accounts with authentication
- **Word**: Spelling words with descriptions
- **Streak**: User practice streaks

### Migrations
```bash
# Add new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update
```

## 🧪 Testing

### API Testing
```bash
# Test login
curl -X POST "https://apiforspelling.somee.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"string","password":"string"}'

# Test streak (requires JWT token)
curl -X GET "https://apiforspelling.somee.com/api/streak" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Frontend Testing
```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 🚨 Troubleshooting

### Common Issues

1. **API not starting**
   - Check if port 5009 is available
   - Verify database connection string
   - Run `dotnet ef database update`

2. **Frontend not connecting to API**
   - Check API URL in `src/services/api.js`
   - Verify CORS configuration in API
   - Check browser console for errors

3. **Deployment fails**
   - Verify FTP credentials in `deploy-api.ps1`
   - Check if publish folder exists
   - Run with `-BuildOnly` first to test build

### Logs
- **API Logs**: Check console output when running `dotnet run`
- **Frontend Logs**: Check browser developer console
- **Deployment Logs**: Check PowerShell output

## 📝 Development Notes

### Adding New Features
1. **API**: Add controllers, models, and DTOs
2. **Database**: Create migrations for schema changes
3. **Frontend**: Update services and components
4. **Deploy**: Use `deploy-api.ps1` for API updates

### Code Style
- **Backend**: Follow C# conventions
- **Frontend**: Use functional components with hooks
- **Database**: Use Entity Framework conventions

## 🔐 Security

- JWT tokens for authentication
- Password hashing with BCrypt
- CORS configured for specific domains
- Input validation on all endpoints

## 📞 Support

For issues or questions:
1. Check this README
2. Review error logs
3. Test with curl commands
4. Verify configuration files

---

**Happy Spelling! 🎯**