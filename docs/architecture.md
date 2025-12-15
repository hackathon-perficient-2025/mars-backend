# Mars Resource Management System - Architecture

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        FE[React Frontend<br/>TypeScript + Vite]
        Mobile[Mobile/Tablet<br/>Responsive UI]
    end

    subgraph "Communication Layer"
        REST[REST API<br/>HTTP/HTTPS]
        WS[WebSocket<br/>Socket.IO]
    end

    subgraph "Backend Layer"
        subgraph "Express Server"
            Router[Express Router<br/>Route Definitions]
            MW[Middleware Layer<br/>CORS, Auth, Logging]
            Controller[Controllers<br/>HTTP Handlers]
        end

        subgraph "Business Logic"
            Service[Services<br/>Business Rules]
            Jobs[Background Jobs<br/>Cron-like Tasks]
        end

        subgraph "Data Access"
            Repo[Repositories<br/>Data Queries]
            Models[Mongoose Models<br/>Schema Definitions]
        end
    end

    subgraph "Database Layer"
        DB[(MongoDB Atlas<br/>Cloud Database)]
    end

    subgraph "External Services"
        Swagger[Swagger UI<br/>API Documentation]
        Analytics[Analytics Service<br/>Metrics & Predictions]
    end

    FE -->|HTTP Requests| REST
    FE -->|Real-time Events| WS
    Mobile -->|HTTP Requests| REST
    Mobile -->|Real-time Events| WS

    REST --> Router
    WS --> Router

    Router --> MW
    MW --> Controller
    Controller --> Service
    Service --> Repo
    Service --> Jobs
    Repo --> Models
    Models --> DB

    Jobs -->|Emit Events| WS
    Jobs --> Repo

    Service --> Analytics
    Controller --> Swagger

    style FE fill:#61dafb,stroke:#333,stroke-width:2px
    style DB fill:#4caf50,stroke:#333,stroke-width:2px
    style Service fill:#ff9800,stroke:#333,stroke-width:2px
    style WS fill:#f44336,stroke:#333,stroke-width:2px
```

## Layered Architecture

```mermaid
graph LR
    subgraph "Presentation Layer"
        UI[User Interface<br/>React Components]
    end

    subgraph "API Layer"
        Routes[Routes<br/>URL Mapping]
        Controllers[Controllers<br/>Request/Response<br/>HTTP Status Codes]
    end

    subgraph "Business Layer"
        Services[Services<br/>Business Logic<br/>Validations<br/>Calculations]
    end

    subgraph "Data Layer"
        Repositories[Repositories<br/>Database Queries<br/>CRUD Operations]
        Models[Models<br/>Schema Definitions<br/>Data Validation]
    end

    subgraph "Database"
        MongoDB[(MongoDB<br/>Collections)]
    end

    UI <-->|REST API<br/>WebSocket| Routes
    Routes --> Controllers
    Controllers --> Services
    Services --> Repositories
    Repositories --> Models
    Models --> MongoDB

    style UI fill:#61dafb,stroke:#333,stroke-width:2px
    style Services fill:#ff9800,stroke:#333,stroke-width:2px
    style MongoDB fill:#4caf50,stroke:#333,stroke-width:2px
```

## Request Flow (HTTP)

```mermaid
sequenceDiagram
    participant Client as Frontend Client
    participant Router as Express Router
    participant MW as Middleware
    participant Ctrl as Controller
    participant Svc as Service
    participant Repo as Repository
    participant DB as MongoDB

    Client->>Router: GET /api/resources
    Router->>MW: Route Matched
    MW->>MW: CORS Check
    MW->>MW: Request Logging
    MW->>Ctrl: Next()

    Ctrl->>Svc: getAllResources()
    Svc->>Svc: Apply Business Logic
    Svc->>Repo: findAll()
    Repo->>DB: Resource.find()
    DB-->>Repo: [Resource Documents]
    Repo-->>Svc: [Resource Objects]

    Svc->>Svc: Calculate Status<br/>(critical/warning/optimal)
    Svc->>Svc: Calculate Days Remaining
    Svc-->>Ctrl: [Enhanced Resources]

    Ctrl->>Ctrl: Format Response
    Ctrl-->>Client: HTTP 200 + JSON
