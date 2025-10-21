---
description: 
auto_execution_mode: 1
---

# Research Codebase

Conducts comprehensive research across the codebase to answer questions by exploring relevant components and connections, then documents findings in a research document.

## Initial Setup

Please provide your research question or area of interest, and I'll analyze it thoroughly by exploring relevant components and connections.

## Steps

### 1. Read Mentioned Files First

If you mention specific files (tasks, docs, JSON):
- Read them FULLY first (entire files, no partial reads)
- Read them in the main context before any other analysis
- This ensures full context before proceeding

### 2. Analyze and Decompose the Research Question

- Break down your query into composable research areas
- Think deeply about the underlying patterns, connections, and architectural implications
- Identify specific components, patterns, or concepts to investigate
- Consider which directories, files, or architectural patterns are relevant

### 3. Research the Codebase

Explore different aspects of the codebase:
- Find what files and components exist
- Understand how implementations work
- Find similar features to reference
- Look for historical context and decisions
- Find related tickets or past implementations

### 4. Synthesize Findings

After research completes:
- Compile all results (both codebase and .thoughts findings)
- Prioritize live codebase findings as primary source of truth
- Use .thoughts/ findings as supplementary historical context
- Connect findings across different components
- Include specific file paths and line numbers for reference
- Highlight patterns, connections, and architectural decisions
- Answer your specific questions with concrete evidence

### 5. Generate Research Document

Create a research document at `.windsurf/research/YYYY-MM-DD-description.md`

Structure the document with YAML frontmatter followed by content:

```markdown
---
date: [Current date and time with timezone in ISO format]
researcher: [Researcher name]
git_commit: [Current commit hash]
branch: [Current branch name]
repository: [Repository name]
topic: "[Your Question/Topic]"
tags: [research, codebase, relevant-component-names]
status: complete
last_updated: [Current date in YYYY-MM-DD format]
last_updated_by: [Researcher name]
---

# Research: [Your Question/Topic]

**Date**: [Current date and time with timezone]
**Researcher**: [Researcher name]
**Git Commit**: [Current commit hash]
**Branch**: [Current branch name]
**Repository**: [Repository name]

## Research Question
[Original query]

## Summary
[High-level findings answering your question]

## Detailed Findings

### [Component/Area 1]
- Finding with reference (`file.ext:line`)
- Connection to other components
- Implementation details

### [Component/Area 2]
...

## Code References
- `path/to/file.py:123` - Description of what's there
- `another/file.ts:45-67` - Description of the code block

## Architecture Insights
[Patterns, conventions, and design decisions discovered]

## Historical Context (from .thoughts/)
[Relevant insights from .thoughts/ directory with references]
- `.windsurf/something.md` - Historical decision about X
- `.windsurf/local/notes.md` - Past exploration of Y

## Related Research
[Links to other research documents in .windsurf/research/]

## Open Questions
[Any areas that need further investigation]
```

### 6. Present Findings

Present a concise summary of findings including:
- Key discoveries
- File references for easy navigation
- Ask if there are follow-up questions or need clarification

### 7. Handle Follow-up Questions

If there are follow-up questions:
- Append to the same research document
- Update the frontmatter fields `last_updated` and `last_updated_by`
- Add `last_updated_note: "Added follow-up research for [brief description]"`
- Add a new section: `## Follow-up Research [timestamp]`
- Continue updating the document

## Important Notes

- Always run fresh codebase research - never rely solely on existing research documents
- The .thoughts/ directory provides historical context to supplement live findings
- Focus on finding concrete file paths and line numbers for developer reference
- Research documents should be self-contained with all necessary context
- Consider cross-component connections and architectural patterns
- Include temporal context (when the research was conducted)
- Keep focused on synthesis, not deep file reading
- Explore all of .thoughts/ directory, not just research subdirectory
