document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const assigneeInput = document.getElementById('assigneeInput'); // New assignee input
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    loadTasks();

    addTaskBtn.addEventListener('click', addTask);
    taskList.addEventListener('click', toggleTask);

    taskInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addTask();
        }
    });
    assigneeInput.addEventListener('keypress', function(event) { // Allow Enter on assignee field
        if (event.key === 'Enter') {
            addTask();
        }
    });

    function addTask() {
        const taskText = taskInput.value.trim();
        const assigneeText = assigneeInput.value.trim(); // Get assignee value

        if (taskText === '') {
            alert('タスクを入力してください。'); // Translated alert
            return;
        }

        const li = document.createElement('li');
        // Store task as an object to be stringified for the dataset attribute
        const taskData = {
            text: taskText,
            assignee: assigneeText,
            completed: false
        };
        li.dataset.task = JSON.stringify(taskData); // Store all data

        // Display task and assignee
        let displayText = taskText;
        if (assigneeText !== '') {
            displayText += ` - ${assigneeText}`;
        }
        li.textContent = displayText;

        taskList.appendChild(li);

        taskInput.value = '';
        assigneeInput.value = ''; // Clear assignee input field
        saveTasks();
    }

    function toggleTask(event) {
        if (event.target.tagName === 'LI') {
            const taskData = JSON.parse(event.target.dataset.task);
            taskData.completed = !taskData.completed;
            event.target.dataset.task = JSON.stringify(taskData); // Update task data

            event.target.classList.toggle('completed');
            // No need to change text content for strikethrough, CSS handles it
            saveTasks();
        }
    }

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(li => {
            // When saving, we retrieve the full task data object
            const taskData = JSON.parse(li.dataset.task);
            tasks.push(taskData);
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        if (tasks) {
            tasks.forEach(taskData => {
                const li = document.createElement('li');
                li.dataset.task = JSON.stringify(taskData); // Store all data

                let displayText = taskData.text;
                if (taskData.assignee && taskData.assignee !== '') {
                    displayText += ` - ${taskData.assignee}`;
                } else if (taskData.assignee === undefined && typeof taskData === 'object' && !taskData.hasOwnProperty('assignee')) {
                    // Handle old tasks that were just strings or objects without assignee
                    // This specific check might need adjustment based on how old tasks were stored
                    // For this version, we assume new structure or display as is.
                }


                li.textContent = displayText;
                if (taskData.completed) {
                    li.classList.add('completed');
                }
                taskList.appendChild(li);
            });
        }
    }
});
