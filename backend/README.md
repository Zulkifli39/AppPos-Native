# Native POS Backend

Backend development uses a local MySQL database by default.

## Local Setup

Create the local database first:

```sql
CREATE DATABASE native_pos_dev;
```

Then run:

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

Default local API:

```text
http://localhost:4000/api
```

Default development login:

```text
username: admin
password: admin123
```

For production, keep the code unchanged and replace `DATABASE_URL`, `API_PORT`, `CORS_ORIGIN`, and `JWT_SECRET` in the production `.env`.
