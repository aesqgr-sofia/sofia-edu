# Sofia Platform Deployment Guide

This guide will help you set up a complete CI/CD pipeline for the Sofia educational platform with AWS infrastructure.

## Architecture Overview

- **Frontend**: React application hosted on S3 with CloudFront CDN
- **Backend**: Django application deployed on AWS Elastic Beanstalk
- **Database**: PostgreSQL on AWS RDS
- **CI/CD**: GitHub Actions with dev/prod environments
- **Infrastructure**: AWS CloudFormation for infrastructure as code

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **GitHub Repository** for your code
3. **AWS CLI** installed and configured
4. **Domain Name** (optional, for custom domains)

## Step 1: AWS Setup

### 1.1 Install AWS CLI

```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Windows
# Download and run the AWS CLI MSI installer
```

### 1.2 Configure AWS CLI

```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region, and Output format
```

### 1.3 Create IAM User for GitHub Actions

Create an IAM user with the following policies:
- `AmazonS3FullAccess`
- `CloudFrontFullAccess`
- `AWSElasticBeanstalkFullAccess`
- `AmazonRDSFullAccess`
- `AmazonVPCFullAccess`
- `CloudFormationFullAccess`

Save the Access Key ID and Secret Access Key for GitHub Actions.

## Step 2: Deploy AWS Infrastructure

### 2.1 Deploy Development Environment

```bash
./scripts/deploy-infrastructure.sh dev
```

### 2.2 Deploy Production Environment

```bash
./scripts/deploy-infrastructure.sh prod
```

### 2.3 Save Stack Outputs

After deployment, save the following outputs for GitHub Actions secrets:

- `FrontendBucketName`
- `FrontendDistributionId`
- `EBDeploymentBucketName`
- `BackendURL`
- `DatabaseEndpoint`

## Step 3: Configure GitHub Actions

### 3.1 Set up GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

#### AWS Configuration
- `AWS_ACCESS_KEY_ID`: IAM user access key
- `AWS_SECRET_ACCESS_KEY`: IAM user secret key

#### Development Environment
- `DEV_S3_BUCKET`: Frontend S3 bucket name (dev)
- `DEV_CLOUDFRONT_ID`: CloudFront distribution ID (dev)
- `DEV_API_URL`: Backend URL (dev)

#### Production Environment
- `PROD_S3_BUCKET`: Frontend S3 bucket name (prod)
- `PROD_CLOUDFRONT_ID`: CloudFront distribution ID (prod)
- `PROD_API_URL`: Backend URL (prod)

#### Elastic Beanstalk
- `EB_S3_BUCKET`: Deployment bucket name

### 3.2 Set up GitHub Environments

1. Go to Settings → Environments
2. Create two environments: `development` and `production`
3. For production, add protection rules:
   - Required reviewers
   - Wait timer (optional)
   - Restrict to main branch

## Step 4: Configure Backend Environment Variables

### 4.1 Development Environment Variables

In your Elastic Beanstalk dev environment, set:

```
DJANGO_SETTINGS_MODULE=sofia_project.settings.development
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://user:pass@host:port/db
CORS_ALLOWED_ORIGINS=https://your-dev-frontend-url.com
```

### 4.2 Production Environment Variables

In your Elastic Beanstalk prod environment, set:

```
DJANGO_SETTINGS_MODULE=sofia_project.settings.production
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgres://user:pass@host:port/db
CORS_ALLOWED_ORIGINS=https://your-prod-frontend-url.com
AWS_STORAGE_BUCKET_NAME=your-static-files-bucket
SECURE_SSL_REDIRECT=True
```

## Step 5: Set up Local Development

### 5.1 Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 5.2 Manual Setup

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export DJANGO_SETTINGS_MODULE=sofia_project.settings.development
export DB_HOST=localhost
export DB_NAME=sofia_db
export DB_USER=sofia_user
export DB_PASSWORD=sofia_password

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

#### Frontend Setup

```bash
cd frontend
npm install

# Set environment variables
export REACT_APP_API_URL=http://localhost:8000

# Start development server
npm start
```

## Step 6: Deployment Workflow

### 6.1 Development Deployment

1. Push to `develop` branch
2. GitHub Actions will:
   - Run tests
   - Deploy to dev environment
   - Update dev frontend and backend

### 6.2 Production Deployment

1. Create pull request to `main` branch
2. After review and merge:
   - GitHub Actions will deploy to dev first
   - Then deploy to production (with approval if configured)

## Step 7: Monitoring and Maintenance

### 7.1 Monitoring

- **CloudWatch**: Monitor Elastic Beanstalk and RDS metrics
- **CloudFront**: Monitor CDN performance
- **GitHub Actions**: Monitor deployment status

### 7.2 Backup Strategy

- **Database**: Automated RDS backups (7 days retention)
- **Static Files**: S3 versioning enabled
- **Code**: Git repository with proper branching strategy

### 7.3 Scaling

- **Backend**: Auto-scaling configured in Elastic Beanstalk
- **Database**: Can be upgraded to larger instance types
- **Frontend**: CloudFront provides global CDN

## Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check GitHub Actions logs
   - Verify AWS credentials and permissions
   - Check CloudFormation events

2. **Database Connection Issues**
   - Verify security group rules
   - Check database credentials
   - Ensure VPC configuration is correct

3. **Frontend Not Loading**
   - Check S3 bucket policy
   - Verify CloudFront distribution
   - Check CORS settings

4. **SSL/HTTPS Issues**
   - Ensure CloudFront is configured for HTTPS
   - Check security headers in Django settings

### Getting Help

- Check AWS CloudFormation events
- Review Elastic Beanstalk logs
- Monitor GitHub Actions workflow logs
- Check application logs in CloudWatch

## Security Considerations

1. **Secrets Management**: Use GitHub Secrets for sensitive data
2. **Database Security**: RDS in private subnets
3. **HTTPS**: Enforced via CloudFront and Django settings
4. **Access Control**: IAM roles with minimal permissions
5. **Network Security**: VPC with security groups

## Cost Optimization

1. **Development**: Use t3.micro instances
2. **Production**: Monitor and adjust instance sizes
3. **Storage**: Implement S3 lifecycle policies
4. **Database**: Use appropriate instance sizes
5. **Monitoring**: Set up billing alerts

---

For additional support or questions, refer to the AWS documentation or create an issue in the repository. 