# Architecture Overview - School Fee Management System

## 🏛️ System Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                 │
│              http://localhost:5173/                          │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Dashboard  │  │   Students   │  │  Fee Struct  │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌──────────────────────────────┐  ┌───────────────────┐   │
│  │  Bills & Payments Module     │  │   Navigation UI   │   │
│  │  (PDF Download)              │  │  (Header, Sidebar)│   │
│  └──────────────────────────────┘  └───────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Axios HTTP Client (src/services/api.js)       │   │
│  │  studentAPI | feeStructureAPI | billAPI | healthAPI │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTP Requests
                  ┌──────────────────────┐
                  │   CORS Bridge        │
                  │  (localhost:5000)    │
                  └──────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                │
│               http://localhost:5000/api                     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │           Express.js Router                        │   │
│  │  /students | /fee-structures | /bills | /health    │   │
│  └────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │          Controllers (Business Logic)              │   │
│  │  studentController | billController |             │   │
│  │  feeStructureController                           │   │
│  └────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │           Middleware (Validation)                  │   │
│  │  errorHandler | validate | asyncHandler            │   │
│  └────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │            Mongoose Models                         │   │
│  │  Student | Bill | FeeStructure                     │   │
│  └────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │    PDF Generator (NEW - pdfGenerator.js)           │   │
│  │    Generates professional invoices                 │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓ Database Operations
                  ┌──────────────────────┐
                  │   MongoDB Atlas      │
                  │  (Cloud Database)    │
                  │                      │
                  │ Collections:         │
                  │ - students           │
                  │ - bills              │
                  │ - feestructures      │
                  └──────────────────────┘
```

---

## 📱 Frontend Architecture

### Component Hierarchy

```
App.jsx (Main Container)
│
├── Header.jsx (Top Navigation)
│   ├── School Logo/Name
│   ├── Notification Bell
│   ├── Settings
│   └── Logout Button
│
├── Sidebar.jsx (Left Navigation)
│   ├── Dashboard Link
│   ├── Students Link
│   ├── Fee Structures Link
│   ├── Bills & Payments Link
│   └── Version Info
│
└── Main Content Area (Dynamic)
    │
    ├── Dashboard.jsx (Stats & Overview)
    │   ├── Stat Cards (5 KPIs)
    │   ├── Status Breakdown Table
    │   └── Monthly Analytics
    │
    ├── Students.jsx (CRUD Operations)
    │   ├── Search Bar (Name, Roll, Parent)
    │   ├── Filter Dropdowns (Class, Section)
    │   ├── Student Table
    │   │   ├── Name Column
    │   │   ├── Roll Number Column
    │   │   ├── Class-Section Badge
    │   │   ├── Parent Name Column
    │   │   ├── Contact Number Column
    │   │   └── Actions (View/Edit/Delete)
    │   └── Pagination Controls
    │
    ├── FeeStructures.jsx (View & Manage)
    │   ├── Class Filter Dropdown
    │   ├── Fee Cards Grid (3 columns)
    │   │   ├── Fee Type
    │   │   ├── Amount
    │   │   ├── Billing Cycle
    │   │   └── Actions (Edit/Delete)
    │   └── Add New Button
    │
    └── Bills.jsx (Main Hub)
        ├── Action Buttons
        │   ├── Generate Monthly Bills
        │   └── Manual Bill Create
        ├── Status Filter Dropdown
        ├── Bills Table
        │   ├── Bill Number (Blue, Monospace)
        │   ├── Student Name
        │   ├── Class-Section
        │   ├── Amount
        │   ├── Paid
        │   ├── Due
        │   ├── Status Badge
        │   └── Actions
        │       ├── 📥 Download PDF ✓ (WORKING)
        │       ├── 💰 Record Payment (TODO)
        │       └── 👁️ View Details
        └── Pagination Controls
```

### State Management Flow

```
React Hooks (useState, useEffect)
│
├── useEffect() - Runs on component mount
│   ├── Calls API to fetch data
│   ├── Sets loading state
│   └── Handles errors
│
├── useState() - Manages component state
│   ├── data - API response
│   ├── loading - Loading indicator
│   ├── error - Error messages
│   ├── filters - Search/filter values
│   ├── pagination - Current page
│   └── selectedItems - For bulk actions
│
└── Event Handlers
    ├── onClick - Button interactions
    ├── onChange - Filter/search changes
    ├── onSubmit - Form submissions
    └── onPaginationChange - Page navigation
