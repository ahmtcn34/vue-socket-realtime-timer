<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");

const router = useRouter();
const toast = useToast();
const store = useStore();
const roomName = ref("");
const password = ref("");
const createRoom = () => {
    const room = roomName.value;
    const pass = password.value;
    socket.emit("CREATE_ROOM", { room, pass });
};
socket.on("createFailed", (res) => {
    console.log("createFailed", res);
});
socket.on("createdRoom", (room) => {
    toast.success(`${room} room has been created successfully`, {
        timeout: 2000,
    });
    setTimeout(() => {
        router.push({
            path: `/join-room/${room}`,
            query: { password: password.value ?? "" },
        });
    }, 2000);
});
</script>
<template>
    <div class="w-full h-full flex items-center justify-center flex-col">
        <h2 class="text-white text-6xl mb-8">Create Room</h2>
        <div class="p-8 bg-gray-800 rounded-md w-10/12 md:w-1/2">
            <div class="flex flex-col mb-6">
                <label for="" class="text-white opacity-70 mb-1"
                    >Room Name</label
                >
                <input
                    class="bg-gray-700 px-4 py-2 rounded outline-none text-white"
                    type="text"
                    placeholder="Enter the name of the room..."
                    v-model="roomName"
                />
            </div>
            <div class="flex flex-col mb-6">
                <label for="" class="text-white opacity-70 mb-1"
                    >Room Password</label
                >
                <input
                    class="bg-gray-700 px-4 py-2 rounded outline-none text-white"
                    type="password"
                    placeholder="Enter the password of the room..."
                    v-model="password"
                />
            </div>

            <button
                class="bg-teal-700 rounded p-3 text-white hover:bg-teal-600 transition"
                @click="createRoom"
            >
                Create
            </button>
        </div>
    </div>
</template>

<style></style>
