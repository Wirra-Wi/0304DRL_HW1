let N = 5;
let grid = [];
let start = [-1, -1];
let goal = [-1, -1];
let obstacles = [];
let V = null;
let policy = null;
const arrows = ['↑', '↓', '←', '→'];

function initGrid() {
    const gridDiv = document.getElementById('grid');
    gridDiv.style.gridTemplateColumns = `repeat(${N}, 80px)`;
    gridDiv.style.gridTemplateRows = `repeat(${N}, 80px)`;
    gridDiv.innerHTML = '';
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.i = i;
            cell.dataset.j = j;
            cell.onmousedown = (e) => handleClick(e, i, j);
            // cell.ondblclick = (e) => setGoal(i, j);
            gridDiv.appendChild(cell);
        }
    }
    updateGrid();
}

function handleClick(e, i, j) {
    e.preventDefault();
    if (e.button === 0) { // left click
        if (i === start[0] && j === start[1]) {
            // Clicked on start, clear start
            start = [-1, -1];
            updateGrid();
        } else if (i === goal[0] && j === goal[1]) {
            // Clicked on goal, clear goal
            goal = [-1, -1];
            updateGrid();
        } else if (obstacles.some(o => o[0] === i && o[1] === j)) {
            // Clicked on obstacle, remove it
            toggleObstacle(i, j);
        } else {
            // Clicked on empty cell
            if (start[0] === -1) {
                // No start set, set start
                setStart(i, j);
            } else if (goal[0] === -1) {
                // Start set but no goal, set goal
                setGoal(i, j);
            } else {
                // Both start and goal set, toggle obstacle
                toggleObstacle(i, j);
            }
        }
    // } else if (e.button === 2) { // right click
    //     // Clear cell
    //     if (i === start[0] && j === start[1]) {
    //         start = [-1, -1];
    //     } else if (i === goal[0] && j === goal[1]) {
    //         goal = [-1, -1];
    //     } else {
    //         toggleObstacle(i, j);
    //     }
    //     updateGrid();
    }
}

function toggleObstacle(i, j) {
    if ((i === start[0] && j === start[1]) || (i === goal[0] && j === goal[1])) return;
    const idx = obstacles.findIndex(o => o[0] === i && o[1] === j);
    if (idx === -1) {
        if (obstacles.length < N - 2) {
            obstacles.push([i, j]);
        } else {
            showMessage(`障礙物不能超過 ${N-2} 個`);
        }
    } else {
        obstacles.splice(idx, 1);
    }
    updateGrid();
}

function setStart(i, j) {
    if ((i === goal[0] && j === goal[1]) || obstacles.some(o => o[0] === i && o[1] === j)) return;
    start = [i, j];
    updateGrid();
}

function setGoal(i, j) {
    if ((i === start[0] && j === start[1]) || obstacles.some(o => o[0] === i && o[1] === j)) return;
    goal = [i, j];
    updateGrid();
}

function getPath() {
    if (!policy || !Array.isArray(policy) || start[0] === -1 || goal[0] === -1) return [];
    const path = [];
    let current = [start[0], start[1]];
    const visited = new Set();
    const maxSteps = N * N;
    let steps = 0;

    const actions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (steps < maxSteps) {
        const key = `${current[0]},${current[1]}`;
        if (visited.has(key)) return []; // 遇到迴圈，無法到達
        visited.add(key);
        path.push([current[0], current[1]]);

        if (current[0] === goal[0] && current[1] === goal[1]) return path; // 成功到達

        const action = policy[current[0]][current[1]];
        if (action === undefined || action === null) return []; // 無效行動

        const move = actions[action];
        current = [current[0] + move[0], current[1] + move[1]];

        if (current[0] < 0 || current[0] >= N || current[1] < 0 || current[1] >= N) return []; // 超出邊界
        steps++;
    }
    return []; // 超過最大步數，無法到達
}

function canReachGoalFrom(i, j) {
    if (!policy || !Array.isArray(policy)) return false;
    const visited = new Set();
    let current = [i, j];
    const actions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const maxSteps = N * N;
    let steps = 0;

    while (steps < maxSteps) {
        const key = `${current[0]},${current[1]}`;
        if (visited.has(key)) return false;
        visited.add(key);

        if (current[0] === goal[0] && current[1] === goal[1]) return true;

        const action = policy[current[0]][current[1]];
        if (action === undefined || action === null) return false;

        const move = actions[action];
        current = [current[0] + move[0], current[1] + move[1]];
        if (current[0] < 0 || current[0] >= N || current[1] < 0 || current[1] >= N) return false;
        steps++;
    }
    return false;
}

function isStartReachableByAnyNeighbor() {
    if (start[0] === -1 || goal[0] === -1) return false;
    const directions = [[-1,0],[1,0],[0,-1],[0,1]];
    for (const [di, dj] of directions) {
        const ni = start[0] + di;
        const nj = start[1] + dj;
        if (ni < 0 || ni >= N || nj < 0 || nj >= N) continue;
        if (obstacles.some(o => o[0] === ni && o[1] === nj)) continue;
        if (canReachGoalFrom(ni, nj)) return true;
    }
    return false;
}

