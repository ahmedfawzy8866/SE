"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentOrchestrator = void 0;
var registry_1 = require("./registry");
var obedian_1 = require("@sierra-estates/obedian");
var generative_ai_1 = require("@google/generative-ai");
var AgentOrchestrator = /** @class */ (function () {
    function AgentOrchestrator(config) {
        if (config === void 0) { config = {}; }
        this.genAI = null;
        var apiKey = config.apiKey || process.env.GOOGLE_AI_API_KEY;
        if (apiKey) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        }
        this.defaultModel = config.defaultModel || 'gemini-flash-latest';
        this.runCompletionCustom = config.runCompletion;
    }
    /**
     * Helper to execute completions, using custom callback or direct SDK
     */
    AgentOrchestrator.prototype.executeCompletion = function (agentName, stage, systemPrompt, userPrompt) {
        return __awaiter(this, void 0, void 0, function () {
            var model, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.runCompletionCustom) {
                            return [2 /*return*/, this.runCompletionCustom(agentName, stage, systemPrompt, userPrompt)];
                        }
                        if (!this.genAI) {
                            throw new Error("[AgentOrchestrator] Direct execution failed: GOOGLE_AI_API_KEY is not configured.");
                        }
                        model = this.genAI.getGenerativeModel({
                            model: this.defaultModel,
                            generationConfig: { temperature: 0.2 },
                            systemInstruction: systemPrompt,
                        });
                        return [4 /*yield*/, model.generateContent(userPrompt)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.response.text()];
                }
            });
        });
    };
    /**
     * Query all shared knowledge stored in Obedian Memory
     */
    AgentOrchestrator.prototype.getSharedKnowledge = function () {
        return __awaiter(this, void 0, void 0, function () {
            var memories;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, obedian_1.obedian.search('', ['shared-knowledge'])];
                    case 1:
                        memories = _a.sent();
                        if (memories.length === 0) {
                            return [2 /*return*/, 'No prior shared knowledge found.'];
                        }
                        return [2 /*return*/, memories
                                .map(function (m) {
                                return "[Source: ".concat(m.id, " | Date: ").concat(m.updatedAt, "]\nTags: ").concat(m.tags.join(', '), "\nContent: ").concat(typeof m.value === 'string' ? m.value : JSON.stringify(m.value, null, 2));
                            })
                                .join('\n\n---\n\n')];
                }
            });
        });
    };
    /**
     * Add new knowledge to the shared memory pool
     */
    AgentOrchestrator.prototype.addSharedKnowledge = function (id_1, value_1) {
        return __awaiter(this, arguments, void 0, function (id, value, tags) {
            var allTags;
            if (tags === void 0) { tags = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        allTags = __spreadArray(['shared-knowledge'], tags, true);
                        return [4 /*yield*/, obedian_1.obedian.set(id, value, allTags)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executes a single agent task. The system prompt is automatically enriched
     * with the shared knowledge of all other agents from Obedian memory.
     */
    AgentOrchestrator.prototype.runAgentTask = function (agentName, taskDescription, additionalContext) {
        return __awaiter(this, void 0, void 0, function () {
            var agent, sharedIntel, enrichedSystemPrompt, userPrompt, output, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[Orchestrator] Starting task for agent: ".concat(agentName));
                        agent = registry_1.registry.getAgent(agentName);
                        if (!agent) {
                            return [2 /*return*/, {
                                    agentName: agentName,
                                    status: 'failed',
                                    output: '',
                                    error: "Agent \"".concat(agentName, "\" not found in registry."),
                                }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.getSharedKnowledge()];
                    case 2:
                        sharedIntel = _a.sent();
                        enrichedSystemPrompt = "\n".concat(agent.systemPrompt, "\n\n=========================================\n\uD83E\uDDE0 SHARED COGNITIVE MEMORY (OBEDIAN STORE)\n=========================================\nAll agents share the knowledge below. You must use this context to inform your decision-making and ensure alignment with other specialists' progress and findings:\n\n").concat(sharedIntel, "\n=========================================\n");
                        userPrompt = "\nTASK DESCRIPTION:\n".concat(taskDescription, "\n\n").concat(additionalContext ? "ADDITIONAL CONTEXT:\n".concat(additionalContext) : '', "\n\nPlease execute this task and return your final response/results. Ensure your response is detailed, professional, and directly addresses the goal.\n");
                        return [4 /*yield*/, this.executeCompletion(agent.name, 'execute-task', enrichedSystemPrompt.trim(), userPrompt.trim())];
                    case 3:
                        output = _a.sent();
                        // 5. Save the output to Shared Memory so other agents learn from this execution
                        return [4 /*yield*/, this.addSharedKnowledge("agent-task-".concat(agentName, "-").concat(Date.now()), {
                                taskDescription: taskDescription,
                                output: output,
                            }, [agentName, 'task-execution'])];
                    case 4:
                        // 5. Save the output to Shared Memory so other agents learn from this execution
                        _a.sent();
                        return [2 /*return*/, {
                                agentName: agentName,
                                status: 'success',
                                output: output,
                            }];
                    case 5:
                        err_1 = _a.sent();
                        console.error("[Orchestrator] Failed task execution for ".concat(agentName, ":"), err_1);
                        return [2 /*return*/, {
                                agentName: agentName,
                                status: 'failed',
                                output: '',
                                error: err_1.message || String(err_1),
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Coordinated pipeline execution. Orchestrates multiple agents in sequence.
     */
    AgentOrchestrator.prototype.orchestratePipeline = function (pipelineName, steps, initialContext) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, steps_1, step, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDE80 [Orchestrator] Running coordinated pipeline: ".concat(pipelineName));
                        if (!initialContext) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.addSharedKnowledge("".concat(pipelineName, "-initial-context"), initialContext, ['pipeline-context'])];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        results = [];
                        _i = 0, steps_1 = steps;
                        _a.label = 3;
                    case 3:
                        if (!(_i < steps_1.length)) return [3 /*break*/, 6];
                        step = steps_1[_i];
                        return [4 /*yield*/, this.runAgentTask(step.agentName, step.taskDescription, "Pipeline Step Context: Running pipeline \"".concat(pipelineName, "\""))];
                    case 4:
                        result = _a.sent();
                        results.push(result);
                        if (result.status === 'failed') {
                            console.warn("\u26A0\uFE0F [Orchestrator] Step failed for ".concat(step.agentName, ". Continuing pipeline..."));
                        }
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, results];
                }
            });
        });
    };
    return AgentOrchestrator;
}());
exports.AgentOrchestrator = AgentOrchestrator;
