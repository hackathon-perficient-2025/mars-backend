# Mars Resource Management System - Data Flow

## Complete User Journey: Resource Monitoring

```mermaid
journey
    title User Journey: Monitoring Critical Resource
    section Login
      Open Dashboard: 5: User
      View Resources: 5: User
    section Alert Detection
      System Detects Low Water: 3: System
      Alert Created: 3: System
      Push Notification Sent: 4: System
    section User Action
      User Sees Alert: 2: User
      Views Resource Details: 3: User
      Checks Analytics: 3: User
      Creates Resupply Request: 4: User
    section Resolution
      Request Approved: 5: Admin
      Resupply Scheduled: 5: System
      Resource Restocked: 5: System
      Alert Resolved: 5: User
```

## State Machine: Resource Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Optimal: Resource Created<br/>Level > 80%

    Optimal --> Stable: Consumption<br/>80% > Level > 40%
    Stable --> Warning: Consumption<br/>40% > Level > 20%
    Warning --> Critical: Consumption<br/>Level < 20%

    Critical --> Warning: Resupply<br/>Level > 20%
    Warning --> Stable: Resupply<br/>Level > 40%
    Stable --> Optimal: Resupply<br/>Level > 80%

    Critical --> AlertCreated: Auto-trigger
    Warning --> AlertCreated: Auto-trigger

    AlertCreated --> ResupplyRequested: User Action
    ResupplyRequested --> Pending: System Process
    Pending --> InTransit: Approval
    InTransit --> Delivered: Arrival
    Delivered --> Optimal: Restock

    state AlertCreated {
        [*] --> Active
        Active --> Acknowledged: User Views
        Acknowledged --> Resolved: Issue Fixed
        Resolved --> [*]
    }
```

## Alert System Flow

```mermaid
flowchart TD
    Start([Background Job Running]) --> CheckTime{Every 10<br/>Seconds}
    CheckTime -->|Timer Triggers| GetResources[Get All Resources<br/>from Database]

    GetResources --> Loop{For Each<br/>Resource}

    Loop --> CalcPercent[Calculate Percentage<br/>currentLevel / maxCapacity × 100]

    CalcPercent --> CheckLevel{Check<br/>Level}

    CheckLevel -->|< 20%| IsCritical{Already has<br/>Critical Alert?}
    CheckLevel -->|20-40%| IsWarning{Already has<br/>Warning Alert?}
    CheckLevel -->|> 40%| NoAction[No Action Needed]

    IsCritical -->|No| CreateCritical[Create Critical Alert<br/>severity: 'critical']
    IsCritical -->|Yes| NoAction

    IsWarning -->|No| CreateWarning[Create Warning Alert<br/>severity: 'warning']
    IsWarning -->|Yes| NoAction

    CreateCritical --> SaveAlert[Save Alert to Database]
    CreateWarning --> SaveAlert

    SaveAlert --> EmitSocket[Emit Socket Event<br/>'alert:new']
    EmitSocket --> NotifyUsers[Frontend Receives<br/>Show Notification]

    NotifyUsers --> CheckPriority{Is<br/>Critical?}
    CheckPriority -->|Yes| AutoRequest[Auto-create<br/>Resupply Request]
    CheckPriority -->|No| UserDecision[User Decides<br/>Next Action]

    AutoRequest --> Next
    UserDecision --> Next
    NoAction --> Next

    Next{More<br/>Resources?}
    Next -->|Yes| Loop
    Next -->|No| Wait[Wait 10 Seconds]
    Wait --> CheckTime

    style CreateCritical fill:#f44336,stroke:#333,stroke-width:2px,color:#fff
    style CreateWarning fill:#ff9800,stroke:#333,stroke-width:2px
    style EmitSocket fill:#2196f3,stroke:#333,stroke-width:2px,color:#fff
```

## Resource Update Cycle

```mermaid
flowchart LR
    subgraph "Backend Job (Every 5s)"
        Start([Timer Triggers]) --> Fetch[Fetch All Resources]
        Fetch --> Simulate[Simulate Consumption]
        Simulate --> Calculate[Calculate New Levels<br/>level -= consumptionRate]
        Calculate --> Validate{Level > 0?}
        Validate -->|Yes| Save[Save to Database]
        Validate -->|No| SetZero[Set Level = 0]
        SetZero --> Save
        Save --> Emit[Emit Socket Event]
    end

    subgraph "Frontend (Real-time)"
        Emit --> Listen[Socket Listener<br/>'resource:updated']
        Listen --> UpdateState[Update React State]
        UpdateState --> Render[Re-render Components]
        Render --> Display[Update Dashboard<br/>Charts & Gauges]
    end

    subgraph "Analytics (Every 30s)"
        Emit --> Metrics[Collect Metrics]
        Metrics --> Analyze[Calculate Trends]
        Analyze --> Store[(Store Analytics)]
    end

    style Emit fill:#2196f3,stroke:#333,stroke-width:2px,color:#fff
    style Display fill:#61dafb,stroke:#333,stroke-width:2px
