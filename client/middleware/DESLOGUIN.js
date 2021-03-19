
import Cookies from 'js-cookie';
import { state } from "~/store/index.js";

  state.auth = false;
  Cookies.remove('token');
  Cookies.remove('name');
  Cookies.remove('lastname');
  Cookies.remove('rol');




