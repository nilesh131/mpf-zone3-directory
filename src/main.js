import "./styles/main.css";
import "./styles/header.css";
import { initializeApp } from "./core/app.js";
import { initializeDemo } from "./core/demo.js";

window.addEventListener("DOMContentLoaded", async () => {

    await initializeApp();
    initializeDemo();

});