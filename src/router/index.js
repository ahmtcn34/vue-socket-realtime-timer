import { createWebHistory, createRouter } from "vue-router";
const routes = [
    {
        path: "/",
        name: "CreeateRoom",
        component: () => import("../views/CreateRoom.vue"),
    },
    {
        path: "/join-room",
        name: "JoinRoom",
        component: () => import("../views/JoinRoom.vue"),
    },
    {
        path: "/join-room/:room",
        name: "JoinRoomName",
        component: () => import("../views/JoinRoom.vue"),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
