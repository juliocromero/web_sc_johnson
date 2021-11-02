'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SunsLastQuerySchema extends Schema {
  up () {
    this.create('suns_last_queries', (table) => {
      table.increments()
      table.timestamps()
    })
  }

  down () {
    this.drop('suns_last_queries')
  }
}

module.exports = SunsLastQuerySchema
