// Chatbot configuration
const CHATBOT_CONFIG = {
    name: 'SafeWeather Assistant',
    avatar: '🤖',
    greeting: 'Hello! I\'m your SafeWeather assistant. How can I help you today?',
    responses: {
        weather: [
            "The current temperature is {temp}°C with {condition}. Air quality is {aqi} (AQI).",
            "It's {temp}°C outside with {condition}. Visibility is about {visibility} km.",
            "Weather update: {temp}°C, {condition}. {advice}"
        ],
        report: [
            "You can submit a weather report by clicking the 'Report' button in the navigation.",
            "To report a hazard, go to the Report section and fill out the form with details about the location and conditions.",
            "Reports help keep everyone safe! You can submit them from the Report page."
        ],
        premium: [
            "Premium members get unlimited reports, SMS alerts, and advanced analytics. Upgrade in the Premium section!",
            "With Premium, you'll get priority alerts, historical data, and unlimited reporting capabilities.",
            "Upgrade to Premium for enhanced features and unlimited access to all tools."
        ],
        help: [
            "I can help with weather information, reporting hazards, account questions, and premium features.",
            "You can ask me about current conditions, how to submit reports, or account management.",
            "Need help? I can assist with weather data, reporting, alerts, and account settings."
        ],
        default: [
            "I'm not sure I understand. You can ask me about weather, reports, or account help.",
            "Can you rephrase that? I'm here to help with weather safety information.",
            "I'm still learning! Try asking about weather conditions or how to submit a report."
        ]
    },
    quickReplies: [
        { text: "Current weather", action: "weather" },
        { text: "How to report", action: "report" },
        { text: "Premium benefits", action: "premium" },
        { text: "Need help", action: "help" }
    ]
};