```

## CRUD Operations Flow

```mermaid
graph TB
    subgraph "CREATE"
        C1[POST /api/resources] --> C2[Validate Request Body]
        C2 --> C3[Service.create]
        C3 --> C4[Repository.create]
        C4 --> C5[Model.create]
        C5 --> C6[(Insert into MongoDB)]
        C6 --> C7[Return Created Resource]
        C7 --> C8[HTTP 201 Created]
    end

    subgraph "READ"
        R1[GET /api/resources/:id] --> R2[Extract ID from params]
        R2 --> R3[Service.getById]
        R3 --> R4[Repository.findById]
        R4 --> R5[Model.findById]
        R5 --> R6[(Query MongoDB)]
        R6 --> R7{Found?}
        R7 -->|Yes| R8[Return Resource]
        R7 -->|No| R9[Throw NotFoundError]
        R8 --> R10[HTTP 200 OK]
        R9 --> R11[HTTP 404 Not Found]
    end

    subgraph "UPDATE"
        U1[PUT /api/resources/:id] --> U2[Validate Request Body]
        U2 --> U3[Service.update]
        U3 --> U4[Repository.update]
        U4 --> U5[Model.findByIdAndUpdate]
        U5 --> U6[(Update in MongoDB)]
        U6 --> U7[Return Updated Resource]
        U7 --> U8[Emit Socket Event<br/>'resource:updated']
        U8 --> U9[HTTP 200 OK]
    end

    subgraph "DELETE"
        D1[DELETE /api/resources/:id] --> D2[Extract ID]
        D2 --> D3[Service.delete]
        D3 --> D4[Repository.delete]
        D4 --> D5[Model.findByIdAndDelete]
        D5 --> D6[(Delete from MongoDB)]
        D6 --> D7[Return Success]
        D7 --> D8[HTTP 204 No Content]
    end

    style C8 fill:#4caf50,stroke:#333,stroke-width:2px,color:#fff
    style R10 fill:#2196f3,stroke:#333,stroke-width:2px,color:#fff
    style U9 fill:#ff9800,stroke:#333,stroke-width:2px
    style D8 fill:#f44336,stroke:#333,stroke-width:2px,color:#fff
```

## Authentication & Authorization Flow (Future)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Auth as Auth Service
    participant DB as Database

    User->>Frontend: Enter Credentials
    Frontend->>Backend: POST /api/auth/login
    Backend->>Auth: Validate Credentials
    Auth->>DB: Find User
    DB-->>Auth: User Data
    Auth->>Auth: Compare Password Hash

    alt Valid Credentials
        Auth->>Auth: Generate JWT Token
        Auth-->>Backend: Token + User Info
        Backend-->>Frontend: 200 OK + Token
        Frontend->>Frontend: Store Token in LocalStorage
        Frontend->>Frontend: Set Auth Header<br/>Authorization: Bearer {token}
        Frontend-->>User: Redirect to Dashboard
    else Invalid Credentials
        Auth-->>Backend: Authentication Failed
        Backend-->>Frontend: 401 Unauthorized
        Frontend-->>User: Show Error Message
    end

    Note over Frontend,Backend: Subsequent Requests

    User->>Frontend: Request Protected Resource
    Frontend->>Backend: GET /api/resources<br/>Authorization: Bearer {token}
    Backend->>Auth: Verify Token

    alt Valid Token
        Auth-->>Backend: User Info
        Backend->>DB: Get Resources
        DB-->>Backend: Resources
        Backend-->>Frontend: 200 OK + Resources
        Frontend-->>User: Display Resources
    else Invalid/Expired Token
        Auth-->>Backend: Invalid Token
        Backend-->>Frontend: 401 Unauthorized
        Frontend->>Frontend: Clear Token
        Frontend-->>User: Redirect to Login
    end
```

## Analytics Data Pipeline

