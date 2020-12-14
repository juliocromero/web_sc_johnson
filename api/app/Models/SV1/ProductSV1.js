'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class ProductSV1 extends Model {
    static get connection(){
        return 'Server1';
    }
}

module.exports = ProductSV1
