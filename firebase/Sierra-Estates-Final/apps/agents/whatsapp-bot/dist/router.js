"use strict";
/**
 * WhatsApp Bot Router - Sierra Estates
 *
 * This is the central dispatcher for all incoming WhatsApp messages.
 * It determines which agent should handle each message and coordinates
 * the full response pipeline:
 *
 *   Liela  ← first contact / triage / direct assist
 *   Sierra ← property search / analysis / recommendations
 *   OpenClaw ← property data lookup / verification
 *   Hermes ← message formatting / delivery / routing
 *   CloserAgent ← deals stage 7-9 / signing
 *
 * Flow:
 *   1. Incoming WhatsApp message
 *   2. Router classifies intent
 *   3. Routes to Liela (always first for new clients)
 *   4. Liela may request Sierra for property search
 *   5. Sierra calls OpenClaw for data
 *   6. Sierra returns recommendations to Liela
 *   7. Liela formats response via Hermes
 *   8. Hermes delivers to WhatsApp
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = exports.WhatsAppBotRouter = void 0;
exports.classifyIntent = classifyIntent;
exports.determineUrgency = determineUrgency;
exports.routeMessage = routeMessage;
var agents_core_1 = require("@sierra-estates/agents-core");
var memory_engine_1 = require("@sierra-estates/memory-engine");
// ─────────────────────────────────────────────────────────────────────────────
// Intent Classifier
// ─────────────────────────────────────────────────────────────────────────────
var PROPERTY_CODE_PATTERN = /\b(SE|SB|SBE|PROP)[- ]?(\d{3,6})\b/i;
var INTENT_PATTERNS = [
    {
        intent: 'closing',
        patterns: [/عقد|contract|توقيع|sign|هاخد|confirmed|بدفع|دفع|عربون|حجز|deposit|downpayment/i],
    },
    {
        intent: 'viewing_request',
        patterns: [/معاينة|مشاهدة|اشوف|أزور|ازور|viewing|visit|زيارة|موعد/i],
    },
    {
        intent: 'price_inquiry',
        patterns: [/سعر|price|كام|بكام|ايجار|rent|تمن/i],
    },
    {
        intent: 'availability_check',
        patterns: [
            /متاح|available|فاضي|فاضية|موجود/i,
            new RegExp(PROPERTY_CODE_PATTERN.source + '\\s*(متاح|available|فاضي|فاضية|موجود)', 'i'),
            new RegExp('(متاح|available|فاضي|فاضية|موجود).*' + PROPERTY_CODE_PATTERN.source, 'i')
        ],
    },
    {
        intent: 'property_inquiry',
        patterns: [PROPERTY_CODE_PATTERN],
    },
    {
        intent: 'property_search',
        patterns: [/ابحث|عايز|محتاج|أريد|looking for|شقة|فيلا|apartment|villa|غرف|bedroom/i],
    },
    {
        intent: 'complaint',
        patterns: [/مش كويس|زعلان|مشكلة|problem|complaint|disappointed|ما ردوش/i],
    },
    {
        intent: 'greeting',
        patterns: [/^(اهلا|مرحبا|السلام|hi|hello|hey|صباح|مساء).{0,30}$/i],
    },
];
function classifyIntent(body) {
    for (var _i = 0, INTENT_PATTERNS_1 = INTENT_PATTERNS; _i < INTENT_PATTERNS_1.length; _i++) {
        var _a = INTENT_PATTERNS_1[_i], intent = _a.intent, patterns = _a.patterns;
        if (patterns.some(function (p) { return p.test(body); })) {
            return intent;
        }
    }
    return 'unknown';
}
function determineUrgency(intent, history) {
    if (intent === 'closing')
        return 'critical';
    if (intent === 'complaint')
        return 'high';
    if (intent === 'viewing_request')
        return 'high';
    if (intent === 'availability_check' || intent === 'property_inquiry')
        return 'medium';
    if (history.length === 0)
        return 'medium'; // New client always medium+
    return 'low';
}
function routeMessage(intent, urgency, isNewClient) {
    // Critical path: ready to close
    if (intent === 'closing') {
        return {
            primaryAgent: 'closer',
            supportingAgents: ['liela', 'hermes'],
            intent: intent,
            urgency: 'critical',
        };
    }
    // Human escalation for complaints
    if (intent === 'complaint' || urgency === 'critical') {
        return {
            primaryAgent: 'human',
            supportingAgents: ['liela', 'hermes'],
            intent: intent,
            urgency: 'high',
        };
    }
    // Property data needed
    if (['availability_check', 'property_inquiry', 'property_search', 'price_inquiry'].includes(intent)) {
        return {
            primaryAgent: 'liela',
            supportingAgents: ['sierra', 'openclaw', 'hermes'],
            intent: intent,
            urgency: urgency,
        };
    }
    // Viewing coordination
    if (intent === 'viewing_request') {
        return {
            primaryAgent: 'liela',
            supportingAgents: ['sierra', 'hermes'],
            intent: intent,
            urgency: 'high',
        };
    }
    // Default: Liela handles with Hermes for delivery
    return {
        primaryAgent: 'liela',
        supportingAgents: ['hermes'],
        intent: intent,
        urgency: urgency,
    };
}
// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp Bot Router
// ─────────────────────────────────────────────────────────────────────────────
var WhatsAppBotRouter = /** @class */ (function () {
    function WhatsAppBotRouter(apiKey) {
        this.orchestrator = new agents_core_1.AgentOrchestrator({ apiKey: apiKey });
        console.log('[WhatsAppBotRouter] Initialized. Liela and Sierra are ready.');
    }
    /**
     * Main entry point. Call this for every incoming WhatsApp message.
     * Returns the response text to send back to the client.
     */
    WhatsAppBotRouter.prototype.handle = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var phone, startedAt, history_1, leadProfile, isNewClient, intent, urgency, route, context, response, elapsed, err_1, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        phone = msg.from.replace('@c.us', '').replace('@g.us', '');
                        startedAt = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        // 1. Record inbound message in shared memory
                        return [4 /*yield*/, memory_engine_1.sharedMemory.recordConversationTurn(phone, 'system', 'inbound', msg.body)
                            // 2. Get client history
                        ];
                    case 2:
                        // 1. Record inbound message in shared memory
                        _a.sent();
                        return [4 /*yield*/, memory_engine_1.sharedMemory.getClientHistory(phone)];
                    case 3:
                        history_1 = _a.sent();
                        return [4 /*yield*/, memory_engine_1.sharedMemory.getLeadProfile(phone)];
                    case 4:
                        leadProfile = _a.sent();
                        isNewClient = history_1.length === 0;
                        intent = classifyIntent(msg.body);
                        urgency = determineUrgency(intent, history_1);
                        route = routeMessage(intent, urgency, isNewClient);
                        console.log("[Router] ".concat(phone, " | intent=").concat(intent, " | urgency=").concat(urgency, " | route=").concat(route.primaryAgent));
                        context = this.buildAgentContext(phone, msg, intent, history_1, leadProfile);
                        if (!(route.primaryAgent === 'human')) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.escalateToHuman(phone, msg, context)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, 'سيتواصل معك أحد مستشارينا في أقرب وقت. نعتذر عن أي إزعاج.'];
                    case 6: return [4 /*yield*/, this.runAgentPipeline(route, context, msg.body, phone)
                        // 7. Record outbound response in shared memory
                    ];
                    case 7:
                        response = _a.sent();
                        // 7. Record outbound response in shared memory
                        return [4 /*yield*/, memory_engine_1.sharedMemory.recordConversationTurn(phone, route.primaryAgent, 'outbound', response)];
                    case 8:
                        // 7. Record outbound response in shared memory
                        _a.sent();
                        elapsed = Date.now() - startedAt;
                        console.log("[Router] Response delivered in ".concat(elapsed, "ms"));
                        return [2 /*return*/, response];
                    case 9:
                        err_1 = _a.sent();
                        message = err_1 instanceof Error ? err_1.message : String(err_1);
                        console.error('[WhatsAppBotRouter] Error handling message:', message);
                        // Fallback response
                        return [2 /*return*/, 'عذراً، حدث خطأ مؤقت. سيتواصل معك فريقنا قريباً.'];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Run multi-agent pipeline based on routing decision
     */
    WhatsAppBotRouter.prototype.runAgentPipeline = function (route, context, userMessage, phone) {
        return __awaiter(this, void 0, void 0, function () {
            var needsData, needsAnalysis, enrichedContext, dataResult, analysisResult, lielResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        needsData = route.supportingAgents.includes('openclaw');
                        needsAnalysis = route.supportingAgents.includes('sierra');
                        enrichedContext = context;
                        if (!needsData) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.orchestrator.runAgentTask('openclaw', "Retrieve property data relevant to this client inquiry: ".concat(userMessage), context)];
                    case 1:
                        dataResult = _a.sent();
                        if (dataResult.status === 'success') {
                            enrichedContext += "\n\nOPENCLAW DATA:\n".concat(dataResult.output);
                        }
                        _a.label = 2;
                    case 2:
                        if (!needsAnalysis) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.orchestrator.runAgentTask('sierra', "Analyze client message and generate the best 1-3 property recommendations with response strategy: ".concat(userMessage), enrichedContext)];
                    case 3:
                        analysisResult = _a.sent();
                        if (analysisResult.status === 'success') {
                            enrichedContext += "\n\nSIERRA ANALYSIS:\n".concat(analysisResult.output);
                        }
                        _a.label = 4;
                    case 4: return [4 /*yield*/, this.orchestrator.runAgentTask('liela', "Generate a warm, professional WhatsApp response in Egyptian Arabic to this client message: \"".concat(userMessage, "\""), enrichedContext)];
                    case 5:
                        lielResult = _a.sent();
                        if (lielResult.status === 'success') {
                            return [2 /*return*/, lielResult.output];
                        }
                        return [2 /*return*/, 'أهلاً! سيتواصل معك أحد مستشارينا في أقرب وقت.'];
                }
            });
        });
    };
    /**
     * Build rich context string for agents
     */
    WhatsAppBotRouter.prototype.buildAgentContext = function (phone, msg, intent, history, leadProfile) {
        return "\nCLIENT CONTEXT:\n- Phone: ".concat(phone, "\n- Message Timestamp: ").concat(new Date(msg.timestamp * 1000).toISOString(), "\n- Source: ").concat(msg.groupName || 'Direct Message', "\n- Detected Intent: ").concat(intent, "\n- Is New Client: ").concat(history.length === 0, "\n- Conversation History Length: ").concat(history.length, " messages\n\nLEAD PROFILE:\n").concat(leadProfile ? JSON.stringify(leadProfile, null, 2) : 'No profile yet - this appears to be a new client', "\n\nRECENT CONVERSATION HISTORY (last 5 messages):\n").concat(history.slice(-5).map(function (h) { return JSON.stringify(h); }).join('\n') || 'None', "\n    ").trim();
    };
    /**
     * Escalate to human agent - send alert to team WhatsApp group
     */
    WhatsAppBotRouter.prototype.escalateToHuman = function (phone, msg, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.warn("[Router] ESCALATING TO HUMAN: ".concat(phone, " | Reason: complaint/critical"));
                        return [4 /*yield*/, memory_engine_1.sharedMemory.write("escalation-".concat(phone, "-").concat(Date.now()), {
                                phone: phone,
                                message: msg.body,
                                context: context,
                                escalatedAt: new Date().toISOString(),
                                reason: 'complaint-or-critical',
                            }, {
                                author: 'system',
                                tags: ['human-escalation', 'urgent', "phone-".concat(phone)],
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return WhatsAppBotRouter;
}());
exports.WhatsAppBotRouter = WhatsAppBotRouter;
// Singleton export
exports.router = new WhatsAppBotRouter(process.env.GOOGLE_AI_API_KEY);
exports.default = exports.router;
