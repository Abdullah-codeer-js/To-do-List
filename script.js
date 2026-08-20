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
    deleteBtn.innerText = '✕';
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

  if (!/[A-Za-z]/.test(userName)) {
    alert('Username must contain at least one letter');
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

  filteredTasks.forEach((task, index) => {
    const actualIndex = tasks.indexOf(task);
    
    const taskCard = document.createElement('div');
    taskCard.classList.add('taskCard');
    
    let classVal = 'pending';
    let statusText = 'Pending';
    
    if (task.completed) {
      classVal = 'completed';
      statusText = 'Completed';
    }
    taskCard.classList.add(classVal);

    // Task text
    const taskText = document.createElement('p');
    taskText.classList.add('taskText');
    taskText.innerText = task.text;

    // User assignment
    const userInfo = document.createElement('p');
    userInfo.classList.add('userInfo');
    userInfo.innerText = `👤 ${task.assignedUser}`;

    // Status
    const taskStatus = document.createElement('p');
    taskStatus.classList.add('status');
    taskStatus.innerText = statusText;

    // Toggle button
    const toggleButton = document.createElement('button');
    toggleButton.classList.add('button-box');
    const btnContentEl = document.createElement('span');
    btnContentEl.classList.add('green');
    btnContentEl.innerText = task.completed ? 'Mark as Pending' : 'Mark as Completed';
    toggleButton.appendChild(btnContentEl);
    toggleButton.addEventListener('click', () => {
      tasks[actualIndex].completed = !tasks[actualIndex].completed;
      saveTasks();
      renderTasks();
      updateStatistics();
    });

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('button-box');
    const delBtnContentEl = document.createElement('span');
    delBtnContentEl.classList.add('red');
    delBtnContentEl.innerText = 'Delete';
    deleteButton.appendChild(delBtnContentEl);
    deleteButton.addEventListener('click', () => {
      indexToBeDeleted = actualIndex;
      confirmEl.style.display = 'block';
      taskManagerContainer.classList.add('overlay');
    });

    taskCard.appendChild(taskText);
    taskCard.appendChild(userInfo);
    taskCard.appendChild(taskStatus);
    taskCard.appendChild(toggleButton);
    taskCard.appendChild(deleteButton);

    taskContainer.appendChild(taskCard);
  });
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
