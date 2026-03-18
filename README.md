# FX Trading App

A robust, multi-currency wallet and foreign exchange trading platform built with [NestJS](https://nestjs.com/). This application enables users to hold wallets in multiple fiat currencies (NGN, USD, EUR, GBP, KES), fund their accounts, and execute real-time currency conversions at market rates.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Assumptions & Architectural Decisions](#assumptions--architectural-decisions)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Features

- **User Registration & Email Verification**: Users can register with email and receive an OTP for verification. Only verified users can access trading features.
- **Multi-Currency Wallet System**: Each user has a wallet supporting multiple currencies (NGN, USD, EUR, GBP, KES). Users can fund their wallets starting with Naira (NGN) and hold balances in various currencies.
- **Real-Time FX Rates**: Fetch real-time FX rates from a third-party API (exchangerate-api.com) with intelligent caching (5-minute TTL) for performance optimization.
- **Currency Conversion & Trading**: Users can convert between currencies using real-time FX rates:
  - Naira → Other Currencies
  - Other Currencies → Naira
- **Transaction History**: Complete audit trail of all actions including funding, conversions, and trades with details such as amount, rate used, transaction type, timestamp, and status.
- **Secure PII Handling**: AES-256-CBC encryption for sensitive identity data (BVN/NIN).
- **Immutable Financial Ledger**: Append-only transaction records with soft-delete user management.
- **Lazy Wallet Provisioning**: Automatic wallet creation on first use to reduce database bloat.
- **Idempotent Funding**: Safe deposit simulation with reference-based deduplication.

---

## Tech Stack

- **Backend Framework**: [NestJS](https://nestjs.com/) (Progressive Node.js framework)
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL (or MySQL)
- **Caching**: Redis / In-Memory Store
- **External APIs**: [exchangerate-api.com](https://www.exchangerate-api.com/) for real-time FX rates
- **Email Provider**: Gmail SMTP (or any mail provider)
- **Security**: AES-256-CBC encryption, bcrypt password hashing
- **Package Manager**: pnpm

---

## Architecture Overview

The application follows a modular, domain-driven architecture typical of NestJS applications:

src/
├── auth/               # Authentication & Authorization (JWT, Guards)
├── user/               # User management, KYC data, email verification
├── wallet/             # Wallet entities, balances, lazy provisioning
├── transaction/        # Immutable ledger, financial records
├── fx/                 # Exchange rate service, caching layer
├── convert/            # Internal wallet-to-wallet conversions
├── trade/              # Market execution simulation
├── fund/               # Deposit simulation & idempotency
├── common/             # Shared utilities, decorators, interceptors
└── main.ts             # Application entry point





```plain
---

## Assumptions & Architectural Decisions

### Data Security & PII Encryption
To adhere to data protection regulations (GDPR, NDPR) and security best practices, sensitive Personally Identifiable Information (PII) such as BVN (Bank Verification Number) and NIN (National Identification Number) are **encrypted at rest** using a TypeORM `@Column` transformer implementing **AES-256-CBC**. This ensures the database never stores plaintext identity numbers, protecting user privacy even in the event of a database breach.

```





### **Immutable Financial Ledger**

To maintain strict accounting principles and full auditability, the **Transaction ledger is entirely immutable**. I specifically avoided `CASCADE` on database relations, utilizing `NO ACTION` instead to prevent accidental data loss at the database level.

- **Soft Deletes Only**: User deletions are handled strictly via soft deletes (status flags), ensuring that historical transaction volumes and exchange rate data are never orphaned or destroyed
- **Referential Integrity**: Foreign key constraints prevent deletion of records with financial history
- **Audit Trail**: Every financial movement creates an append-only record that cannot be modified or deleted

### **Lazy Wallet Creation**

Upon registration, users are strictly provisioned with a **default Naira (NGN) wallet** within a synchronous database transaction to ensure data integrity.

Wallets for other fiat currencies (USD, EUR, GBP, KES) are generated **"lazily" (on-the-fly)** the first time a user attempts to fund or convert into that specific currency.

**Benefits:**

- Reduces initial database bloat for inactive currencies
- Seamless addition of new currency support without migrations
- Better resource utilization—only created when needed


### **Convert vs. Trade Distinction**
The API provides two distinct endpoints for currency exchange:

| Endpoint               | Purpose             | Mechanism                                                                  |
| ---------------------- | ------------------- | -------------------------------------------------------------------------- |
| `POST /wallet/convert` | Currency conversion | Convert between currencies using real-time FX rates (e.g., 1000 NGN → USD) |
| `POST /wallet/trade`   | Market trading      | Trade Naira with other currencies and vice versa (e.g., BUY/SELL orders)   |

Rationale: This distinction separates personal fund management from market participation, allowing different validation rules, fee structures, and regulatory treatments for each operation type.

## **Caching Strategy (Real-Time Definition)**
To satisfy the requirement for "real-time FX rates" while honoring constraints to cache data for performance and respect third-party API rate limits, "real-time" is defined as a rate refreshed within a 5-minute window.
Implementation:
- Short TTL: 5-minute cache expiration (Redis or In-Memory)
- Stale-While-Revalidate: Serve cached data while refreshing in background
- Rate Limit Respect: Batches API calls to stay within free-tier limits of external providers

**Funding Mechanism**
For the scope of this implementation, the POST /wallet/fund endpoint simulates a successful deposit.

**Production Considerations:**
Would be secured behind webhook validation from payment providers (e.g., Paystack, Flutterwave)
Relies on unique reference strings for idempotency (preventing double-crediting)
Would integrate with actual banking/payment rails for NGN and international remittance partners for other currencies

**Transaction Atomicity & Race Conditions**
All wallet balance updates and transaction recordings are wrapped in database transactions to prevent race conditions. Optimistic locking or row-level locking is implemented to ensure concurrent requests don't result in double-spending or balance inconsistencies.

**Getting Started**
- Prerequisites
- Node.js (v18 or higher)
- pnpm package manager
- PostgreSQL Database (or MySQL)
- Redis (Optional, for distributed caching)
- Gmail account (or other SMTP provider) for email services

**Installation**

# Clone the repository

git clone https://github.com/owolabi2001/fx-trading-app.git
cd fx-trading-app


# Install dependencies
pnpm install

Running the Application
bash
Copy
# Development mode (with hot reload)
$ pnpm run start:dev

# Production mode
$ pnpm run build
$ pnpm run start:prod

# Run tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# Test coverage
$ pnpm run test:cov


### **API Documentation**

**Authentication**
| Method | Endpoint         | Description                           |
| ------ | ---------------- | ------------------------------------- |
| POST   | `/auth/register` | Register a user and trigger OTP email |
| POST   | `/auth/verify`   | Verify OTP and activate account       |
| POST   | `/auth/login`    | Authenticate and receive JWT          |

**Wallet Management**
| Method | Endpoint          | Description                                         |
| ------ | ----------------- | --------------------------------------------------- |
| GET    | `/wallet`         | Get user wallet balances by currency                |
| POST   | `/wallet/fund`    | Fund wallet in NGN or other currencies              |
| POST   | `/wallet/convert` | Convert between currencies using real-time FX rates |
| POST   | `/wallet/trade`   | Trade Naira with other currencies and vice versa    |

**FX Rates**
| Method | Endpoint    | Description                                            |
| ------ | ----------- | ------------------------------------------------------ |
| GET    | `/fx/rates` | Retrieve current FX rates for supported currency pairs |


**Transactions**
| Method | Endpoint        | Description              |
| ------ | --------------- | ------------------------ |
| GET    | `/transactions` | View transaction history |


**User Profile**

| Method | Endpoint        | Description                            |
| ------ | --------------- | -------------------------------------- |
| GET    | `/user/profile` | View profile (masked PII)              |
| PATCH  | `/user/profile` | Update KYC details (BVN/NIN encrypted) |


## Future Improvements
**Tiered KYC & Compliance Limits**
While the current system unlocks core trading features strictly upon email verification, a production iteration would implement a Tiered KYC System reflecting real-world Nigerian fintech compliance (AML/CFT):

| Tier       | Requirement         | Limits                              | Features                      |
| ---------- | ------------------- | ----------------------------------- | ----------------------------- |
| **Tier 0** | Registration Only   | View-only access                    | Cannot fund or trade          |
| **Tier 1** | Email Verified      | Daily volume limit (e.g., ₦100,000) | Basic trading, no withdrawals |
| **Tier 2** | BVN + NIN Submitted | Unlimited                           | Full platform access          |

Implementation Notes:
Daily limits tracked via rolling window counters in Redis
KYC documents stored with encryption (same AES-256-CBC pattern)
Admin review queue for Tier 2 verification
Additional Enhancements
Webhook-Based Funding: Replace simulated funding with secure webhooks from Paystack/Flutterwave with signature validation
Multi-Provider FX Rates: Implement fallback providers (Fixer.io, OpenExchangeRates) with circuit breaker patterns
Transaction Fees: Add spread or flat-fee logic for revenue generation
Audit Logging: Separate audit trail table for admin actions (suspicious activity reporting)
Rate Alerts: WebSocket/SSE notifications for favorable rate movements
Statement Generation: Monthly PDF statement generation with transaction history
Role-Based Access Control: Admin vs. regular user roles with different permissions
Analytics Dashboard: Track and log trades, FX trends, and user activity
Scalability: Horizontal scaling with load balancers, database read replicas, and microservices architecture for millions of users

