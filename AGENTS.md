### Lifecycle

**Starting a change** (`/opsx-new <name>`):
0. Read through existing specs in openspec/specs/
1. Verify the current branch is `main`. If not, warn and confirm before proceeding.
2. Infer branch type (or ask if ambiguous). Create branch: `git checkout -b <type>/<name>`
3. Run the openspec new-change flow on the branch.

**During the change**:
- Commit openspec artifacts (proposal, specs, design, tasks) to the branch as they are created.
- All implementation commits go to the branch. Do not implement without a completed `tasks.md`.

**Finishing a change** (`/opsx-archive`):
1. Run `/opsx-archive` on the branch (syncs specs, moves to archive).
2. Commit the archive to the branch.
3. Check out `main`: `git checkout main`
4. Squash merge: `git merge --squash <type>/<name>`
5. Commit with a message drafted from the proposal's **Why** and **What Changes** sections.
6. Delete the branch: `git branch -D <type>/<name>` (squash merges are not recognised as merged by git, so `-D` is always required)