```

### API Service Layer (src/services/api.js)

```
Axios Instance
├── Base URL: http://localhost:5000/api
├── Headers: Content-Type: application/json
└── Interceptors
    ├── Response interceptor - Log errors
    └── Ready for auth token injection (Phase 4)

Grouped Endpoints
│
├── studentAPI
│   ├── list()           - GET /students
│   ├── get(id)          - GET /students/:id
│   ├── create()         - POST /students
│   ├── update(id, data) - PUT /students/:id
│   ├── delete(id)       - DELETE /students/:id
│   ├── stats()          - GET /students/stats/summary
│   └── getBills(id)     - GET /students/:id/bills
│
├── feeStructureAPI
│   ├── list()           - GET /fee-structures
│   ├── get(id)          - GET /fee-structures/:id
│   ├── create()         - POST /fee-structures
│   ├── update(id, data) - PUT /fee-structures/:id
│   ├── delete(id)       - DELETE /fee-structures/:id
│   ├── getByClass()     - GET /fee-structures/class/:name
│   └── bulkCreate()     - POST /fee-structures/bulk
│
├── billAPI
│   ├── list()           - GET /bills
│   ├── get(id)          - GET /bills/:id
│   ├── create()         - POST /bills
│   ├── update(id, data) - PUT /bills/:id
│   ├── delete(id)       - DELETE /bills/:id
│   ├── recordPayment()  - POST /bills/:id/payments
│   ├── downloadPDF()    - GET /bills/:id/pdf (blob)
│   ├── generate()       - POST /bills/generate
│   ├── getByStudent()   - GET /bills/student/:studentId
│   └── stats()          - GET /bills/stats/summary
│
└── healthAPI
    └── check()          - GET /health
```

---

## 🖥️ Backend Architecture

### Express.js Request Pipeline

```
Client Request (HTTP)
│
↓
┌─────────────────────────────────────┐
│     CORS Middleware                 │
│  (Allow requests from localhost:3000)│
└─────────────────────────────────────┘
│
↓
┌─────────────────────────────────────┐
│     Body Parser Middleware          │
│  (Parse JSON request bodies)        │
└─────────────────────────────────────┘
│
↓
┌─────────────────────────────────────┐
│     Route Matching                  │
│  (Find appropriate route handler)   │
└─────────────────────────────────────┘
│
↓
┌─────────────────────────────────────┐
│     Validation Middleware           │
│  (Validate request parameters)      │
└─────────────────────────────────────┘
│
↓
┌─────────────────────────────────────┐
│     Controller Handler              │
│  (Execute business logic)           │
│  - Query database                   │
│  - Process data                     │
│  - Generate responses               │
└─────────────────────────────────────┘
│
↓
┌─────────────────────────────────────┐
│     Error Handler Middleware        │
│  (Catch and format errors)          │
└─────────────────────────────────────┘
│
↓
Response (JSON or PDF)
```

### Controller Flow (Example: billController.js)

```
downloadBillPDF(req, res)
│
├─ 1. Extract Bill ID from URL parameter
│  └─ req.params.id
│
├─ 2. Query Database
│  ├─ Find bill by ID
│  ├─ Populate student reference
│  └─ Handle not found error
│
├─ 3. Generate PDF
│  ├─ Call pdfGenerator.generateBillPDF()
│  └─ Pass bill + student data
│
├─ 4. Set Response Headers
│  ├─ Content-Type: application/pdf
│  ├─ Content-Disposition: inline (view) or attachment (download)
│  └─ Filename: Bill_[billNumber].pdf
│
├─ 5. Stream PDF to Client
│  ├─ Pipe PDF document to response
│  └─ End response stream
│
└─ 6. Error Handling
   ├─ Catch PDF generation errors → 500 response
   ├─ Catch database errors → 400/404 response
   └─ Log error for debugging
