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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentWorkflows = void 0;
var AgentWorkflows = /** @class */ (function () {
    function AgentWorkflows(orchestrator) {
        this.orchestrator = orchestrator;
    }
    /**
     * API Design & Implementation Workflow
     */
    AgentWorkflows.prototype.runApiWorkflow = function (taskDescription) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.orchestrator.orchestratePipeline('API Workflow', [
                        {
                            agentName: 'database-architect',
                            taskDescription: "Analyze requirements and design schema/models for: ".concat(taskDescription),
                        },
                        {
                            agentName: 'backend-specialist',
                            taskDescription: "Implement endpoints and business logic based on the schema design for: ".concat(taskDescription),
                        },
                        {
                            agentName: 'security-auditor',
                            taskDescription: "Audit the implemented endpoints for SQL injection, auth issues, and vulnerability checks.",
                        },
                        {
                            agentName: 'documentation-writer',
                            taskDescription: "Generate API reference docs and update status.",
                        },
                    ], taskDescription)];
            });
        });
    };
    /**
     * Debugging and Bugfixing Workflow
     */
    AgentWorkflows.prototype.runDebugWorkflow = function (taskDescription) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.orchestrator.orchestratePipeline('Debug Workflow', [
                        {
                            agentName: 'code-archaeologist',
                            taskDescription: "Trace logs, search codebase, and isolate root cause for: ".concat(taskDescription),
                        },
                        {
                            agentName: 'debugger',
                            taskDescription: "Develop fix, address syntax/logic issues, and refactor code.",
                        },
                        {
                            agentName: 'test-engineer',
                            taskDescription: "Verify changes by running/generating test cases.",
                        },
                    ], taskDescription)];
            });
        });
    };
    /**
     * Plan & Architecture Workflow
     */
    AgentWorkflows.prototype.runPlanWorkflow = function (taskDescription) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.orchestrator.orchestratePipeline('Plan Workflow', [
                        {
                            agentName: 'project-planner',
                            taskDescription: "Decompose task into atomic list of subtasks, estimate constraints: ".concat(taskDescription),
                        },
                        {
                            agentName: 'orchestrator',
                            agentName_fallback: 'orchestrator', // coordinate
                            taskDescription: "Review project architecture, dependencies, and verify alignment.",
                        },
                    ], taskDescription)];
            });
        });
    };
    /**
     * Security Audit Workflow
     */
    AgentWorkflows.prototype.runSecurityWorkflow = function (taskDescription) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.orchestrator.orchestratePipeline('Security Workflow', [
                        {
                            agentName: 'penetration-tester',
                            taskDescription: "Identify attack vectors and check dependencies for CVEs: ".concat(taskDescription),
                        },
                        {
                            agentName: 'security-auditor',
                            taskDescription: "Review code changes against OWASP standards.",
                        },
                    ], taskDescription)];
            });
        });
    };
    /**
     * Quality Audit & Compliance Check
     */
    AgentWorkflows.prototype.runAuditWorkflow = function (taskDescription) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.orchestrator.orchestratePipeline('Audit Workflow', [
                        {
                            agentName: 'quality-inspector',
                            taskDescription: "Verify compliance of code changes, lint issues, and guidelines: ".concat(taskDescription),
                        },
                        {
                            agentName: 'qa-automation-engineer',
                            taskDescription: "Run full test suite (lint, unit, build checks).",
                        },
                    ], taskDescription)];
            });
        });
    };
    /**
     * UI/UX Enhancement Workflow
     */
    AgentWorkflows.prototype.runUiUxWorkflow = function (taskDescription) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.orchestrator.orchestratePipeline('UI/UX Enhancement Workflow', [
                        {
                            agentName: 'product-manager',
                            taskDescription: "Analyze user flow and define interactions/visual specs for: ".concat(taskDescription),
                        },
                        {
                            agentName: 'frontend-specialist',
                            taskDescription: "Implement responsive design, animations, and typography enhancements.",
                        },
                        {
                            agentName: 'performance-optimizer',
                            taskDescription: "Optimize bundles, images, and rendering performance.",
                        },
                    ], taskDescription)];
            });
        });
    };
    return AgentWorkflows;
}());
exports.AgentWorkflows = AgentWorkflows;
