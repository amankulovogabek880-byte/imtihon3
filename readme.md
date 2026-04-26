# Car Service Booking - PostgreSQL version

## Setup

```bash
npm install
```

Create PostgreSQL database:

```sql
CREATE DATABASE car_service_db;
```

Create `.env` from `.env.example` and write your PostgreSQL password:

```env
DB_NAME=car_service_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

Run:

```bash
npm run dev
```

Default admin:

```txt
email: admin@example.com
password: Admin123!
```

Main pages:
- `/register`
- `/login`
- `/bookings/create`
- `/bookings`
- `/admin`
