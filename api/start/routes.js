'use strict'
/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/api/v1', () => {
  return { greeting: 'Welcome API- SC Johnson - Systelec S.A' }
})

// USERS
Route.post("api/v1/register", "UserController.store");
Route.post("api/v1/login", "UserController.login");
Route.get("api/v1/user", "UserController.index");
Route.get("api/v1/loginUsersAutomatico", "UserController.loginToken");
Route.put("api/v1/change_pass", "UserController.update");
Route.put("api/v1/restore_pass", "UserController.restore");
Route.put("api/v1/user/:id", "UserController.edit");
Route.delete("api/v1/user/:id", "UserController.destroy");

//SETPOINTS
Route.get("api/v1/products", "BpSetpointsController.index");
Route.post("api/v1/products", "BpSetpointsController.store");
Route.put("api/v1/products/:id", "BpSetpointsController.update");
Route.delete("api/v1/products/:id", "BpSetpointsController.destroy");

//WASHING_RULES
Route.group(() => {
  //CODES
  Route.get("codes", "CodesWashingRulesController.index");
  Route.post("codes", "CodesWashingRulesController.store");
  Route.put("multiple_codes", "CodesWashingRulesController.multipleUpdate");
  //GROUPS
  Route.get("groups", "GroupWashingRulesController.index");
  Route.post("groups", "GroupWashingRulesController.store");
  Route.put("groups", "GroupWashingRulesController.update");
}).prefix('api/v1/washing_rules/');

//SUNS
Route.get("api/v1/producto_lote", "ProductoLoteController.index");
