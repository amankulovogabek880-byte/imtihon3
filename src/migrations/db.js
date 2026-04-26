import pool from "../db/db.config.js";

const TABLE_SCHEMAS = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL ,
  browser VARCHAR(100),
  os VARCHAR(100),
  device VARCHAR(100),
  ip VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export const migrateSchemas = async () => {
  try {
    await pool.query(TABLE_SCHEMAS);
  return "PostgreSQL tables migrated✅";
  } catch (error) {
    console.log(error)
    return "db error"
    
  }
};

migrateSchemas()
.then((res)=>{console.log(res)})
.catch((err)=>console.log(err))