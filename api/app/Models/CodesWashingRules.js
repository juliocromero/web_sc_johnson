'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CodesWashingRules extends Model {
    static get createdAtColumn() {
        return null;
    }
        
    static get updatedAtColumn() {
        return null;
    }
    static get table () { //esta funcion cambia el nombre de la tabla
        return 'codes_washing_rules'
    }

    grupo () {
        return this.hasOne('App/Models/GroupWashingRules', 'id', 'grupo');
    }
}

module.exports = CodesWashingRules