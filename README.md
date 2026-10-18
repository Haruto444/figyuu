# Figyuu

A web-based anime figure collection tracker built with vanilla JavaScript, Express.js, and PostgreSQL.

Figyuu helps collectors organize their anime figures, manage collection statuses, and keep track of figures they own, have ordered, or want to collect.

## Features

- **Collection management** — Add figures with details such as series, character, manufacturer, scale, release date, and image URL.
- **Status tracking** — Categorize figures as `Owned`, `Ordered`, or `Wished`.
- **Persistent storage** — Store figure information and collection statuses in PostgreSQL.
- **Collection statistics** — View statistics about your collection.
- **REST API** — Communicate with the backend through Express.js endpoints.
- **Responsive interface** — Browse and manage your collection through a custom HTML and CSS frontend.

## Tech Stack

| Technology | Purpose |
| --- | --- |
| HTML5 | Application structure |
| CSS3 | Styling and layout |
| JavaScript | Frontend functionality |
| Node.js | JavaScript runtime |
| Express.js | Backend and REST API |
| PostgreSQL | Relational database |
| node-postgres (`pg`) | Database connectivity |
| dotenv | Environment configuration |

## Project Structure

```text
figyuu/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── src/
│   └── db/
│       └── pool.js
├── server.js
├── package.json
├── package-lock.json
├── .env
└── .gitignore
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd figyuu
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a PostgreSQL database for Figyuu and initialize the required tables: `figures` and `collection_items`.

4. Create a `.env` file in the project root and configure the database connection using the variable names expected by `src/db/pool.js`.

   Example configuration:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=figyuu
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```

5. Start the server:

   ```bash
   node server.js
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** The environment variable names above are examples. Match them to your database connection configuration. A database schema or migration script must be provided or created before the application can run successfully.

## API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Check server status |
| `GET` | `/api/db-health` | Check database connectivity |
| `GET` | `/api/figures` | Retrieve figures and collection statuses |
| `POST` | `/api/figures` | Create a figure entry |
| `PATCH` | `/api/figures/:id/status` | Update a figure's collection status |

### Collection Statuses

| Status | Description |
| --- | --- |
| `Owned` | The figure is already in the collection. |
| `Ordered` | The figure has been ordered. |
| `Wished` | The figure is on the wishlist. |

## Configuration and Security

- Keep database credentials in environment variables.
- Do not commit `.env` or `node_modules/`.
- Use parameterized SQL queries for database operations.
- Validate input on the server before updating database records.

## Development

Start the server with:

```bash
node server.js
```

For local development, restart the server after backend changes unless a development watcher is configured.

## Roadmap

Potential future improvements:

- [ ] Edit figure details
- [ ] Delete figure entries
- [ ] Search, filter, and sort collections
- [ ] Add detailed figure views
- [ ] Track collection value and spending
- [ ] Introduce user accounts
- [ ] Deploy the application

## Contributing

Contributions and suggestions are welcome. For substantial changes, consider opening an issue first to discuss the proposed feature or fix.

## License

No license has been specified yet.

---

**Figyuu** — Organize your collection, one figure at a time.