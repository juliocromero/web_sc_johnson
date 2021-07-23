'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class BpSetpoints extends Model {
    static get table () { //esta funcion cambia el nombre de la tabla
        return 'bp_setpoints'
    }
}

module.exports = BpSetpoints
