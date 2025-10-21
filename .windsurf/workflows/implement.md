---
description: Command to implement changes described by a plan
auto_execution_mode: 1
---

# Implement Plan

Implements an approved technical plan from `.windsurf/local/plans/` or `.windsurf/plans/`. These plans contain phases with specific changes and success criteria.

## Getting Started

When given a plan path:
1. Read the plan completely and check for any existing checkmarks (- [x])
2. Read the original task and all files mentioned in the plan
3. Read files fully - never use limit/offset parameters, you need complete context
4. Think deeply about how the pieces fit together
5. Start implementing if you understand what needs to be done

If no plan path provided, ask for one.

## Implementation Philosophy

Plans are carefully designed, but reality can be messy. Your job is to:
- Follow the plan's intent while adapting to what you find
- Implement each phase fully before moving to the next
- Verify your work makes sense in the broader codebase context
- Update checkboxes in the plan as you complete sections

When things don't match the plan exactly, think about why and communicate clearly. The plan is your guide, but your judgment matters too.

## Steps

1. **Understand the Plan**
   - Read the entire plan document
   - Identify which phases are already completed (checkmarks)
   - Understand the overall goal and approach
   - Note any dependencies between phases

2. **For Each Phase**
   - Read all relevant files mentioned in the phase
   - Understand the current state of the code
   - Implement the changes as specified
   - Adapt if reality differs from the plan
   - Test your changes

3. **If You Encounter a Mismatch**
   STOP and think deeply about why the plan can't be followed
   
   Present the issue clearly:
   ```
   Issue in Phase [N]:
   Expected: [what the plan says]
   Found: [actual situation]
   Why this matters: [explanation]
   
   How should I proceed?
   ```

4. **Verify Your Work**
   After implementing a phase:
   - Run the success criteria checks (usually `pnpm test` covers everything)
   - Fix any issues before proceeding
   - Update your progress in the plan
   - Check off completed items in the plan file itself

5. **Continue to Next Phase**
   - Don't let verification interrupt your flow
   - Batch verification at natural stopping points
   - Keep the end goal in mind
   - Maintain forward momentum

## If You Get Stuck

When something isn't working as expected:
- First, make sure you've read and understood all the relevant code
- Consider if the codebase has evolved since the plan was written
- Present the mismatch clearly and ask for guidance

## Resuming Work

If the plan has existing checkmarks:
- Trust that completed work is done
- Pick up from the first unchecked item
- Verify previous work only if something seems off

## Remember

You're implementing a solution, not just checking boxes. Keep the end goal in mind and maintain forward momentum.
