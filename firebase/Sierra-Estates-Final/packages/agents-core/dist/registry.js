"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registry = exports.AgentRegistry = void 0;
var fs = require("fs");
var path = require("path");
var AgentRegistry = /** @class */ (function () {
    function AgentRegistry(customSrcDir) {
        this.profiles = {};
        this.srcDir = customSrcDir || __dirname;
        this.loadAllProfiles();
    }
    AgentRegistry.prototype.loadAllProfiles = function () {
        try {
            var files = fs.readdirSync(this.srcDir);
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var file = files_1[_i];
                if (file.endsWith('.md')) {
                    var name_1 = path.basename(file, '.md');
                    var filePath = path.join(this.srcDir, file);
                    var content = fs.readFileSync(filePath, 'utf-8');
                    var profile = this.parseMarkdownProfile(name_1, content);
                    this.profiles[name_1] = profile;
                }
            }
        }
        catch (err) {
            console.error('[AgentRegistry] Error loading profiles:', err);
        }
    };
    AgentRegistry.prototype.parseMarkdownProfile = function (name, content) {
        // Basic Frontmatter Parser
        var frontmatterRegex = /^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/;
        var match = content.match(frontmatterRegex);
        var domain = 'General Development';
        var description = '';
        var ruleRef = '';
        var dnaRef = '';
        var systemPrompt = content;
        if (match) {
            var frontmatter = match[1];
            systemPrompt = match[2];
            var lines = frontmatter.split('\n');
            for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                var line = lines_1[_i];
                var parts = line.split(':');
                if (parts.length >= 2) {
                    var key = parts[0].trim().toLowerCase();
                    var val = parts.slice(1).join(':').trim();
                    if (key === 'domain')
                        domain = val;
                    else if (key === 'description')
                        description = val;
                    else if (key === 'rule_ref')
                        ruleRef = val;
                    else if (key === 'dna_ref')
                        dnaRef = val;
                }
            }
        }
        return {
            name: name,
            domain: domain,
            description: description,
            systemPrompt: systemPrompt.trim(),
            ruleRef: ruleRef,
            dnaRef: dnaRef,
        };
    };
    AgentRegistry.prototype.getAgent = function (name) {
        return this.profiles[name] || null;
    };
    AgentRegistry.prototype.listAgents = function () {
        return Object.values(this.profiles);
    };
    return AgentRegistry;
}());
exports.AgentRegistry = AgentRegistry;
exports.registry = new AgentRegistry();
