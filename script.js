document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
    // Solicitar permissões para notificações
    const requestNotificationPermission = async () => {
        const { LocalNotifications } = require('@capacitor/local-notifications');

        const permission = await LocalNotifications.requestPermissions();
        console.log('Notification permission:', permission);
    };

    requestNotificationPermission();

    const splashScreen = document.querySelector('.splash-screen');
    const appContainer = document.querySelector('.app-container');

    setTimeout(() => {
        splashScreen.style.opacity = '0';
        appContainer.style.opacity = '1';
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 1000);
    }, 1500); // Duração da splash screen
});

function addTask() {
    const taskInput = document.getElementById('taskInput').value;
    const dateInput = document.getElementById('dateInput').value;
    const timeInput = document.getElementById('timeInput').value;

    if (taskInput === '' || dateInput === '' || timeInput === '') {
        alert('Por favor, preencha o nome do trabalho, a data e a hora.');
        return;
    }

    const task = {
        id: Date.now(),
        name: taskInput,
        dueDate: new Date(`${dateInput}T${timeInput}`).toISOString(),
        completed: false,
    };

    addTaskToDOM(task);
    saveTask(task);
    scheduleNotifications(task);

    document.getElementById('taskInput').value = '';
    document.getElementById('dateInput').value = '';
    document.getElementById('timeInput').value = '';
}

function scheduleNotifications(task) {
    const currentDate = new Date();
    const timeDifference = new Date(task.dueDate).getTime() - currentDate.getTime();
    const daysUntilDue = Math.ceil(timeDifference / (1000 * 3600 * 24));

    if (daysUntilDue <= 4) {
        for (let i = 1; i <= daysUntilDue; i++) {
            const notificationTime = new Date(task.dueDate);
            notificationTime.setDate(notificationTime.getDate() - i);
            notificationTime.setHours(Math.floor(Math.random() * 12) + 9);
            notificationTime.setMinutes(Math.floor(Math.random() * 60));

            scheduleLocalNotification(task.name, i, notificationTime);
        }
    }
}

async function scheduleLocalNotification(taskName, daysRemaining, notificationTime) {
    const { LocalNotifications } = require('@capacitor/local-notifications');

    await LocalNotifications.schedule({
        notifications: [
            {
                title: 'Notific',
                body: `Ei! Faltam ${daysRemaining} dias para o seu trabalho "${taskName}".`,
                id: Math.floor(Math.random() * 10000),
                schedule: { at: notificationTime },
                sound: null, // Adicione um caminho para o som customizado se necessário
                attachments: null,
                actionTypeId: "",
                extra: null
            }
        ]
    });
}

function addTaskToDOM(task) {
    const taskList = document.getElementById('taskList');

    const listItem = document.createElement('li');
    listItem.setAttribute('data-id', task.id);

    const taskName = document.createElement('span');
    taskName.textContent = `${task.name} - ${new Date(task.dueDate).toLocaleString()}`;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Excluir';
    deleteButton.onclick = () => deleteTask(task.id);

    listItem.appendChild(taskName);
    listItem.appendChild(deleteButton);

    taskList.appendChild(listItem);
}

function saveTask(task) {
    const tasks = loadTasksFromStorage();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = loadTasksFromStorage();
    tasks.forEach(addTaskToDOM);
}

function loadTasksFromStorage() {
    const tasksJSON = localStorage.getItem('tasks');
    return tasksJSON ? JSON.parse(tasksJSON) : [];
}

function deleteTask(taskId) {
    let tasks = loadTasksFromStorage();
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    const taskList = document.getElementById('taskList');
    const taskItem = taskList.querySelector(`[data-id="${taskId}"]`);
    if (taskItem) {
        taskList.removeChild(taskItem);
    }
}
