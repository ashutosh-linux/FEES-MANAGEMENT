# School Fee Management & Student Record System — Backend

Phase 1 · Backend Foundation · Node.js + Express + MongoDB Atlas

---

## Project Structure

```
school-fee-backend/
├── config/
│   └── db.js                  # Mongoose connection + event listeners
├── middleware/
│   └── errorHandler.js        # Global error handler (last middleware)
├── models/
│   ├── Student.js             # Student schema + indexes
│   ├── FeeStructure.js        # Fee schedule schema
│   ├── Bill.js                # Invoice + payment history schema
│   └── index.js               # Barrel export
├── routes/
│   ├── healthRoutes.js        # GET /api/health
│   ├── studentRoutes.js       # /api/students (stubs)
│   ├── feeStructureRoutes.js  # /api/fee-structures (stubs)
│   └── billRoutes.js          # /api/bills (stubs)
├── utils/
│   ├── asyncHandler.js        # Wraps async controllers → no try/catch
│   ├── apiResponse.js         # Consistent JSON response helpers
│   └── generateBillNumber.js  # BILL-YYYYMM-XXXX generator
├── app.js                     # Express app (no listen call — testable)
├── server.js                  # Entry point: connect DB → start server
├── .env.example               # Environment variable template
└── package.json               # ES Modules, scripts, dependencies
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and set your MONGO_URI from MongoDB Atlas
```

### 3. Run in development
```bash
npm run dev        # nodemon auto-reload
# or
npm start          # plain node
```

### 4. Verify
```
GET http://localhost:5000/api/health
```
Expected response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "database": "connected"
}
```

---

## Environment Variables

| Variable    | Required | Description                                |
|-------------|----------|--------------------------------------------|
| `PORT`      | No       | HTTP port (default: 5000)                  |
| `NODE_ENV`  | No       | `development` or `production`              |
| `MONGO_URI` | **Yes**  | MongoDB Atlas connection string            |

---

## API Endpoints (Phase 1 — stubs)

| Method | Endpoint                        | Description               |
|--------|---------------------------------|---------------------------|
| GET    | `/api/health`                   | Server + DB health check  |
| GET    | `/api/students`                 | List students             |
| POST   | `/api/students`                 | Create student            |
| GET    | `/api/students/:id`             | Get student by ID         |
| PUT    | `/api/students/:id`             | Update student            |
| DELETE | `/api/students/:id`             | Delete student            |
| GET    | `/api/fee-structures`           | List fee structures       |
| POST   | `/api/fee-structures`           | Create fee structure      |
| GET    | `/api/bills`                    | List all bills            |
| POST   | `/api/bills`                    | Create bill               |
| POST   | `/api/bills/:id/payments`       | Record a payment          |
| GET    | `/api/bills/student/:studentId` | Bills for a student       |

Controllers and full implementations arrive in **Phase 2**.

---

## Mongoose Models

### Student
- Unique compound index on `{ rollNumber, class, section }`
- Virtual: `fullClassLabel`
- Soft-delete via `isActive`

### FeeStructure
- Unique compound index on `{ className, feeType, billingCycle }`
- Static: `FeeStructure.findByClass(className)`

### Bill
- References `Student` via `studentId`
- Embedded `items[]` (line items) and `paymentHistory[]`
- Pre-save hook auto-derives `status` from `paidAmount`
- Virtuals: `netPayable`, `balanceDue`, `isOverdue`
- Static: `Bill.findPendingByStudent(studentId)`
