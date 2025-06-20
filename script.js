document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    // Load tasks from local storage if available
    loadTasks();

    addTaskBtn.addEventListener('click', addTask);
    taskList.addEventListener('click', toggleTask);
    taskInput.addEventListener('keypress', function(event) {
        // Check if the key pressed is 'Enter'
        if (event.key === 'Enter') {
            addTask();
        }
    });

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            alert('Please enter a task.');
            return;
        }

        const li = document.createElement('li');
        li.textContent = taskText;
        taskList.appendChild(li);

        taskInput.value = ''; // Clear input field
        saveTasks();
    }

    function toggleTask(event) {
        if (event.target.tagName === 'LI') {
            event.target.classList.toggle('completed');
            saveTasks();
        }
    }

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(li => {
            tasks.push({
                text: li.textContent,
                completed: li.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        if (tasks) {
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = task.text;
                if (task.completed) {
                    li.classList.add('completed');
                }
                taskList.appendChild(li);
            });
        }
    }
});
