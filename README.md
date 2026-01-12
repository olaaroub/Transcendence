*This project has been created as part of the 42 curriculum by hes-safi, olaaroub, mmondad, ohammou-, oumondad.*

---

<p align="center">
  <img src="https://img.shields.io/badge/42-ft__transcendence-gold?style=for-the-badge" alt="42 Badge"/>
  <img src="https://img.shields.io/badge/Points-34%2F14-brightgreen?style=for-the-badge" alt="Points"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Babylon.js-BB464B?style=for-the-badge" alt="Babylon.js"/>
</p>

<h1 align="center">🪐 SPACE PONG</h1>

<p align="center">
  <b>A real-time multiplayer 3D Pong game with microservices architecture</b>
</p>

---

## 📑 Table of Contents

| Section | Description |
|---------|-------------|
| [📖 Description](#-description) | Project overview and key features |
| [🚀 Quick Start](#-quick-start) | Prerequisites, setup, and running the app |
| [👥 Team Information](#-team-information) | Team members and role responsibilities |
| [📋 Project Management](#-project-management) | Organization and workflow |
| [🛠️ Technical Stack](#️-technical-stack) | Frontend, Backend, Game Engine, DevOps |
| [🗄️ Database Schema](#️-database-schema) | Database structure and relationships |
| [✨ Features List](#-features-list) | Complete feature breakdown by area |
| [📊 Modules](#-modules) | Point calculation and module ownership |
| [👤 Individual Contributions](#-individual-contributions) | Detailed work per team member |
| [🔧 Architecture Overview](#-architecture-overview) | System architecture diagram |
| [📚 Resources](#-resources) | Documentation and AI usage disclosure |
| [📄 License](#-license) | License information |

---

## 📖 Description

**SPACE PONG** is a full-stack web application featuring a classic Pong game reimagined with stunning 3D graphics powered by Babylon.js. The platform offers real-time multiplayer gameplay, AI opponents with adjustable difficulty, comprehensive user management, global and private chat systems, and a robust DevOps infrastructure for monitoring and security.

### Key Features

- 🎮 **3D Pong Game** - Immersive gameplay with advanced Babylon.js rendering
- 🤖 **AI Opponent** - Challenging computer opponent with multiple difficulty levels
- 🌐 **Real-time Multiplayer** - Play against friends remotely via WebSockets
- 👤 **User Management** - Profiles, avatars, friends system, and online status
- 💬 **Chat System** - Global and private messaging with real-time updates
- 📊 **Statistics & Leaderboard** - Track your performance and compete for rankings
- 🔐 **Secure Authentication** - Local & OAuth 2.0 (Google, GitHub, 42 Intra)
- 🛡️ **Security** - WAF/ModSecurity hardened with HashiCorp Vault for secrets
- 📈 **Monitoring** - Prometheus + Grafana dashboards with ELK stack logging

---

## 🚀 Quick Start

### Prerequisites

- **Docker** & **Docker Compose**
- **OpenSSL** (for certificate generation)
- **Make**

### Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Transcendence
   ```

2. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Configure the following environment variables in `.env`:
   ```env
   # Vault Configuration
   VAULT_TOKEN=<your-vault-token>
   VAULT_ADDR_PROD=http://vault-prod:8200
   
   # JWT & Cookie Secrets
   JWT_SECRET_VALUE=<your-jwt-secret>
   COOKIE_SECRET=<your-cookie-secret>
   
   # OAuth Credentials (Optional)
   GITHUB_CLIENT_ID=<github-client-id>
   GITHUB_CLIENT_SECRET=<github-client-secret>
   GOOGLE_CLIENT_ID=<google-client-id>
   GOOGLE_CLIENT_SECRET=<google-client-secret>
   INTRA_CLIENT_ID=<42-intra-client-id>
   INTRA_CLIENT_SECRET=<42-intra-client-secret>
   
   # Service Tokens
   AUTH_SERVICE_TOKEN=<auth-token>
   USER_SERVICE_TOKEN=<user-token>
   GLOBAL_CHAT_SERVICE_TOKEN=<global-chat-token>
   PRIVATE_CHAT_SERVICE_TOKEN=<private-chat-token>
   PONG_SERVICE_TOKEN=<pong-token>
   
   # Elasticsearch (for ELK stack)
   ELASTIC_PASSWORD=<elastic-password>
   ```

### Running the Application

#### Production Mode
```bash
make up
```
Access the application at: `https://localhost:8443`

#### Development Mode
```bash
make dev
```

#### With ELK Stack (Full Monitoring)
```bash
make elk
```

### Available Commands

| Command | Description |
|---------|-------------|
| `make up` | Start production environment |
| `make down` | Stop production environment |
| `make dev` | Start development environment |
| `make down-dev` | Stop development environment |
| `make elk` | Start with ELK stack monitoring |
| `make re` | Full restart (production) |
| `make fclean` | Stop and remove all volumes |
| `make deps` | Generate package-lock.json files |

---

## 👥 Team Information

| Name | Login | Role | Main Responsibility |
|------|-------|------|---------------------|
| **Hamza ES-SAFI** | `hes-safi` | Product Owner (PO) | Game Development |
| **Oussama LAAROUBI** | `olaaroub` | Project Manager (PM) | DevOps & Infrastructure |
| **Mohammed MONDAD** | `mmondad` | Technical Lead | Frontend Development |
| **Oussama HAMMOU MESSAOUD** | `ohammou-` | Developer | Backend Services |
| **Oussama MONDAD** | `oumondad` | Developer | Chat System |

### Role Responsibilities

- **Product Owner (PO):** Defined product vision, prioritized features, validated completed work, and managed the game module implementation.
- **Project Manager (PM):** Organized team meetings, tracked progress, managed the DevOps pipeline, and ensured infrastructure reliability.
- **Technical Lead:** Oversaw technical architecture decisions, frontend implementation, and code quality standards.
- **Developers:** Implemented assigned features, participated in code reviews, tested implementations, and documented work.

---

## 📋 Project Management

### Organization
- **Communication:** On-site meetings and Discord for asynchronous communication
- **Task Tracking:** Tasks and To-dos logged in dedicated project files (`TODO.md`)
- **Role Distribution:** Roles were assigned on-site weeks before the project began
- **Duration:** ~2 months of development

### Workflow
- Regular team syncs to discuss progress and blockers
- Clear work breakdown into manageable tasks per team member
- Code reviews for critical changes
- Documentation of important decisions

---

## 🛠️ Technical Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **TypeScript** | Type-safe JavaScript development |
| **Vite** | Fast build tool and development server |
| **Tailwind CSS** | Utility-first CSS framework |
| **Socket.io Client** | Real-time WebSocket communication |

**Justification:** TypeScript provides type safety and better developer experience. Vite offers extremely fast HMR (Hot Module Replacement) during development. Tailwind CSS enables rapid UI development with a consistent design system.

### Backend (Microservices)
| Service | Framework | Database | Purpose |
|---------|-----------|----------|---------|
| **Auth Service** | Fastify | SQLite (better-sqlite3) | Authentication |
| **User Service** | Fastify | SQLite (better-sqlite3) | User management, friends, leaderboard |
| **Global Chat** | Fastify | SQLite (better-sqlite3) | Public chat rooms |
| **Private Chat** | Fastify + Socket.io | SQLite (better-sqlite3) | Direct messaging |
| **Pong Game** | Fastify + Socket.io | In-memory | Game state & matchmaking |

**Justification:** Fastify was chosen for its exceptional performance and low overhead. SQLite with `better-sqlite3` provides a lightweight, file-based database perfect for containerized microservices. The microservices architecture enables independent scaling and deployment of each service.

### Game Engine
| Technology | Purpose |
|------------|---------|
| **Babylon.js** | 3D rendering engine |
| **Socket.io** | Real-time game state synchronization |
| **Custom Physics** | Server-authoritative game logic |

**Justification:** Babylon.js provides powerful 3D graphics capabilities with excellent WebGL support. The game engine uses a server-authoritative model to prevent cheating and ensure fair gameplay.

### DevOps & Security
| Technology | Purpose |
|------------|---------|
| **Docker & Docker Compose** | Containerization |
| **NGINX** | Reverse proxy & static file serving |
| **ModSecurity (OWASP CRS)** | Web Application Firewall |
| **HashiCorp Vault** | Secrets management |
| **Prometheus** | Metrics collection |
| **Grafana** | Metrics visualization & dashboards |
| **ELK Stack** | Log management (Elasticsearch, Logstash, Kibana) |
| **Filebeat** | Log shipping |

---

## 🗄️ Database Schema

### Auth Service Database
```
┌─────────────────────────────────────────┐
│                 users                   │
├─────────────────────────────────────────┤
│ id            INTEGER PRIMARY KEY       │
│ username      TEXT UNIQUE NOT NULL      │
│ password      TEXT                      │
│ auth_provider TEXT (local/google/github)│
│ email         TEXT UNIQUE NOT NULL      │
│ towFaSecret   TEXT                      │
│ towFaEnabled  BOOLEAN                   │
└─────────────────────────────────────────┘
```

### User Service Database
```
┌─────────────────────────────────────────┐
│               userInfo                  │
├─────────────────────────────────────────┤
│ id            INTEGER UNIQUE NOT NULL   │
│ username      TEXT UNIQUE NOT NULL      │
│ bio           TEXT                      │
│ avatar_url    TEXT                      │
│ GamesPlayed   INTEGER                   │
│ TotalWins     INTEGER                   │
│ TotalLosses   INTEGER                   │
│ WinRate       FLOAT                     │
│ GoalsScored   INTEGER                   │
│ GoalsTaken    INTEGER                   │
│ CurrentStreak INTEGER                   │
│ MaxStreak     INTEGER                   │
│ Rating        INTEGER (ELO-based)       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│             friendships                 │
├─────────────────────────────────────────┤
│ id             INTEGER PRIMARY KEY      │
│ userRequester  INTEGER (FK → userInfo)  │
│ userReceiver   INTEGER (FK → userInfo)  │
│ blocker_id     INTEGER                  │
│ status         TEXT (PENDING/ACCEPTED/  │
│                     REJECTED/BLOCKED)   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│            matchHistory                 │
├─────────────────────────────────────────┤
│ id             INTEGER PRIMARY KEY      │
│ player1_id     INTEGER (FK → userInfo)  │
│ player2_id     INTEGER (FK → userInfo)  │
│ player1_score  INTEGER                  │
│ player2_score  INTEGER                  │
│ match_date     DATETIME                 │
└─────────────────────────────────────────┘
```

---

## ✨ Features List

### Game (hes-safi)
| Feature | Description |
|---------|-------------|
| 3D Pong Game | Immersive Babylon.js-powered 3D environment with advanced lighting and materials |
| AI Opponent | Intelligent computer opponent with Easy, Medium, and Hard difficulty levels |
| Remote Multiplayer | Real-time gameplay between players on separate devices |
| Offline Mode | Local multiplayer for two players on the same device |
| Game Customization | Adjustable game settings and difficulty options |
| Spectator Mode | Watch ongoing matches in real-time |

### Frontend (mmondad)
| Feature | Description |
|---------|-------------|
| Single-Page Application | Smooth navigation without page reloads using custom router |
| Responsive Design | Mobile-first design adapting to all screen sizes |
| User Authentication UI | Login, signup & OAuth flows |
| Dashboard | Central hub for user activities and quick actions |
| Profile Management | View and edit user profiles, avatars, and settings |
| Leaderboard | Global rankings with player statistics |
| Privacy & Terms Pages | Comprehensive legal pages as required |
| Custom Components | Reusable NavBar, Toast notifications, Search bar, etc. |

### Backend (ohammou-)
| Feature | Description |
|---------|-------------|
| Microservices Architecture | Loosely-coupled services with single responsibilities |
| RESTful APIs | Well-structured endpoints for all operations |
| WebSocket Integration | Real-time updates for notifications and presence |
| JWT Authentication | Secure token-based authentication |
| OAuth 2.0 Integration | Google, GitHub, and 42 Intra login |
| Friends System | Send/accept/reject requests, block users |
| Search Functionality | Find users by username |
| Match History Recording | Track and store game results |

### Chat (oumondad)
| Feature | Description |
|---------|-------------|
| Global Chat | Public chat rooms for all users |
| Private Messaging | Direct messages between users |
| Real-time Updates | Instant message delivery via WebSockets |
| Chat History | Persistent message storage |
| Advanced Features | Block users, typing indicators |

### DevOps (olaaroub)
| Feature | Description |
|---------|-------------|
| Docker Containerization | All services containerized for consistency |
| WAF/ModSecurity | OWASP CRS with paranoia level 2 for security |
| HashiCorp Vault | Centralized secrets management |
| Prometheus Monitoring | Metrics collection from all services |
| Grafana Dashboards | Custom dashboards for service metrics and user insights |
| ELK Stack | Centralized logging with Elasticsearch, Logstash, Kibana |
| HTTPS Everywhere | TLS encryption for all communications |
| Health Checks | Automated service health monitoring |

---

## 📊 Modules

### Point Calculation

| Module | Type | Points | Owner |
|--------|------|--------|-------|
| Backend as microservices | Major | 2 | olaaroub, ohammou- |
| WAF/ModSecurity + HashiCorp Vault | Major | 2 | olaaroub |
| ELK Infrastructure | Major | 2 | olaaroub |
| Prometheus + Grafana Monitoring | Major | 2 | olaaroub |
| User activity analytics dashboard | Minor | 1 | olaaroub |
| Standard user management & auth | Major | 2 | mmondad, ohammou- |
| Single-Page Application (SPA) | Major | 2 | mmondad |
| Custom design system | Minor | 1 | mmondad |
| Support for additional browsers | Minor | 1 | mmondad |
| Game statistics & match history | Minor | 1 | mmondad |
| Use a backend framework (Fastify) | Minor | 1 | ohammou- |
| Real-time features (WebSockets) | Major | 2 | ohammou-, mmondad |
| User interaction (chat, friends) | Major | 2 | ohammou-, oumondad |
| OAuth 2.0 authentication | Minor | 1 | ohammou- |
| Global Chat | Minor | 1 | ohammou- |
| Web-based game implementation | Major | 2 | hes-safi |
| AI Opponent | Major | 2 | hes-safi |
| Remote players | Major | 2 | hes-safi |
| Advanced 3D graphics (Babylon.js) | Major | 2 | hes-safi |
| Game customization options | Minor | 1 | hes-safi |
| Spectator mode | Minor | 1 | hes-safi |
| Advanced chat features | Minor | 1 | oumondad |

### **Total: 34 Points** (Required: 14)

---

## 👤 Individual Contributions

### Hamza ES-SAFI (hes-safi) - Game
- Designed and implemented the 3D Pong game engine using Babylon.js
- Created the AI opponent with multiple difficulty algorithms
- Built real-time multiplayer synchronization using Socket.io
- Implemented offline local multiplayer mode
- Developed spectator mode for live match viewing
- Created game customization options

### Oussama LAAROUBI (olaaroub) - DevOps
- Architected the microservices infrastructure
- Configured Docker Compose for multiple environments (dev, prod, elk)
- Set up WAF/ModSecurity with OWASP CRS rules
- Implemented HashiCorp Vault for secrets management
- Deployed Prometheus and Grafana monitoring stack
- Configured ELK stack for centralized logging
- Created custom Grafana dashboards for metrics and user insights
- Managed SSL/TLS certificates and HTTPS configuration

### Mohammed MONDAD (mmondad) - Frontend
- Built the SPA architecture with custom TypeScript router
- Designed and implemented the UI with Tailwind CSS
- Created responsive layouts for all screen sizes
- Implemented user authentication flows (login, signup, OAuth)
- Built the dashboard, profile, and settings pages
- Developed the leaderboard and statistics views
- Created Privacy Policy and Terms of Service pages
- Built reusable components (NavBar, Toast, Search, etc.)

### Oussama HAMMOU MESSAOUD (ohammou-) - Backend
- Designed the microservices architecture
- Implemented Auth Service (local auth, OAuth)
- Built User Service (profiles, friends, statistics, leaderboard)
- Integrated WebSocket for real-time notifications
- Implemented match history and statistics tracking
- Created database schemas and migrations
- Built Global Chat service

### Oussama MONDAD (oumondad) - Chat
- Implemented Private Chat service with Socket.io
- Built real-time messaging system
- Created conversation management
- Implemented chat history persistence
- Added advanced chat features (blocking, notifications)

---

## 🔧 Architecture Overview

```
                                    ┌─────────────┐
                                    │   Client    │
                                    │  (Browser)  │
                                    └──────┬──────┘
                                           │ HTTPS
                                    ┌──────▼──────┐
                                    │   NGINX     │
                                    │  Frontend   │
                                    └──────┬──────┘
                                           │
                                    ┌──────▼──────┐
                                    │ ModSecurity │
                                    │    (WAF)    │
                                    └──────┬──────┘
                                           │
            ┌──────────────┬───────────────┼───────────────┬──────────────┐
            │              │               │               │              │
     ┌──────▼──────┐ ┌─────▼─────┐ ┌───────▼───────┐ ┌─────▼─────┐ ┌──────▼──────┐
     │ Auth Service│ │Usr Service│ │  Global Chat  │ │Privte Chat│ │  Pong Game  │
     │   :3001     │ │   :3002   │ │     :3003     │ │   :3004   │ │    :3005    │
     └──────┬──────┘ └─────┬─────┘ └───────┬───────┘ └─────┬─────┘ └──────┬──────┘
            │              │               │               │              │
            └──────────────┴───────────────┼───────────────┴──────────────┘
                                           │
                                    ┌──────▼──────┐
                                    │   Vault     │
                                    │  (Secrets)  │
                                    └─────────────┘

     ┌────────────────────────────────────────────────────────────────────┐
     │                        Monitoring Stack                            │
     │  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐  │
     │  │Prometheus │───▶│  Grafana  │    │Elasticsrch│◀───│ Logstash  │  │
     │  └───────────┘    └───────────┘    └─────┬─────┘    └─────┬─────┘  │
     │                                          │                │        │
     │                                    ┌─────▼─────┐    ┌─────▼─────┐  │
     │                                    │  Kibana   │    │ Filebeat  │  │
     │                                    └───────────┘    └───────────┘  │
     └────────────────────────────────────────────────────────────────────┘
```

---

## 📚 Resources

### Documentation & Tutorials
- [Babylon.js Documentation](https://doc.babylonjs.com/)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [HashiCorp Vault Documentation](https://developer.hashicorp.com/vault/docs)
- [OWASP ModSecurity CRS](https://coreruleset.org/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Elastic Stack Documentation](https://www.elastic.co/guide/)

### AI Usage Disclosure
AI tools were used during development for:
- Generating boilerplate code and configurations
- Debugging complex issues
- Documentation drafting and refinement
- Research on best practices for microservices architecture

All AI-generated content was reviewed, tested, and validated by team members before integration.

---

## 📄 License

This project was created as part of the 42 curriculum. All rights reserved by the respective authors.

---

<p align="center">
  <i>Made with ❤️ by Team "Rah kheddama 3ndi - Maps Poroti" </i>
</p>
