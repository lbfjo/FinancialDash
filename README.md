# Finance Dashboard

A modern, full-stack personal finance management application built with Next.js 16, React 19, and PostgreSQL. Track your income, expenses, and financial health all in one place with a beautiful, intuitive interface.

## Features

- **Dashboard Overview** - Real-time financial summary with income/expense tracking
- **Account Management** - Manage multiple financial accounts (checking, savings, credit cards)
- **Transaction Tracking** - Record and categorize all your financial transactions
- **Category System** - Organize income and expenses with customizable categories
- **Visual Analytics** - Interactive charts showing spending patterns and trends
- **Authentication** - Secure login with email/password or GitHub OAuth
- **Responsive Design** - Beautiful UI that works on desktop and mobile devices

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **React:** Version 19.2.0 with Server Components
- **Database:** PostgreSQL via [Prisma Postgres](https://www.prisma.io/postgres)
- **ORM:** [Prisma 6](https://www.prisma.io/)
- **Authentication:** [NextAuth.js v5](https://next-auth.js.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **TypeScript:** Strict mode enabled

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (or use Prisma Postgres for local development)
- **GitHub OAuth App** (for GitHub login feature)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/finance-dashboard.git
cd finance-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# NextAuth Configuration
AUTH_SECRET="your-secret-key-min-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth (Get from: https://github.com/settings/developers)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

#### Setting Up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App" or "Register a new application"
3. Fill in the application details:
   - **Application name:** Finance Dashboard (Dev)
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and generate a new **Client Secret**
6. Add these credentials to your `.env` file

#### Generate AUTH_SECRET

```bash
openssl rand -base64 32
```

### 4. Database Setup

Generate Prisma Client and apply migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed the database with sample data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Database Schema

The application uses the following core models:

- **User** - User accounts with email and OAuth support
- **FinanceAccount** - Financial accounts (checking, savings, etc.)
- **Category** - Income and expense categories
- **Transaction** - Financial transactions with amounts and dates
- **Account** - OAuth provider accounts (GitHub, etc.)

## Available Scripts

### Development

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database

```bash
npx prisma generate                          # Generate Prisma Client
npx prisma migrate dev --name <name>         # Create and apply migration
npx prisma migrate deploy                    # Apply pending migrations
npx prisma db push                           # Push schema changes without migration
npx prisma studio                            # Open Prisma Studio GUI
npx prisma migrate reset                     # Reset database (destructive)
npm run db:seed                              # Seed database with sample data
```

## Project Structure

```
finance-dashboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard page
│   │   ├── transactions/      # Transactions page
│   │   ├── accounts/          # Accounts page
│   │   ├── categories/        # Categories page
│   │   ├── login/             # Login page
│   │   └── register/          # Registration page
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── accounts/         # Account-related components
│   │   ├── transactions/     # Transaction components
│   │   └── categories/       # Category components
│   ├── lib/                   # Utility functions and configs
│   │   ├── auth.ts           # NextAuth configuration
│   │   └── prisma.ts         # Prisma client instance
│   └── types/                 # TypeScript type definitions
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Database seeding script
├── public/                    # Static assets
└── package.json
```

## Authentication

The application supports two authentication methods:

1. **Email/Password** - Traditional email and password authentication
2. **GitHub OAuth** - One-click sign-in with GitHub account

All routes under `/dashboard`, `/transactions`, `/accounts`, and `/categories` are protected and require authentication.

## Demo Account

When running with seed data:
- **Email:** demo@example.com
- **Password:** demo123

## Features in Detail

### Dashboard
- Total income and expense summary
- Net income calculation
- Recent transactions list
- Income/expense breakdown by category
- Account transaction counts
- Interactive charts and visualizations

### Transactions
- Create, read, update, and delete transactions
- Filter by account, category, and date range
- Sort by date, amount, or category
- Pagination for large transaction lists

### Accounts
- Manage multiple financial accounts
- Track transactions per account
- View account balances and transaction history

### Categories
- Organize transactions by income/expense categories
- Default categories provided (Salary, Groceries, Rent, etc.)
- Create custom categories
- Track spending per category

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Update GitHub OAuth callback URL to your production domain
5. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Docker container

Ensure you set all required environment variables on your hosting platform.

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[API Reference](docs/api/API_REFERENCE.md)** - Complete API documentation with endpoints, request/response formats, and examples
- **[Architecture Guide](docs/architecture/ARCHITECTURE.md)** - System architecture, database schema, and design decisions
- **[User Guide](docs/user-guide/USER_GUIDE.md)** - Step-by-step guide for using the application
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Coding standards and best practices
- How to submit pull requests
- Testing guidelines

Quick start for contributors:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Prisma](https://www.prisma.io/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)
- UI styled with [Tailwind CSS](https://tailwindcss.com/)
- Charts by [Recharts](https://recharts.org/)

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

**Note:** This is a personal finance management tool. Always ensure you're following best security practices when handling financial data.
