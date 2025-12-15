# SimOps: Kubernetes Architecture Simulator

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Control Plane](https://img.shields.io/badge/K8s-Control_Plane-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)

SimOps is an interactive, visual platform designed to simulate and demonstrate Kubernetes internal operations, traffic flows, and control plane logic in real-time. It provides a "glass box" view of K8s clusters, helping engineers understand how components like the API Server, Scheduler, etcd, and Controllers interact.

## 🚀 Features

### 🧠 Control Plane Simulation
Visualize the hidden "brain" of Kubernetes. Watch how the Control Plane components work together to manage the cluster state.
- **Interactive Scenarios**: Run simulations for logic flows like `Pod Creation`, `Pod Deletion`, `Scale Deployment`, `Node Failure`, and `DaemonSet/StatefulSet` logic.
- **Component Visualization**: See the exact sequence of operations between `kubectl`, `API Server`, `etcd`, `Scheduler`, and `Kubelet`.
- **State Tracking**: Follow the request phases with a detailed status tracker.

### 🌐 User Request Flow
Simulate real-world traffic patterns through your architecture.
- **Traffic Animation**: Watch packets travel from Ingress → Service → Pod.
- **Latency Simulation**: Visual delays at each hop to represent processing time.
- **Response Handling**: See the return path of the response data back to the user.

### 🏗️ Architecture Topology
- **Interactive Graph**: Drag, zoom, and inspect Nodes, Pods, Services, and Ingresses.
- **Resource Inspection**: Click on any component to view detailed specs, status, and resource usage.
- **Dynamic Updates**: The topology reacts in real-time to simulation events (e.g., new pods appearing on nodes).

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Visualization**: [XYFlow (React Flow)](https://xyflow.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Optimization**: Custom chunk splitting strategy for optimal production performance.

## 📂 Project Structure

The project is organized into modular components to handle the complexity of simulations:

### Core Topologies
- **`ArchitectureView.tsx`**: The main container utilizing a layered approach.
    - **`ControlPlaneView.tsx`**: Handles the logic and visualization of the Kubernetes Control Plane (API Server, Scheduler, etc.).
    - **`UserRequestView.tsx`**: Manages the traffic simulation, Worker Nodes, and User → Ingress → Service → Pod packet flows.
    - **`TrafficAnimationLayer.tsx`**: Specialized layer for rendering moving traffic packets directly on top of the topology.

### Information Panels
- **`EnhancedInfoPanel.tsx`**: A context-aware panel providing deep-dive information for selected resources.
    - **`enhancedContent.ts`**: Centralized educational content for all K8s resources.
    - **`EnhancedPanelComponents.tsx`**: Reusable UI blocks for analogies, key points, and troubleshooting tips.

## 📦 Getting Started

1.  **Install dependencies**
    ```bash
    npm install
    ```

2.  **Run the development server**
    ```bash
    npm run dev
    ```

3.  **Build for production**
    ```bash
    npm run build
    ```

## 🤝 Simulation Modes

| Mode | Description | Key Components |
|------|-------------|----------------|
| **User Request** | Simulates external traffic hitting the cluster. Best for understanding networking. | Ingress, Service, Endpoints, Pods |
| **Control Plane** | Simulates internal K8s logic. Best for understanding scheduling and state reconciliation. | API Server, etcd, Scheduler, Controller Manager |
