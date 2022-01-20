import { createApp } from "vue";
import router from "./router/index";
import store from "./store/index";
import App from "./App.vue";
import Toast from "vue-toastification";
import { io } from "socket.io-client";

import "vue-toastification/dist/index.css";
import "./assets/index.css";

const socket = io("http://localhost:5000");

const options = {};
const app = createApp(App);
app.config.globalProperties.$socket = socket;
app.use(router);
app.use(store);
app.use(Toast, options);
app.mount("#app");