```

### PDF Generator Module (pdfGenerator.js)

```
generateBillPDF(bill, student)
│
├─ 1. Create PDF Document
│  └─ Return PDFDocument stream
│
├─ 2. Add School Header
│  ├─ School name/logo
│  ├─ Address
│  ├─ Contact info
│  └─ Email/website
│
├─ 3. Add Bill Metadata Section
│  ├─ Bill number
│  ├─ Issue date
│  ├─ Due date
│  └─ Status badge (color-coded)
│
├─ 4. Add Student Information
│  ├─ Name
│  ├─ Roll number
│  ├─ Class & section
│  ├─ Parent name
│  ├─ Contact number
│  └─ Address
│
├─ 5. Add Itemized Fees Table
│  ├─ Fee description
│  ├─ Billing cycle
│  ├─ Amount per item
│  └─ Total column
│
├─ 6. Add Payment Summary
│  ├─ Total amount
│  ├─ Discount (if any)
│  ├─ Fine/late fee
│  ├─ Net payable
│  ├─ Total paid amount
│  └─ Balance due
│
├─ 7. Add Payment History
│  ├─ Previous payment date
│  ├─ Payment method
│  ├─ Amount paid
│  └─ Transaction ID
│
├─ 8. Add Footer Section
│  ├─ Terms & conditions
│  ├─ Signature line
│  ├─ Principal stamp area
│  └─ School seal placeholder
│
└─ Return: PDF Document Stream
```

### Database Schema Relationships

```
┌──────────────────────────────────┐
│         STUDENTS                 │
│                                  │
│ _id                              │
│ name          (String)           │
│ rollNumber    (String, Unique)   │
│ class         (String) ◄────┐    │
│ section       (String)      │    │
│ parentName    (String)      │    │
│ contactNumber (String)      │    │
│ address       (String)      │    │
│ status        (Boolean)     │    │
│ createdAt     (Date)        │    │
│ updatedAt     (Date)        │    │
│                              │    │
└──────────────────────────────│────┘
                               │
              ┌────────────────┼────────────────┐
              ↓                ↓                ↓
    ┌──────────────────┐  ┌──────────────────┐
    │      BILLS       │  │  FEE_STRUCTURES  │
    │                  │  │                  │
    │ _id              │  │ _id              │
    │ billNumber       │  │ className ◄──────┤────┐
    │ student ◄────────┼──┤ feeType          │    │
    │ issueDate        │  │ amount           │    │
    │ dueDate          │  │ billingCycle     │    │
    │ totalAmount      │  │ description      │    │
    │ discount         │  │ status           │    │
    │ fine             │  │ createdAt        │    │
    │ payments: [ ]    │  │ updatedAt        │    │
    │ ├─ date          │  │                  │    │
    │ ├─ method        │  └──────────────────┘    │
    │ ├─ amount        │                         │
    │ └─ transactionId │                         │
    │ status           │                         │
    │ createdAt        │                         │
    │ updatedAt        │                         │
    │                  │                         │
    └──────────────────┘                         │
            │ (Many bills → 1 student)           │
            │ (Bill contains fee items)          │
            └─────────────────────────────────────┘
                   (Populated from fee structures)
