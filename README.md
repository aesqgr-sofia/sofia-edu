# Sofia Educational Platform

A comprehensive educational platform for managing learning situations, modules, and competence coverage visualization.

## 🚀 Quick Start

### Local Development Setup

1. **Automated Setup (Recommended)**
   ```bash
   ./scripts/setup-local-dev.sh
   ```

2. **Docker Setup**
   ```bash
   docker-compose up -d
   ```

3. **Manual Setup**
   See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin (admin/admin123)

## 🏗️ Architecture

### Frontend (React)
- Modern React application with hooks and context
- Responsive design with mobile support
- Internationalization (i18n) support
- Advanced features like competence coverage visualization

### Backend (Django)
- Django REST Framework API
- PostgreSQL database
- Token-based authentication
- Comprehensive admin interface

### Key Features
- **Learning Situations Management**: Create and manage educational scenarios
- **Module System**: Reusable educational modules
- **Competence Coverage**: Visual analytics for competence fulfillment
- **Multi-language Support**: English and Spanish
- **Drag & Drop Interface**: Intuitive planning interface

## 🌐 Deployment

### AWS Infrastructure
The platform is designed for deployment on AWS with:
- **S3 + CloudFront**: Frontend hosting with global CDN
- **Elastic Beanstalk**: Backend application hosting
- **RDS PostgreSQL**: Managed database service
- **GitHub Actions**: CI/CD pipeline

### Deployment Workflow
1. **Development**: Push to `develop` branch → Auto-deploy to dev environment
2. **Production**: Merge to `main` branch → Deploy to staging → Production (with approval)

### Quick Deploy to AWS
```bash
# Deploy infrastructure
./scripts/deploy-infrastructure.sh dev
./scripts/deploy-infrastructure.sh prod

# Configure GitHub Actions secrets (see DEPLOYMENT_GUIDE.md)
```

## 📁 Project Structure

```
sofia/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── i18n/           # Internationalization
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
├── backend/                 # Django application
│   ├── apps/               # Django apps
│   │   ├── core/          # Core models and views
│   │   └── accounts/      # User management
│   ├── sofia_project/     # Django project settings
│   │   └── settings/      # Environment-specific settings
│   ├── requirements.txt   # Python dependencies
│   └── manage.py         # Django management script
├── aws/                   # AWS infrastructure
│   └── cloudformation/   # CloudFormation templates
├── scripts/              # Deployment and setup scripts
├── docker-compose.yml    # Local development with Docker
└── DEPLOYMENT_GUIDE.md   # Comprehensive deployment guide
```

## 🔧 Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Git

### Environment Variables

#### Backend (.env)
```bash
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=sofia_db
DB_USER=sofia_user
DB_PASSWORD=sofia_password
DB_HOST=localhost
DB_PORT=5432
```

#### Frontend (.env.local)
```bash
REACT_APP_API_URL=http://localhost:8000
```

### Development Commands

```bash
# Backend
cd backend
source venv/bin/activate
python manage.py runserver

# Frontend
cd frontend
npm start

# Database migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test
npm test
```

## 📊 Features

### Competence Coverage Visualization
- **Progress Tracking**: Visual indicators for competence fulfillment
- **Radar Charts**: Multi-dimensional competence analysis
- **Detailed Breakdown**: Drill-down into specific evaluation criteria
- **Color-coded Status**: Immediate visual feedback on coverage status

### Learning Situation Management
- **Drag & Drop Planning**: Intuitive interface for organizing modules
- **Timeline View**: Chronological organization of learning activities
- **Module Library**: Reusable educational content blocks
- **Competence Mapping**: Link modules to specific competences

### Multi-language Support
- **i18n Framework**: React-i18next integration
- **Dynamic Language Switching**: Runtime language changes
- **Localized Content**: Translated UI and educational content

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow
1. **Code Quality**: Linting and testing
2. **Build**: Frontend and backend builds
3. **Deploy Dev**: Automatic deployment to development environment
4. **Deploy Prod**: Manual approval for production deployment

### Environments
- **Development**: Automatic deployment from `develop` branch
- **Production**: Manual deployment from `main` branch with approval

## 📈 Monitoring & Maintenance

### AWS Services
- **CloudWatch**: Application and infrastructure monitoring
- **RDS Backups**: Automated database backups (7 days retention)
- **CloudFront Logs**: CDN access logs and analytics

### Local Monitoring
- **Django Admin**: Database management and monitoring
- **React DevTools**: Frontend debugging and profiling

## 🛠️ Troubleshooting

### Common Issues
1. **Database Connection**: Check PostgreSQL service status
2. **Frontend Build**: Clear npm cache and reinstall dependencies
3. **Backend Errors**: Check Django logs and database migrations
4. **AWS Deployment**: Verify IAM permissions and CloudFormation events

### Support
- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed troubleshooting
- Review GitHub Actions logs for CI/CD issues
- Monitor AWS CloudWatch for infrastructure problems

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Django and Django REST Framework communities
- React and React ecosystem contributors
- AWS documentation and community resources 