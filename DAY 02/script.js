/* =====================================================
   TASKY - TO-DO APP
   Vanilla JavaScript
===================================================== */


/* =========================
   SELECT ELEMENTS
========================= */

const taskInput =
    document.getElementById("taskInput");

const addTaskBtn =
    document.getElementById("addTaskBtn");

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

const totalTasks =
    document.getElementById("totalTasks");

const completedTasks =
    document.getElementById("completedTasks");

const remainingTasks =
    document.getElementById("remainingTasks");

const clearCompleted =
    document.getElementById("clearCompleted");

const clock =
    document.getElementById("clock");

const date =
    document.getElementById("date");


/* =========================
   TASK DATA
========================= */

let tasks =
    JSON.parse(localStorage.getItem("taskyTasks")) || [];


/* =========================
   SAVE TASKS
========================= */

function saveTasks() {

    localStorage.setItem(
        "taskyTasks",
        JSON.stringify(tasks)
    );

}


/* =========================
   ADD TASK
========================= */

function addTask() {

    const text =
        taskInput.value.trim();


    /* Don't add empty tasks */

    if (text === "") {

        taskInput.focus();

        return;

    }


    const newTask = {

        id: Date.now(),

        text: text,

        completed: false,

        time: new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        )

    };


    tasks.unshift(newTask);


    saveTasks();

    renderTasks();


    /* Clear input */

    taskInput.value = "";

    taskInput.focus();

}


/* =========================
   RENDER TASKS
========================= */

function renderTasks() {

    /* Remove existing tasks */

    const taskItems =
        taskList.querySelectorAll(".task-item");


    taskItems.forEach(item => {

        item.remove();

    });


    /* Empty state */

    if (tasks.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

    }


    /* Create task elements */

    tasks.forEach(task => {

        const taskItem =
            document.createElement("div");


        taskItem.className = "task-item";


        if (task.completed) {

            taskItem.classList.add("completed");

        }


        taskItem.innerHTML = `

            <button
                class="task-check"
                onclick="toggleTask(${task.id})"
                aria-label="Complete task"
            >
                <i class="fa-solid fa-check"></i>
            </button>


            <span class="task-text">
                ${escapeHTML(task.text)}
            </span>


            <span class="task-time">
                ${task.time}
            </span>


            <button
                class="delete-task"
                onclick="deleteTask(${task.id})"
                aria-label="Delete task"
            >
                <i class="fa-solid fa-trash"></i>
            </button>

        `;


        taskList.appendChild(taskItem);

    });


    updateStats();

}


/* =========================
   TOGGLE TASK
========================= */

function toggleTask(id) {

    tasks =
        tasks.map(task => {

            if (task.id === id) {

                return {
                    ...task,
                    completed: !task.completed
                };

            }

            return task;

        });


    saveTasks();

    renderTasks();

}


/* =========================
   DELETE TASK
========================= */

function deleteTask(id) {

    tasks =
        tasks.filter(task => task.id !== id);


    saveTasks();

    renderTasks();

}


/* =========================
   CLEAR COMPLETED
========================= */

clearCompleted.addEventListener(
    "click",
    () => {

        tasks =
            tasks.filter(
                task => !task.completed
            );


        saveTasks();

        renderTasks();

    }
);


/* =========================
   UPDATE STATISTICS
========================= */

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const remaining =
        total - completed;


    totalTasks.textContent = total;

    completedTasks.textContent = completed;

    remainingTasks.textContent = remaining;

}


/* =========================
   ADD BUTTON
========================= */

addTaskBtn.addEventListener(
    "click",
    addTask
);


/* =========================
   ENTER KEY
========================= */

taskInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            addTask();

        }

    }
);


/* =========================
   LIVE CLOCK
========================= */

function updateClock() {

    const now =
        new Date();


    clock.textContent =
        now.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );


    date.textContent =
        now.toLocaleDateString(
            [],
            {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );

}


updateClock();


setInterval(
    updateClock,
    1000
);


/* =========================
   SECURITY
   Prevent HTML injection
========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================
   INITIAL RENDER
========================= */

renderTasks();