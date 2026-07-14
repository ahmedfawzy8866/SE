# Claude Instructions: Sierra Blu Memory Engine

## Project Brain (Obsidian Vault)
This project uses an Obsidian Vault for agent memory and workflow intelligence (the "Sierra Engine Brain" / Hermes). 

## Obsidian Skills
Claude must use the `kepano/obsidian-skills` toolset (installed in this project) to read, search, and update the memory vault located in the `project_brain` directory.

## Key Rules
- **Memory First:** Before writing code for agents (Sierra, Leila, Matchmaker, Closer, Scribe, Curator), read their respective intelligence markdown files in `project_brain`.
- **Workflow Automation:** The external n8n/Node scripts for property scraping and owner contact are documented in the vault. Always consult the vault for the latest business logic and "Golden Questions".
- **Documentation:** When you learn new information or make a core architectural change, persist that knowledge back into the `project_brain` Obsidian vault using your skills.
