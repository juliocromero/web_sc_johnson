'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class WashingRule extends Model {
    static get createdAtColumn() {
        return null;
    }
        
    static get updatedAtColumn() {
        return null;
    }

    static get table () {
        return 'cip.washing_rules'
    }

    cur_group () {
        return this.hasOne('App/Models/GroupWashingRules','grupo_id_act','id');
    }
    pre_group () {
        return this.hasOne('App/Models/GroupWashingRules','grupo_id_ant','id');
    }

}

module.exports = WashingRule
