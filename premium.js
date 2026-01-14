// Premium features manager
class PremiumManager {
    constructor() {
        this.features = {
            unlimited_reports: {
                name: 'Unlimited Reports',
                description: 'Submit unlimited weather reports',
                icon: 'fas fa-file-alt',
                free: false,
                premium: true
            },
            sms_alerts: {
                name: 'SMS Alerts',
                description: 'Receive alerts via SMS',
                icon: 'fas fa-sms',
                free: false,
                premium: true
            },
            advanced_analytics: {
                name: 'Advanced Analytics',
                description: 'Detailed weather trends and insights',
                icon: 'fas fa-chart-line',
                free: false,
                premium: true
            },
            historical_data: {
                name: 'Historical Data',
                description: 'Access to past weather data',
                icon: 'fas fa-history',
                free: false,
                premium: true
            },
            priority_support: {
                name: 'Priority Support',
                description: '24/7 dedicated support',
                icon: 'fas fa-headset',
                free: false,
                premium: true
            },
            custom_alerts: {
                name: 'Custom Alerts',
                description: 'Create personalized alert rules',
                icon: 'fas fa-bell',
                free: false,
                premium: true
            },
            no_ads: {
                name: 'Ad-Free Experience',
                description: 'Use without advertisements',
                icon: 'fas fa-ad',
                free: false,
                premium: true
            },
            export_data: {
                name: 'Data Export',
                description: 'Export reports and data',
                icon: 'fas fa-download',
                free: false,
                premium: true
            }
        };
        
        this.plans = {
            free: {
                name: 'Free',
                price: 0,
                period: 'month',
                features: ['basic_weather', 'limited_reports', 'email_alerts'],
                color: '#64748b'
            },
            pro: {
                name: 'Pro',
                price: 9.99,
                period: 'month',
                features: ['unlimited_reports', 'sms_alerts', 'advanced_analytics', 
                          'historical_data', 'priority_support', 'no_ads'],
                color: '#f59e0b',
                popular: true
            },
            enterprise: {
                name: 'Enterprise',
                price: 49.99,
                period: 'month',
                features: ['all_features', 'custom_alerts', 'export_data', 
                          'api_access', 'white_label', 'dedicated_support'],
                color: '#8b5cf6'
            }
        };
    }
    
    checkFeatureAccess(featureName) {
        const user = window.userManager?.currentUser;
        if (!user) return false;
        
        const plan = user.plan || 'free';
        const planFeatures = this.plans[plan]?.features || [];
        
        return planFeatures.includes('all_features') || 
               planFeatures.includes(featureName) ||
               (plan === 'pro' && this.features[featureName]?.premium);
    }
    
    getPlanDetails(planName) {
        return this.plans[planName] || this.plans.free;
    }
    
    getFeatureList(planName) {
        const plan = this.getPlanDetails(planName);
        const featureList = [];
        
        Object.keys(this.features).forEach(key => {
            const feature = this.features[key];
            const hasFeature = plan.features.includes('all_features') || 
                              plan.features.includes(key) ||
                              (planName === 'pro' && feature.premium);
            
            featureList.push({
                ...feature,
                available: hasFeature
            });
        });
        
        return featureList;
    }
    