function updateGrid() {
    const path = getPath();
    const startNearbyReachable = isStartReachableByAnyNeighbor();
    document.querySelectorAll('.cell').forEach(cell => {
        const i = parseInt(cell.dataset.i);
        const j = parseInt(cell.dataset.j);
        cell.className = 'cell';
        cell.innerHTML = '';
        if (start[0] !== -1 && i === start[0] && j === start[1]) {
            cell.classList.add('start');
            cell.textContent = 'S';
            if (startNearbyReachable) {
                cell.classList.add('path');
            }

        } else if (goal[0] !== -1 && i === goal[0] && j === goal[1]) {
            cell.classList.add('goal');
            cell.textContent = 'G';
        } else if (obstacles.some(o => o[0] === i && o[1] === j)) {
            cell.classList.add('obstacle');
        } else {
            if (policy) {
                const arrow = document.createElement('div');
                arrow.className = 'arrow';
                arrow.textContent = arrows[policy[i][j]];
                cell.appendChild(arrow);
                if (V) {
                    const value = document.createElement('div');
                    value.className = 'value';
                    const reachable = canReachGoalFrom(i, j);
                    value.textContent = reachable ? V[i][j].toFixed(2) : 'X';
                    cell.appendChild(value);
                }
            }
            if (path.some(p => p[0] === i && p[1] === j)) {
                cell.classList.add('path');
            }
        }
    });
}

function showMessage(msg) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = msg;
    setTimeout(() => messageDiv.textContent = '', 3000);
}

document.getElementById('compute').onclick = async () => {
    // 1. 從輸入框重新抓取值並轉型
    const currentN = parseInt(document.getElementById('gridSize').value);
    const currentGamma = parseFloat(document.getElementById('gamma').value);
    const currentGoalReward = parseFloat(document.getElementById('goalReward').value);

    // 2. 嚴格檢查規則
    const allowedSizes = [5, 6, 7, 8, 9];

    if (!allowedSizes.includes(currentN)) {
        showMessage('網格大小非法！');
        return;
    }

    if (isNaN(currentGamma) || currentGamma < 0 || currentGamma > 1) {
        showMessage('Gamma 值必須在 0 到 1 之間');
        return;
    }

    if (isNaN(currentGoalReward) || currentGoalReward <= 0 || currentGoalReward > 100) {
        showMessage('獎勵數值不合法');
        return;
    }

    if (start[0] === -1 || goal[0] === -1) {
        showMessage('請先設置起點和終點');
        return;
    }

    // 3. 檢查障礙物數量（防止使用者透過 console 硬塞進陣列）
    if (obstacles.length > currentN - 2) {
        showMessage(`障礙物不能超過 ${currentN - 2} 個`);
        // 強制修剪掉多出的障礙物
        obstacles = obstacles.slice(0, currentN - 2); 
        updateGrid();
        return;
    }

    // 4. 通過檢查才發送請求
    const response = await fetch('/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            N: currentN, 
            start, 
            goal, 
            obstacles, 
            gamma: currentGamma, 
            goalReward: currentGoalReward 
        })
    });

    // 5. 處理後端回傳的錯誤
    if (!response.ok) {
        const errorData = await response.json();
        showMessage(errorData.error);
        return;
    }

    const data = await response.json();
    V = data.V;
    policy = data.policy;
    updateGrid();
};

document.getElementById('compute').onclick = async () => {
    if (start[0] === -1 || goal[0] === -1) {
        showMessage('請先設置起點和終點');
        return;
    }
    if (obstacles.length > N - 2) {
        showMessage(`障礙物不能超過 ${N-2} 個`);
        return;
    }
    const gamma = parseFloat(document.getElementById('gamma').value);
    const goalReward = parseFloat(document.getElementById('goalReward').value);
    if (isNaN(gamma) || gamma < 0 || gamma > 1) {
        showMessage('gamma 必須在 0 到 1 之間');
        return;
    }
    if (isNaN(goalReward) || goalReward <= 0) {
        showMessage('終點獎勵必須是正數');
        return;
    }
    const response = await fetch('/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ N, start, goal, obstacles, gamma, goalReward })
    });
    const data = await response.json();
    V = data.V;
    policy = data.policy;
    updateGrid();
};

document.addEventListener('contextmenu', e => e.preventDefault()); // disable right click menu

document.getElementById('gridSize').onchange = (e) => {
    const newN = parseInt(e.target.value);
    N = newN;
    // 檢查 start 和 goal 是否在範圍內
    if (start[0] >= N || start[1] >= N) {
        start = [-1, -1];
    }
    if (goal[0] >= N || goal[1] >= N) {
        goal = [-1, -1];
    }
    // 過濾障礙物
    obstacles = obstacles.filter(o => o[0] < N && o[1] < N);
    V = null;
    policy = null;
    initGrid();
};

document.getElementById('randomPolicy').onclick = async () => {
    if (start[0] === -1 || goal[0] === -1) {
        showMessage('請先設置起點和終點');
        return;
    }
    const response = await fetch('/random_policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ N, start, goal, obstacles })
    });
    const data = await response.json();
    V = data.V;
    policy = data.policy;
    updateGrid();
};

initGrid();