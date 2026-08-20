// Data Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentFilter = '';
let indexToBeDeleted = null;

// DOM Elements
const taskManagerContainer = document.querySelector(".taskManager");
const confirmEl = document.querySelector(".confirm");
const confirmDeleteBtn = confirmEl.querySelector(".confirmDelete");
const cancelBtn = confirmEl.querySelector(".cancel");
const taskForm = document.getElementById('taskform');
const textInput = document.getElementById('textinput');
const userInput = document.getElementById('userInput');
const addUserBtn = document.getElementById('addUserBtn');
const userSelect = document.getElementById('userSelect');
const filterUser = document.getElementById('filterUser');
const taskContainer = document.getElementById('taskContainer');

// USER MANAGEMENT 

function saveUsers() {
  localStorage.setItem('users', JSON.stringify(users));
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderUserList() {
  const userList = document.getElementById('userList');
  userList.innerHTML = '';

  users.forEach((user, index) => {
    const userItem = document.createElement('div');
    userItem.classList.add('userItem');
    
    const userName = document.createElement('span');
    userName.classList.add('userName');
    userName.innerText = user;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('deleteUserBtn');
    deleteBtn.innerText = 'X';
    deleteBtn.addEventListener('click', () => deleteUser(index));
    
    userItem.appendChild(userName);
    userItem.appendChild(deleteBtn);
    userList.appendChild(userItem);
  });

  updateUserSelects();
}

function updateUserSelects() {
  // Update user select dropdown in form
  const currentValue = userSelect.value;
  userSelect.innerHTML = '<option value="">Select User</option>';
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user;
    option.innerText = user;
    userSelect.appendChild(option);
  });
  userSelect.value = currentValue;

  // Update filter dropdown
  const currentFilter = filterUser.value;
  filterUser.innerHTML = '<option value="">All Tasks</option>';
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user;
    option.innerText = user;
    filterUser.appendChild(option);
  });
  filterUser.value = currentFilter;
}

function addUser() {
  const userName = userInput.value.trim();
  
  if (userName === '') {
    alert('Please enter a username');
    return;
  }

  if (/^\d/.test(userName)) {
    alert('Username must not start with a number');
    return;
  }

  const alphabetCount = (userName.match(/[A-Za-z]/g) || []).length;
  if (alphabetCount < 5) {
    alert('Username must contain at least 5 letters');
    return;
  }
  
  if (users.includes(userName)) {
    alert('User already exists');
    return;
  }
  
  users.push(userName);
  saveUsers();
  userInput.value = '';
  renderUserList();
  updateStatistics();
}

function deleteUser(index) {
  const deletedUser = users[index];
  users.splice(index, 1);
  
  // Remove tasks assigned to this user
  tasks = tasks.filter(task => task.assignedUser !== deletedUser);
  
  saveUsers();
  saveTasks();
  renderUserList();
  renderTasks();
  updateStatistics();
}

//  TASK MANAGEMENT 

