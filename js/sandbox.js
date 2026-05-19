/* DEVELOPER API PLAYGROUND SANDBOX - LEANETH VENTURES */

import { playClickSound } from './router.js';

// Predefined payload data mappings - Wrapped in backticks to prevent JS compilation syntax errors
const PAYLOADS = {
    "/api/v1/auth/login": {
        request: `{
  "client_id": "leaneth_demo_key",
  "client_secret": "ls_sec_918274a10f92b7"
}`,
        response: `{
  "status": "success",
  "token_type": "Bearer",
  "access_token": "leaneth_jwt_session_827f8190c102a94f8281",
  "expires_in": 3600,
  "scope": [
    "analytics.read",
    "web3.bridge",
    "webhooks.dispatch"
  ],
  "permissions": "guest_developer"
}`,
        headers: `content-type: application/json
x-leaneth-node: tokyo-edge-4
cache-control: no-store`,
        status: "200 OK",
        latency: "12ms"
    },
    "/api/v1/analytics/realtime": {
        request: `{
  "cluster_id": "tokyo_edge_node_4",
  "metrics": [
    "cpu",
    "memory",
    "request_count"
  ]
}`,
        response: `{
  "timestamp": 1779226511937,
  "node_status": "healthy",
  "cpu_utilization_percent": 14.82,
  "memory_used_mb": 4092.45,
  "active_sockets_connections": 1284,
  "ingress_throughput_mb_s": 84.15,
  "egress_throughput_mb_s": 142.08
}`,
        headers: `content-type: application/json
x-leaneth-node: tokyo-edge-4
x-cache: MISS`,
        status: "200 OK",
        latency: "18ms"
    },
    "/api/v1/webhooks/dispatch": {
        request: `{
  "target_url": "https://your-server.com/api/v1/hooks",
  "event": "transaction.confirmed",
  "payload_format": "json"
}`,
        response: `{
  "webhook_id": "wh_disp_9102874a12",
  "delivery_status": "accepted",
  "queued_timestamp": 1779226521990,
  "retry_policy": {
    "max_attempts": 5,
    "exponential_backoff_seconds": 10
  }
}`,
        headers: `content-type: application/json
x-leaneth-node: tokyo-edge-2
x-webhook-signature: sha256=9b496daa50454d36...`,
        status: "202 Accepted",
        latency: "28ms"
    },
    "/api/v1/ai/generate": {
        request: `{
  "model": "leaneth-quantum-llama",
  "prompt": "What makes high-performance API structures premium?",
  "temperature": 0.2
}`,
        response: `{
  "model": "leaneth-quantum-llama-v2",
  "object": "text_completion",
  "completion": "Premium API architectures achieve greatness via modular abstractions, glassmorphic UI dashboards, minimal connection handshakes, live low-latency ticker streams, and robust error-rate throttlers.",
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 34,
    "total_tokens": 46
  }
}`,
        headers: `content-type: application/json
x-leaneth-node: tokyo-gpu-edge-1
x-ai-provider: LeanEthLLM`,
        status: "200 OK",
        latency: "84ms"
    },
    "/api/v1/rate-limit-test": {
        request: `{
  "action": "flood_test_trigger"
}`,
        response: `{
  "status": "success",
  "message": "Call registered. Keep clicking rapidly to flood the Edge node cluster and trigger an EIP-429 Rate Limiter response."
}`,
        headers: `content-type: application/json
x-leaneth-node: tokyo-edge-4
x-ratelimit-limit: 5
x-ratelimit-remaining: 4`,
        status: "200 OK",
        latency: "8ms"
    }
};

class SandboxEngine {
    constructor() {
        this.endpointSelect = document.getElementById('api-endpoint-select');
        this.payloadInput = document.getElementById('api-payload-input');
        this.fireBtn = document.getElementById('btn-fire-api');
        
        // Terminal elements
        this.termStatus = document.getElementById('term-status-code');
        this.termLatency = document.getElementById('term-stat-latency');
        this.termRateLimit = document.getElementById('term-stat-ratelimit');
        this.terminalOutput = document.getElementById('terminal-output');
        
        // Counter variables
        this.rateLimitCalls = 0;
        this.rateLimitTimer = null;
        this.activeEndpoint = '/api/v1/auth/login';

        this.init();
    }

    init() {
        if (!this.endpointSelect) return;

        // Change select action
        this.endpointSelect.addEventListener('change', () => {
            playClickSound();
            this.activeEndpoint = this.endpointSelect.value;
            this.updateInputPayload();
        });

        // Fire call click
        this.fireBtn.addEventListener('click', () => this.executeCall());
    }

    updateInputPayload() {
        const data = PAYLOADS[this.activeEndpoint];
        if (data) {
            this.payloadInput.value = data.request;
        }
    }

