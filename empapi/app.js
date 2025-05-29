const express = require('express');
const { sql, getConnection, testConnection } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JSON parsing error handler
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
        success: false,
            message: 'Invalid JSON format in request body',
            error: 'Please check your JSON syntax'
    });
    }
    next();
});

// Test database connection on startup
testConnection();

// Health check endpoint
app.get('/api/health', (req, res) => {
        res.status(200).json({
            success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
        });
});

// GET all Users
app.get('/api/users', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT [UserId], [UserName], [Roles], [FirstName],[LastName],[EmailId],[MobileNo], [isActive] FROM dbo.UserMaster');
        
        res.status(200).json({
            success: true,
            data: result.recordset,
            count: result.recordset.length
        });
    } catch (error) {
        console.error('Error fetching Users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching Users',
            error: error.message
        });
    }
});


// GET all divisions
app.get('/api/divisions', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT [id], [divisionName], [divisionCode], [divisionSAPCode], [isActive] FROM dbo.Division');
        
        res.status(200).json({
            success: true,
            data: result.recordset,
            count: result.recordset.length
        });
    } catch (error) {
        console.error('Error fetching divisions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching divisions',
            error: error.message
        });
    }
});

// GET division by ID
app.get('/api/divisions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT [id], [divisionName], [divisionCode], [divisionSAPCode], [isActive] FROM dbo.Division WHERE [id] = @id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Division not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Error fetching division:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching division',
            error: error.message
        });
    }
});

// POST create new division
app.post('/api/divisions', async (req, res) => {
    try {
        console.log('Request body:', req.body); // Debug log
        
        const { divisionName, divisionCode, divisionSAPCode, isActive } = req.body;
        
        // Convert to string and check if empty or null
        const nameStr = String(divisionName || '').trim();
        const codeStr = String(divisionCode || '').trim();
        const sapCodeStr = divisionSAPCode ? String(divisionSAPCode).trim() : null;
        
        if (!nameStr) {
            return res.status(400).json({
                success: false,
                message: 'Division name is required'
            });
        }
        
        if (!codeStr) {
            return res.status(400).json({
                success: false,
                message: 'Division code is required'
            });
        }
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('divisionName', sql.NVarChar, nameStr)
            .input('divisionCode', sql.NVarChar, codeStr)
                .input('divisionSAPCode', sql.NVarChar, sapCodeStr)
            .input('isActive', sql.Bit, isActive !== undefined ? Boolean(isActive) : true)
            .query(`
                INSERT INTO dbo.Division ([divisionName], [divisionCode], [divisionSAPCode], [isActive]) 
                OUTPUT INSERTED.[id], INSERTED.[divisionName], INSERTED.[divisionCode], INSERTED.[divisionSAPCode], INSERTED.[isActive]
                VALUES (@divisionName, @divisionCode, @divisionSAPCode, @isActive)
            `);
        
        res.status(201).json({
            success: true,
            message: 'Division created successfully',
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Error creating division:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating division',
            error: error.message
        });
    }
});

