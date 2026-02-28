// 模拟用户数据库，从本地存储加载
let users = JSON.parse(localStorage.getItem('users')) || [
    { username: 'admin', password: '123456', avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20male&image_size=square' },
    { username: 'user1', password: '123456', avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20avatar%20female&image_size=square' },
    { username: 'user2', password: '123456', avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=casual%20avatar%20male&image_size=square' }
];

// 保存用户到本地存储
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

// 从本地存储加载好友关系
let friends = JSON.parse(localStorage.getItem('friends')) || {};

// 保存好友关系到本地存储
function saveFriends() {
    localStorage.setItem('friends', JSON.stringify(friends));
}

// 添加好友
function addFriend(username, friendUsername) {
    if (!friends[username]) {
        friends[username] = [];
    }
    if (!friends[username].includes(friendUsername)) {
        friends[username].push(friendUsername);
        saveFriends();
        return true;
    }
    return false;
}

// 初始化应用
function initApp() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        showChat();
    } else {
        showLogin();
    }
}

// 显示登录界面
function showLogin() {
    document.body.innerHTML = `
        <div class="login-container">
            <h2>登录</h2>
            <div class="form-group">
                <label for="username">用户名</label>
                <input type="text" id="username" placeholder="请输入用户名">
            </div>
            <div class="form-group">
                <label for="password">密码</label>
                <input type="password" id="password" placeholder="请输入密码">
            </div>
            <button id="login-btn">登录</button>
            <button id="register-btn" style="margin-top: 10px; background-color: #2196F3;">注册</button>
            <div class="error-message" id="error-message"></div>
        </div>
    `;
    
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('register-btn').addEventListener('click', showRegister);
}

// 显示注册界面
function showRegister() {
    document.body.innerHTML = `
        <div class="login-container">
            <h2>注册</h2>
            <div class="form-group">
                <label for="reg-username">用户名</label>
                <input type="text" id="reg-username" placeholder="请输入用户名">
            </div>
            <div class="form-group">
                <label for="reg-password">密码</label>
                <input type="password" id="reg-password" placeholder="请输入密码">
            </div>
            <div class="form-group">
                <label for="reg-confirm-password">确认密码</label>
                <input type="password" id="reg-confirm-password" placeholder="请确认密码">
            </div>
            <button id="confirm-register-btn">注册</button>
            <button id="back-to-login-btn" style="margin-top: 10px; background-color: #607D8B;">返回登录</button>
            <div class="error-message" id="error-message"></div>
        </div>
    `;
    
    document.getElementById('confirm-register-btn').addEventListener('click', handleRegister);
    document.getElementById('back-to-login-btn').addEventListener('click', showLogin);
}

// 处理注册
function handleRegister() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const errorMessage = document.getElementById('error-message');
    
    // 验证输入
    if (!username || !password) {
        errorMessage.textContent = '用户名和密码不能为空';
        return;
    }
    
    if (password !== confirmPassword) {
        errorMessage.textContent = '两次输入的密码不一致';
        return;
    }
    
    // 检查用户名是否已存在
    if (users.find(u => u.username === username)) {
        errorMessage.textContent = '用户名已存在';
        return;
    }
    
    // 为新用户生成默认头像
    const avatarPrompt = Math.random() > 0.5 ? 'friendly avatar' : 'casual avatar';
    const avatar = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(avatarPrompt)}&image_size=square`;
    
    // 添加新用户
    users.push({ username, password, avatar });
    saveUsers();
    
    // 注册成功后自动登录
    localStorage.setItem('currentUser', username);
    if (!localStorage.getItem('messages')) {
        localStorage.setItem('messages', JSON.stringify([]));
    }
    showChat();
}

// 处理登录
function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    // 验证用户
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', username);
        // 初始化聊天记录
        if (!localStorage.getItem('messages')) {
            localStorage.setItem('messages', JSON.stringify([]));
        }
        showChat();
    } else {
        errorMessage.textContent = '用户名或密码错误';
    }
}

// 显示聊天界面
function showChat() {
    const currentUser = localStorage.getItem('currentUser');
    const currentUserInfo = users.find(u => u.username === currentUser);
    const currentUserAvatar = currentUserInfo ? currentUserInfo.avatar : 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square';
    
    document.body.innerHTML = `
        <div class="chat-container" style="display: flex; flex-direction: row; height: 600px;">
            <!-- 好友列表 -->
            <div style="width: 250px; border-right: 1px solid #e0e0e0; background-color: #f5f5f5;">
                <div style="padding: 15px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
                    <h3>好友列表</h3>
                    <button id="add-friend-btn" style="background-color: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">添加好友</button>
                </div>
                <div id="friends-list" style="padding: 10px; height: calc(100% - 100px); overflow-y: auto;">
                    <!-- 好友列表将通过 JavaScript 动态添加 -->
                </div>
                <div style="padding: 10px; border-top: 1px solid #e0e0e0;">
                    <button id="games-btn" style="width: 100%; background-color: #2196F3; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">游戏</button>
                </div>
            </div>
            
            <!-- 聊天区域 -->
            <div style="flex: 1; display: flex; flex-direction: column;">
                <div class="chat-header">
                    <h1>选择好友开始聊天</h1>
                    <div class="user-info" style="display: flex; align-items: center; gap: 10px;">
                        <img src="${currentUserAvatar}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">
                        <span id="current-user">${currentUser}</span>
                        <button id="logout-btn">退出</button>
                    </div>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #666;">
                        请从左侧选择好友开始聊天
                    </div>
                </div>
                <div class="chat-input" style="display: flex; align-items: center; gap: 10px;">
                    <button id="emoji-btn" style="background: none; border: none; font-size: 20px; cursor: pointer; padding: 5px;" disabled>😊</button>
                    <button id="voice-btn" style="background: none; border: none; font-size: 20px; cursor: pointer; padding: 5px;" disabled>🎤</button>
                    <input type="text" id="message-input" placeholder="输入消息..." disabled style="flex: 1;">
                    <button id="send-btn" disabled>发送</button>
                </div>
            </div>
        </div>
    `;
    
    // 加载好友列表
    loadFriends();
    
    // 绑定事件
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('message-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !this.disabled) {
            sendMessage();
        }
    });
    
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        showLogin();
    });
    
    document.getElementById('add-friend-btn').addEventListener('click', showAddFriend);
    
    document.getElementById('games-btn').addEventListener('click', showGames);
}

// 加载好友列表
function loadFriends() {
    const currentUser = localStorage.getItem('currentUser');
    const friendsList = document.getElementById('friends-list');
    const userFriends = friends[currentUser] || [];
    
    friendsList.innerHTML = '';
    
    if (userFriends.length === 0) {
        friendsList.innerHTML = '<div style="text-align: center; color: #666; margin-top: 20px;">暂无好友</div>';
        return;
    }
    
    userFriends.forEach(friend => {
        // 获取好友的头像
        const friendInfo = users.find(u => u.username === friend);
        const friendAvatar = friendInfo ? friendInfo.avatar : 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square';
        
        const friendElement = document.createElement('div');
        friendElement.style.padding = '10px';
        friendElement.style.borderBottom = '1px solid #e0e0e0';
        friendElement.style.cursor = 'pointer';
        friendElement.style.display = 'flex';
        friendElement.style.alignItems = 'center';
        friendElement.style.gap = '10px';
        friendElement.innerHTML = `
            <img src="${friendAvatar}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">
            <span style="flex: 1;">${friend}</span>
            <button class="delete-friend-btn" data-friend="${friend}" style="background-color: #f44336; color: white; border: none; padding: 3px 8px; border-radius: 3px; font-size: 12px; cursor: pointer;">删除</button>
        `;
        friendsList.appendChild(friendElement);
        
        // 添加点击事件
        friendElement.querySelector('span').addEventListener('click', function() {
            selectFriend(friend);
        });
        
        // 点击头像也可以选择好友
        friendElement.querySelector('img').addEventListener('click', function() {
            selectFriend(friend);
        });
    });
    
    // 绑定删除好友事件
    document.querySelectorAll('.delete-friend-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const friend = this.getAttribute('data-friend');
            deleteFriend(localStorage.getItem('currentUser'), friend);
        });
    });
}

// 删除好友
function deleteFriend(username, friendUsername) {
    if (friends[username]) {
        friends[username] = friends[username].filter(f => f !== friendUsername);
        saveFriends();
        loadFriends();
    }
}

// 显示添加好友界面
function showAddFriend() {
    const currentUser = localStorage.getItem('currentUser');
    document.body.innerHTML = `
        <div class="login-container">
            <h2>添加好友</h2>
            <div class="form-group">
                <label for="friend-username">好友用户名</label>
                <input type="text" id="friend-username" placeholder="请输入好友用户名">
            </div>
            <button id="confirm-add-friend-btn">添加</button>
            <button id="back-to-chat-btn" style="margin-top: 10px; background-color: #607D8B;">返回</button>
            <div class="error-message" id="error-message"></div>
        </div>
    `;
    
    document.getElementById('confirm-add-friend-btn').addEventListener('click', handleAddFriend);
    document.getElementById('back-to-chat-btn').addEventListener('click', showChat);
}

// 处理添加好友
function handleAddFriend() {
    const currentUser = localStorage.getItem('currentUser');
    const friendUsername = document.getElementById('friend-username').value;
    const errorMessage = document.getElementById('error-message');
    
    // 验证输入
    if (!friendUsername) {
        errorMessage.textContent = '请输入好友用户名';
        return;
    }
    
    // 不能添加自己
    if (friendUsername === currentUser) {
        errorMessage.textContent = '不能添加自己为好友';
        return;
    }
    
    // 检查用户是否存在
    const userExists = users.find(u => u.username === friendUsername);
    if (!userExists) {
        errorMessage.textContent = '用户不存在';
        return;
    }
    
    // 添加好友
    const success = addFriend(currentUser, friendUsername);
    if (success) {
        showChat();
    } else {
        errorMessage.textContent = '已经是好友了';
    }
}

// 全局变量，当前选中的好友
let currentChatFriend = null;

// 加载聊天记录
function loadMessages() {
    const currentUser = localStorage.getItem('currentUser');
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    
    // 从本地存储加载与当前好友的聊天记录
    const chatKey = currentChatFriend ? `${currentUser}_${currentChatFriend}` : 'global';
    const messages = JSON.parse(localStorage.getItem(`messages_${chatKey}`) || '[]');
    
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender === currentUser ? 'sent' : 'received'}`;
        messageElement.innerHTML = `
            <div class="sender">${message.sender}</div>
            <div class="content">${message.content}</div>
        `;
        chatMessages.appendChild(messageElement);
    });
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 发送消息
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const content = messageInput.value.trim();
    
    if (content) {
        const currentUser = localStorage.getItem('currentUser');
        // 确定聊天记录的存储键
        const chatKey = currentChatFriend ? `${currentUser}_${currentChatFriend}` : 'global';
        const messages = JSON.parse(localStorage.getItem(`messages_${chatKey}`) || '[]');
        
        messages.push({
            sender: currentUser,
            content: content,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem(`messages_${chatKey}`, JSON.stringify(messages));
        messageInput.value = '';
        loadMessages();
    }
}

// 选择好友聊天
function selectFriend(friend) {
    currentChatFriend = friend;
    // 更新聊天界面标题
    const chatHeader = document.querySelector('.chat-header h1');
    chatHeader.textContent = `与 ${friend} 聊天`;
    // 启用输入框、发送按钮、表情按钮和语音按钮
    document.getElementById('message-input').disabled = false;
    document.getElementById('send-btn').disabled = false;
    document.getElementById('emoji-btn').disabled = false;
    document.getElementById('voice-btn').disabled = false;
    // 加载与该好友的聊天记录
    loadMessages();
    
    // 绑定表情和语音按钮事件
    document.getElementById('emoji-btn').addEventListener('click', showEmojiPicker);
    document.getElementById('voice-btn').addEventListener('click', toggleVoiceRecording);
}

// 显示游戏页面
function showGames() {
    const currentUser = localStorage.getItem('currentUser');
    document.body.innerHTML = `
        <div class="chat-container" style="height: 600px;">
            <div class="chat-header">
                <h1>游戏中心</h1>
                <div class="user-info">
                    <span id="current-user">${currentUser}</span>
                    <button id="back-to-chat-btn" style="background-color: #607D8B; margin-right: 10px;">返回</button>
                    <button id="logout-btn">退出</button>
                </div>
            </div>
            <div style="padding: 20px; height: calc(100% - 60px); display: flex; flex-direction: column; gap: 20px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; text-align: center; cursor: pointer; transition: transform 0.2s; border: 1px solid #e0e0e0;" id="game-1">
                        <h3>猜数字</h3>
                        <p>猜一个1-100之间的数字</p>
                    </div>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; text-align: center; cursor: pointer; transition: transform 0.2s; border: 1px solid #e0e0e0;" id="game-2">
                        <h3>石头剪刀布</h3>
                        <p>与电脑对战</p>
                    </div>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; text-align: center; cursor: pointer; transition: transform 0.2s; border: 1px solid #e0e0e0;" id="game-3">
                        <h3>记忆游戏</h3>
                        <p>考验你的记忆力</p>
                    </div>
                </div>
                <div id="game-container" style="flex: 1; background-color: #f9f9f9; border-radius: 10px; padding: 20px; display: flex; justify-content: center; align-items: center;">
                    <div style="text-align: center; color: #666;">
                        请选择一个游戏开始
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 绑定事件
    document.getElementById('back-to-chat-btn').addEventListener('click', showChat);
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        showLogin();
    });
    
    // 游戏选择事件
    document.getElementById('game-1').addEventListener('click', startGuessNumberGame);
    document.getElementById('game-2').addEventListener('click', startRockPaperScissorsGame);
    document.getElementById('game-3').addEventListener('click', startMemoryGame);
    
    // 添加悬停效果
    document.querySelectorAll('[id^="game-"]').forEach(game => {
        game.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.backgroundColor = '#e3f2fd';
        });
        game.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.backgroundColor = '#f5f5f5';
        });
    });
}

// 猜数字游戏
function startGuessNumberGame() {
    const gameContainer = document.getElementById('game-container');
    let secretNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;
    
    gameContainer.innerHTML = `
        <div style="width: 100%; max-width: 400px;">
            <h3 style="text-align: center; margin-bottom: 20px;">猜数字游戏</h3>
            <p style="text-align: center; margin-bottom: 20px;">我想了一个1-100之间的数字，你能猜出来吗？</p>
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <input type="number" id="guess-input" min="1" max="100" placeholder="输入你的猜测" style="flex: 1; padding: 10px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <button id="guess-btn" style="background-color: #4CAF50; color: white; border: none; padding: 0 20px; border-radius: 5px; cursor: pointer;">猜</button>
            </div>
            <div id="guess-result" style="margin-bottom: 20px; padding: 10px; border-radius: 5px; min-height: 50px;"></div>
            <div id="guess-stats" style="margin-bottom: 20px;">尝试次数: <span id="attempts-count">0</span></div>
            <button id="restart-guess-btn" style="background-color: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">重新开始</button>
        </div>
    `;
    
    // 绑定事件
    document.getElementById('guess-btn').addEventListener('click', function() {
        const guessInput = document.getElementById('guess-input');
        const guess = parseInt(guessInput.value);
        const resultDiv = document.getElementById('guess-result');
        const attemptsCount = document.getElementById('attempts-count');
        
        if (isNaN(guess) || guess < 1 || guess > 100) {
            resultDiv.textContent = '请输入1-100之间的数字';
            resultDiv.style.backgroundColor = '#ffebee';
            return;
        }
        
        attempts++;
        attemptsCount.textContent = attempts;
        
        if (guess === secretNumber) {
            resultDiv.textContent = `恭喜你！猜对了！用了${attempts}次尝试。`;
            resultDiv.style.backgroundColor = '#e8f5e8';
            document.getElementById('guess-input').disabled = true;
            document.getElementById('guess-btn').disabled = true;
        } else if (guess < secretNumber) {
            resultDiv.textContent = '太小了，再试试！';
            resultDiv.style.backgroundColor = '#fff3e0';
        } else {
            resultDiv.textContent = '太大了，再试试！';
            resultDiv.style.backgroundColor = '#fff3e0';
        }
        
        guessInput.value = '';
        guessInput.focus();
    });
    
    document.getElementById('restart-guess-btn').addEventListener('click', startGuessNumberGame);
    
    // 回车键触发猜测
    document.getElementById('guess-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('guess-btn').click();
        }
    });
}

// 石头剪刀布游戏
function startRockPaperScissorsGame() {
    const gameContainer = document.getElementById('game-container');
    let playerScore = 0;
    let computerScore = 0;
    
    gameContainer.innerHTML = `
        <div style="width: 100%; max-width: 500px;">
            <h3 style="text-align: center; margin-bottom: 20px;">石头剪刀布</h3>
            <div style="display: flex; justify-content: space-around; margin-bottom: 30px;">
                <div style="text-align: center;">
                    <h4>你</h4>
                    <div id="player-choice" style="font-size: 48px; margin: 10px 0;">✊</div>
                    <div id="player-score" style="font-size: 24px; font-weight: bold;">0</div>
                </div>
                <div style="text-align: center;">
                    <h4>电脑</h4>
                    <div id="computer-choice" style="font-size: 48px; margin: 10px 0;">✊</div>
                    <div id="computer-score" style="font-size: 24px; font-weight: bold;">0</div>
                </div>
            </div>
            <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 30px;">
                <button class="choice-btn" data-choice="rock" style="font-size: 36px; padding: 20px; border: none; border-radius: 10px; cursor: pointer; transition: transform 0.2s;">✊</button>
                <button class="choice-btn" data-choice="paper" style="font-size: 36px; padding: 20px; border: none; border-radius: 10px; cursor: pointer; transition: transform 0.2s;">✋</button>
                <button class="choice-btn" data-choice="scissors" style="font-size: 36px; padding: 20px; border: none; border-radius: 10px; cursor: pointer; transition: transform 0.2s;">✌️</button>
            </div>
            <div id="rps-result" style="margin-bottom: 20px; padding: 15px; border-radius: 5px; text-align: center; min-height: 50px;"></div>
            <button id="restart-rps-btn" style="background-color: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; display: block; margin: 0 auto;">重新开始</button>
        </div>
    `;
    
    // 绑定事件
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const playerChoice = this.getAttribute('data-choice');
            const computerChoice = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
            
            // 更新显示
            document.getElementById('player-choice').textContent = getChoiceEmoji(playerChoice);
            document.getElementById('computer-choice').textContent = getChoiceEmoji(computerChoice);
            
            // 计算结果
            const result = determineWinner(playerChoice, computerChoice);
            const resultDiv = document.getElementById('rps-result');
            
            if (result === 'player') {
                playerScore++;
                resultDiv.textContent = '你赢了！';
                resultDiv.style.backgroundColor = '#e8f5e8';
            } else if (result === 'computer') {
                computerScore++;
                resultDiv.textContent = '电脑赢了！';
                resultDiv.style.backgroundColor = '#ffebee';
            } else {
                resultDiv.textContent = '平局！';
                resultDiv.style.backgroundColor = '#fff3e0';
            }
            
            // 更新分数
            document.getElementById('player-score').textContent = playerScore;
            document.getElementById('computer-score').textContent = computerScore;
        });
        
        // 悬停效果
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    document.getElementById('restart-rps-btn').addEventListener('click', startRockPaperScissorsGame);
}

// 获取选择的表情
function getChoiceEmoji(choice) {
    switch (choice) {
        case 'rock': return '✊';
        case 'paper': return '✋';
        case 'scissors': return '✌️';
        default: return '✊';
    }
}

// 确定赢家
function determineWinner(player, computer) {
    if (player === computer) return 'tie';
    if ((player === 'rock' && computer === 'scissors') ||
        (player === 'paper' && computer === 'rock') ||
        (player === 'scissors' && computer === 'paper')) {
        return 'player';
    }
    return 'computer';
}

// 记忆游戏
function startMemoryGame() {
    const gameContainer = document.getElementById('game-container');
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let attempts = 0;
    let gameStarted = false;
    let timer = 0;
    let timerInterval;
    
    // 初始化卡片
    function initCards() {
        const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
        cards = [...emojis, ...emojis]; // 复制一份形成配对
        shuffleArray(cards);
    }
    
    // 洗牌函数
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // 开始游戏
    function startGame() {
        initCards();
        flippedCards = [];
        matchedPairs = 0;
        attempts = 0;
        gameStarted = false;
        timer = 0;
        clearInterval(timerInterval);
        
        gameContainer.innerHTML = `
            <div style="width: 100%; max-width: 500px;">
                <h3 style="text-align: center; margin-bottom: 20px;">记忆游戏</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                    <div>尝试次数: <span id="memory-attempts">0</span></div>
                    <div>时间: <span id="memory-timer">0</span>秒</div>
                </div>
                <div id="memory-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
                    <!-- 卡片将通过 JavaScript 动态添加 -->
                </div>
                <button id="start-memory-btn" style="background-color: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; display: block; margin: 0 auto;">开始游戏</button>
                <div id="memory-result" style="margin-top: 20px; padding: 15px; border-radius: 5px; text-align: center; min-height: 50px;"></div>
            </div>
        `;
        
        // 生成卡片
        const grid = document.getElementById('memory-grid');
        cards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.style.width = '80px';
            card.style.height = '80px';
            card.style.backgroundColor = '#2196F3';
            card.style.borderRadius = '10px';
            card.style.display = 'flex';
            card.style.justifyContent = 'center';
            card.style.alignItems = 'center';
            card.style.fontSize = '36px';
            card.style.cursor = 'pointer';
            card.style.transition = 'transform 0.3s, background-color 0.3s';
            card.style.userSelect = 'none';
            card.textContent = '?';
            grid.appendChild(card);
        });
        
        // 绑定事件
        document.getElementById('start-memory-btn').addEventListener('click', function() {
            startGameTimer();
            gameStarted = true;
            this.textContent = '重新开始';
            document.getElementById('memory-result').textContent = '';
        });
        
        // 卡片点击事件
        document.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', function() {
                if (!gameStarted || flippedCards.length >= 2 || this.classList.contains('matched') || this.classList.contains('flipped')) {
                    return;
                }
                
                flipCard(this);
            });
        });
    }
    
    // 翻转卡片
    function flipCard(card) {
        const index = parseInt(card.dataset.index);
        card.textContent = cards[index];
        card.style.backgroundColor = '#e3f2fd';
        card.classList.add('flipped');
        flippedCards.push({ card, index });
        
        if (flippedCards.length === 2) {
            attempts++;
            document.getElementById('memory-attempts').textContent = attempts;
            
            setTimeout(() => {
                checkMatch();
            }, 1000);
        }
    }
    
    // 检查匹配
    function checkMatch() {
        const [card1, card2] = flippedCards;
        
        if (cards[card1.index] === cards[card2.index]) {
            // 匹配成功
            card1.card.classList.add('matched');
            card2.card.classList.add('matched');
            matchedPairs++;
            
            if (matchedPairs === cards.length / 2) {
                // 游戏结束
                clearInterval(timerInterval);
                const resultDiv = document.getElementById('memory-result');
                resultDiv.textContent = `恭喜你完成了游戏！用了${attempts}次尝试，耗时${timer}秒。`;
                resultDiv.style.backgroundColor = '#e8f5e8';
            }
        } else {
            // 匹配失败
            card1.card.textContent = '?';
            card2.card.textContent = '?';
            card1.card.style.backgroundColor = '#2196F3';
            card2.card.style.backgroundColor = '#2196F3';
        }
        
        card1.card.classList.remove('flipped');
        card2.card.classList.remove('flipped');
        flippedCards = [];
    }
    
    // 开始游戏计时器
    function startGameTimer() {
        clearInterval(timerInterval);
        timer = 0;
        document.getElementById('memory-timer').textContent = timer;
        
        timerInterval = setInterval(() => {
            timer++;
            document.getElementById('memory-timer').textContent = timer;
        }, 1000);
    }
    
    // 启动游戏
    startGame();
}

// 显示表情选择器
function showEmojiPicker() {
    // 表情列表
    const emojis = ['😊', '😂', '😍', '🤔', '😮', '😢', '😡', '👍', '👎', '❤️', '🎉', '🔥', '🌟', '🤣', '😅', '😆', '😋', '😎', '😤', '😢'];
    
    // 创建表情选择器面板
    let emojiPicker = document.getElementById('emoji-picker');
    if (emojiPicker) {
        // 如果已存在，切换显示/隐藏
        emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
        return;
    }
    
    emojiPicker = document.createElement('div');
    emojiPicker.id = 'emoji-picker';
    emojiPicker.style.position = 'absolute';
    emojiPicker.style.bottom = '80px';
    emojiPicker.style.left = '270px';
    emojiPicker.style.backgroundColor = 'white';
    emojiPicker.style.border = '1px solid #e0e0e0';
    emojiPicker.style.borderRadius = '10px';
    emojiPicker.style.padding = '10px';
    emojiPicker.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    emojiPicker.style.zIndex = '1000';
    emojiPicker.style.display = 'grid';
    emojiPicker.style.gridTemplateColumns = 'repeat(5, 1fr)';
    emojiPicker.style.gap = '10px';
    
    // 添加表情
    emojis.forEach(emoji => {
        const emojiElement = document.createElement('div');
        emojiElement.textContent = emoji;
        emojiElement.style.fontSize = '24px';
        emojiElement.style.cursor = 'pointer';
        emojiElement.style.textAlign = 'center';
        emojiElement.style.padding = '5px';
        emojiElement.style.borderRadius = '5px';
        emojiElement.style.transition = 'background-color 0.2s';
        
        emojiElement.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f0f0f0';
        });
        
        emojiElement.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
        
        emojiElement.addEventListener('click', function() {
            const messageInput = document.getElementById('message-input');
            messageInput.value += emoji;
            messageInput.focus();
            emojiPicker.remove();
        });
        
        emojiPicker.appendChild(emojiElement);
    });
    
    // 添加到聊天容器
    document.querySelector('.chat-container').appendChild(emojiPicker);
    
    // 点击其他地方关闭表情选择器
    document.addEventListener('click', function(event) {
        if (!emojiPicker.contains(event.target) && event.target.id !== 'emoji-btn') {
            emojiPicker.remove();
        }
    }, { once: true });
}

// 语音录制相关变量
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

// 切换语音录制状态
function toggleVoiceRecording() {
    const voiceBtn = document.getElementById('voice-btn');
    
    if (!isRecording) {
        // 开始录制
        startVoiceRecording();
        voiceBtn.textContent = '⏹️';
        voiceBtn.style.color = 'red';
        isRecording = true;
    } else {
        // 停止录制
        stopVoiceRecording();
        voiceBtn.textContent = '🎤';
        voiceBtn.style.color = 'inherit';
        isRecording = false;
    }
}

// 开始语音录制
function startVoiceRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.addEventListener('dataavailable', event => {
                audioChunks.push(event.data);
            });
            
            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                sendVoiceMessage(audioBlob);
                // 停止流
                stream.getTracks().forEach(track => track.stop());
            });
            
            mediaRecorder.start();
        })
        .catch(error => {
            console.error('无法访问麦克风:', error);
            alert('无法访问麦克风，请检查权限设置。');
            const voiceBtn = document.getElementById('voice-btn');
            voiceBtn.textContent = '🎤';
            voiceBtn.style.color = 'inherit';
            isRecording = false;
        });
}

// 停止语音录制
function stopVoiceRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
}

// 发送语音消息
function sendVoiceMessage(audioBlob) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser || !currentChatFriend) return;
    
    // 生成唯一的音频文件名
    const audioId = 'audio_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    // 在实际应用中，这里会上传音频到服务器
    // 这里我们使用本地存储模拟
    const chatKey = `${currentUser}_${currentChatFriend}`;
    const messages = JSON.parse(localStorage.getItem(`messages_${chatKey}`) || '[]');
    
    messages.push({
        sender: currentUser,
        content: '[语音消息]',
        type: 'voice',
        audioId: audioId,
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem(`messages_${chatKey}`, JSON.stringify(messages));
    loadMessages();
    
    // 注意：由于是本地模拟，音频消息无法实际播放
    // 在实际应用中，需要将音频上传到服务器并返回可访问的URL
}

// 修改加载消息函数，支持语音消息和头像显示
function loadMessages() {
    const currentUser = localStorage.getItem('currentUser');
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    
    // 从本地存储加载与当前好友的聊天记录
    const chatKey = currentChatFriend ? `${currentUser}_${currentChatFriend}` : 'global';
    const messages = JSON.parse(localStorage.getItem(`messages_${chatKey}`) || '[]');
    
    messages.forEach(message => {
        // 获取发送者的头像
        const senderInfo = users.find(u => u.username === message.sender);
        const senderAvatar = senderInfo ? senderInfo.avatar : 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square';
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender === currentUser ? 'sent' : 'received'}`;
        messageElement.style.display = 'flex';
        messageElement.style.alignItems = 'flex-start';
        messageElement.style.gap = '10px';
        
        if (message.type === 'voice') {
            // 语音消息
            messageElement.innerHTML = `
                <img src="${senderAvatar}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; margin-top: 5px;">
                <div style="flex: 1;">
                    <div class="sender">${message.sender}</div>
                    <div class="content" style="display: flex; align-items: center; gap: 10px;">
                        <button class="play-voice-btn" style="background: none; border: none; font-size: 20px; cursor: pointer;">▶️</button>
                        <span>[语音消息]</span>
                    </div>
                </div>
            `;
            
            // 添加播放按钮事件
            messageElement.querySelector('.play-voice-btn').addEventListener('click', function() {
                alert('语音消息播放功能需要服务器支持，这里仅作演示。');
            });
        } else {
            // 文本消息
            messageElement.innerHTML = `
                <img src="${senderAvatar}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; margin-top: 5px;">
                <div style="flex: 1;">
                    <div class="sender">${message.sender}</div>
                    <div class="content">${message.content}</div>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageElement);
    });
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 初始化应用
initApp();