```

## Real-time Updates (WebSocket)

```mermaid
sequenceDiagram
    participant Client as Frontend Client
    participant Socket as Socket.IO Server
    participant Job as Background Job
    participant Svc as Service
    participant Repo as Repository
    participant DB as MongoDB

    Client->>Socket: Connect
    Socket-->>Client: Connection Established

    loop Every 5 seconds
        Job->>Repo: findAll()
        Repo->>DB: Resource.find()
        DB-->>Repo: [Resources]
        Repo-->>Job: [Resources]

        Job->>Job: Simulate Consumption<br/>currentLevel -= consumptionRate
        Job->>DB: Save Updated Resources

        Job->>Socket: emit('resource:updated', resource)
        Socket-->>Client: Resource Update Event
        Client->>Client: Update Dashboard UI
    end

    loop Every 10 seconds
        Job->>Svc: checkAlerts()
        Svc->>Repo: findCriticalResources()
        Repo-->>Svc: [Critical Resources]

        alt Resource is Critical
            Svc->>DB: Create Alert
            Svc->>Socket: emit('alert:new', alert)
            Socket-->>Client: Alert Notification
            Client->>Client: Show Alert Banner
        end
    end
```

## Background Jobs System

```mermaid
graph TB
    Start[Server Startup] --> Init[Initialize Jobs]

    Init --> Job1[Resource Update Job<br/>Every 5 seconds]
    Init --> Job2[Alert Check Job<br/>Every 10 seconds]
    Init --> Job3[Rover Update Job<br/>Every 8 seconds]
    Init --> Job4[Metrics Collection<br/>Every 30 seconds]

    Job1 --> A1[Get All Resources]
    A1 --> A2[Simulate Consumption]
    A2 --> A3[Update Database]
    A3 --> A4[Emit Socket Event]
    A4 --> Job1

    Job2 --> B1[Get All Resources]
    B1 --> B2{Check Thresholds}
    B2 -->|Critical| B3[Create Alert]
    B2 -->|Warning| B4[Create Warning]
    B2 -->|OK| B5[No Action]
    B3 --> B6[Emit Alert Event]
    B4 --> B6
    B5 --> Job2
    B6 --> Job2

    Job3 --> C1[Get All Rovers]
    C1 --> C2[Update Position]
    C2 --> C3[Update Status]
    C3 --> C4[Emit Rover Event]
    C4 --> Job3

    Job4 --> D1[Collect Metrics]
    D1 --> D2[Calculate Statistics]
    D2 --> D3[Store in Analytics]
    D3 --> Job4

    style Job1 fill:#4caf50,stroke:#333,stroke-width:2px
    style Job2 fill:#ff9800,stroke:#333,stroke-width:2px
    style Job3 fill:#2196f3,stroke:#333,stroke-width:2px
    style Job4 fill:#9c27b0,stroke:#333,stroke-width:2px
