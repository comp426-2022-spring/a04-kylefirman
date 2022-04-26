// Require better-sqlite.
const database = require('better-sqlite3'); 

// Connect to a database or create one if it doesn't exist yet.
const db = new database('log.db');

// Is the database initialized or do we need to initialize it?
const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`);

let row = stmt.get();

if (row === undefined) {
    console.log('Log database appears to be empty. Creating log database...');

    const sqlInit = `
        CREATE TABLE accesslog ( 
            id INTEGER PRIMARY KEY, 
            remoteaddr TEXT,
            remoteuser TEXT,
            time TEXT,
            method TEXT,
            url TEXT,
            protocol TEXT,
            httpversion TEXT,
            status TEXT, 
            referrer TEXT,
            useragent TEXT
        );
    `

    db.exec(sqlInit);
} else {
    console.log('Log database exists.');
}

// Export all of the above as a module so that we can use it elsewhere.
module.exports = db;