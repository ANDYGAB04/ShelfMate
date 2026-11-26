# ShelfMate

ShelfMate is a book-sharing platform. Users build their own collection, share books with others, borrow books from people in the network, approve returns, and rate the books they've read.

> **Status:** the **backend (REST API) is complete**. The **frontend (Angular) is still in progress** and not yet in this repository.

---

## Features

- **Account registration with email activation.** New accounts are disabled until the user enters a 6-digit code sent by email. The code is valid for 15 minutes, and an expired code triggers a new one automatically.
- **JWT authentication.** Stateless login. The token carries the user's authorities and full name.
- **Book management.** Add books (title, author, ISBN, synopsis), upload a cover image, and toggle a book as *shareable* or *archived*.
- **Borrowing workflow:**
  1. A user borrows a book that is shareable, not archived, and not their own.
  2. The borrower marks the book as returned.
  3. The owner approves the return.
- **Feedback and ratings.** Users leave a 0–5 rating and a comment on books they don't own. Each book exposes its average rating.
- **Paginated listings** for all books, my books, borrowed books, and returned books.
- **Validation and error handling.** Request validation, business error codes, and a global exception handler.
- **Interactive API docs** with Swagger UI (springdoc-openapi).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot (Web MVC, Data JPA, Validation, Mail, Thymeleaf) |
| Security | Spring Security + JWT (jjwt 0.11.5), BCrypt passwords |
| Database | PostgreSQL |
| Email (dev) | MailDev (local SMTP server + web inbox) |
| API docs | springdoc-openapi / Swagger UI |
| Build | Maven (wrapper included) |
| Infrastructure | Docker Compose |
| Frontend | Angular *(work in progress)* |

---

## Project Structure

```
ShelfMate/
├── docker-compose.yml          # PostgreSQL + MailDev
└── book-network/               # Spring Boot backend
    ├── pom.xml
    └── src/main/
        ├── java/com/project/book/
        │   ├── auth/           # Register, login, account activation
        │   ├── book/           # Book entity, CRUD, borrow/return logic
        │   ├── feedback/       # Ratings & comments
        │   ├── history/        # Borrow/return transaction history
        │   ├── user/           # User entity, activation tokens
        │   ├── role/           # Roles (USER is created at startup)
        │   ├── security/       # JWT filter, JWT service, security config
        │   ├── email/          # Activation email sender (async)
        │   ├── file/           # Book cover upload storage
        │   ├── handler/        # Global exception handler, error codes
        │   ├── config/         # Beans, auditing, OpenAPI config
        │   └── common/         # BaseEntity, PageResponse
        └── resources/
            ├── application.yml
            ├── application-dev.yml
            └── templates/activate_account.html
```

---

## Getting Started

### Prerequisites

- Java 17+
- Docker and Docker Compose
- (Optional) Maven. The project includes the Maven wrapper (`mvnw`).

### 1. Clone the repository

```bash
git clone https://github.com/ANDYGAB04/ShelfMate.git
cd ShelfMate
```

### 2. Start PostgreSQL and MailDev

```bash
docker compose up -d
```

| Service | Address |
|---|---|
| PostgreSQL | `localhost:5432` (db `book_social_network`, user `username`, password `password`) |
| MailDev web inbox | http://localhost:1080 |
| MailDev SMTP | `localhost:1025` |

### 3. Configure the application

The app reads a few custom properties that must be present in `book-network/src/main/resources/application-dev.yml`. Add this block if it isn't there yet:

```yaml
server:
  port: 8088

application:
  security:
    jwt:
      secret-key: <BASE64_ENCODED_SECRET_AT_LEAST_256_BITS>
      expiration: 86400000          # 24h in milliseconds
  mailing:
    frontend:
      activation-url: http://localhost:4200/activate-account
  file:
    upload:
      photos-output-path: ./uploads
```

You can generate a secret key with:

```bash
openssl rand -base64 32
```

> Don't commit real secrets. For anything beyond local development, pass them through environment variables.

### 4. Run the backend

```bash
cd book-network
./mvnw spring-boot:run        # On Windows: mvnw.cmd spring-boot:run
```

The API is served under the context path **`/api/v1`**:

- API base URL: `http://localhost:8088/api/v1`
- Swagger UI: http://localhost:8088/api/v1/swagger-ui/index.html

---

## Authentication Flow

1. **Register:** `POST /auth/register` with first name, last name, email, and a password of at least 8 characters.
2. **Activate:** open MailDev (http://localhost:1080), copy the 6-digit code, then call `GET /auth/activate-account?token=<code>`.
3. **Login:** `POST /auth/authenticate` with email and password. The response contains a JWT token.
4. **Use the token:** send it on every other request:
   ```
   Authorization: Bearer <token>
   ```
   In Swagger UI, click **Authorize** and paste the token.

---

## API Endpoints

All paths are relative to `/api/v1`. Every endpoint except `/auth/**` and the Swagger docs requires a JWT.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create an account and send the activation email |
| `POST` | `/auth/authenticate` | Log in and get a JWT |
| `GET` | `/auth/activate-account?token={code}` | Activate an account with the emailed code |

### Books

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/books` | Add a new book |
| `GET` | `/books/{book-id}` | Get a book by id |
| `GET` | `/books?page=0&size=10` | All shareable, non-archived books from other users |
| `GET` | `/books/owner` | Books owned by the current user |
| `GET` | `/books/borrowed` | Books the current user has borrowed |
| `GET` | `/books/returned` | Borrow history of the current user's books |
| `PATCH` | `/books/shareable/{book-id}` | Toggle the shareable status (owner only) |
| `PATCH` | `/books/archived/{book-id}` | Toggle the archived status (owner only) |
| `POST` | `/books/borrow/{book-id}` | Borrow a book |
| `PATCH` | `/books/borrow/return/{book-id}` | Mark a borrowed book as returned |
| `PATCH` | `/books/borrow/return/approve/{book-id}` | Approve a return (owner) |
| `POST` | `/books/cover/{book-id}` | Upload a cover image (`multipart/form-data`, field `file`, max 50 MB) |

### Feedback

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/feedbacks` | Rate (0–5) and comment on a book |
| `GET` | `/feedbacks/book/{book-id}` | Paginated feedback for a book |

### Paginated response format

```json
{
  "content": [ ... ],
  "number": 0,
  "size": 10,
  "totalElements": 42,
  "totalPages": 5,
  "first": true,
  "last": false
}
```

---

## Data Model

```
User ──< Book ──< Feedback
  │        │
  └──< BookTransactionHistory >──┘
           (borrowed / returned / returnApproved)
User >──< Role
User ──< Token (activation codes)
```

The database schema is generated automatically by Hibernate (`ddl-auto: update`). All entities inherit auditing fields (`createdDate`, `lastModifiedDate`, `createdBy`, `lastModifiedBy`) from `BaseEntity`.

---

---

## Author

**Andrei Suhan**, [@ANDYGAB04](https://github.com/ANDYGAB04)
