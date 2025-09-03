document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const inputBox = document.getElementById('input-box');
    const addButton = document.getElementById('add-button');
    const listContainer = document.getElementById('list-container');
    const filterAllBtn = document.getElementById('filter-all');
    const filterActiveBtn = document.getElementById('filter-active');
    const filterCompletedBtn = document.getElementById('filter-completed');
    const clearCompletedBtn = document.getElementById('clear-completed');

    // --- App State ---
    let tasks = [];
    let currentFilter = 'all'; // 'all', 'active', 'completed'

    // --- Functions ---

    // Render tasks based on the current filter
    function renderTasks() {
        listContainer.innerHTML = '';
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true; // 'all'
        });

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task.text;
            li.dataset.id = task.id; // Use data attribute to store ID

            if (task.completed) {
                li.classList.add('checked');
            }

            const span = document.createElement('span');
            span.innerHTML = '\u00d7';
            li.appendChild(span);

            listContainer.appendChild(li);
        });
        saveData();
    }

    // Add a new task
    function addTask() {
        const taskText = inputBox.value.trim();
        if (taskText === '') {
            alert('You must write something!');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };

        tasks.push(newTask);
        inputBox.value = '';
        renderTasks();
    }

    // Toggle task completion status
    function toggleTask(taskId) {
        const task = tasks.find(t => t.id == taskId);
        if (task) {
            task.completed = !task.completed;
            renderTasks();
        }
    }

    // Delete a task
    function deleteTask(taskId) {
        tasks = tasks.filter(t => t.id != taskId);
        renderTasks();
    }

    // Start editing a task by double-clicking
    function editTask(liElement) {
        // Prevent editing a completed task
        if (liElement.classList.contains('checked')) {
            return;
        }
        
        liElement.style.pointerEvents = 'none'; // Disable click during edit

        const taskId = liElement.dataset.id;
        const task = tasks.find(t => t.id == taskId);
        const originalText = task.text;

        // Make the list item editable
        liElement.setAttribute('contenteditable', 'true');
        liElement.classList.add('editing');
        liElement.focus();

        // Select all text inside the element for easy replacement
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(liElement);
        selection.removeAllRanges();
        selection.addRange(range);

        const finishEditing = () => {
            liElement.setAttribute('contenteditable', 'false');
            liElement.classList.remove('editing');
            liElement.style.pointerEvents = 'auto'; // Re-enable click

            const newText = liElement.textContent.replace('\u00d7', '').trim();

            if (newText && newText !== originalText) {
                task.text = newText;
            } else {
                // If text is empty or unchanged, revert to original
                liElement.textContent = originalText;
                const span = document.createElement('span');
                span.innerHTML = '\u00d7';
                liElement.appendChild(span);
            }
            saveData();
            
            // Clean up event listeners to prevent memory leaks
            liElement.removeEventListener('blur', finishEditing);
            liElement.removeEventListener('keydown', handleKeydown);
        };

        const handleKeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent creating a new line
                finishEditing();
            } else if (e.key === 'Escape') {
                // Revert changes on Escape key
                liElement.textContent = originalText;
                const span = document.createElement('span');
                span.innerHTML = '\u00d7';
                liElement.appendChild(span);
                finishEditing();
            }
        };

        liElement.addEventListener('blur', finishEditing);
        liElement.addEventListener('keydown', handleKeydown);
    }

    // Change the current filter and update the view
    function setFilter(filter) {
        currentFilter = filter;
        // Update active button style
        [filterAllBtn, filterActiveBtn, filterCompletedBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`filter-${filter}`).classList.add('active');
        renderTasks();
    }

    // Clear all completed tasks from the list
    function clearCompleted() {
        tasks = tasks.filter(task => !task.completed);
        renderTasks();
    }

    // --- Local Storage ---
    function saveData() {
        localStorage.setItem('todoListTasks', JSON.stringify(tasks));
    }

    function loadData() {
        const data = localStorage.getItem('todoListTasks');
        tasks = data ? JSON.parse(data) : [];
        renderTasks();
    }

    // --- Event Listeners ---
    addButton.addEventListener('click', addTask);
    inputBox.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') addTask();
    });

    listContainer.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;

        const taskId = li.dataset.id;
        if (e.target.tagName === 'SPAN') {
            deleteTask(taskId);
        } else {
            toggleTask(taskId);
        }
    });
    
    listContainer.addEventListener('dblclick', (e) => {
        const li = e.target.closest('li');
        if (li) editTask(li);
    });

    filterAllBtn.addEventListener('click', () => setFilter('all'));
    filterActiveBtn.addEventListener('click', () => setFilter('active'));
    filterCompletedBtn.addEventListener('click', () => setFilter('completed'));
    clearCompletedBtn.addEventListener('click', clearCompleted);

    // --- Initial Load ---
    loadData();
});