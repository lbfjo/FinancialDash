# Finance Dashboard API Documentation

## Version: v1 (Current)

Base URL: `http://localhost:3000/api`

---

## Security Features

### Authentication
- All protected endpoints require authentication via NextAuth.js
- Session-based authentication with secure HTTP-only cookies
- OAuth support (GitHub)
- Credentials-based authentication with bcrypt password hashing

### Rate Limiting
The API implements rate limiting to prevent abuse:

- **Auth endpoints** (`/api/auth/*`): 5 requests per 15 minutes
- **API endpoints** (`/api/*`): 100 requests per minute

### Input Validation
- All inputs validated using Zod schemas
- Password strength requirements: 8+ chars, uppercase, lowercase, number
- String length limits to prevent DoS attacks

### Error Handling
- User-friendly error messages
- Structured error responses with timestamps
- Proper HTTP status codes

---

## Performance Optimizations

### Database Indexes
- Optimized indexes on user ID, transaction date, and common query patterns
- Compound indexes for filtering

### Query Optimization
- N+1 queries prevented
- Parallel query execution
- Efficient aggregations

### Logging
- Structured JSON logging (Pino)
- Security event tracking
- Performance monitoring

---

For full API endpoint documentation, see the inline JSDoc comments in route files.
