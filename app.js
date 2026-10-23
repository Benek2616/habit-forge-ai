const startScreen = document.getElementById('start-screen');
const mainScreen = document.getElementById('main-screen');
const habitInput = document.getElementById('habit-input');
const frequencySelect = document.getElementById('frequency');
const createBtn = document.getElementById('create-btn');
const doneBtn = document.getElementById('done-btn');
const resetBtn = document.getElementById('reset-btn');
const habitNameEl = document.getElementById('habit-name');
const streakCountEl = document.getElementById('streak-count');
const todayPlanEl = document.getElementById('today-plan');
const weekGridEl = document.getElementById('week-grid');
const smartTipEl = document.getElementById('smart-tip');

let currentLevel = 'easy';

// Difficulty buttons
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLevel = btn.dataset.level;
  });
});

// Load saved data
function loadData() {
  const data = JSON.parse(localStorage.getItem('habitforge') || 'null');
  if (data && data.habit) {
    showMainScreen(data);
  }
}

function saveData(data) {
  localStorage.setItem('habitforge', JSON.stringify(data));
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function calculateStreak(history) {
  let streak = 0;
  const today = getToday();
  let checkDate = new Date();
  
  // If today is done, start from today, else from yesterday
  if (!history[today]) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  while (true) {
    const key = checkDate.toISOString().slice(0, 10);
    if (history[key]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function generatePlan(habit, level, frequency) {
  const plans = {
    easy: [
      `Zrób wersję "mini" swojego nawyku (nawet 2-5 minut).`,
      `Połącz nawyk z czymś, co już robisz (np. po kawie / po umyciu zębów).`,
      `Przygotuj wszystko wcześniej, żeby jutro było łatwiej zacząć.`
    ],
    medium: [
      `Wykonaj pełną wersję nawyku: "${habit}".`,
      `Ustaw konkretną godzinę i trzymaj się jej.`,
      `Po zakończeniu zapisz jedno zdanie: co poszło dobrze.`
    ],
    hard: [
      `Zrób wersję "plus" – trochę więcej niż zwykle.`,
      `Dodaj element utrudniający (np. bez muzyki, w ciszy, dłużej).`,
      `Na koniec zastanów się: co możesz jutro zrobić jeszcze lepiej?`
    ]
  };

  const freqText = {
    daily: 'Codziennie',
    '5days': '5 dni w tygodniu',
    '3days': '3 dni w tygodniu',
    weekly: 'Raz w tygodniu'
  };

  return `
    <strong>${habit}</strong><br><br>
    Częstotliwość: ${freqText[frequency]}<br>
    Poziom: ${level === 'easy' ? 'Łatwy' : level === 'medium' ? 'Średni' : 'Trudny'}<br><br>
    ${plans[level].map((p, i) => `${i + 1}. ${p}`).join('<br>')}
  `;
}

function generateTip(streak, level) {
  if (streak === 0) {
    return "Najważniejsze jest zaczęcie. Zrób dziś nawet najmniejszą wersję – to buduje momentum.";
  }
  if (streak < 3) {
    return "Świetny start! Trzymaj się prostej wersji przez pierwsze dni – nawyk musi stać się automatyczny.";
  }
  if (streak < 7) {
    return "Jesteś na dobrej drodze. Po 7 dniach z rzędu mózg zaczyna traktować to jako nową normę.";
  }
  if (streak < 21) {
    return `Masz już ${streak} dni! To solidna baza. Nie podnosz teraz poprzeczki – stabilność > intensywność.`;
  }
  return `Imponujące ${streak} dni! Jesteś w fazie automatyzacji. Możesz teraz delikatnie podnieść poziom trudności.`;
}

function showMainScreen(data) {
  startScreen.classList.add('hidden');
  mainScreen.classList.remove('hidden');

  habitNameEl.textContent = data.habit;
  const streak = calculateStreak(data.history || {});
  streakCountEl.textContent = streak;

  todayPlanEl.innerHTML = generatePlan(data.habit, data.level, data.frequency);
  smartTipEl.textContent = generateTip(streak, data.level);

  // Week grid
  const last7 = getLast7Days();
  const today = getToday();
  weekGridEl.innerHTML = last7.map(date => {
    const dayNum = new Date(date).getDate();
    const isDone = data.history && data.history[date];
    const isToday = date === today;
    return `<div class="day ${isDone ? 'done' : ''} ${isToday ? 'today' : ''}">${dayNum}</div>`;
  }).join('');

  // Disable button if already done today
  if (data.history && data.history[today]) {
    doneBtn.disabled = true;
    doneBtn.textContent = '✅ Już zrobione dzisiaj';
  } else {
    doneBtn.disabled = false;
    doneBtn.textContent = '✅ Zrobione dzisiaj';
  }
}

createBtn.addEventListener('click', () => {
  const habit = habitInput.value.trim();
  if (!habit) {
    habitInput.focus();
    return;
  }

  const data = {
    habit,
    frequency: frequencySelect.value,
    level: currentLevel,
    history: {},
    created: getToday()
  };

  saveData(data);
  showMainScreen(data);
});

doneBtn.addEventListener('click', () => {
  const data = JSON.parse(localStorage.getItem('habitforge'));
  if (!data) return;

  const today = getToday();
  data.history = data.history || {};
  data.history[today] = true;

  saveData(data);
  showMainScreen(data);
});

resetBtn.addEventListener('click', () => {
  if (confirm('Na pewno chcesz zmienić nawyk? Postępy zostaną utracone.')) {
    localStorage.removeItem('habitforge');
    mainScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    habitInput.value = '';
  }
});

// Init
loadData();