"use strict";
/**
 * SIERRA ESTATES — EXCHANGE SHEET CLIENT
 * Central data contract between Admin UI, Agents, and Workflows
 * Uses Firestore /exchange collection as the shared message bus
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.db = void 0;
exports.writeExchange = writeExchange;
exports.updateExchange = updateExchange;
exports.sendAdminSignal = sendAdminSignal;
exports.subscribeExchange = subscribeExchange;
exports.subscribeAllExchange = subscribeAllExchange;
exports.subscribeAgentTasks = subscribeAgentTasks;
exports.subscribeWorkflowRuns = subscribeWorkflowRuns;
var firestore_1 = require("firebase/firestore");
var firestore_2 = require("firebase/firestore");
var app_1 = require("firebase/app");
// Initialize a default instance if not provided by the consumer
var firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
var app = (0, app_1.getApps)().length > 0 ? (0, app_1.getApp)() : (0, app_1.initializeApp)(firebaseConfig);
exports.db = (0, firestore_2.getFirestore)(app);
// ─── Collection Reference ─────────────────────────────────────────────────────
var EXCHANGE_COLLECTION = 'exchange';
function exchangeCol() {
    return (0, firestore_1.collection)(exports.db, EXCHANGE_COLLECTION);
}
// ─── Write Operations ─────────────────────────────────────────────────────────
/**
 * Write a new record to the Exchange Sheet.
 * Used by: Admin UI, Agents, Workflows, Webhooks
 */
function writeExchange(input) {
    return __awaiter(this, void 0, void 0, function () {
        var now, docRef;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    now = firestore_1.Timestamp.now();
                    return [4 /*yield*/, (0, firestore_1.addDoc)(exchangeCol(), __assign(__assign({}, input), { status: (_a = input.status) !== null && _a !== void 0 ? _a : 'pending', createdAt: now, updatedAt: now }))];
                case 1:
                    docRef = _b.sent();
                    return [2 /*return*/, docRef.id];
            }
        });
    });
}
/**
 * Update the status and/or result of an existing exchange record.
 * Used by agents/workflows to report progress or completion.
 */
function updateExchange(id, updates) {
    return __awaiter(this, void 0, void 0, function () {
        var ref;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ref = (0, firestore_1.doc)(exports.db, EXCHANGE_COLLECTION, id);
                    return [4 /*yield*/, (0, firestore_1.updateDoc)(ref, __assign(__assign({}, updates), { updatedAt: firestore_1.Timestamp.now() }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// ─── Admin Signal (Admin UI → Workflow/Agent) ─────────────────────────────────
/**
 * Admin triggers a workflow or agent task from the Admin Hub.
 */
function sendAdminSignal(signal) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, writeExchange({
                    type: 'admin_signal',
                    source: 'admin',
                    status: 'pending',
                    payload: __assign({ action: signal.action }, signal.payload),
                    agentId: signal.targetAgentId,
                    workflowId: signal.targetWorkflowId,
                })];
        });
    });
}
// ─── Real-Time Subscriptions (Admin UI reads) ─────────────────────────────────
/**
 * Subscribe to live Exchange Sheet updates.
 * Returns unsubscribe function — call it on component unmount.
 */
function subscribeExchange(options) {
    var _a;
    var q = (0, firestore_1.query)(exchangeCol(), (0, firestore_1.orderBy)('createdAt', 'desc'), (0, firestore_1.limit)((_a = options.limitTo) !== null && _a !== void 0 ? _a : 100));
    if (options.type) {
        q = (0, firestore_1.query)(q, (0, firestore_1.where)('type', '==', options.type));
    }
    if (options.status) {
        q = (0, firestore_1.query)(q, (0, firestore_1.where)('status', '==', options.status));
    }
    return (0, firestore_1.onSnapshot)(q, function (snapshot) {
        var records = snapshot.docs.map(function (d) { return (__assign({ id: d.id }, d.data())); });
        options.onData(records);
    }, function (err) {
        var _a;
        console.error('[ExchangeSheet] Subscription error:', err);
        (_a = options.onError) === null || _a === void 0 ? void 0 : _a.call(options, err);
    });
}
/**
 * Subscribe to ALL exchange records (used by the Exchange Sheet tab in Admin Hub).
 */
function subscribeAllExchange(onData) {
    return subscribeExchange({ limitTo: 200, onData: onData });
}
/**
 * Subscribe to active agent tasks only.
 */
function subscribeAgentTasks(onData) {
    return subscribeExchange({ type: 'agent_task', limitTo: 50, onData: onData });
}
/**
 * Subscribe to active workflow runs only.
 */
function subscribeWorkflowRuns(onData) {
    return subscribeExchange({ type: 'workflow_run', limitTo: 50, onData: onData });
}
