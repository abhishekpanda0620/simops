# SimOps: Interactive DevOps Learning Platform

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-12.0-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Kubernetes](https://img.shields.io/badge/K8s-Simulation-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)

**SimOps** is an interactive, visual platform designed to help engineers **learn DevOps by doing, not just watching**. It provides real-time simulations and visualizations of Kubernetes internals, CI/CD pipelines, and DevSecOps practices—giving you a "glass box" view into complex systems.

<p align="center">
  <strong>🚀 Learn DevOps by Doing, Not Just Watching</strong>
</p>

---

## ✨ Features

### 🧠 Kubernetes Control Plane Simulation
Visualize the hidden "brain" of Kubernetes. Watch how Control Plane components work together to manage cluster state.
- **Interactive Scenarios**: Pod Creation, Pod Deletion, Scale Deployment, Node Failure, DaemonSet/StatefulSet logic
- **Component Visualization**: See exact operation sequences between `kubectl`, API Server, etcd, Scheduler, and Kubelet
- **State Tracking**: Follow request phases with a detailed status tracker

### 🌐 User Request Flow
Simulate real-world traffic patterns through your architecture.
- **Traffic Animation**: Watch packets travel from Ingress → Service → Pod
- **Latency Simulation**: Visual delays at each hop to represent processing time
- **Response Handling**: See the return path of response data back to the user

### 🔄 CI/CD Pipeline Simulation
Visualize deployment pipelines and common failure scenarios.
- **Scenarios**: Successful Deploy, Test Failure, Flaky Tests, Hotfix, Rollback, Manual Approval
- **Stage Visualization**: Track progress of Build, Test, Security, and Deploy stages
- **Log Streaming**: View simulated console output for every step

### 🔐 DevSecOps Security Module
Learn security best practices through interactive simulations.
- **Image Scanner**: Simulate CVE scanning with Trivy/Clair concepts
- **Admission Control**: Test OPA Gatekeeper policy enforcement
- **Security Dashboard**: View security scores, threats, and compliance metrics

### 🧪 Interactive Labs
Hands-on learning modules with progress tracking.
- **Guided Learning**: Step-by-step exercises with clear objectives
- **Difficulty Levels**: Beginner, Intermediate, and Advanced tracks
- **Progress Tracking**: Resume where you left off

### 🏗️ Architecture Topology
- **Interactive Graph**: Drag, zoom, and inspect Nodes, Pods, Services, and Ingresses
- **Resource Inspection**: Click on any component to view detailed specs, status, and resource usage
- **Dynamic Updates**: Topology reacts in real-time to simulation events

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [React 19](https://react.dev/) | UI Framework |
| [Vite](https://vitejs.dev/) | Build Tool |
| [TypeScript](https://www.typescriptlang.org/) | Type Safety |
| [Tailwind CSS v4](https://tailwindcss.com/) | Styling |
| [Zustand](https://github.com/pmndrs/zustand) | State Management |
| [XYFlow (React Flow)](https://xyflow.com/) | Graph Visualization |
| [Framer Motion](https://www.framer.com/motion/) | Animations |

### Backend
| Technology | Purpose |
|------------|---------|
| [Laravel 12](https://laravel.com/) | PHP API Framework |
| [Laravel Sanctum](https://laravel.com/docs/sanctum) | API Authentication |
| [MySQL](https://www.mysql.com/) | Database |

---

## 📂 Project Structure

```
simops/
├── app/                    # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI Components
│   │   │   ├── landing/    # Landing page components
│   │   │   ├── layout/     # Layout components (Sidebar, Header)
│   │   │   ├── pipeline/   # CI/CD simulation components
│   │   │   ├── security/   # DevSecOps components
│   │   │   ├── topology/   # K8s visualization components
│   │   │   └── ui/         # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   └── services/       # API services
│   └── ...
├── server/                 # Laravel Backend API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   └── Models/
│   ├── routes/api.php      # API Routes
│   └── ...
└── docs/                   # Documentation
```

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+ & npm
- PHP 8.2+
- Composer
- MySQL 8.0+ (or SQLite for dev)

### Frontend Setup

```bash
cd app
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Backend Setup

```bash
cd server
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

The API will be available at `http://localhost:8000`

---

## 🤝 Simulation Modes

| Mode | Description | Key Components |
|------|-------------|----------------|
| **User Request** | Simulates external traffic hitting the cluster | Ingress, Service, Endpoints, Pods |
| **Control Plane** | Simulates internal K8s logic | API Server, etcd, Scheduler, Controller Manager |
| **CI/CD Pipeline** | Simulates deployment workflows | Build, Test, Security, Deploy stages |
| **DevSecOps** | Simulates security scanning & policy enforcement | Trivy, OPA Gatekeeper |

---

## 🎯 Use Cases

- **Learning**: Understand complex DevOps concepts visually
- **Teaching**: Demonstrate K8s/CI/CD workflows to teams
- **Interviews**: Practice explaining system architecture
- **Onboarding**: Get new engineers up to speed quickly

---

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

<p align="center">
  Made with ❤️ for the DevOps community
</p>
