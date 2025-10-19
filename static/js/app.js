document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoList = document.getElementById('todo-list');
    const nameInput = document.getElementById('todo-name');
    const descriptionInput = document.getElementById('todo-description');

    const API_URL = '/todos/';

    // Fetch and display todos
    async function fetchTodos() {
        const response = await fetch(API_URL);
        const todos = await response.json();
        todoList.innerHTML = '';
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="${todo.completed ? 'completed' : ''}">${todo.name}</span>
                <div>
                    <button class="complete-btn">Complete</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
            li.dataset.id = todo.id;

            // Delete button
            li.querySelector('.delete-btn').addEventListener('click', async () => {
                await fetch(`${API_URL}${todo.id}`, { method: 'DELETE' });
                fetchTodos();
            });

            // Complete button
            li.querySelector('.complete-btn').addEventListener('click', async () => {
                const updatedTodo = { ...todo, completed: !todo.completed };
                await fetch(`${API_URL}${todo.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedTodo)
                });
                fetchTodos();
            });

            todoList.appendChild(li);
        });
    }

    // Add new todo
    todoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newTodo = {
            name: nameInput.value,
            description: descriptionInput.value,
            completed: false
        };
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTodo)
        });
        nameInput.value = '';
        descriptionInput.value = '';
        fetchTodos();
    });

    fetchTodos();
});