function handleFormSubmit(event) {
  event.preventDefault();
  const taskText = textInput.value.trim();
  const assignedUser = userSelect.value;

  if (taskText === '') {
    alert('Please enter a task');
    return;
  }

  if (assignedUser === '') {
    alert('Please select a user');
    return;
  }

  const newTask = {
    text: taskText,
    completed: false,
    assignedUser: assignedUser,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  saveTasks();
  textInput.value = '';
  userSelect.value = '';
  renderTasks();
  updateStatistics();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
  updateStatistics();
}

function renderTasks() {
  taskContainer.innerHTML = '';

  // Filter tasks based on current filter
  const filteredTasks = currentFilter 
    ? tasks.filter(task => task.assignedUser === currentFilter)
    : tasks;

  if (filteredTasks.length === 0) {
    const noTasks = document.createElement('p');
    noTasks.classList.add('noTasks');
    noTasks.innerText = 'No tasks found';
    taskContainer.appendChild(noTasks);
    return;
  }

  const tableWrapper = document.createElement('div');
  tableWrapper.classList.add('tableWrapper');

  const taskTable = document.createElement('table');
  taskTable.classList.add('taskTable');
  taskTable.innerHTML = `
    <thead>
      <tr>
        <th scope="col">Task name</th>
        <th scope="col">User name</th>
        <th scope="col">Status</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tableBody = taskTable.querySelector('tbody');

  filteredTasks.forEach((task, index) => {
    const actualIndex = tasks.indexOf(task);
    const taskRow = document.createElement('tr');
    taskRow.classList.add(task.completed ? 'completed' : 'pending');

    const taskNameCell = document.createElement('td');
    taskNameCell.classList.add('taskText');
    taskNameCell.innerText = task.text;

    const userNameCell = document.createElement('td');
    userNameCell.classList.add('userInfo');
    userNameCell.innerText = task.assignedUser;

    const statusCell = document.createElement('td');
    const taskStatus = document.createElement('span');
    taskStatus.classList.add('status');
    taskStatus.innerText = task.completed ? 'Completed' : 'Pending';
    statusCell.appendChild(taskStatus);

    const actionsCell = document.createElement('td');
    actionsCell.classList.add('taskActions');

    // Toggle button
    const toggleButton = document.createElement('button');
    toggleButton.classList.add('button-box');
    toggleButton.classList.add('toggleButton');
    toggleButton.innerText = task.completed ? 'Mark as Pending' : 'Mark as Done';
    toggleButton.setAttribute('aria-label', `${toggleButton.innerText}: ${task.text}`);
    toggleButton.addEventListener('click', () => {
      tasks[actualIndex].completed = !tasks[actualIndex].completed;
      saveTasks();
      renderTasks();
      updateStatistics();
    });

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('button-box');
    deleteButton.classList.add('deleteButton');
    deleteButton.innerText = 'Delete';
    deleteButton.setAttribute('aria-label', `Delete: ${task.text}`);
    deleteButton.addEventListener('click', () => {
      indexToBeDeleted = actualIndex;
      confirmEl.style.display = 'block';
      taskManagerContainer.classList.add('overlay');
    });

    actionsCell.appendChild(toggleButton);
    actionsCell.appendChild(deleteButton);
    taskRow.appendChild(taskNameCell);
    taskRow.appendChild(userNameCell);
    taskRow.appendChild(statusCell);
    taskRow.appendChild(actionsCell);
    tableBody.appendChild(taskRow);
  });

  tableWrapper.appendChild(taskTable);
  taskContainer.appendChild(tableWrapper);
}

// STATISTICS 

function updateStatistics() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  document.getElementById('totalTasks').innerText = totalTasks;
  document.getElementById('completedCount').innerText = completedTasks;
  document.getElementById('pendingCount').innerText = pendingTasks;

  // Update user-specific statistics
  updateUserStatistics();
}

function updateUserStatistics() {
  users.forEach((user, index) => {
    const userItems = document.querySelectorAll('.userItem');
    if (userItems[index]) {
      const userTasks = tasks.filter(task => task.assignedUser === user);
      const userCompleted = userTasks.filter(task => task.completed).length;
      const userPending = userTasks.length - userCompleted;
      
      const stats = userItems[index].querySelector('.userStats');
      if (stats) {
        stats.innerText = `${userCompleted}/${userTasks.length}`;
      }
    }
  });
}

// EVENT LISTENERS 

addUserBtn.addEventListener('click', addUser);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addUser();
});

taskForm.addEventListener('submit', handleFormSubmit);

filterUser.addEventListener('change', (e) => {
  currentFilter = e.target.value;
  renderTasks();
});

confirmDeleteBtn.addEventListener('click', () => {
  confirmEl.style.display = 'none';
  taskManagerContainer.classList.remove('overlay');
  deleteTask(indexToBeDeleted);
});

cancelBtn.addEventListener('click', () => {
  confirmEl.style.display = 'none';
  taskManagerContainer.classList.remove('overlay');
});

//  INITIAL RENDER 

renderUserList();
renderTasks();
updateStatistics();
