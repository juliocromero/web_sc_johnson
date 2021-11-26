'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class GroupWashingRules extends Model {
    static get createdAtColumn() {
        return null;
    }
        
    static get updatedAtColumn() {
        return null;
    }
    static get table () { //esta funcion cambia el nombre de la tabla
        return 'groups_washing_rules'
    }
}

module.exports = GroupWashingRules