```mermaid
graph TB
    subgraph "Data Collection"
        Job[Metrics Collection Job<br/>Every 30 seconds] --> Collect[Collect Current State]
        Collect --> R[Resources]
        Collect --> A[Alerts]
        Collect --> RV[Rovers]
    end

    subgraph "Processing"
        R --> Calc1[Calculate Resource Metrics]
        A --> Calc2[Count Alert Frequency]
        RV --> Calc3[Track Rover Activity]

        Calc1 --> Metric1[Consumption Rate Trends]
        Calc1 --> Metric2[Level Changes Over Time]

        Calc2 --> Metric3[Alert Patterns]
        Calc2 --> Metric4[Critical Events Count]

        Calc3 --> Metric5[Rover Utilization]
        Calc3 --> Metric6[Battery Drain Rate]
    end

    subgraph "Storage"
        Metric1 --> Store[(Analytics Collection)]
        Metric2 --> Store
        Metric3 --> Store
        Metric4 --> Store
        Metric5 --> Store
        Metric6 --> Store
    end

    subgraph "Analysis"
        Store --> Trend[Trend Analysis]
        Store --> Anomaly[Anomaly Detection]
        Store --> Predict[Predictive Models]

        Trend --> Report1[Weekly Reports]
        Anomaly --> Report2[Unusual Patterns]
        Predict --> Report3[Consumption Forecasts]
    end

    subgraph "Delivery"
        Report1 --> API[Analytics API Endpoints]
        Report2 --> API
        Report3 --> API

        API --> Dashboard[Frontend Dashboard]
        API --> Alerts[Alert System]
    end

    style Store fill:#4caf50,stroke:#333,stroke-width:2px
    style API fill:#2196f3,stroke:#333,stroke-width:2px,color:#fff
```

## Resupply Request Workflow

```mermaid
stateDiagram-v2
    [*] --> ResourceLow: Resource < 30%

    ResourceLow --> AlertCreated: System Alert
    AlertCreated --> UserNotified: Push Notification

    UserNotified --> UserDecision: User Views Alert

    state UserDecision {
        [*] --> ReviewOptions
        ReviewOptions --> CheckInventory: View Analytics
        CheckInventory --> EstimateDemand: Calculate Needs
    }

    UserDecision --> CreateRequest: User Submits

    state CreateRequest {
        [*] --> FillForm
        FillForm --> SelectResource
        SelectResource --> SpecifyQuantity
        SpecifyQuantity --> SetPriority
        SetPriority --> Submit
    }

    CreateRequest --> Pending: Request Created

    Pending --> AdminReview: Notify Admin

    state AdminReview {
        [*] --> ValidateRequest
        ValidateRequest --> CheckBudget
        CheckBudget --> VerifyNeed
    }

    AdminReview --> Approved: Accept
    AdminReview --> Rejected: Deny

    Rejected --> [*]: Notify User

    Approved --> Scheduled: Add to Queue
    Scheduled --> InTransit: Cargo Ship Departs
    InTransit --> Arrived: Landed on Mars
    Arrived --> Delivered: Unloaded & Verified

    Delivered --> UpdateInventory: Add to Resources
    UpdateInventory --> AlertResolved: Close Alert
    AlertResolved --> [*]: Complete

    note right of Pending
        Priority Levels:
        - Low (7+ days)
        - Medium (3-7 days)
        - High (1-3 days)
        - Critical (< 24 hours)
    end note
```

## Testing Strategy Flow

```mermaid
graph TB
    subgraph "Development"
        Code[Write Code] --> UnitTest[Write Unit Tests]
        UnitTest --> RunUnit[npm test]
        RunUnit --> Pass{All Pass?}
        Pass -->|No| Fix[Fix Issues]
        Fix --> Code
        Pass -->|Yes| Commit[Git Commit]
    end

    subgraph "CI Pipeline"
        Commit --> GH[Push to GitHub]
        GH --> CI[GitHub Actions Trigger]
        CI --> InstallDeps[Install Dependencies]
        InstallDeps --> Lint[Run ESLint]
        Lint --> TestUnit[Run Unit Tests]
        TestUnit --> TestInt[Run Integration Tests]
        TestInt --> Coverage[Check Coverage]

        Coverage --> CovPass{> 80%?}
        CovPass -->|No| FailCI[❌ CI Failed]
        CovPass -->|Yes| Build[Build TypeScript]

        Build --> BuildPass{Success?}
        BuildPass -->|No| FailCI
        BuildPass -->|Yes| SuccessCI[✅ CI Passed]
    end

    subgraph "Deployment"
        SuccessCI --> Deploy[Deploy to Vercel]
        Deploy --> E2E[Run E2E Tests<br/>on Staging]
        E2E --> E2EPass{Pass?}
        E2EPass -->|No| Rollback[Rollback Deployment]
        E2EPass -->|Yes| Production[✅ Production Release]
    end

    style FailCI fill:#f44336,stroke:#333,stroke-width:2px,color:#fff
    style SuccessCI fill:#4caf50,stroke:#333,stroke-width:2px,color:#fff
    style Production fill:#4caf50,stroke:#333,stroke-width:2px,color:#fff
```
