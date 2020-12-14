'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

/** @type {import('@adonisjs/ignitor/src/Helpers')} */
const Helpers = use('Helpers')

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Connection
  |--------------------------------------------------------------------------
  |
  | Connection defines the default connection settings to be used while
  | interacting with SQL databases.
  |
  */
  connection: Env.get('DB_CONNECTION', 'sqlite'),

  /*
  |--------------------------------------------------------------------------
  | Sqlite
  |--------------------------------------------------------------------------
  |
  | Sqlite is a flat file database and can be a good choice for a development
  | environment.
  |
  | npm i --save sqlite3
  |
  */
  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: Helpers.databasePath(`${Env.get('DB_DATABASE', 'development')}.sqlite`)
    },
    useNullAsDefault: true,
    debug: Env.get('DB_DEBUG', false)
  },

  /*
  |--------------------------------------------------------------------------
  | MySQL
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for MySQL database.
  |
  | npm i --save mysql
  |
  */
  mysql: {
    client: 'mysql',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    },
    debug: Env.get('DB_DEBUG', false)
  },

  /*
  |--------------------------------------------------------------------------
  | PostgreSQL
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for PostgreSQL database.
  |
  | npm i --save pg
  |
  */
  pg: {
    client: 'pg',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    },
    debug: Env.get('DB_DEBUG', false)
  },


    /*
  |--------------------------------------------------------------------------
  | Microsoft SQL Server
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for SQLServer database.
  |
  | npm i --save mssql
  |
  */
 historicos: {
  client: 'mssql',
  connection: {
    type: 'mssql',
    host: Env.get('DB_HOST_SQL', 'localhost'), 
    user: Env.get('DB_USER_SQL', 'root'), 
    password: Env.get('DB_PASSWORD_SQL', ''), 
    database: Env.get('DB_DATABASE_SQL', 'adonis'), 
  }
},

    /*
  |--------------------------------------------------------------------------
  | Microsoft SQL Server
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for SQLServer database.
  |
  | npm i --save mssql
  |
  */
 Server2: {
  client: 'mssql',
  connection: {
    type: 'mssql',
    host: Env.get('DB_HOST_SERVER2', 'localhost'), 
    user: Env.get('DB_USER_SERVER2', 'root'), 
    password: Env.get('DB_PASSWORD_SERVER2', ''), 
    database: Env.get('DB_DATABASE_SERVER2', 'adonis'), 
  }
},
}
