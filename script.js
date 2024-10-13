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
});