// PUT update division
app.put('/api/divisions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { divisionName, divisionCode, divisionSAPCode, isActive } = req.body;
        
        // Convert to string and check if empty or null
        const nameStr = String(divisionName || '').trim();
        const codeStr = String(divisionCode || '').trim();
        const sapCodeStr = divisionSAPCode ? String(divisionSAPCode).trim() : null;
        
        if (!nameStr) {
            return res.status(400).json({
                success: false,
                message: 'Division name is required'
            });
        }
        
        if (!codeStr) {
            return res.status(400).json({
                success: false,
                message: 'Division code is required'
            });
        }
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('divisionName', sql.NVarChar, nameStr)
            .input('divisionCode', sql.NVarChar, codeStr)
                .input('divisionSAPCode', sql.NVarChar, sapCodeStr)
            .input('isActive', sql.Bit, isActive !== undefined ? Boolean(isActive) : true)
            .query(`
                UPDATE dbo.Division 
                SET [divisionName] = @divisionName, 
                    [divisionCode] = @divisionCode, 
                    [divisionSAPCode] = @divisionSAPCode, 
                    [isActive] = @isActive
                OUTPUT INSERTED.[id], INSERTED.[divisionName], INSERTED.[divisionCode], INSERTED.[divisionSAPCode], INSERTED.[isActive]
                WHERE [id] = @id
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Division not found'
        });
        }
        res.status(200).json({
            success: true,
            message: 'Division updated successfully',
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Error updating division:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating division',
            error: error.message
        });
    }
});

// DELETE division (soft delete by setting isActive to false)
app.delete('/api/divisions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        // First check if division exists
        const checkResult = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT [id] FROM dbo.Division WHERE [id] = @id');
        
        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Division not found'
            });
        }
        
        // Soft delete by setting isActive to false
        await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE dbo.Division SET [isActive] = 0 WHERE [id] = @id');
        
        res.status(200).json({
            success: true,
            message: 'Division deactivated successfully'
        });
    } catch (error) {
        console.error('Error deactivating division:', error);
        res.status(500).json({
            success: false,
            message: 'Error deactivating division',
            error: error.message
        });
    }
});

// DELETE division permanently (optional endpoint)
app.delete('/api/divisions/:id/permanent', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        // First check if division exists
        const checkResult = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT [id] FROM dbo.Division WHERE [id] = @id');
        
        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
        success: false,
                message: 'Division not found'
    });
        }
        
        // Permanent delete
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM dbo.Division WHERE [id] = @id');
        res.status(200).json({
            success: true,
            message: 'Division deleted permanently'
    });
    } catch (error) {
        console.error('Error deleting division:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting division',
            error: error.message
});
    }
});

// GET only active divisions
app.get('/api/divisions/active', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT [id], [divisionName], [divisionCode], [divisionSAPCode], [isActive] FROM dbo.Division WHERE [isActive] = 1');
        
        res.status(200).json({
            success: true,
            data: result.recordset,
            count: result.recordset.length
        });
    } catch (error) {
        console.error('Error fetching active divisions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching active divisions',
            error: error.message
        });
    }
});

// API Documentation endpoint
app.get('/api-docs', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Division API Documentation</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .endpoint { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                .method { font-weight: bold; color: white; padding: 5px 10px; border-radius: 3px; }
                .get { background-color: #61affe; }
                .post { background-color: #49cc90; }
                .put { background-color: #fca130; }
                .delete { background-color: #f93e3e; }
                code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
                .example { background-color: #f8f9fa; padding: 10px; border-radius: 3px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <h1>Division API Documentation</h1>
            <p>Base URL: <code>http://localhost:${PORT}</code></p>
            
            <div class="endpoint">
                <span class="method get">GET</span> <code>/api/health</code>
                <p>Health check endpoint</p>
            </div>
            
            <div class="endpoint">
                <span class="method get">GET</span> <code>/api/divisions</code>
                <p>Get all divisions</p>
            </div>
            
            <div class="endpoint">
                <span class="method get">GET</span> <code>/api/divisions/active</code>
                <p>Get only active divisions</p>
            </div>
            
            <div class="endpoint">
                <span class="method get">GET</span> <code>/api/divisions/:id</code>
                <p>Get division by ID</p>
            </div>
            
            <div class="endpoint">
                <span class="method post">POST</span> <code>/api/divisions</code>
                <p>Create new division</p>
                <div class="example">
                    <strong>Example JSON Body (strings):</strong><br>
                    <code>{
                        "divisionName": "Engineering",
                        "divisionCode": "ENG",
                        "divisionSAPCode": "ENG001",
                        "isActive": true
                    }</code><br><br>
                    <strong>Example JSON Body (numbers converted to strings):</strong><br>
                    <code>{
                        "divisionName": "camera2",
                        "divisionCode": 20,
                        "divisionSAPCode": 20,
                        "isActive": 0
                    }</code>
                </div>
            </div>
            
            <div class="endpoint">
                <span class="method put">PUT</span> <code>/api/divisions/:id</code>
                <p>Update division</p>
                <div class="example">
                    <strong>Example JSON Body:</strong><br>
                    <code>{
                        "divisionName": "Updated Engineering",
                        "divisionCode": "ENG",
                        "divisionSAPCode": "ENG001",
                        "isActive": true
                    }</code>
                </div>
            </div>
            
            <div class="endpoint">
                <span class="method delete">DELETE</span> <code>/api/divisions/:id</code>
                <p>Soft delete division (sets isActive to false)</p>
            </div>
            
            <div class="endpoint">
                <span class="method delete">DELETE</span> <code>/api/divisions/:id/permanent</code>
                <p>Permanently delete division</p>
            </div>
            
            <h3>Field Descriptions:</h3>
            <ul>
                <li><strong>id:</strong> Auto-generated unique identifier</li>
                <li><strong>divisionName:</strong> Name of the division (required) - accepts strings or numbers</li>
                <li><strong>divisionCode:</strong> Short code for the division (required) - accepts strings or numbers</li>
                <li><strong>divisionSAPCode:</strong> SAP system code (optional) - accepts strings or numbers</li>
                <li><strong>isActive:</strong> Boolean flag for active status (accepts true/false, 1/0)</li>
            </ul>
        </body>
        </html>
    `);
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`📚 API documentation available at http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    const { closeConnection } = require('./db');
    await closeConnection();
    process.exit(0);
});

module.exports = app;