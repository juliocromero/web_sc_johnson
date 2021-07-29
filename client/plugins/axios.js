import axios from "axios";

export default axios.create({

    baseURL: "http://192.168.1.182:8080/api/v1/",
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    }
});
//192.168.194.98:3333/api/v1/