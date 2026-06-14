# AI-Native Mini CRM

A simple AI-powered CRM built using Next.js, Prisma, and Gemini AI.

The application helps marketers manage customer data, create audience segments, generate campaigns using AI, launch campaigns, and track performance from a single dashboard.

---

# Features

## Dashboard

- View total customers, orders, revenue, and campaign statistics
- See recently added customers and orders
- Seed or reset sample data for testing

## Customers & Orders

- View customer and order data
- Upload customer and order CSV files
- Store data in the database using Prisma

## Audience Segments

- Create audience groups using filters
- Generate audience segments using Gemini AI
- Preview matching customers instantly

## Campaign Generator

- Enter a campaign goal
- Generate campaign messages using Gemini AI
- Get suggested communication channels

## Campaign Launch

- Launch campaigns for selected audiences
- Create communication records
- Track delivery status

## Analytics

- View campaign performance
- Monitor engagement and delivery metrics
- Analyze campaign results

---

# Tech Stack

- Frontend: Next.js 15 + React
- Styling: Tailwind CSS
- Database: Prisma ORM
- AI: Google Gemini API
- CSV Processing: PapaParse
- Deployment: Vercel

---


---

# System Flow

```mermaid
flowchart TD

A[User Opens CRM Dashboard]

A --> B[Manage Customers & Orders]
B --> C[Upload CSV or Seed Data]
C --> D[Next.js API Routes]
D --> E[Prisma ORM]
E --> F[(Database)]

A --> G[Create Audience Segment]
G --> H[Audience Service]
H --> I[Gemini AI]
I --> H
H --> F

A --> J[Generate Campaign]
J --> K[Campaign Service]
K --> I
I --> K

K --> L[Campaign Draft Generated]

A --> M[Launch Campaign]
M --> N[Create Communication Records]
N --> F

A --> O[View Analytics]
O --> P[Analytics Service]
P --> F
```

---

# High-Level Architecture

```mermaid
graph TD

    classDef frontend fill:#1e1b4b,stroke:#4f46e5,stroke-width:2px,color:#fff;
    classDef backend fill:#18181b,stroke:#27272a,stroke-width:2px,color:#d4d4d8;
    classDef database fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef ai fill:#701a75,stroke:#c026d3,stroke-width:2px,color:#fff;

    subgraph Frontend
        UI[Next.js Pages & Components]
    end
    class UI frontend;

    subgraph Backend
        API[Next.js API Routes]
        Services[CRM Services]
    end
    class API,Services backend;

    subgraph Data
        Prisma[Prisma ORM]
        DB[(Database)]
    end
    class Prisma,DB database;

    subgraph AI
        Gemini[Gemini API]
    end
    class Gemini ai;

    UI --> API
    API --> Services
    Services --> Prisma
    Prisma --> DB
    Services --> Gemini
```

---

# Detailed Architecture

```mermaid
graph TD

    classDef server fill:#18181b,stroke:#27272a,stroke-width:2px,color:#d4d4d8;
    classDef service fill:#064e3b,stroke:#059669,stroke-width:2px,color:#fff;
    classDef database fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef external fill:#701a75,stroke:#c026d3,stroke-width:2px,color:#fff;

    subgraph Backend
        API[Next.js API Routes]
    end

    subgraph Services
        Customer[Customer Service]
        Audience[Audience Service]
        Campaign[Campaign Service]
        Analytics[Analytics Service]
    end

    subgraph Database
        Prisma[Prisma ORM]
        DB[(Database)]
    end

    subgraph AI
        Gemini[Gemini API]
    end

    API --> Customer
    API --> Audience
    API --> Campaign
    API --> Analytics

    Customer --> Prisma
    Audience --> Prisma
    Campaign --> Prisma
    Analytics --> Prisma

    Prisma --> DB

    Audience --> Gemini
    Campaign --> Gemini
```

---

# Campaign Flow

```mermaid
sequenceDiagram
    autonumber

    actor User

    participant UI as CRM Dashboard
    participant API as API Routes
    participant Gemini as Gemini AI
    participant DB as Database

    User->>UI: Upload customers and orders
    UI->>API: Save data
    API->>DB: Store records

    User->>UI: Create audience segment
    UI->>API: Send segment request
    API->>Gemini: Generate audience rules
    Gemini-->>API: Segment criteria
    API->>DB: Find matching customers
    API-->>UI: Audience preview

    User->>UI: Generate campaign
    UI->>API: Campaign goal
    API->>Gemini: Generate campaign content
    Gemini-->>API: Campaign message
    API-->>UI: Show campaign draft

    User->>UI: Launch campaign
    UI->>API: Launch request
    API->>DB: Create communication records

    User->>UI: View analytics
    UI->>API: Request campaign stats
    API->>DB: Fetch results
    API-->>UI: Show analytics
```

---

# API Endpoints

| Method | Endpoint | Purpose |
|----------|----------|----------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| POST | `/api/dashboard/seed` | Seed sample data |
| POST | `/api/dashboard/reset` | Reset database |
| POST | `/api/upload/customers` | Upload customer CSV |
| POST | `/api/upload/orders` | Upload order CSV |
| POST | `/api/segmentation` | Generate audience segment |
| POST | `/api/campaign` | Generate or launch campaign |
| GET | `/api/campaign?type=metrics` | Get campaign analytics |

---

# Project Structure

```text
src
├── app
│   ├── dashboard
│   ├── customers-orders
│   ├── audience-segments
│   ├── campaign-engine
│   ├── analytics
│   └── api

├── components
│   ├── dashboard
│   └── ui

├── services
│   ├── customer
│   ├── audience
│   ├── campaign
│   └── analytics

├── prisma
│   ├── schema.prisma
│   └── seed.js
```

---

# Setup

## 1. Create Environment File

```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_database_url
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Setup Database

```bash
npx prisma db push
npx prisma db seed
```

## 4. Start Application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```
