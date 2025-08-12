// background.js
let alarmName = 'pomodoroTimer';
let currentMode = 'work';
let durations = { work: 25 * 60 * 1000, break: 5 * 60 * 1000 };
let remainingTime = durations.work;
let isRunning = false;

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

chrome.runtime.onStartup.addListener(() => {
    chrome.tabs.create({ url: 'chrome://newtab' });  // Открывает твою new tab при запуске браузера
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'start') {
        isRunning = true;
        remainingTime = message.time || durations[currentMode];
        chrome.alarms.create(alarmName, { periodInMinutes: 1 / 60 });  // Каждую секунду (но браузер оптимизирует)
        sendResponse({ status: 'started' });
    } else if (message.command === 'pause') {
        isRunning = false;
        chrome.alarms.clear(alarmName);
        sendResponse({ status: 'paused' });
    } else if (message.command === 'reset') {
        isRunning = false;
        remainingTime = durations[currentMode];
        chrome.alarms.clear(alarmName);
        chrome.storage.local.set({ remainingTime });
        sendResponse({ status: 'reset' });
    } else if (message.command === 'switchMode') {
        currentMode = message.newMode;
        remainingTime = durations[currentMode];
        chrome.storage.local.set({ mode: currentMode, remainingTime });
        sendResponse({ mode: currentMode });
    } else if (message.command === 'getState') {
        sendResponse({ remainingTime, isRunning, mode: currentMode });
    }
    return true;  // Для async sendResponse
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === alarmName && isRunning) {
        remainingTime -= 1000;
        if (remainingTime <= 0) {
            remainingTime = 0;
            isRunning = false;
            chrome.alarms.clear(alarmName);
            // Notify UI (broadcast message)
            chrome.runtime.sendMessage({ type: 'finished' });
        } else {
            // Update storage for UI sync
            chrome.storage.local.set({ remainingTime });
            // Optional: broadcast tick if needed
        }
    }
});

// Load initial state from storage
chrome.storage.local.get(['mode', 'remainingTime'], (data) => {
    currentMode = data.mode || 'work';
    remainingTime = data.remainingTime || durations[currentMode];
});