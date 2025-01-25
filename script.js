let events = [];
let workingHours = { start: "08:00", end: "18:00" };

function setWorkingHours() {
    workingHours.start = document.getElementById("workStart").value;
    workingHours.end = document.getElementById("workEnd").value;
    alert(`Working hours set to: ${workingHours.start} - ${workingHours.end}`);
}

function addEvent() {
    const name = document.getElementById("eventName").value;
    const start = document.getElementById("startTime").value;
    const end = document.getElementById("endTime").value;

    if (!name || !start || !end) {
        alert("Please fill in all fields.");
        return;
    }

    const newEvent = { name, start, end };
    events.push(newEvent);
    displayEvents();
    detectConflicts();
}

function displayEvents() {
    const container = document.getElementById("scheduleContainer");
    container.innerHTML = "";
    events.sort((a, b) => a.start.localeCompare(b.start));

    events.forEach((event, index) => {
        const div = document.createElement("div");
        div.className = "event";
        div.draggable = true;
        div.textContent = `"${event.name}" (${event.start} - ${event.end})`;
        div.dataset.index = index;

        div.ondragstart = (e) => dragStart(e);
        container.appendChild(div);
    });
}

function dragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.dataset.index);
}

document.getElementById("scheduleContainer").ondrop = (e) => {
    e.preventDefault();
    const index = e.dataTransfer.getData("text/plain");
    const event = events[index];
    event.start = prompt("Enter new start time (HH:MM):", event.start) || event.start;
    event.end = prompt("Enter new end time (HH:MM):", event.end) || event.end;
    displayEvents();
    detectConflicts();
};

document.getElementById("scheduleContainer").ondragover = (e) => {
    e.preventDefault();
};

function detectConflicts() {
    const conflictList = document.getElementById("conflictList");
    const suggestionList = document.getElementById("suggestionList");
    conflictList.innerHTML = "";
    suggestionList.innerHTML = "";

    for (let i = 0; i < events.length; i++) {
        for (let j = i + 1; j < events.length; j++) {
            const event1 = events[i];
            const event2 = events[j];

            if (event1.end > event2.start) {
                // Add to conflict list
                const conflictLi = document.createElement("li");
                conflictLi.textContent = `${event1.name} and ${event2.name}`;
                conflictList.appendChild(conflictLi);

                // Suggest alternative time slot
                const duration = calculateDuration(event2.start, event2.end);
                const lastEnd = event1.end > workingHours.start ? event1.end : workingHours.start;
                const suggestedStart = addMinutesToTime(lastEnd, 0);
                const suggestedEnd = addMinutesToTime(suggestedStart, duration);

                if (suggestedEnd <= workingHours.end) {
                    const suggestionLi = document.createElement("li");
                    suggestionLi.textContent = `Reschedule "${event2.name}" to Start: ${suggestedStart}, End: ${suggestedEnd}`;
                    suggestionList.appendChild(suggestionLi);
                }
            }
        }
    }
}

function calculateDuration(start, end) {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    return (endH - startH) * 60 + (endM - startM);
}

function addMinutesToTime(time, minutes) {
    const [hours, mins] = time.split(":").map(Number);
    const newMinutes = mins + minutes;
    const newHours = hours + Math.floor(newMinutes / 60);
    const remainingMinutes = newMinutes % 60;
    return `${String(newHours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
}
