from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    n = data['n']
    start = data['start']
    end = data['end']
    walls = data.get('walls', []) # 取得牆壁列表，若無則為空
    
    # 隨機生成策略 (0:上, 1:下, 2:左, 3:右)
    policy = [[random.randint(0, 3) for _ in range(n)] for _ in range(n)]
    
    # 簡單的價值評估迭代 (Policy Evaluation)
    v = [[0.0 for _ in range(n)] for _ in range(n)]
    gamma = 0.9
    
    for _ in range(100):
        new_v = [row[:] for row in v]
        for r in range(n):
            for c in range(n):
                if [r, c] == end or [r, c] in walls:
                    continue
                
                move = policy[r][c]
                nr, nc = r, c
                if move == 0: nr = max(0, r-1)
                elif move == 1: nr = min(n-1, r+1)
                elif move == 2: nc = max(0, c-1)
                elif move == 3: nc = min(n-1, c+1)
                
                # 撞牆處理
                if [nr, nc] in walls:
                    nr, nc = r, c
                
                reward = 10 if [nr, nc] == end else 0
                new_v[r][c] = reward + gamma * v[nr][nc]
        v = new_v

    return jsonify({'v': v, 'policy': policy})

if __name__ == '__main__':
    app.run(debug=True)