#!/bin/bash

# Sofia Platform Infrastructure Deployment Script
set -e

# Configuration
REGION=${AWS_REGION:-eu-west-1}
STACK_PREFIX="sofia-platform"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if AWS CLI is installed and configured
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_status "AWS CLI is configured and ready."
}

# Function to deploy CloudFormation stack
deploy_stack() {
    local environment=$1
    local db_password=$2
    local stack_name="${STACK_PREFIX}-${environment}"
    
    print_status "Deploying ${environment} environment..."
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$stack_name" --region "$REGION" &> /dev/null; then
        print_status "Stack $stack_name exists. Updating..."
        aws cloudformation update-stack \
            --stack-name "$stack_name" \
            --template-body file://aws/cloudformation/infrastructure.yml \
            --parameters ParameterKey=Environment,ParameterValue="$environment" \
                        ParameterKey=DBPassword,ParameterValue="$db_password" \
            --capabilities CAPABILITY_IAM \
            --region "$REGION" \
            --disable-rollback
        
        print_status "Waiting for stack update to complete..."
        aws cloudformation wait stack-update-complete \
            --stack-name "$stack_name" \
            --region "$REGION"
    else
        print_status "Stack $stack_name does not exist. Creating..."
        aws cloudformation create-stack \
            --stack-name "$stack_name" \
            --template-body file://aws/cloudformation/infrastructure.yml \
            --parameters ParameterKey=Environment,ParameterValue="$environment" \
                        ParameterKey=DBPassword,ParameterValue="$db_password" \
            --capabilities CAPABILITY_IAM \
            --region "$REGION" \
            --disable-rollback
        
        print_status "Waiting for stack creation to complete..."
        aws cloudformation wait stack-create-complete \
            --stack-name "$stack_name" \
            --region "$REGION"
    fi
    
    print_status "Stack $stack_name deployed successfully!"
}

# Function to get stack outputs
get_stack_outputs() {
    local environment=$1
    local stack_name="${STACK_PREFIX}-${environment}"
    
    print_status "Getting stack outputs for $environment environment..."
    
    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
        --output table
}

# Main deployment function
main() {
    print_status "Starting Sofia Platform Infrastructure Deployment"
    
    # Check prerequisites
    check_aws_cli
    
    # Check if CloudFormation template exists
    if [ ! -f "aws/cloudformation/infrastructure.yml" ]; then
        print_error "CloudFormation template not found at aws/cloudformation/infrastructure.yml"
        exit 1
    fi
    
    # Get environment and database password
    if [ -z "$1" ]; then
        print_error "Usage: $0 <environment> [db_password]"
        print_error "Environment: dev or prod"
        exit 1
    fi
    
    local environment=$1
    
    if [ "$environment" != "dev" ] && [ "$environment" != "prod" ]; then
        print_error "Environment must be 'dev' or 'prod'"
        exit 1
    fi
    
    # Get database password
    local db_password=$2
    if [ -z "$db_password" ]; then
        echo -n "Enter database password (minimum 8 characters): "
        read -s db_password
        echo
        
        if [ ${#db_password} -lt 8 ]; then
            print_error "Database password must be at least 8 characters long"
            exit 1
        fi
    fi
    
    # Deploy the stack
    deploy_stack "$environment" "$db_password"
    
    # Show outputs
    get_stack_outputs "$environment"
    
    print_status "Deployment completed successfully!"
    print_warning "Please save the stack outputs above - you'll need them for GitHub Actions secrets."
}

# Run main function
main "$@" 