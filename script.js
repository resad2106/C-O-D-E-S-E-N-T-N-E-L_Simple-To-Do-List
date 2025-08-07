const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const categorySelect = document.getElementById('categorySelect');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

let tasks = [];
let currentFilter = 'all';
let dragSrcEl = null;

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem('tasks');
  tasks = saved ? JSON.parse(saved) : [];
}

function renderTasks() {
  taskList.innerHTML = '';

  let filteredTasks = tasks;
  if (currentFilter === 'completed') {
    filteredTasks = tasks.filter(t => t.completed);
  } else if (currentFilter === 'pending') {
    filteredTasks = tasks.filter(t => !t.completed);
  }

  filteredTasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.setAttribute('draggable', 'true');
    li.className = task.completed ? 'completed' : '';
    li.dataset.index = index;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.className = 'task-checkbox';
    checkbox.addEventListener('change', () => {
      tasks[index].completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const dragHandle = document.createElement('span');
    dragHandle.textContent = '≡';
    dragHandle.className = 'drag-handle';

    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';

    const taskInputEdit = document.createElement('input');
    taskInputEdit.type = 'text';
    taskInputEdit.value = task.text;
    taskInputEdit.setAttribute('aria-label', 'Edit task text');
    taskInputEdit.readOnly = true;

    taskInputEdit.addEventListener('dblclick', () => {
      taskInputEdit.readOnly = false;
      taskInputEdit.focus();
    });
    taskInputEdit.addEventListener('blur', () => {
      taskInputEdit.readOnly = true;
      tasks[index].text = taskInputEdit.value.trim() || tasks[index].text;
      saveTasks();
      renderTasks();
    });
    taskInputEdit.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        taskInputEdit.blur();
      }
    });

    taskContent.appendChild(taskInputEdit);

    const meta = document.createElement('div');
    meta.className = 'task-meta';
    if (task.dueDate) {
      const dueSpan = document.createElement('span');
      dueSpan.textContent = `Due: ${task.dueDate}`;
      meta.appendChild(dueSpan);
    }
    if (task.category) {
      const catSpan = document.createElement('span');
      catSpan.textContent = task.category;
      meta.appendChild(catSpan);
    }
    taskContent.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '✎';
    editBtn.title = 'Edit task';
    editBtn.addEventListener('click', () => {
      taskInputEdit.readOnly = false;
      taskInputEdit.focus();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '🗑';
    deleteBtn.title = 'Delete task';
    deleteBtn.addEventListener('click', () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(dragHandle);
    li.appendChild(checkbox);
    li.appendChild(taskContent);
    li.appendChild(actions);

    li.addEventListener('dragstart', (e) => {
      dragSrcEl = li;
      li.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index);
    });
    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const draggingOverEl = e.target.closest('li');
      if (draggingOverEl && draggingOverEl !== dragSrcEl) {
        const draggingOverIndex = Number(draggingOverEl.dataset.index);
        const draggingIndex = Number(dragSrcEl.dataset.index);
        if (draggingIndex < draggingOverIndex) {
          draggingOverEl.after(dragSrcEl);
        } else {
          draggingOverEl.before(dragSrcEl);
        }
      }
    });
    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
      const newTasks = [];
      taskList.querySelectorAll('li').forEach((liEl) => {
        const i = Number(liEl.dataset.index);
        newTasks.push(tasks[i]);
      });
      tasks = newTasks;
      saveTasks();
      renderTasks();
    });

    taskList.appendChild(li);
  });
}

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const dueDate = dueDateInput.value;
  const category = categorySelect.value;

  tasks.push({
    text,
    completed: false,
    dueDate: dueDate ? dueDate : null,
    category: category ? category : null,
  });

  taskInput.value = '';
  dueDateInput.value = '';
  categorySelect.selectedIndex = 0;

  saveTasks();
  renderTasks();
});

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

clearCompletedBtn.addEventListener('click', () => {
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  renderTasks();
});

loadTasks();
renderTasks();