    executeCall() {
        playClickSound();
        const payloadText = this.payloadInput.value.trim();
        let validatedPayload = payloadText;

        // Validate JSON
        try {
            if (payloadText) {
                JSON.parse(payloadText);
            }
        } catch (e) {
            alert('Invalid Request JSON format. Please ensure syntax has opening and closing braces.');
            return;
        }

        // Disable button while query is processed
        this.fireBtn.disabled = true;
        this.fireBtn.textContent = 'EXECUTING TRANSACTION...';

        // Clear terminal output screen and prepare curl command log
        this.terminalOutput.innerHTML = `
            <div class="terminal-line text-muted">// Transmitting client query payload to cluster nodes...</div>
            <div class="terminal-line text-cyan">guest@leaneth-edge-server ~ % curl -X ${this.activeEndpoint.includes('login') || this.activeEndpoint.includes('dispatch') || this.activeEndpoint.includes('generate') ? 'POST' : 'GET'} https://api.leaneth.com${this.activeEndpoint} \\</div>
            <div class="terminal-line text-cyan">  -H "Content-Type: application/json" \\</div>
            <div class="terminal-line text-cyan">  -H "Authorization: Bearer leaneth_token_xyz" \\</div>
            <div class="terminal-line text-cyan">  -d '${validatedPayload.replace(/\n/g, '')}'</div>
            <div class="terminal-line text-muted">// Awaiting handshake response...</div>
        `;

        // Check for Rate Limit test flood
        if (this.activeEndpoint === '/api/v1/rate-limit-test') {
            this.rateLimitCalls++;
            
            // Clear decay timer
            if (this.rateLimitTimer) clearTimeout(this.rateLimitTimer);
            
            // Reset call count after 6 seconds of inactivity
            this.rateLimitTimer = setTimeout(() => {
                this.rateLimitCalls = 0;
            }, 6000);
        }

        const endpointData = PAYLOADS[this.activeEndpoint];
        
        // Simulating Node Network Latency
        setTimeout(() => {
            let status = endpointData.status;
            let responseBody = endpointData.response;
            let headers = endpointData.headers;
            let latency = endpointData.latency;

            // Trigger EIP-429 Rate Limiting if they clicked rate-limit-test more than 4 times rapidly
            if (this.activeEndpoint === '/api/v1/rate-limit-test' && this.rateLimitCalls >= 5) {
                status = "429 Too Many Requests";
                latency = "5ms";
                responseBody = `{
  "error": "too_many_requests",
  "message": "API Quota exceeded. Rate limit is locked to 5 requests per 10 seconds to prevent cluster denial.",
  "retry_after_seconds": 10
}`;
                headers = `content-type: application/json
x-leaneth-node: tokyo-edge-4
x-ratelimit-limit: 5
x-ratelimit-remaining: 0
x-ratelimit-reset: 10`;
                
                this.termStatus.className = "terminal-badge badge-error";
                this.termRateLimit.className = "text-error";
                this.termRateLimit.textContent = "0/5 remaining (LOCKED)";
            } else {
                this.termStatus.className = "terminal-badge";
                this.termRateLimit.className = "";
                
                // Update Rate Limit remaining counter display
                if (this.activeEndpoint === '/api/v1/rate-limit-test') {
                    const remaining = Math.max(0, 5 - this.rateLimitCalls);
                    this.termRateLimit.textContent = `${remaining}/5 remaining`;
                } else {
                    this.termRateLimit.textContent = "99/100 remaining";
                }
            }

            // Update terminal metrics top bars
            this.termStatus.textContent = status;
            this.termLatency.textContent = latency;

            // Print formatted response back to terminal console screen
            const logLineHeaders = document.createElement('div');
            logLineHeaders.className = 'terminal-line text-muted';
            logLineHeaders.textContent = `\nHTTP/1.1 ${status}\n${headers}\n`;
            
            const logLineBody = document.createElement('div');
            logLineBody.className = status.includes('429') ? 'terminal-line text-error' : 'terminal-line text-success';
            logLineBody.textContent = responseBody;

            const logPromptLine = document.createElement('div');
            logPromptLine.className = 'terminal-line text-cyan';
            logPromptLine.textContent = `\nguest@leaneth-edge-server ~ % _`;

            this.terminalOutput.appendChild(logLineHeaders);
            this.terminalOutput.appendChild(logLineBody);
            this.terminalOutput.appendChild(logPromptLine);
            
            // Auto scroll console to bottom
            this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;

            // Restore fire button
            this.fireBtn.disabled = false;
            this.fireBtn.textContent = 'EXECUTE CALL';

        }, parseInt(endpointData.latency) * 3 + 200); // realistic latency multiplication + connection wait
    }
}

export function initSandbox() {
    new SandboxEngine();
}
