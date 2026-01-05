# SimOps Backend API

![Laravel](https://img.shields.io/badge/Laravel-12.0-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Sanctum](https://img.shields.io/badge/Sanctum-4.0-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)

The backend API server for **SimOps** - a Kubernetes Architecture Simulator. This Laravel-based API provides authentication, scenario management, and lab progress tracking for the SimOps frontend.

## 🚀 Features

### 🔐 Authentication
- **User Registration & Login** - Secure authentication powered by Laravel Sanctum
- **Token-based API access** - SPA authentication with HTTP-only cookies
- **Guest access support** - Seeded guest credentials for demo access

### 📊 Scenarios API
- **K8s Scenarios** - Kubernetes control plane simulation scenarios
- **CI/CD Pipelines** - Pipeline configuration and execution states
- **General Scenarios** - Additional simulation scenarios with status tracking

### 🧪 Labs System
- **Interactive Labs** - Guided learning experiences
- **Progress Tracking** - Per-user lab completion tracking
- **Achievement System** - Track milestones and accomplishments

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Laravel | 12.0 | PHP Framework |
| PHP | 8.2+ | Runtime |
| MySQL | 8.0+ | Database |
| Laravel Sanctum | 4.0 | API Authentication |
| Laravel Sail | 1.41 | Docker Development |

## 📦 Prerequisites

- PHP 8.2 or higher
- Composer
- MySQL 8.0+ (or SQLite for development)
- Node.js & npm (for asset compilation)

## ⚡ Quick Start

### 1. Install Dependencies

```bash
composer install
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Database Setup

```bash
# Create database (MySQL)
mysql -u root -e "CREATE DATABASE simops;"

# Run migrations
php artisan migrate

# Seed demo data (optional)
php artisan db:seed
```

### 4. Start Development Server

```bash
# Option 1: Using composer script (recommended)
composer dev

# Option 2: Manual start
php artisan serve
```

The API will be available at `http://localhost:8000`

## 🔌 API Endpoints

### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/k8s-scenarios` | List K8s scenarios |
| `GET` | `/api/k8s-scenarios/{id}` | Get K8s scenario details |
| `GET` | `/api/pipelines` | List CI/CD pipelines |
| `GET` | `/api/pipelines/{id}` | Get pipeline details |
| `GET` | `/api/scenarios` | List scenarios |
| `GET` | `/api/scenarios/{id}` | Get scenario details |
| `GET` | `/api/scenarios/{id}/status` | Get scenario status |

### Protected Routes (Requires Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/logout` | User logout |
| `GET` | `/api/user` | Get current user |
| `GET` | `/api/labs` | List labs |
| `GET` | `/api/labs/{id}` | Get lab details |
| `POST` | `/api/labs/{id}/progress` | Update lab progress |
| `GET` | `/api/labs/{id}/progress` | Get lab progress |

## 🧪 Testing

```bash
# Run all tests
composer test

# Run specific test suite
php artisan test --testsuite=Feature
```

## 📂 Project Structure

```
server/
├── app/
│   ├── Http/
│   │   └── Controllers/Api/    # API Controllers
│   ├── Models/                 # Eloquent Models
│   └── Providers/              # Service Providers
├── config/                     # Configuration files
├── database/
│   ├── factories/              # Model Factories
│   ├── migrations/             # Database Migrations
│   └── seeders/                # Database Seeders
├── routes/
│   └── api.php                 # API Routes
├── storage/                    # Storage (logs, cache, etc.)
└── tests/                      # Test Suite
```

## 🐳 Docker Development (Laravel Sail)

```bash
# Start containers
./vendor/bin/sail up -d

# Stop containers
./vendor/bin/sail down

# Run artisan commands
./vendor/bin/sail artisan migrate
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | Laravel |
| `APP_URL` | Application URL | http://localhost |
| `DB_CONNECTION` | Database driver | mysql |
| `DB_DATABASE` | Database name | simops |
| `SANCTUM_STATEFUL_DOMAINS` | Allowed SPA domains | localhost |

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