    renderPricingTable() {
        const container = document.getElementById('pricingTable');
        if (!container) return;
        
        const plans = Object.keys(this.plans);
        
        container.innerHTML = `
            <div class="pricing-header">
                ${plans.map(plan => `
                    <div class="pricing-column ${this.plans[plan].popular ? 'popular' : ''}">
                        <h3>${this.plans[plan].name}</h3>
                        <div class="price">
                            RM ${this.plans[plan].price}
                            <span class="period">/${this.plans[plan].period}</span>
                        </div>
                        ${this.plans[plan].popular ? '<div class="popular-badge">MOST POPULAR</div>' : ''}
                    </div>
                `).join('')}
            </div>
            <div class="pricing-features">
                ${Object.keys(this.features).map(key => `
                    <div class="feature-row">
                        <div class="feature-name">
                            <i class="${this.features[key].icon}"></i>
                            <span>${this.features[key].name}</span>
                        </div>
                        ${plans.map(plan => `
                            <div class="feature-availability ${this.checkFeatureAccess(key, plan) ? 'available' : 'unavailable'}">
                                <i class="fas ${this.checkFeatureAccess(key, plan) ? 'fa-check' : 'fa-times'}"></i>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
            <div class="pricing-footer">
                ${plans.map(plan => `
                    <div class="plan-action">
                        <button class="btn ${this.plans[plan].popular ? 'btn-primary' : 'btn-outline'}" 
                                onclick="selectPlan('${plan}')">
                            ${plan === 'free' ? 'Get Started' : 'Upgrade Now'}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    checkFeatureAccess(featureName, planName) {
        const plan = this.plans[planName];
        if (!plan) return false;
        
        return plan.features.includes('all_features') || 
               plan.features.includes(featureName) ||
               (planName === 'pro' && this.features[featureName]?.premium);
    }
    
    async processUpgrade(planName, paymentDetails) {
        const user = window.userManager?.currentUser;
        if (!user) {
            throw new Error('User must be logged in to upgrade');
        }
        
        // In production, this would integrate with payment gateway
        // For demo, we'll simulate payment processing
        
        showNotification(`Processing ${planName} upgrade...`, 'info');
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Update user plan
                    const result = window.userManager.upgradeToPremium(user.id);
                    
                    if (result.success) {
                        // Track upgrade in analytics
                        this.trackUpgrade(planName, user.id);
                        
                        // Show success message
                        showNotification(`Successfully upgraded to ${planName}!`, 'success');
                        
                        // Update UI
                        window.updateUserInterface();
                        
                        resolve(result);
                    } else {
                        reject(new Error('Upgrade failed'));
                    }
                } catch (error) {
                    reject(error);
                }
            }, 2000);
        });
    }
    
    trackUpgrade(planName, userId) {
        const upgrades = JSON.parse(localStorage.getItem('premiumUpgrades') || '[]');
        upgrades.push({
            userId,
            plan: planName,
            timestamp: new Date().toISOString(),
            amount: this.plans[planName]?.price || 0
        });
        localStorage.setItem('premiumUpgrades', JSON.stringify(upgrades));
    }
    
    getUpgradeStats() {
        const upgrades = JSON.parse(localStorage.getItem('premiumUpgrades') || '[]');
        const totalRevenue = upgrades.reduce((sum, upgrade) => sum + upgrade.amount, 0);
        
        return {
            totalUpgrades: upgrades.length,
            totalRevenue: totalRevenue.toFixed(2),
            recentUpgrades: upgrades.slice(-10)
        };
    }
    
    renderPaymentForm(planName) {
        const plan = this.plans[planName];
        if (!plan) return;
        
        const container = document.getElementById('paymentSection');
        if (!container) return;
        
        container.innerHTML = `
            <div class="payment-form-container">
                <h3><i class="fas fa-credit-card"></i> Complete Your ${plan.name} Upgrade</h3>
                
                <div class="order-summary">
                    <h4>Order Summary</h4>
                    <div class="summary-item">
                        <span>Plan:</span>
                        <span>${plan.name} (${plan.period}ly)</span>
                    </div>
                    <div class="summary-item">
                        <span>Price:</span>
                        <span>RM ${plan.price}</span>
                    </div>
                    <div class="summary-item">
                        <span>Tax (6%):</span>
                        <span>RM ${(plan.price * 0.06).toFixed(2)}</span>
                    </div>
                    <div class="summary-item total">
                        <span>Total:</span>
                        <span>RM ${(plan.price * 1.06).toFixed(2)}</span>
                    </div>
                </div>
                
                <form id="paymentForm" class="payment-form">
                    <div class="form-group">
                        <label for="cardNumber">Card Number</label>
                        <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" 
                               pattern="[0-9]{16}" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="expiryDate">Expiry Date</label>
                            <input type="text" id="expiryDate" placeholder="MM/YY" 
                                   pattern="(0[1-9]|1[0-2])\/[0-9]{2}" required>
                        </div>
                        <div class="form-group">
                            <label for="cvv">CVV</label>
                            <input type="text" id="cvv" placeholder="123" 
                                   pattern="[0-9]{3,4}" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="cardName">Name on Card</label>
                        <input type="text" id="cardName" placeholder="John Doe" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox">
                            <input type="checkbox" id="saveCard" checked>
                            <span class="checkmark"></span>
                            Save card for future payments
                        </label>
                    </div>
                    
                    <div class="payment-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-lock"></i> Pay RM ${(plan.price * 1.06).toFixed(2)}
                        </button>
                        <button type="button" class="btn btn-outline" onclick="cancelPayment()">
                            Cancel
                        </button>
                    </div>
                    
                    <div class="payment-security">
                        <i class="fas fa-shield-alt"></i>
                        <span>Your payment is secure and encrypted</span>
                    </div>
                </form>
                
                <div class="payment-methods">
                    <p>Other payment methods:</p>
                    <div class="method-buttons">
                        <button class="btn btn-payment" onclick="useTouchNGo()">
                            <i class="fas fa-mobile-alt"></i> Touch 'n Go
                        </button>
                        <button class="btn btn-payment" onclick="useBoost()">
                            <i class="fas fa-bolt"></i> Boost
                        </button>
                        <button class="btn btn-payment" onclick="usePayPal()">
                            <i class="fab fa-paypal"></i> PayPal
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Setup payment form submission
        document.getElementById('paymentForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePayment(planName);
        });
    }
    
    async handlePayment(planName) {
        // Validate form
        if (!this.validatePaymentForm()) {
            showNotification('Please check your payment details', 'error');
            return;
        }
        
        // Process payment
        try {
            const paymentDetails = {
                cardNumber: document.getElementById('cardNumber').value,
                expiryDate: document.getElementById('expiryDate').value,
                cvv: document.getElementById('cvv').value,
                cardName: document.getElementById('cardName').value,
                saveCard: document.getElementById('saveCard').checked
            };
            
            await this.processUpgrade(planName, paymentDetails);
            
            // Hide payment section
            document.getElementById('paymentSection').innerHTML = `
                <div class="upgrade-success">
                    <i class="fas fa-check-circle fa-3x"></i>
                    <h3>Upgrade Successful!</h3>
                    <p>Welcome to ${this.plans[planName].name} plan. Your account has been upgraded.</p>
                    <button class="btn btn-primary" onclick="showSection('dashboard')">
                        Go to Dashboard
                    </button>
                </div>
            `;
            
        } catch (error) {
            showNotification('Payment failed: ' + error.message, 'error');
        }
    }
    
    validatePaymentForm() {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('cardName').value;
        
        // Basic validation
        if (!/^[0-9]{16}$/.test(cardNumber)) return false;
        if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiryDate)) return false;
        if (!/^[0-9]{3,4}$/.test(cvv)) return false;
        if (cardName.length < 3) return false;
        
        // Check expiry date
        const [month, year] = expiryDate.split('/');
        const now = new Date();
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        
        if (expiry < now) return false;
        
        return true;
    }
    
    renderPremiumDashboard() {
        const user = window.userManager?.currentUser;
        if (!user || user.plan === 'free') {
            return this.renderUpgradePrompt();
        }
        
        const stats = this.getUpgradeStats();
        const plan = this.plans[user.plan];
        
        return `
            <div class="premium-dashboard">
                <div class="premium-status glass-card">
                    <div class="status-header">
                        <i class="fas fa-crown fa-2x"></i>
                        <div>
                            <h3>${plan.name} Member</h3>
                            <p>Active since ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <div class="premium-features">
                        <h4>Your Premium Features</h4>
                        <div class="features-grid">
                            ${Object.keys(this.features)
                                .filter(key => this.checkFeatureAccess(key))
                                .map(key => `
                                    <div class="feature-item">
                                        <i class="${this.features[key].icon}"></i>
                                        <span>${this.features[key].name}</span>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                    
                    <div class="usage-stats">
                        <h4>Usage Statistics</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-value">${user.reportsUsed || 0}</span>
                                <span class="stat-label">Reports Submitted</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${stats.totalUpgrades}</span>
                                <span class="stat-label">Total Upgrades</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">RM ${stats.totalRevenue}</span>
                                <span class="stat-label">Total Revenue</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="premium-actions">
                    <button class="btn btn-outline" onclick="manageSubscription()">
                        <i class="fas fa-cog"></i> Manage Subscription
                    </button>
                    <button class="btn btn-outline" onclick="downloadInvoice()">
                        <i class="fas fa-receipt"></i> Download Invoice
                    </button>
                    <button class="btn btn-outline" onclick="sharePremium()">
                        <i class="fas fa-share-alt"></i> Share with Friends
                    </button>
                </div>
            </div>
        `;
    }
    
    renderUpgradePrompt() {
        return `
            <div class="upgrade-prompt glass-card">
                <div class="prompt-header">
                    <i class="fas fa-crown fa-3x"></i>
                    <h3>Unlock Premium Features</h3>
                    <p>Upgrade to get the most out of SafeWeather Pro</p>
                </div>
                
                <div class="prompt-features">
                    ${Object.keys(this.features)
                        .filter(key => !this.checkFeatureAccess(key))
                        .slice(0, 4)
                        .map(key => `
                            <div class="feature-preview">
                                <i class="${this.features[key].icon}"></i>
                                <div>
                                    <h5>${this.features[key].name}</h5>
                                    <p>${this.features[key].description}</p>
                                </div>
                            </div>
                        `).join('')}
                </div>
                
                <div class="prompt-actions">
                    <button class="btn btn-primary" onclick="showSection('premium')">
                        <i class="fas fa-rocket"></i> View Plans
                    </button>
                    <button class="btn btn-outline" onclick="startFreeTrial()">
                        <i class="fas fa-clock"></i> Start 7-Day Free Trial
                    </button>
                </div>
            </div>
        `;
    }
    
    startFreeTrial() {
        const user = window.userManager?.currentUser;
        if (!user) {
            showNotification('Please login to start free trial', 'warning');
            return;
        }
        
        // Track trial start
        const trials = JSON.parse(localStorage.getItem('freeTrials') || '[]');
        trials.push({
            userId: user.id,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
        localStorage.setItem('freeTrials', JSON.stringify(trials));
        
        // Temporarily enable premium features
        user.trialActive = true;
        user.trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        window.userManager.saveCurrentUser();
        
        showNotification('Free trial started! Premium features unlocked for 7 days.', 'success');
        window.updateUserInterface();
    }
}

// Initialize premium manager
const premiumManager = new PremiumManager();

// Export functions
window.premiumManager = premiumManager;
window.selectPlan = (planName) => premiumManager.renderPaymentForm(planName);
window.cancelPayment = () => {
    document.getElementById('paymentSection').innerHTML = '';
    showNotification('Payment cancelled', 'info');
};
window.startFreeTrial = () => premiumManager.startFreeTrial();
window.upgradeToPro = () => premiumManager.renderPaymentForm('pro');