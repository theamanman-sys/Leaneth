/* REAL WEB3 IDENTITY BRIDGE - LEANETH VENTURES
   Supports real MetaMask EIP-1193 connection + demo mode fallback
   + CoinGecko live prices (ETH, BTC, SOL, MATIC) */

import { playClickSound } from './router.js';

const CHAIN_NAMES = {
    '0x1': 'Ethereum Mainnet',
    '0x5': 'Goerli Testnet',
    '0xaa36a7': 'Sepolia Testnet',
    '0x89': 'Polygon Mainnet',
    '0xa86a': 'Avalanche Mainnet',
    '0xa': 'Optimism Mainnet',
    '0xa4b1': 'Arbitrum One',
    '0x38': 'BNB Smart Chain',
};

class Web3IdentityBridge {
    constructor() {
        this.ethPrice = document.getElementById('ticker-eth-price');
        this.ethChange = document.getElementById('ticker-eth-change');
        this.btcPrice = document.getElementById('ticker-btc-price');
        this.btcChange = document.getElementById('ticker-btc-change');
        this.solPrice = document.getElementById('ticker-sol-price');
        this.solChange = document.getElementById('ticker-sol-change');
        this.maticPrice = document.getElementById('ticker-matic-price');
        this.maticChange = document.getElementById('ticker-matic-change');
        this.updateTime = document.getElementById('market-update-time');
        this.connectBtn = document.getElementById('web3-connect-btn');
        this.signBtn = document.getElementById('web3-sign-btn');
        this.sendBtn = document.getElementById('web3-send-btn');
        this.statusBadge = document.getElementById('wallet-connected-badge');
        this.providerVal = document.getElementById('wallet-provider-val');
        this.addressVal = document.getElementById('wallet-address-val');
        this.balanceVal = document.getElementById('wallet-balance-val');
        this.networkVal = document.getElementById('wallet-network-val');
        this.chainVal = document.getElementById('wallet-chain-val');
        this.actionsSection = document.getElementById('wallet-actions-section');
        this.connectModal = document.getElementById('web3-modal');
        this.connectModalClose = document.getElementById('web3-modal-close');
        this.txModal = document.getElementById('web3-tx-modal');
        this.txModalClose = document.getElementById('web3-tx-close');
        this.txTitle = document.getElementById('tx-modal-title');
        this.txSpinner = document.getElementById('tx-spinner');
        this.txStatus = document.getElementById('tx-modal-status');
        this.txDetails = document.getElementById('tx-modal-details');
        this.txDoneBtn = document.getElementById('tx-modal-done-btn');
        this.txLogList = document.getElementById('tx-log-list');
        this.txLogStatus = document.getElementById('tx-log-status');
        this.mmStatus = document.getElementById('mm-status');
        this.soundSuccess = document.getElementById('sound-success');
        this.connected = false;
        this.account = null;
        this.provider = null;
        this.ethPriceUsd = 3420.25;
        this.btcPriceUsd = 68540.80;
        this.solPriceUsd = 172.30;
        this.maticPriceUsd = 0.89;
        this.init();
    }

