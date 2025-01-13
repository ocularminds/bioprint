const sql = require('mssql');

const config = { 
    test: { filename: './test.db' }, 
    production: { 
        user: 'your-username', password: 'your-password', 
        server: 'your-server', database: 'your-database', 
        options: { encrypt: true, enableArithAbort: true}
    } 
};

const Db = {
    db: null, 
    async connect(env = 'production') { 
        if (env === 'test') { 
            this.db = new sqlite3.Database(config.test.filename, (err) => { if (err) {
                console.error('Error opening SQLite database:', err.message); 
            } else { console.log('Connected to the SQLite database.'); } });
        } else { 
            this.db = new sql.ConnectionPool(config.production) .connect() .then(pool => { 
                console.log('Connected to MSSQL'); return pool;
            }) .catch(err => console.error('Database Connection Failed! Bad Config:', err)); 
        } 
    }, 
    
    async query(queryString, params = []) { 
        if (process.env.NODE_ENV === 'test') { 
            return new Promise((resolve, reject) => { 
                this.db.all(queryString, params, (err, rows) => { 
                    if (err) { 
                        reject(err); 
                    } else { 
                        resolve(rows);
                    } 
                }); 
            }); 
        } else { 
            const pool = await this.db; 
            return pool.request().query(queryString); 
        } 
    }, 
    
    async execute(procedureName, inputParams = {}, outputParams = {}) { 
        if (process.env.NODE_ENV === 'test') { 
            throw new Error('Stored procedures are not supported in SQLite.'); 
        } else { 
            const pool = await this.db; 
            const request = pool.request(); 
            for (const param in inputParams) { 
                request.input(param, inputParams[param]); 
            } 
            
            for (const param in outputParams) { 
                request.output(param, outputParams[param]); 
            } 
            
            return request.execute(procedureName);
        } 
    }, 
    
    async close() { 
        if (process.env.NODE_ENV === 'test') { 
            this.db.close((err) => { 
                if (err) { 
                    console.error('Error closing SQLite database:', err.message); 
                } else { console.log('Closed the SQLite database connection.');                     
                } 
            });
        } else { 
            await this.db.close(); 
            console.log('Closed the MSSQL database connection.'); 
        } 
    },

    getRequests: async() => {
        const pool = await db;
        const result = await pool.request().query('SELECT * FROM FingerprintRequests');
        return result.recordset;
    },

    async storeRequest(accountNumber, kioskStationID, bvn) {
        const pool = await poolPromise;
        const query = `
            INSERT INTO FingerprintRequests (AccountNumber, KioskStationID, BVN, Status)
            VALUES (@accountNumber, @kioskStationID, @bvn, 'Idle')
        `;
        await pool.request()
            .input('accountNumber', sql.VarChar, accountNumber)
            .input('kioskStationID', sql.VarChar, kioskStationID)
            .input('bvn', sql.VarChar, bvn)
            .query(query);
    },

    async updateRequestStatus(id, status, fingerprintTemplate = null) {
        const pool = await poolPromise;
        const query = `
            UPDATE FingerprintRequests
            SET Status = @status, FingerprintTemplate = @fingerprintTemplate
            WHERE Id = @id
        `;
        await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.VarChar, status)
            .input('fingerprintTemplate', sql.VarChar, fingerprintTemplate)
            .query(query);
    }
};

module.exports = Db;
