from flask import Flask, render_template, request, jsonify
import numpy as np
import os

app = Flask(__name__)

actions = [(-1, 0), (1, 0), (0, -1), (0, 1)]  # up, down, left, right

def value_iteration(N, start, goal, obstacles, gamma=0.9, goal_reward=1, theta=1e-4):
    if N < 5 or N > 9 or gamma < 0 or gamma > 1 or goal_reward <= 0:
        raise ValueError("Invalid input parameters")
    obstacles_set = set(tuple(o) for o in obstacles)
    V = np.zeros((N, N))
    policy = np.zeros((N, N), dtype=int)
    
    while True:
        delta = 0
        for i in range(N):
            for j in range(N):
                if (i, j) in obstacles_set or (i, j) == tuple(goal):
                    continue
                v = V[i, j]
                q_values = []
                for a, (di, dj) in enumerate(actions):
                    ni, nj = i + di, j + dj
                    if 0 <= ni < N and 0 <= nj < N and (ni, nj) not in obstacles_set:
                        reward = goal_reward if (ni, nj) == tuple(goal) else -0.01
                        q = reward + gamma * V[ni, nj]
                    else:
                        q = -0.01 + gamma * V[i, j]  # stay
                    q_values.append(q)
                V[i, j] = max(q_values)
                policy[i, j] = np.argmax(q_values)
                delta = max(delta, abs(v - V[i, j]))
        if delta < theta:
            break
    return V, policy

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/compute', methods=['POST'])
def compute():
    data = request.json
    N = data['N']
    start = data['start']
    goal = data['goal']
    obstacles = data['obstacles']
    gamma = data.get('gamma', 0.9)
    goal_reward = data.get('goalReward', 1)
    # --- 開始過濾與驗證 ---

    # A. 驗證 N (網格大小)
    allowed_sizes = [5, 6, 7, 8, 9]
    if N not in allowed_sizes:
        return jsonify({"error": "不合法的網格大小"}), 400

    # B. 驗證 gamma (必須在 0 到 1 之間)
    if not (0 <= gamma <= 1):
        return jsonify({"error": "gamma 必須介於 0 與 1 之間"}), 400

    # C. 驗證 goalReward (必須為正數，假設上限為 100 避免溢位)
    if goal_reward <= 0 or goal_reward > 100:
        return jsonify({"error": "終點獎勵數值異常"}), 400

    # D. 驗證座標是否越界 (start, goal, obstacles)
    def is_invalid_coord(coord):
        return not (0 <= coord[0] < N and 0 <= coord[1] < N)

    if is_invalid_coord(start) or is_invalid_coord(goal):
        return jsonify({"error": "起點或終點座標越界"}), 400

    # E. 驗證障礙物數量與座標
    if len(obstacles) > N - 2:
        return jsonify({"error": f"障礙物數量不能超過 {N-2} 個"}), 400
    
    for obs in obstacles:
        if is_invalid_coord(obs):
            return jsonify({"error": "障礙物座標越界"}), 400
        
    V, policy = value_iteration(N, start, goal, obstacles, gamma, goal_reward)
    return jsonify({'V': V.tolist(), 'policy': policy.tolist()})

@app.route('/random_policy', methods=['POST'])
def random_policy():
    data = request.json
    N = data['N']
    start = data['start']
    goal = data['goal']
    obstacles = data['obstacles']
    obstacles_set = set(tuple(o) for o in obstacles)
    policy = np.random.randint(0, 4, (N, N))  # 隨機選擇行動 0-3
    # 確保終點沒有行動
    policy[goal[0]][goal[1]] = 0  # 隨意設置
    
    # 計算隨機政策的價值函數
    V = np.zeros((N, N))
    gamma = 0.9  # 使用默認gamma
    goal_reward = 1  # 使用默認獎勵
    theta = 1e-4
    while True:
        delta = 0
        for i in range(N):
            for j in range(N):
                if (i, j) in obstacles_set or (i, j) == tuple(goal):
                    continue
                v = V[i, j]
                action = policy[i][j]
                di, dj = actions[action]
                ni, nj = i + di, j + dj
                if 0 <= ni < N and 0 <= nj < N and (ni, nj) not in obstacles_set:
                    reward = goal_reward if (ni, nj) == tuple(goal) else -0.01
                    V[i, j] = reward + gamma * V[ni, nj]
                else:
                    V[i, j] = -0.01 + gamma * V[i, j]  # stay
                delta = max(delta, abs(v - V[i, j]))
        if delta < theta:
            break
    
    return jsonify({'V': V.tolist(), 'policy': policy.tolist()})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