class Chatbot {
    constructor() {
        this.messages = [];
        this.isOpen = false;
        this.userName = 'Guest';
        this.loadHistory();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Enter key to send message
        document.getElementById('chatbotInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Quick reply buttons
        document.querySelectorAll('.quick-action').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.closest('.quick-action').getAttribute('onclick').match(/'(.+?)'/)[1];
                this.handleQuickAction(action);
            });
        });
    }
    
    loadHistory() {
        const saved = localStorage.getItem('chatbotHistory');
        if (saved) {
            this.messages = JSON.parse(saved);
            this.renderMessages();
        } else {
            this.addBotMessage(CHATBOT_CONFIG.greeting);
        }
    }
    
    saveHistory() {
        // Keep only last 50 messages
        const history = this.messages.slice(-50);
        localStorage.setItem('chatbotHistory', JSON.stringify(history));
    }
    
    toggle() {
        this.isOpen = !this.isOpen;
        const widget = document.getElementById('chatbotWidget');
        
        if (this.isOpen) {
            widget.style.display = 'block';
            this.scrollToBottom();
            document.getElementById('chatbotInput').focus();
        } else {
            widget.style.display = 'none';
        }
    }
    
    sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addUserMessage(message);
        input.value = '';
        
        // Process message and get response
        setTimeout(() => {
            const response = this.processMessage(message);
            this.addBotMessage(response);
        }, 500);
    }
    
    addUserMessage(text) {
        const message = {
            id: Date.now(),
            type: 'user',
            text: text,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        this.messages.push(message);
        this.renderMessage(message);
        this.saveHistory();
    }
    
    addBotMessage(text) {
        const message = {
            id: Date.now(),
            type: 'bot',
            text: text,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        this.messages.push(message);
        this.renderMessage(message);
        this.saveHistory();
    }
    
    renderMessage(message) {
        const container = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        messageDiv.innerHTML = `
            <div class="message-content">${message.text}</div>
            <div class="message-time">${message.time}</div>
        `;
        
        container.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    renderMessages() {
        const container = document.getElementById('chatbotMessages');
        container.innerHTML = '';
        
        this.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.type}`;
            messageDiv.innerHTML = `
                <div class="message-content">${message.text}</div>
                <div class="message-time">${message.time}</div>
            `;
            container.appendChild(messageDiv);
        });
        
        this.scrollToBottom();
    }
    
    scrollToBottom() {
        const container = document.getElementById('chatbotMessages');
        container.scrollTop = container.scrollHeight;
    }
    
    processMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for specific intents
        if (this.containsAny(lowerMessage, ['weather', 'temperature', 'hot', 'cold', 'cuaca', 'panas', 'sejuk'])) {
            return this.getWeatherResponse();
        }
        
        if (this.containsAny(lowerMessage, ['report', 'lapor', 'hazard', 'danger', 'risk'])) {
            return this.getRandomResponse('report');
        }
        
        if (this.containsAny(lowerMessage, ['premium', 'upgrade', 'pro', 'crown', 'mahal'])) {
            return this.getRandomResponse('premium');
        }
        
        if (this.containsAny(lowerMessage, ['help', 'bantuan', 'sakit', 'problem', 'issue'])) {
            return this.getRandomResponse('help');
        }
        
        if (this.containsAny(lowerMessage, ['hello', 'hi', 'hai', 'hey', 'hola'])) {
            return `Hello ${this.userName}! How can I help you today?`;
        }
        
        if (this.containsAny(lowerMessage, ['thank', 'thanks', 'terima kasih'])) {
            return "You're welcome! Is there anything else I can help with?";
        }
        
        return this.getRandomResponse('default');
    }
    
    containsAny(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }
    
    getRandomResponse(type) {
        const responses = CHATBOT_CONFIG.responses[type] || CHATBOT_CONFIG.responses.default;
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        // Replace variables in response
        return this.replaceVariables(response);
    }
    
    replaceVariables(text) {
        const weather = window.currentWeather || {
            temp: 32,
            condition: 'sunny',
            aqi: 85,
            visibility: 8
        };
        
        const advice = this.getWeatherAdvice(weather.condition);
        
        return text
            .replace('{temp}', weather.temperature)
            .replace('{condition}', weather.description || weather.condition)
            .replace('{aqi}', weather.aqi || 85)
            .replace('{visibility}', weather.visibility || 8)
            .replace('{advice}', advice);
    }
    
    getWeatherResponse() {
        if (!window.currentWeather) {
            return "I don't have current weather data. Please check the weather section for updates.";
        }
        
        const weather = window.currentWeather;
        const advice = this.getWeatherAdvice(weather.condition);
        
        const responses = [
            `Currently ${weather.temperature}°C with ${weather.description}. Air Quality Index is ${weather.aqi}.`,
            `The temperature is ${weather.temperature}°C. Conditions: ${weather.description}. ${advice}`,
            `Weather update: ${weather.temperature}°C, ${weather.description}. Visibility ${weather.visibility} km. AQI: ${weather.aqi}.`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    getWeatherAdvice(condition) {
        const advice = {
            sunny: "Remember to stay hydrated and use sun protection.",
            rainy: "Carry an umbrella and drive carefully on wet roads.",
            cloudy: "Good weather for outdoor activities.",
            haze: "Reduce outdoor activities and wear a mask if needed.",
            storm: "Stay indoors and avoid unnecessary travel."
        };
        
        return advice[condition] || "Have a safe day!";
    }
    
    handleQuickAction(action) {
        const actions = {
            weather: "What's the current weather?",
            report: "How do I report weather conditions?",
            alerts: "How do I set up alerts?",
            help: "I need help using the platform",
            premium: "Tell me about Premium features"
        };
        
        const message = actions[action];
        if (message) {
            document.getElementById('chatbotInput').value = message;
            this.sendMessage();
        }
    }
    
    updateUserName(name) {
        this.userName = name || 'Guest';
    }
    
    clearHistory() {
        this.messages = [];
        localStorage.removeItem('chatbotHistory');
        this.addBotMessage(CHATBOT_CONFIG.greeting);
    }
    
    suggestHelp() {
        const suggestions = [
            "Need weather information?",
            "Want to report hazardous conditions?",
            "Questions about your account?",
            "Interested in Premium features?"
        ];
        
        const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        this.addBotMessage(suggestion);
    }
}

// Initialize chatbot
const chatbot = new Chatbot();

// Export for global access
window.chatbot = chatbot;
window.toggleChatbot = () => chatbot.toggle();
window.sendChatMessage = () => chatbot.sendMessage();
window.quickAction = (action) => chatbot.handleQuickAction(action);