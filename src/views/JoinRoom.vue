<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");

const route = useRoute();
const router = useRouter();
const toast = useToast();

const room = ref(route.params.room ?? "");
const pass = ref("");
const connectRoom = ref("JOIN");
const isStarted = ref(false);
const roomData = reactive({
    roomName: "",
});
const interval = ref(null);
const timer = reactive({
    second: 0,
    minute: 0,
    hour: 0,
});
const joinRoom = () => {
    socket.emit("JOIN_ROOM", { room: room.value, pass: pass.value });
};
const startTimer = () => {
    clearInterval(interval.value);
    isStarted.value = true;
    if (isStarted.value) {
        interval.value = setInterval(function () {
            timer.second++;
            if (timer.second < 10) timer.second = "0" + timer.second;
            if (timer.second > 59) {
                timer.second = 0;
                timer.minute = 1;
                if (timer.minute < 10) timer.minute = "0" + timer.minute;
            }
            if (timer.minute > 59) {
                timer.minute = 0;
                timer.hour = 1;
                if (timer.hour < 10) timer.hour = "0" + timer.hour;
            }
            socket.emit("updateTimer", timer);
        }, 1000);
    }
    socket.emit("isStartTimer", isStarted.value);
};
const stopTimer = () => {
    clearInterval(interval.value);
    isStarted.value = false;
    socket.emit("isStopTimer", isStarted.value);
};
onMounted(() => {
    if (route.params.room) {
        socket.emit("JOIN_ROOM", {
            room: route.params.room,
            pass: route.query.password ? route.query.password : pass.value,
        });
        connectRoom.value = "REQUEST_PASSWORD";
    }
    socket.emit("initValue");
});

socket.on("update", (res) => {
    isStarted.value = res;
});
socket.on("initValueUpdate", (res) => {
    timer.second = res.second;
    timer.minute = res.minute;
    timer.hour = res.hour;
});
socket.on("startTimerUpdate", ({ time }) => {
    timer.second = time.second;
    timer.minute = time.minute;
    timer.hour = time.hour;
});
socket.on("isStartTimer", (res) => {
    isStarted.value = res;
});
socket.on("stopInterval", () => {
    clearInterval(interval.value);
    interval.value = null;
});
socket.on("joinFailed", (res) => {
    toast.error(res);
    connectRoom.value = "REQUEST_PASSWORD";
});
socket.on("JOINED_ROOM", (res) => {
    roomData.roomName = res;
    connectRoom.value = "JOINED";
    router.push(`/join-room/${roomData.roomName}`);
});
</script>

<template>
    <div class="w-full h-full flex items-center justify-center flex-col">
        <h4 class="text-white mb-6 text-center text-3xl">Timer</h4>
        <div
            class="p-8 bg-gray-800 w-10/12 md:w-2/4 mx-4 flex rounded justify-center"
        >
            <div v-if="connectRoom == 'JOIN'">
                <div class="flex flex-col my-6">
                    <label for="" class="text-white opacity-70 mb-1"
                        >Room name</label
                    >
                    <input
                        class="bg-gray-700 px-4 py-2 rounded outline-none text-white"
                        type="text"
                        placeholder="Enter the name of the room..."
                        v-model="room"
                    />
                </div>
                <div class="flex flex-col my-6">
                    <label for="" class="text-white opacity-70 mb-1"
                        >Room Password</label
                    >
                    <input
                        class="bg-gray-700 px-4 py-2 rounded outline-none text-white"
                        type="password"
                        placeholder="Enter the password of the room..."
                        v-model="pass"
                    />
                </div>
                <button
                    class="bg-teal-700 rounded p-3 text-white hover:bg-teal-600 transition"
                    @click="joinRoom"
                >
                    Join Room
                </button>
            </div>
            <div v-else-if="connectRoom == 'REQUEST_PASSWORD'">
                <h2 class="text-white text-lg">
                    You need to enter a password to enter room
                    <span class="text-bold font-bold text-indigo-400">{{
                        room
                    }}</span>
                </h2>
                <div class="flex flex-col my-6">
                    <label for="" class="text-white opacity-70 mb-1"
                        >Room Password</label
                    >
                    <input
                        class="bg-gray-700 px-4 py-2 rounded outline-none text-white"
                        type="password"
                        placeholder="Enter the password of the room..."
                        v-model="pass"
                    />
                </div>
                <button
                    class="bg-teal-700 rounded p-3 text-white hover:bg-teal-600 transition"
                    @click="joinRoom"
                >
                    Join Room
                </button>
            </div>
            <div
                v-else-if="connectRoom == 'JOINED'"
                class="flex flex-col justify-center"
            >
                <div class="flex space-x-4 mb-4">
                    <div
                        class="text-xl text-white bg-indigo-400 py-3 px-4 md:px-8 rounded-md flex flex-col items-center"
                    >
                        {{ timer.hour }}
                        <span>Hour</span>
                    </div>
                    <div
                        class="text-xl text-white bg-indigo-400 py-3 px-4 md:px-8 rounded-md flex flex-col items-center"
                    >
                        {{ timer.minute }}
                        <span>Minute</span>
                    </div>
                    <div
                        class="text-xl text-white bg-indigo-400 py-3 px-4 md:px-8 rounded-md flex flex-col items-center"
                    >
                        {{ timer.second }}
                        <span>Second</span>
                    </div>
                </div>
                <div class="flex justify-center">
                    <button
                        :disabled="isStarted"
                        :class="[
                            { 'opacity-20 cursor-not-allowed': isStarted },
                            'bg-teal-700 rounded p-3 text-white hover:bg-teal-600 transition cursor-pointer',
                        ]"
                        @click="startTimer"
                    >
                        Start
                    </button>
                    <button
                        :class="[
                            { 'opacity-20 cursor-not-allowed': !isStarted },
                            'bg-teal-700 rounded p-3 text-white hover:bg-teal-600 transition ml-4 cursor-pointer',
                        ]"
                        @click="stopTimer"
                    >
                        Stop
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