```

---

## 🔄 Data Flow Examples

### Example 1: Download PDF Invoice

```
USER INTERACTION
│
├─ Click PDF icon on bill row
│  └─ Bills.jsx: onClick handler
│
↓
FRONTEND
│
├─ Extract bill ID from table row
├─ Call: billAPI.downloadPDF(billId)
│  └─ Axios: GET /api/bills/:id/pdf
│     └─ responseType: 'blob'
│
↓
NETWORK REQUEST
│
├─ HTTP GET http://localhost:5000/api/bills/:id/pdf
└─ Headers: Accept: application/pdf
│
↓
BACKEND
│
├─ billController.downloadBillPDF()
├─ Find bill in database
├─ Populate student reference
├─ Call pdfGenerator.generateBillPDF()
├─ Set response headers
│  └─ Content-Type: application/pdf
│  └─ Content-Disposition: attachment
└─ Pipe PDF stream to response
│
↓
NETWORK RESPONSE
│
├─ Status: 200 OK
├─ Headers: Content-Type: application/pdf
├─ Body: PDF file (binary data)
│
↓
FRONTEND
│
├─ Receive blob response
├─ Create blob URL
├─ Create temporary <a> element
├─ Trigger download
│  └─ Browser saves: Bill_[NUMBER].pdf
│
↓
USER
└─ File downloaded to Downloads folder
```

### Example 2: List Students with Filter

```
USER INTERACTION
│
├─ Type in search box "John"
│  └─ onChange handler captures input
│
├─ Debounce 300ms
│
↓
FRONTEND (Students.jsx)
│
├─ State update: searchTerm = "John"
├─ useEffect detects state change
├─ Call: studentAPI.list({ search: "John" })
│  └─ Axios: GET /api/students?search=John
│
↓
BACKEND
│
├─ studentController.getStudents()
├─ Parse query params: search = "John"
├─ Query MongoDB
│  └─ db.students.find({ name: /John/i })
├─ Return filtered results
│
↓
FRONTEND
│
├─ Set state: students = [array of matches]
├─ Re-render table with filtered data
│
↓
UI UPDATE
└─ Table shows only students named "John"
```

---

## 🛡️ Error Handling Flow

```
ERROR OCCURS
│
├─ Database error
├─ Validation error
├─ PDF generation error
├─ Missing resource (404)
└─ Server error (500)
│
↓
BACKEND
│
├─ Error caught in try-catch
├─ Error logged to console
├─ Call errorHandler middleware
├─ Format error response
│  └─ { status: "error", message: "...", code: 400 }
└─ Send HTTP response with error status
│
↓
FRONTEND (Axios Interceptor)
│
├─ Check response status
├─ If error detected
│  ├─ Log error to console
│  ├─ Extract error message
│  └─ Pass to component
│
↓
COMPONENT
│
├─ Receive error in catch block
├─ Set state: error = message
├─ Render error alert
│  └─ User sees: "Failed to load students"
│
↓
USER
└─ Sees user-friendly error message
```

---

## 📊 Performance Considerations

### Frontend Optimization
- **React.memo**: Prevent unnecessary re-renders
- **useCallback**: Optimize callback references
- **Lazy Loading**: Load components on demand
- **Debouncing**: Reduce API calls on search
- **Pagination**: Limit data display
- **Caching**: Store API responses in state

### Backend Optimization
- **Indexes**: Create MongoDB indexes on frequently queried fields
- **Lean Queries**: Use `.lean()` for read-only operations
- **Pagination**: Limit database results
- **Response Compression**: gzip compression middleware
- **Caching**: Cache fee structure data
- **Connection Pooling**: MongoDB connection pool settings

### Database Optimization
```javascript
// Add indexes for common queries
db.students.createIndex({ rollNumber: 1 })  // Unique queries
db.bills.createIndex({ status: 1 })         // Status filters
db.bills.createIndex({ student: 1 })        // Student lookups
db.bills.createIndex({ issueDate: -1 })     // Date sorting
```

---

## 🔐 Security Architecture (Phase 4)

```
PUBLIC ROUTES (No Auth)
├─ GET /health
└─ POST /auth/login

PROTECTED ROUTES (Require JWT)
├─ /api/students/**
├─ /api/fee-structures/**
└─ /api/bills/**
   │
   └─ Middleware: verifyToken()
      ├─ Extract JWT from Authorization header
      ├─ Verify signature
      ├─ Decode payload
      ├─ Check expiration
      └─ Attach user to request
```

---

## 📈 Scalability Architecture

### Horizontal Scaling
```
Load Balancer
├─ Backend Server 1 (Port 5000)
├─ Backend Server 2 (Port 5001)
├─ Backend Server 3 (Port 5002)
└─ All connected to same MongoDB

Shared MongoDB
├─ Replica set for redundancy
├─ Sharding for data distribution
└─ Backup & recovery
```

### Caching Layer
```
Frontend Cache
├─ Browser localStorage
├─ Session storage
└─ React state management

Application Cache (Phase 4+)
├─ Redis cache layer
├─ Cache fee structures
├─ Cache student stats
└─ TTL-based invalidation
```

---

## 📝 Deployment Architecture

### Development
```
Localhost
├─ Frontend: http://localhost:5173/ (Vite Dev Server)
├─ Backend: http://localhost:5000/ (Node.js Dev Server)
└─ Database: MongoDB Atlas (Cloud)
```

### Production
```
Cloud Deployment
├─ Frontend: CDN/Vercel (dist/ folder)
├─ Backend: Docker container / VPS
│  └─ Environment: NODE_ENV=production
└─ Database: MongoDB Atlas (Production cluster)
```

---

**Architecture Version:** 3.0
**Last Updated:** August 2024
**Status:** Production Ready

