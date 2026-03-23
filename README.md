# Grid World Value Iteration

一個互動式的強化學習 Value Iteration的教學網站，用於課堂作業。

## 功能特點

- **互動式網格設置**：通過點擊重新設置起點、終點和障礙物
- **價值迭代算法**：實現強化學習中的Value Iteration
- **視覺化顯示**：顯示狀態價值函數和最佳策略
- **最佳路線標記**：以亮色標記從起點到終點的最佳路徑

## 技術棧

- **後端**：Python Flask
- **前端**：HTML, CSS, JavaScript
- **數學計算**：NumPy

## 安裝與運行

### 環境需求

- Python 3.7+
- pip

### 安裝步驟

1. clone或download項目到本地端

2. 安裝依賴包：
   ```bash
   pip install -r requirements.txt
   ```

3. 運行應用：
   ```bash
   python app.py
   ```

4. 在瀏覽器中打開 `http://localhost:5000`

## 使用說明

### 網格操作

1. **設置起點**：點擊起點取消預設並點空白格子設置起點 (顯示為綠色 S)
2. **設置終點**：點擊終點取消並點空白格子設置終點 (顯示為紅色 G)
3. **添加障礙物**：設置好起點和終點後，點擊空白格子添加障礙物 (顯示為黑色)
4. **移除障礙物**：點擊障礙物格子移除障礙物

### 常用控制項

- 網格大小：5x5~9x9（下拉選單）
- gamma：折扣因子（範圍 0~1）
- 終點獎勵：自定義終點到達獎勵值（大於 0）

### 計算策略

設置好起點、終點和障礙物後，點擊 **"計算"** 按鈕來：

- 計算每個狀態的價值函數 V(s)
- 確定每個狀態的最佳動作 (策略 π)
- 以箭頭顯示最佳動作方向
- 以黃色標記最佳路徑（可達時）

### 隨機策略

點擊 **"隨機策略"** 按鈕：

- 生成隨機策略（每個格子隨機動作）
- 對應顯示箭頭方向
- 若某格策略無法到終點，價值顯示為 `X`；可達格顯示數值
- 起點若有任何鄰居可達終點則會高亮為路徑狀態

## 演算法說明

### Value Iteration

價值迭代是一種動態規劃算法，用於求解馬爾可夫決策過程 (MDP) 中的最優價值函數和策略。

**更新公式**：
```
V(s) ← max_a ∑_{s'} P(s'|s,a) * [R(s,a,s') + γ * V(s')]
```

**參數**：
- γ (gamma) = 0.9：折扣因子
- θ (theta) = 0.0001：收斂閾值
- 獎勵：到達終點 +1，每步移動 -0.01

### 動作空間

- ↑ 上移
- ↓ 下移
- ← 左移
- → 右移

## 項目結構

```
DRL_DIC2/
├── app.py                 # Flask 應用主文件
├── requirements.txt       # Python 依賴包
├── static/
│   ├── css/
│   │   └── style.css      # 網格樣式
│   └── js/
│       └── script.js      # 前端互動邏輯
└── templates/
    └── index.html         # 主頁面模板
```

## 學習目標

此專案演示強化學習中：

1. **馬爾可夫決策過程 (MDP)**
2. **Value Iteration（價值迭代）**
3. **策略（Policy）呈現**
4. **可視化與交互式參數調整**

## 最新專案行為（與原生版本差異）

1. 網格大小可選：5x5 ~ 9x9
2. 允許動態設定：起點、終點、障礙物（障礙數量最多 `N-2`）
3. 輸入驗證：阻擋非法 `gamma`、終點獎勵、網格大小、超過障礙數量等
4. 可調參數：`gamma`、`goalReward`（終點獎勵）
5. 兩種策略：
   - **計算策略**（Value Iteration）→ 最佳政策 + 價值函數 + 可達路徑高亮
   - **隨機策略**（Random Policy）→ 隨機行動，顯示箭頭 + 值
6. **隨機策略額外規則**：
   - 只要起點某個鄰近方向可達終點，起點顯示高亮
   - 各格子可達終點顯示數值；不可達顯示 `X`

## 開發說明

- `app.py`：
  - `value_iteration(N, start, goal, obstacles, gamma, goal_reward)`
  - `/compute`：Value Iteration
  - `/random_policy`：隨機策略 + 隨機策略價值計算
  - 輸入檢查：網格大小、gamma、goalReward、障礙、座標

- `static/js/script.js`：
  - `initGrid()`, `handleClick()` 路徑交互
  - `getPath()`、`canReachGoalFrom(i,j)` 檢查可達性
  - `isStartReachableByAnyNeighbor()` 起點鄰居可達高亮
  - `updateGrid()` 顯示策略箭頭 + 值（可達/不可達）

- `templates/index.html`：介面控件（網格大小、gamma、終點獎勵、計算、隨機策略）

- `static/css/style.css`：網格對齊、樣式、路徑高亮、起點/終點/障礙色彩

## 運行

```bash
pip install -r requirements.txt
python app.py
```

打開：`http://localhost:5000`

## 授權

僅供教學使用。