    init() {
        if (!this.connectBtn) return;
        this.detectMetaMask();
        this.fetchLivePrices();
        setInterval(() => this.fetchLivePrices(), 30000);
        this.connectBtn.addEventListener('click', () => {
            playClickSound();
            if (this.connected) { this.disconnectWallet(); } else { this.connectModal.classList.remove('hidden'); }
        });
        this.connectModalClose.addEventListener('click', () => { playClickSound(); this.connectModal.classList.add('hidden'); });
        document.querySelectorAll('.wallet-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const wallet = opt.getAttribute('data-wallet');
                this.connectModal.classList.add('hidden');
                if (wallet === 'metamask' && window.ethereum) {
                    this.connectRealMetaMask();
                } else {
                    this.simulateConnection(wallet);
                }
            });
        });
        this.signBtn && this.signBtn.addEventListener('click', () => this.doSign());
        this.sendBtn && this.sendBtn.addEventListener('click', () => this.doSend());
        this.txModalClose.addEventListener('click', () => { this.txModal.classList.add('hidden'); });
        this.txDoneBtn.addEventListener('click', () => { playClickSound(); this.txModal.classList.add('hidden'); });
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) { this.disconnectWallet(); } else { this.account = accounts[0]; this.updateAddressUI(); this.fetchBalance(); }
            });
            window.ethereum.on('chainChanged', () => { if (this.connected) this.fetchChainInfo(); });
        }
    }

    detectMetaMask() {
        if (!this.mmStatus) return;
        if (window.ethereum && window.ethereum.isMetaMask) {
            this.mmStatus.textContent = 'Installed';
            this.mmStatus.style.color = 'var(--accent-cyan)';
        } else {
            this.mmStatus.textContent = 'Not Found';
            this.mmStatus.style.color = 'var(--accent-error, #ff6b6b)';
        }
    }

    async connectRealMetaMask() {
        this.showTxModal('Connecting MetaMask', 'Requesting account access...');
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.account = accounts[0];
            this.provider = window.ethereum;
            await this.fetchChainInfo();
            await this.fetchBalance();
            this.connected = true;
            this.playSuccessChime();
            this.txModal.classList.add('hidden');
            this.updateConnectedUI('MetaMask Extension (Real EIP-1193)');
            this.addTxLog('info', `Real wallet connected: ${this.account.slice(0,6)}...${this.account.slice(-4)}`);
        } catch (err) {
            this.txStatus.textContent = 'Connection rejected: ' + err.message;
            this.txSpinner.classList.add('hidden');
            this.txDoneBtn.textContent = 'Dismiss';
            this.txDoneBtn.classList.remove('hidden');
            this.addTxLog('error', 'Connection rejected by user');
        }
    }

    async fetchChainInfo() {
        if (!window.ethereum) return;
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const networkName = CHAIN_NAMES[chainId] || `Unknown Chain (${chainId})`;
            this.networkVal.textContent = networkName;
            this.chainVal.textContent = `${chainId} (${parseInt(chainId, 16)})`;
        } catch(e) {}
    }

    async fetchBalance() {
        if (!window.ethereum || !this.account) return;
        try {
            const balHex = await window.ethereum.request({ method: 'eth_getBalance', params: [this.account, 'latest'] });
            const balWei = parseInt(balHex, 16);
            const balEth = (balWei / 1e18).toFixed(4);
            this.balanceVal.textContent = `${balEth} ETH`;
        } catch(e) {
            this.balanceVal.textContent = 'Error fetching';
        }
    }

    async doSign() {
        playClickSound();
        if (!this.connected) return;
        this.txTitle.textContent = 'Personal Sign Request';
        this.txSpinner.classList.remove('hidden');
        this.txStatus.textContent = 'Preparing EIP-191 message...';
        this.txDoneBtn.classList.add('hidden');
        this.txDetails.classList.add('hidden');
        this.txModal.classList.remove('hidden');
        const timestamp = Date.now();
        const message = `Welcome to LeanEth Ventures API Portfolio.\n\nChallenge: ${timestamp}\nClient: GuestNode_${Math.floor(Math.random()*9999)}`;
        if (this.provider && this.account) {
            try {
                const sig = await this.provider.request({ method: 'personal_sign', params: [message, this.account] });
                this.txSpinner.classList.add('hidden');
                this.txStatus.textContent = 'Signature authorized!';
                this.txDetails.textContent = `Signature:\n${sig}\n\nMessage:\n"${message}"`;
                this.txDetails.classList.remove('hidden');
                this.txDoneBtn.textContent = 'Dismiss';
                this.txDoneBtn.classList.remove('hidden');
                this.playSuccessChime();
                this.addTxLog('success', `Signed: ${sig.slice(0,10)}...`);
            } catch(err) {
                this.txSpinner.classList.add('hidden');
                this.txStatus.textContent = 'Signature rejected.';
                this.txDoneBtn.textContent = 'Dismiss';
                this.txDoneBtn.classList.remove('hidden');
                this.addTxLog('error', 'Signature rejected by user');
            }
        } else {
            this.simulateSignature(message);
        }
    }

    async doSend() {
        playClickSound();
        if (!this.connected) return;
        this.txTitle.textContent = 'Send ETH Transaction';
        this.txSpinner.classList.remove('hidden');
        this.txStatus.textContent = 'Estimating gas...';
        this.txDoneBtn.classList.add('hidden');
        this.txDetails.classList.add('hidden');
        this.txModal.classList.remove('hidden');
        const gasLimit = 21000;
        const to = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
        const value = '0x' + (0.001 * 1e18).toString(16);
        const payload = `Method: eth_sendTransaction\nTo: ${to}\nValue: 0.001 ETH\nGas: ${gasLimit}`;
        this.txDetails.textContent = payload;
        this.txDetails.classList.remove('hidden');
        setTimeout(() => {
            this.txSpinner.classList.add('hidden');
            this.txStatus.textContent = 'Confirm transaction in your wallet:';
            this.txDoneBtn.textContent = 'Broadcast Tx';
            this.txDoneBtn.classList.remove('hidden');
            this.txDoneBtn.onclick = async () => {
                this.txDoneBtn.classList.add('hidden');
                this.txSpinner.classList.remove('hidden');
                this.txStatus.textContent = 'Broadcasting...';
                if (this.provider && this.account) {
                    try {
                        const txHash = await this.provider.request({ method: 'eth_sendTransaction', params: [{ from: this.account, to, value, gas: '0x' + gasLimit.toString(16) }] });
                        this.txSpinner.classList.add('hidden');
                        this.txStatus.textContent = 'Tx Broadcasted!';
                        this.txDetails.textContent = `Transaction Hash:\n${txHash}`;
                        this.txDoneBtn.textContent = 'Awesome';
                        this.txDoneBtn.classList.remove('hidden');
                        this.txDoneBtn.onclick = () => this.txModal.classList.add('hidden');
                        this.playSuccessChime();
                        this.addTxLog('success', `Tx: ${txHash.slice(0,12)}...`);
                    } catch(e) {
                        this.txSpinner.classList.add('hidden');
                        this.txStatus.textContent = 'Transaction rejected.';
                        this.txDoneBtn.textContent = 'Dismiss';
                        this.txDoneBtn.classList.remove('hidden');
                        this.txDoneBtn.onclick = () => this.txModal.classList.add('hidden');
                        this.addTxLog('error', 'Transaction rejected');
                    }
                } else {
                    this.simulateTransaction();
                }
            };
        }, 1500);
    }

    simulateConnection(walletName) {
        this.showTxModal(`Connecting ${walletName}`, `Opening session bridge...`);
        setTimeout(() => {
            this.txStatus.textContent = 'Awaiting cryptographic handshake...';
            setTimeout(() => {
                this.connected = true;
                this.playSuccessChime();
                this.txModal.classList.add('hidden');
                const walletsMap = {
                    walletconnect: { name: 'WalletConnect Bridge', addr: '0x3a9Fe56EC7b11c098defB751B7401B5f6d887a02', bal: '12.450 ETH', chain: '0x1' },
                    coinbase: { name: 'Coinbase Wallet SDK', addr: '0x2F71c765Ecab88b098d5f751B7401B5f6d8976B2', bal: '1.042 ETH', chain: '0x1' },
                    ledger: { name: 'Ledger Nano Hardware', addr: '0x88fA765EC7ab88b098defB751B7401B5f6d89700', bal: '42.080 ETH', chain: '0x1' }
                };
                const data = walletsMap[walletName] || walletsMap.walletconnect;
                this.account = data.addr;
                this.networkVal.textContent = CHAIN_NAMES[data.chain] || 'Ethereum Mainnet';
                this.chainVal.textContent = `${data.chain} (1)`;
                this.balanceVal.textContent = data.bal;
                this.updateConnectedUI(`${data.name} (Demo Mode)`);
                this.addTxLog('info', `Demo wallet connected: ${data.addr.slice(0,6)}...${data.addr.slice(-4)}`);
            }, 1800);
        }, 1200);
    }

    simulateSignature(message) {
        setTimeout(() => {
            this.txSpinner.classList.add('hidden');
            const r = '0x' + Array.from({length:64}, ()=>Math.floor(Math.random()*16).toString(16)).join('');
            const s = '0x' + Array.from({length:64}, ()=>Math.floor(Math.random()*16).toString(16)).join('');
            this.txStatus.textContent = 'Demo signature generated!';
            this.txDetails.textContent = `Signature (simulated):\n${r.slice(0,40)}...${s.slice(-10)}`;
            this.txDetails.classList.remove('hidden');
            this.txDoneBtn.textContent = 'Dismiss';
            this.txDoneBtn.classList.remove('hidden');
            this.txDoneBtn.onclick = () => this.txModal.classList.add('hidden');
            this.playSuccessChime();
        }, 2000);
    }

    simulateTransaction() {
        setTimeout(() => {
            this.playSuccessChime();
            this.txSpinner.classList.add('hidden');
            const hash = '0x' + Array.from({length:64}, ()=>Math.floor(Math.random()*16).toString(16)).join('');
            this.txStatus.textContent = 'Transaction Success! Confirmed in Block.';
            this.txDetails.textContent = `Receipt:\n{\n  "status": "0x1 (Success)",\n  "transactionHash": "${hash}",\n  "blockNumber": 19827452,\n  "gasUsed": 21000\n}`;
            this.txDoneBtn.textContent = 'Awesome';
            this.txDoneBtn.classList.remove('hidden');
            this.txDoneBtn.onclick = () => this.txModal.classList.add('hidden');
            this.addTxLog('success', `Tx: ${hash.slice(0,12)}...`);
        }, 3500);
    }

    showTxModal(title, status) {
        this.txTitle.textContent = title;
        this.txSpinner.classList.remove('hidden');
        this.txDetails.classList.add('hidden');
        this.txDoneBtn.classList.add('hidden');
        this.txStatus.textContent = status;
        this.txModal.classList.remove('hidden');
    }

    updateConnectedUI(providerName) {
        this.connectBtn.textContent = 'Disconnect';
        this.connectBtn.classList.add('btn-secondary');
        this.connectBtn.classList.remove('btn-glow');
        this.statusBadge.textContent = 'CONNECTED';
        this.statusBadge.className = 'wallet-badge connected';
        this.providerVal.textContent = providerName;
        this.addressVal.textContent = this.account ? `${this.account.slice(0,6)}...${this.account.slice(-4)}` : '—';
        this.actionsSection.classList.remove('hidden');
        this.txLogStatus.textContent = 'Active';
    }

    updateAddressUI() {
        if (this.account) this.addressVal.textContent = `${this.account.slice(0,6)}...${this.account.slice(-4)}`;
    }

    disconnectWallet() {
        this.connected = false;
        this.account = null;
        this.provider = null;
        this.connectBtn.textContent = 'Connect Wallet';
        this.connectBtn.classList.remove('btn-secondary');
        this.connectBtn.classList.add('btn-glow');
        this.statusBadge.textContent = 'DISCONNECTED';
        this.statusBadge.className = 'wallet-badge';
        this.providerVal.textContent = '-';
        this.addressVal.textContent = '0x0000...0000';
        this.balanceVal.textContent = '0.00 ETH';
        this.networkVal.textContent = 'Not Connected';
        this.chainVal.textContent = '-';
        this.actionsSection.classList.add('hidden');
        this.txLogStatus.textContent = 'Idle';
        this.addTxLog('info', 'Wallet disconnected.');
    }

    addTxLog(type, message) {
        if (!this.txLogList) return;
        const stub = this.txLogList.querySelector('.text-muted');
        if (stub) stub.remove();
        const el = document.createElement('div');
        el.className = `tx-log-item tx-log-${type}`;
        const ts = new Date().toLocaleTimeString();
        el.textContent = `[${ts}] ${message}`;
        this.txLogList.prepend(el);
        if (this.txLogList.children.length > 20) this.txLogList.lastChild.remove();
    }

    playSuccessChime() {
        if (this.soundSuccess) { this.soundSuccess.currentTime = 0; this.soundSuccess.play().catch(()=>{}); }
    }

    async fetchLivePrices() {
        try {
            const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,matic-network&vs_currencies=usd&include_24hr_change=true');
            if (!res.ok) throw new Error('CoinGecko rate limited');
            const d = await res.json();
            const update = (el, chEl, price, chg) => {
                if (!el || !chEl) return;
                el.textContent = '$' + price.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
                chEl.textContent = (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%';
                chEl.className = 'coin-change ' + (chg >= 0 ? 'text-success' : 'text-error');
            };
            if (d.ethereum) { this.ethPriceUsd = d.ethereum.usd; update(this.ethPrice, this.ethChange, d.ethereum.usd, d.ethereum.usd_24h_change); }
            if (d.bitcoin)  { this.btcPriceUsd = d.bitcoin.usd;  update(this.btcPrice, this.btcChange, d.bitcoin.usd, d.bitcoin.usd_24h_change); }
            if (d.solana)   { this.solPriceUsd = d.solana.usd;   update(this.solPrice, this.solChange, d.solana.usd, d.solana.usd_24h_change); }
            if (d['matic-network']) { this.maticPriceUsd = d['matic-network'].usd; update(this.maticPrice, this.maticChange, d['matic-network'].usd, d['matic-network'].usd_24h_change); }
            this.redrawChartPath(true);
            const now = new Date();
            if (this.updateTime) this.updateTime.textContent = 'Live Updates * ' + now.toLocaleTimeString();
        } catch(e) {
            this.driftPrices();
            this.redrawChartPath(false);
        }
    }

    driftPrices() {
        const drift = (val, mag) => val + (Math.random()-0.5)*mag;
        this.ethPriceUsd = drift(this.ethPriceUsd, 10);
        this.btcPriceUsd = drift(this.btcPriceUsd, 200);
        this.solPriceUsd = drift(this.solPriceUsd, 3);
        this.maticPriceUsd = drift(this.maticPriceUsd, 0.02);
        const fmt = (v, d=2) => '$' + v.toLocaleString(undefined, {minimumFractionDigits:d, maximumFractionDigits:d});
        if (this.ethPrice) this.ethPrice.textContent = fmt(this.ethPriceUsd);
        if (this.btcPrice) this.btcPrice.textContent = fmt(this.btcPriceUsd);
        if (this.solPrice) this.solPrice.textContent = fmt(this.solPriceUsd);
        if (this.maticPrice) this.maticPrice.textContent = fmt(this.maticPriceUsd, 4);
        const now = new Date();
        if (this.updateTime) this.updateTime.textContent = 'Simulated Feed * ' + now.toLocaleTimeString();
    }

    redrawChartPath(isLive) {
        const path = document.getElementById('chart-glow-path');
        const fill = document.getElementById('chart-area-path');
        if (!path || !fill) return;
        const r = (base, range) => base + (Math.random()-0.5)*range;
        const d = `M 0 ${r(100,15)} Q 100 ${r(80,15)} 200 ${r(90,20)} T 400 ${r(50,25)} T 500 ${isLive ? r(25,10) : r(35,10)}`;
        path.setAttribute('d', d);
        fill.setAttribute('d', d + ' L 500 150 L 0 150 Z');
    }
}

export function initWeb3() {
    new Web3IdentityBridge();
}