```

## Database Schema

```mermaid
erDiagram
    RESOURCE {
        string id PK
        string type "oxygen|water|food|energy"
        string name
        number currentLevel
        number maxCapacity
        number consumptionRate
        number criticalThreshold
        number warningThreshold
        date lastUpdated
    }

    ALERT {
        string id PK
        string resourceId FK
        string type "critical|warning"
        string message
        string status "active|resolved"
        date timestamp
        date resolvedAt
    }

    ROVER {
        string id PK
        string name
        string status "active|maintenance|offline"
        number batteryLevel
        object position "x,y,z"
        number speed
        date lastCommunication
    }

    RESUPPLY_REQUEST {
        string id PK
        string resourceId FK
        string status "pending|approved|completed"
        number quantity
        string priority "low|medium|high|critical"
        date requestedAt
        date estimatedArrival
    }

    ANALYTICS_METRIC {
        string id PK
        string resourceId FK
        date timestamp
        number level
        number consumptionRate
        object metadata
    }

    RESOURCE ||--o{ ALERT : triggers
    RESOURCE ||--o{ RESUPPLY_REQUEST : requires
    RESOURCE ||--o{ ANALYTICS_METRIC : tracks
```

## Service Dependencies

```mermaid
graph TB
    subgraph "Controllers"
        RC[ResourceController]
        AC[AlertController]
        RVC[RoverController]
        RSC[ResupplyController]
        ANC[AnalyticsController]
    end

    subgraph "Services"
        RS[ResourceService]
        AS[AlertService]
        RVS[RoverService]
        RSS[ResupplyService]
        ANS[AnalyticsService]
    end

    subgraph "Repositories"
        RR[ResourceRepository]
        AR[AlertRepository]
        RVR[RoverRepository]
        RSR[ResupplyRepository]
        ANR[AnalyticsRepository]
    end

    RC --> RS
    AC --> AS
    RVC --> RVS
    RSC --> RSS
    ANC --> ANS

    RS --> RR
    AS --> AR
    RVS --> RVR
    RSS --> RSR
    ANS --> ANR

    AS -.->|Read Resources| RR
    RSS -.->|Read Resources| RR
    ANS -.->|Read Resources| RR
    ANS -.->|Read Alerts| AR

    style RS fill:#ff9800,stroke:#333,stroke-width:2px
    style AS fill:#ff9800,stroke:#333,stroke-width:2px
    style RVS fill:#ff9800,stroke:#333,stroke-width:2px
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        Dev[Developer]
        Local[Local Environment<br/>npm run dev]
    end

    subgraph "CI/CD Pipeline"
        GH[GitHub Repository]
        GHA[GitHub Actions<br/>Test & Build]
    end

    subgraph "Production"
        subgraph "Vercel"
            VBE[Backend API<br/>Serverless Functions]
            VFE[Frontend App<br/>Static Hosting]
        end

        subgraph "MongoDB Atlas"
            DBProd[(Production Database<br/>Cloud Cluster)]
        end
    end

    Dev -->|git push| GH
    GH -->|trigger| GHA

    GHA -->|Run Tests| GHA
    GHA -->|Build TypeScript| GHA
    GHA -->|Deploy Backend| VBE
    GHA -->|Deploy Frontend| VFE

    VBE <-->|mongoose| DBProd
    VFE <-->|REST API| VBE
    VFE <-->|WebSocket| VBE

    Local <-->|Test Connection| DBProd

    style GHA fill:#2196f3,stroke:#333,stroke-width:2px
    style VBE fill:#000,stroke:#fff,stroke-width:2px,color:#fff
    style VFE fill:#000,stroke:#fff,stroke-width:2px,color:#fff
    style DBProd fill:#4caf50,stroke:#333,stroke-width:2px
```

## Error Handling Flow

```mermaid
graph TB
    Request[Client Request] --> Controller

    Controller --> Try{Try Block}
    Try -->|Success| Service
    Try -->|Error| Catch[Catch Block]

    Service --> SvcTry{Try Block}
    SvcTry -->|Success| Repository
    SvcTry -->|Error| SvcCatch[Service Error]

    Repository --> RepoTry{Try Block}
    RepoTry -->|Success| DB[(Database)]
    RepoTry -->|Error| RepoCatch[Repository Error]

    DB -->|Success| Response[HTTP 200 Response]
    DB -->|Error| DBError[Database Error]

    Catch --> ErrorMW[Error Middleware]
    SvcCatch --> ErrorMW
    RepoCatch --> ErrorMW
    DBError --> ErrorMW

    ErrorMW --> CheckError{Error Type}
    CheckError -->|ValidationError| E400[HTTP 400<br/>Bad Request]
    CheckError -->|NotFoundError| E404[HTTP 404<br/>Not Found]
    CheckError -->|AppError| ECustom[Custom Status Code]
    CheckError -->|Unknown| E500[HTTP 500<br/>Internal Server Error]

    E400 --> Log[Log Error]
    E404 --> Log
    ECustom --> Log
    E500 --> Log
    Log --> Client[Error Response to Client]

    style ErrorMW fill:#f44336,stroke:#333,stroke-width:2px,color:#fff
    style E500 fill:#d32f2f,stroke:#333,stroke-width:2px,color:#fff
```
