"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.PropertyMatcherAgent = void 0;
var base_agent_1 = require("../base-agent");
var genai_1 = require("@google/genai");
var PropertyMatcherAgent = /** @class */ (function (_super) {
    __extends(PropertyMatcherAgent, _super);
    function PropertyMatcherAgent() {
        var _this = _super.call(this) || this;
        _this.name = 'property-matcher';
        _this.description = 'Matches a lead with suitable properties based on criteria.';
        // Vertex AI mode: billed to the GCP project via IAM/ADC instead of a
        // personal Gemini API key. Requires Application Default Credentials in
        // the runtime environment (GOOGLE_APPLICATION_CREDENTIALS or Workload
        // Identity Federation) with the Vertex AI User role on the project.
        _this.ai = new genai_1.GoogleGenAI({
            vertexai: true,
            project: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
        });
        return _this;
    }
    PropertyMatcherAgent.prototype.execute = function (record) {
        return __awaiter(this, void 0, void 0, function () {
            var criteria, response, matchedProperties, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[Agent: ".concat(this.name, "] Executing task: ").concat(record.id));
                        criteria = record.payload.criteria;
                        if (!criteria) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Missing search criteria in payload.',
                                }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.ai.models.generateContent({
                                model: 'gemini-2.5-pro',
                                contents: "You are an elite luxury real estate agent at Sierra Estates.\nMatch the following client criteria to 3 highly tailored (fictional) luxury properties from our exclusive portfolio.\nEnsure the properties sound ultra-luxurious, cinematic, and perfectly aligned with the request.\n\nCLIENT CRITERIA:\n".concat(JSON.stringify(criteria, null, 2), "\n"),
                                config: {
                                    responseMimeType: 'application/json',
                                    responseSchema: {
                                        type: genai_1.Type.ARRAY,
                                        description: 'List of matched luxury properties',
                                        items: {
                                            type: genai_1.Type.OBJECT,
                                            properties: {
                                                id: { type: genai_1.Type.STRING, description: 'A unique identifier for the property (e.g. prop_982)' },
                                                name: { type: genai_1.Type.STRING, description: 'The ultra-luxury property name (e.g. The Sapphire Penthouse)' },
                                                matchScore: { type: genai_1.Type.INTEGER, description: 'Match score out of 100 based on the criteria' },
                                                rationale: { type: genai_1.Type.STRING, description: 'A 1-sentence cinematic explanation of why this property is the perfect match' }
                                            },
                                            required: ['id', 'name', 'matchScore', 'rationale']
                                        }
                                    }
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        matchedProperties = [];
                        if (response.text) {
                            matchedProperties = JSON.parse(response.text);
                        }
                        console.log("[Agent: ".concat(this.name, "] Task ").concat(record.id, " complete. Found ").concat(matchedProperties.length, " matches."));
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    matches: matchedProperties,
                                    timestamp: new Date().toISOString(),
                                },
                            }];
                    case 3:
                        error_1 = _a.sent();
                        console.error("[Agent: ".concat(this.name, "] Error during Gemini generation:"), error_1);
                        return [2 /*return*/, {
                                success: false,
                                error: error_1.message || 'Gemini generation failed',
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return PropertyMatcherAgent;
}(base_agent_1.BaseAgent));
exports.PropertyMatcherAgent = PropertyMatcherAgent;
