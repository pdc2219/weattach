const sql = require('mssql');
require('dotenv').config();

// Database configuration
const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: true, // Use encryption
        trustServerCertificate: true // Trust self-signed certificates
    },
    pool: {
        max: parseInt(process.env.DB_POOL_MAX) || 10,
        min: parseInt(process.env.DB_POOL_MIN) || 2,
        idleTimeoutMillis: 30000
    },
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 15000,
    requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT) || 15000
};

// Connection pool
let poolPromise;

const getConnection = async () => {
    try {
        if (!poolPromise) {
            poolPromise = new sql.ConnectionPool(config).connect();
        }
        return await poolPromise;
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};

// Test connection function
const testConnection = async () => {
    try {
        const pool = await getConnection();
        console.log('✅ Database connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Close connection
const closeConnection = async () => {
    try {
        if (poolPromise) {
            const pool = await poolPromise;
            await pool.close();
            poolPromise = null;
            console.log('Database connection closed');
        }
    } catch (error) {
        console.error('Error closing database connection:', error);
    }
};

module.exports = {
    sql,
    getConnection,
    testConnection,
    closeConnection
};