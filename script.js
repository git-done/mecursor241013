document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const navLinks = document.querySelectorAll('.nav-link');
    const universeBackground = document.getElementById('universe-background');
    const aboutDescription = document.getElementById('about-description');
    const suggestedQuestions = document.getElementById('suggested-questions');

    const API_KEY = '16fee163c685debe3cb63562edf44e45.ke9ApqKcDsyKFqJA'; // 您的API密钥
    const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    const aboutText = `永远保持上进的，往前走，至于走到什么地步
你不要去问，你不要去管，你现在付出的任何一次努力，它都不会浪费，你现在付出的任何一次努力，都是你在自己内心的树苗之下撒下一把肥沃的土壤，也许你撒下一把肥沃的土壤它是不管用的，但是你一把一把的撒下去，早晚有一天你生命的根须就会从这些土壤当中不断的吸取营养，你将会变成一颗在远方别人可以看得见的大树。`;

    // 单页面应用导航
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('d-none');
            });
            document.getElementById(targetId).classList.remove('d-none');

            // 切换背景图片和主题
            if (targetId === 'home') {
                universeBackground.style.backgroundImage = "url('imags/unnamed.png')";
                document.body.classList.remove('blue-theme', 'dark-theme');
            } else if (targetId === 'ai-chat') {
                universeBackground.style.backgroundImage = "url('imags/earth.jpg')";
                document.body.classList.remove('blue-theme', 'dark-theme');
            } else if (targetId === 'about') {
                universeBackground.style.backgroundImage = "url('https://source.unsplash.com/random/1920x1080/?blue,abstract')";
                document.body.classList.add('blue-theme');
                document.body.classList.remove('dark-theme');
                aboutDescription.textContent = aboutText;
            } else if (targetId === 'projects') {
                universeBackground.style.backgroundImage = "url('https://source.unsplash.com/random/1920x1080/?dark,technology')";
                document.body.classList.add('dark-theme');
                document.body.classList.remove('blue-theme');
            } else {
                universeBackground.style.backgroundImage = "url('https://source.unsplash.com/random/1920x1080/?universe,galaxy')";
                document.body.classList.remove('blue-theme', 'dark-theme');
            }
        });
    });

    // 在 DOMContentLoaded 事件监听器中添加以下代码
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // AI聊天功能
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            await processUserMessage(message);
        }
    });

    async function processUserMessage(message) {
        addMessage('user', message);
        userInput.value = '';
        
        try {
            const response = await callAI(message);
            addMessage('ai', response);
            generateSuggestedQuestions(message);
        } catch (error) {
            console.error('AI API调用出错:', error);
            addMessage('system', '抱歉，AI响应出现了问题。请稍后再试。');
        }
    }

    function addMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        messageElement.innerHTML = `
            <p>${text}</p>
            <button class="copy-btn" onclick="copyText(this)">复制</button>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function copyText(button) {
        const text = button.previousElementSibling.textContent;
        navigator.clipboard.writeText(text).then(() => {
            button.textContent = '已复制';
            setTimeout(() => {
                button.textContent = '复制';
            }, 2000);
        });
    }

    async function generateSuggestedQuestions(lastMessage) {
        const suggestedQuestionsPrompt = `基于以下消息，生成3个相关的后续问题："${lastMessage}"`;
        try {
            const response = await callAI(suggestedQuestionsPrompt);
            const questions = response.split('\n').filter(q => q.trim() !== '');
            displaySuggestedQuestions(questions);
        } catch (error) {
            console.error('生成建议问题时出错:', error);
        }
    }

    function displaySuggestedQuestions(questions) {
        suggestedQuestions.innerHTML = '';
        questions.forEach(question => {
            const questionElement = document.createElement('span');
            questionElement.className = 'suggested-question';
            questionElement.textContent = question;
            questionElement.onclick = () => processUserMessage(question);
            suggestedQuestions.appendChild(questionElement);
        });
    }

    function generateToken(apiKey) {
        const [id, secret] = apiKey.split('.');
        const header = {alg: 'HS256', sign_type: 'SIGN'};
        const payload = {
            api_key: id,
            exp: Date.now() + 60 * 60 * 1000, // 1小时后过期
            timestamp: Date.now()
        };

        return KJUR.jws.JWS.sign('HS256', JSON.stringify(header), JSON.stringify(payload), secret);
    }

    async function callAI(message) {
        const token = generateToken(API_KEY);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                model: "glm-4",
                messages: [{ role: "user", content: message }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // 将 copyText 函数添加到全局作用域
    window.copyText = copyText;

    // 在文件末尾添加以下函数

    function showPeriodicTable() {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('d-none');
        });
        document.getElementById('periodic-table').classList.remove('d-none');
        generatePeriodicTable();
    }

    function generatePeriodicTable() {
        const container = document.getElementById('periodicTableContainer');
        if (container.children.length > 0) return; // 如果已经生成了周期表，就不再重复生成

        elements.forEach(element => {
            const elementDiv = document.createElement('div');
            elementDiv.className = `element ${element.category}`;
            elementDiv.style.gridColumn = element.column;
            elementDiv.style.gridRow = element.row;
            elementDiv.innerHTML = `
                <div class="element-number">${element.number}</div>
                <div class="element-symbol">${element.symbol}</div>
                <div class="element-name">${element.name}</div>
            `;
            elementDiv.onclick = () => speakElementInfo(element);
            container.appendChild(elementDiv);
        });
    }

    function speakElementInfo(element) {
        const speech = new SpeechSynthesisUtterance();
        speech.text = `${element.name}，原子序数${element.number}，化学符号${element.symbol}。${element.description}`;
        speech.lang = 'zh-CN';
        speechSynthesis.speak(speech);
    }

    // 元素数据（这里只列出了一部分元素作为示例）
    const elements = [
        { number: 1, symbol: 'H', name: '氢', category: 'nonmetal', column: 1, row: 1, description: '氢是最轻的元素，在宇宙中含量最多。' },
        { number: 2, symbol: 'He', name: '氦', category: 'noble-gas', column: 18, row: 1, description: '氦是一种惰性气体，常用于气球和低温研究。' },
        // ... 添加更多元素
    ];

    // 在 DOMContentLoaded 事件监听器中添加对新导航链接的处理
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#periodic-table') {
                e.preventDefault();
                showPeriodicTable();
            }
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});