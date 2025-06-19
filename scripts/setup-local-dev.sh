#!/bin/bash

# Sofia Platform Local Development Setup Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_header "Checking prerequisites..."
    
    local missing_tools=()
    
    if ! command_exists python3; then
        missing_tools+=("python3")
    fi
    
    if ! command_exists node; then
        missing_tools+=("node")
    fi
    
    if ! command_exists npm; then
        missing_tools+=("npm")
    fi
    
    if ! command_exists psql; then
        missing_tools+=("postgresql")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_error "Please install the missing tools and run this script again."
        exit 1
    fi
    
    print_status "All prerequisites are installed."
}

# Function to setup PostgreSQL database
setup_database() {
    print_header "Setting up PostgreSQL database..."
    
    # Check if PostgreSQL is running
    if ! pgrep -x "postgres" > /dev/null; then
        print_warning "PostgreSQL is not running. Please start PostgreSQL service."
        print_warning "On macOS: brew services start postgresql"
        print_warning "On Ubuntu: sudo systemctl start postgresql"
        read -p "Press enter when PostgreSQL is running..."
    fi
    
    # Create database and user
    print_status "Creating database and user..."
    
    # Try to create database (ignore error if already exists)
    createdb sofia_db 2>/dev/null || print_warning "Database sofia_db already exists"
    
    # Create user and grant privileges
    psql -d sofia_db -c "
        DO \$\$
        BEGIN
            CREATE USER sofia_user WITH PASSWORD 'sofia_password';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'User sofia_user already exists';
        END
        \$\$;
        
        GRANT ALL PRIVILEGES ON DATABASE sofia_db TO sofia_user;
        ALTER USER sofia_user CREATEDB;
    " 2>/dev/null || print_warning "Database setup completed (some steps may have been skipped)"
    
    print_status "Database setup completed."
}

# Function to setup backend
setup_backend() {
    print_header "Setting up Django backend..."
    
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating .env file..."
        cp env.example .env
    fi
    
    # Set Django settings
    export DJANGO_SETTINGS_MODULE=sofia_project.settings.development
    
    # Run migrations
    print_status "Running database migrations..."
    python manage.py migrate
    
    # Create superuser if it doesn't exist
    print_status "Creating superuser (if needed)..."
    python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
" 2>/dev/null || print_warning "Superuser creation skipped"
    
    # Collect static files
    print_status "Collecting static files..."
    python manage.py collectstatic --noinput
    
    cd ..
    print_status "Backend setup completed."
}

# Function to setup frontend
setup_frontend() {
    print_header "Setting up React frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env.local" ]; then
        print_status "Creating .env.local file..."
        echo "REACT_APP_API_URL=http://localhost:8000" > .env.local
    fi
    
    cd ..
    print_status "Frontend setup completed."
}

# Function to create start scripts
create_start_scripts() {
    print_header "Creating start scripts..."
    
    # Backend start script
    cat > scripts/start-backend.sh << 'EOF'
#!/bin/bash
cd backend
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=sofia_project.settings.development
python manage.py runserver
EOF
    
    # Frontend start script
    cat > scripts/start-frontend.sh << 'EOF'
#!/bin/bash
cd frontend
npm start
EOF
    
    # Make scripts executable
    chmod +x scripts/start-backend.sh
    chmod +x scripts/start-frontend.sh
    
    print_status "Start scripts created."
}

# Function to display completion message
show_completion_message() {
    print_header "Setup completed successfully!"
    echo
    print_status "To start the development servers:"
    echo
    echo "Backend (Terminal 1):"
    echo "  ./scripts/start-backend.sh"
    echo
    echo "Frontend (Terminal 2):"
    echo "  ./scripts/start-frontend.sh"
    echo
    echo "Or use Docker Compose:"
    echo "  docker-compose up -d"
    echo
    print_status "Access the application:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:8000"
    echo "  Admin Panel: http://localhost:8000/admin (admin/admin123)"
    echo
    print_warning "Make sure PostgreSQL is running before starting the backend!"
}

# Main function
main() {
    print_header "Sofia Platform Local Development Setup"
    echo
    
    # Check if we're in the right directory
    if [ ! -f "docker-compose.yml" ]; then
        print_error "Please run this script from the root directory of the Sofia project."
        exit 1
    fi
    
    check_prerequisites
    setup_database
    setup_backend
    setup_frontend
    create_start_scripts
    show_completion_message
}

# Run main function
main "$@" 