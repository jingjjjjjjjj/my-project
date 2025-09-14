# Gemini 啟動說明

本文件說明啟動 Gemini 應用程式的各種方式。請根據您的具體設定和需求選擇最適合的方法。

## 1. 從命令列直接啟動

如果您的 Gemini 應用程式是可執行檔或可直接執行的腳本，您可以使用命令列直接啟動它。

**範例 (Python 腳本):**
```bash
python your_gemini_app.py
```

**範例 (Node.js 應用程式):**
```bash
node your_gemini_app.js
```

**範例 (可執行檔):**
```bash
./your_gemini_app
```

## 2. 作為背景程序啟動 (Daemon)

如果您希望 Gemini 應用程式在背景運行，即使您關閉終端機也能繼續執行，可以使用以下方法：

**使用 `&` 符號 (簡單):**
```bash
nohup python your_gemini_app.py &
```
或
```bash
nohup node your_gemini_app.js &
```
這會將輸出重定向到 `nohup.out` 文件。

**使用 `screen` 或 `tmux` (推薦用於會話管理):**
1. 啟動一個新的 `screen` 或 `tmux` 會話：
   ```bash
   screen -S gemini_session
   # 或
   tmux new -s gemini_session
   ```
2. 在會話中啟動您的 Gemini 應用程式：
   ```bash
   python your_gemini_app.py
   ```
3. 分離會話 (應用程式將在背景繼續運行)：
   - 對於 `screen`: 按 `Ctrl+A` 然後按 `D`
   - 對於 `tmux`: 按 `Ctrl+B` 然後按 `D`
4. 重新連接會話 (如果需要查看輸出或停止應用程式)：
   ```bash
   screen -r gemini_session
   # 或
   tmux attach -t gemini_session
   ```

## 3. 使用啟動腳本

為了方便管理和配置，您可以編寫一個專門的啟動腳本 (例如 `start_gemini.sh`)。

**`start_gemini.sh` 範例:**
```bash
#!/bin/bash

# 設定環境變數
export GEMINI_ENV="production"
export GEMINI_PORT="8080"

# 啟動應用程式
python /path/to/your_gemini_app.py --port $GEMINI_PORT &

echo "Gemini 應用程式已在背景啟動，端口 $GEMINI_PORT"
```

然後執行腳本：
```bash
bash start_gemini.sh
```

## 4. 使用進程管理器

對於生產環境，建議使用進程管理器來監控和管理您的應用程式，例如 `systemd`, `Supervisor`, `PM2` (Node.js)。

**範例 (systemd 服務):**
創建一個 `.service` 文件 (例如 `/etc/systemd/system/gemini.service`):
```ini
[Unit]
Description=Gemini Application Service
After=network.target

[Service]
User=your_user
WorkingDirectory=/path/to/your_gemini_app
ExecStart=/usr/bin/python3 /path/to/your_gemini_app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

然後啟用並啟動服務：
```bash
sudo systemctl enable gemini.service
sudo systemctl start gemini.service
sudo systemctl status gemini.service
```

## 5. 帶有特定配置啟動

如果您的 Gemini 應用程式需要特定的配置檔案或參數，請確保在啟動時提供它們。

**範例 (指定配置檔案):**
```bash
python your_gemini_app.py --config /etc/gemini/config.json
```

---

請根據您的 Gemini 應用程式的實際情況，填寫具體的命令和路徑。
