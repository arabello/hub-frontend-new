---
description: Command to create a plan for future changes
auto_execution_mode: 1
---

# Create Implementation Plan

Creates detailed implementation plans through an interactive, iterative process. Be skeptical, thorough, and work collaboratively to produce high-quality technical specifications.

## Initial Setup

If no parameters provided, ask the user for:
1. The task/ticket description (or reference to a ticket file)
2. Any relevant context, constraints, or specific requirements
3. Links to related research or previous implementations

If parameters are provided (e.g., a ticket file path), read them immediately and begin the research process.

## Process Steps

### Step 1: Context Gathering & Initial Analysis

1. **Read all mentioned files immediately and FULLY**
   - Ticket files (e.g., `.windsurf/local/tasks/ticket.md`)
   - Research documents
   - Related implementation plans
   - Any JSON/data files mentioned
   - Read entire files without limit/offset parameters

2. **Gather context from the codebase**
   - Find all files related to the ticket/task
   - Understand how the current implementation works
   - Look for existing patterns and conventions
   - Identify integration points and dependencies

3. **Analyze and verify understanding**
   - Cross-reference the ticket requirements with actual code
   - Identify any discrepancies or misunderstandings
   - Note assumptions that need verification
   - Determine true scope based on codebase reality

4. **Present informed understanding and focused questions**
   ```
   Based on the ticket and my research of the codebase, I understand we need to [accurate summary].
   
   I've found that:
   - [Current implementation detail with file:line reference]
   - [Relevant pattern or constraint discovered]
   - [Potential complexity or edge case identified]
   
   Questions that my research couldn't answer:
   - [Specific technical question that requires human judgment]
   - [Business logic clarification]
   - [Design preference that affects implementation]
   ```

### Step 2: Research & Discovery

1. **If the user corrects any misunderstanding**
   - DO NOT just accept the correction
   - Verify the correct information by reading the code
   - Read the specific files/directories they mention
   - Only proceed once you've verified the facts yourself

2. **Research different aspects**
   - Find more specific files and components
   - Understand implementation details
   - Find similar features to model after
   - Look for historical context and decisions
   - Find related tickets or past implementations

3. **Present findings and design options**
   ```
   Based on my research, here's what I found:
   
   **Current State:**
   - [Key discovery about existing code]
   - [Pattern or convention to follow]
   
   **Design Options:**
   1. [Option A] - [pros/cons]
   2. [Option B] - [pros/cons]
   
   **Open Questions:**
   - [Technical uncertainty]
   - [Design decision needed]
   
   Which approach aligns best with your vision?
   ```

### Step 3: Plan Structure Development

1. **Create initial plan outline**
   ```
   Here's my proposed plan structure:
   
   ## Overview
   [1-2 sentence summary]
   
   ## Implementation Phases:
   1. [Phase name] - [what it accomplishes]
   2. [Phase name] - [what it accomplishes]
   3. [Phase name] - [what it accomplishes]
   
   Does this phasing make sense? Should I adjust the order or granularity?
   ```

2. **Get feedback on structure** before writing details

### Step 4: Detailed Plan Writing

Write the plan to `.windsurf/plans/YYYY-MM-DD-TICKET-description.md`

Use this template structure:

```markdown
# [Feature/Task Name] Implementation Plan

## Overview
[Brief description of what we're implementing and why]

## Current State Analysis
[What exists now, what's missing, key constraints discovered]

## Desired End State
[Specification of the desired end state and how to verify it]

### Key Discoveries:
- [Important finding with file:line reference]
- [Pattern to follow]
- [Constraint to work within]

## What We're NOT Doing
[Explicitly list out-of-scope items to prevent scope creep]

## Implementation Approach
[High-level strategy and reasoning]

## Phase 1: [Descriptive Name]

### Overview
[What this phase accomplishes]

### Changes Required:

#### 1. [Component/File Group]
**File**: `path/to/file.ext`
**Changes**: [Summary of changes]

```[language]
// Specific code to add/modify
```

### Success Criteria:

#### Automated Verification:
- [ ] Migration applies cleanly: `make migrate`
- [ ] Unit tests pass: `make test-component`
- [ ] Type checking passes: `npm run typecheck`

#### Manual Verification:
- [ ] Feature works as expected when tested via UI
- [ ] Performance is acceptable under load
- [ ] No regressions in related features

---

## Testing Strategy

### Unit Tests:
- [What to test]
- [Key edge cases]

### Manual Testing Steps:
1. [Specific step to verify feature]
2. [Another verification step]

## References
- Original ticket: `.windsurf/local/tasks/task.md`
- Related research: `.windsurf/research/relevant.md`
```

### Step 5: Review and Iterate

1. Present the draft plan location
2. Ask for feedback on:
   - Are the phases properly scoped?
   - Are the success criteria specific enough?
   - Any technical details that need adjustment?
   - Missing edge cases or considerations?
3. Continue refining until the user is satisfied

## Important Guidelines

1. **Be Skeptical**: Question vague requirements, identify potential issues early
2. **Be Interactive**: Don't write the full plan in one shot, get buy-in at each major step
3. **Be Thorough**: Research actual code patterns, include specific file paths
4. **Be Practical**: Focus on incremental, testable changes
5. **No Open Questions in Final Plan**: Research or ask for clarification immediately

## Success Criteria Guidelines

Always separate success criteria into two categories:

1. **Automated Verification** (can be run by execution):
   - Commands that can be run: `make test`, `npm run lint`, etc.
   - Specific files that should exist
   - Code compilation/type checking

2. **Manual Verification** (requires human testing):
   - UI/UX functionality
   - Performance under real conditions
   - Edge cases that are hard to automate
