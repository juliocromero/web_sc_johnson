import axios from "axios";

export default axios.create({

    baseURL: "http://0.0.0.0:3334/api/v1/",
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    }
});
//192.168.194.98:3333/api/v1/