# Agentic development should minimise the cost of justified acceptance

**Status:** Agent-assisted revision following the student's 25 October 2026
request to audit overstatement. The [review record](docs/claim-review-2026-10-25.md)
distinguishes that direction from the agent's source verification; it does not
assert original-source reading by the student.

Good agentic development should reduce the total cost of accepting useful changes
with justified confidence. Hold the desired outcome and quality threshold fixed:
count specification, implementation, model use, review and subsequent repair.
Otherwise, accepting less useful work or postponing defects can masquerade as
productivity. This is a proposed decision rule, not a demonstrated optimum or
demand for exhaustive human inspection. Its central claim is that the appropriate unit of
evaluation is an accepted change and its consequences, rather than generated
code or a passing benchmark alone.

[Jimenez et al.'s SWE-bench](https://arxiv.org/abs/2310.06770v3) provides an important
capability measure: 2,294 issues across twelve Python repositories, evaluated
through execution. It tests changes in existing systems rather than isolated
code completion. However, success on a supplied issue does not establish that
the issue deserves priority, that the tests capture every requirement, or that
integration is economical. The inference proposed here is that workplace adoption
needs evidence about decisions that the benchmark holds fixed.

Productivity experiments make that distinction consequential. [Cui et al.'s
February 2025 working paper](https://economics.mit.edu/sites/default/files/inline-files/draft_copilot_experiments.pdf)
combines three company experiments involving 4,867 developers. Its pooled
instrumental-variable estimate is 26.08% more completed tasks with coding-assistant
use, with a standard error of 10.3 percentage points. Randomised access and
ordinary workplace activity provide evidence beyond perceived savings. The
use-effect estimate depends on the instrumental-variable assumptions; it is not
the effect of access alone. It concerns code-completion assistance, not autonomous
delivery. Pull-request output and build success leave user value and maintenance
incompletely measured. Higher measured output does not by itself establish net
value, an adoption recommendation or an optimal review policy.

[Becker et al.](https://arxiv.org/abs/2507.09089v2), by contrast, randomly allowed
or disallowed AI on 246 tasks undertaken by sixteen experienced contributors in
familiar repositories. Early-2025 tools increased estimated completion time by 19%, despite
participants perceiving savings. The larger positive study does not cancel this
result: the populations, tools, tasks and outcomes differ. Nor does this smaller
experiment establish a permanent slowdown. Together, they justify testing the
workflow being adopted, rather than selecting whichever headline confirms a
preference. Neither isolates verification cost sufficiently to prove that review
alone explains the difference.

METR's [February 2026 follow-up](https://metr.org/blog/2026-02-24-uplift-update/)
further limits that inference: developers avoiding AI-disallowed work, changing
task selection and concurrent agents weakened its later productivity estimates.
Its [May survey](https://metr.org/blog/2026-05-11-ai-usage-survey/) reports median
self-assessed value multipliers of 1.4–2 across three questions to 349 technical
workers in a convenience sample. These are not causal estimates or a confidence
interval. The survey motivates considering changes in which tasks are attempted;
it does not establish their additional value. A local comparison should record
task selection as well as time saved on comparable work.

[Schluntz and Zhang's practitioner account](https://www.anthropic.com/engineering/building-effective-agents)
suggests starting simply, using execution feedback and increasing complexity
when evaluation warrants it. This offers a way to organise delegation, not an
independent productivity measurement. Its vendor perspective and implementation
experience warrant attention without settling the causal question. Tests derived
from the same mistaken assumption as generated code can agree while both fail
the user's requirement; feedback needs an independently stated target.

The strongest counterargument is that measuring and checking everything destroys
the gains delegation offers. It would be unreasonable to audit a reversible
layout adjustment like a permission change. The proposed response is to choose
acceptance evidence before generation, according to the consequences and detectability of
failure. Routine changes can use established checks, sampled inspection and
rollback. Changes that alter access or destroy saved work need direct adversarial
checks and an accountable reviewer. This distinction permits substantial autonomy;
it does not make more human intervention intrinsically better. When a valid
requirement cannot yet be checked, restrict the change's exposure or gather user
evidence rather than quietly lowering the threshold.

A practical trial would compare similar changes under two delegation policies,
record total human time and model cost, and track reverts, defects and usefulness
over a stated follow-up period. Human time and model spending are distinct costs;
combining them requires explicit weights. Report blind spots and task selection;
similar tasks alone do not establish causal comparability. Do not compress unlike
outcomes into a flattering speed score.
If lighter review preserves the agreed outcome while reducing total effort,
expand it. If repair or serious escaped defects erase the saving, narrow it.
This proposed policy is an inference from mixed evidence, not an experimentally
validated optimum. It makes autonomy answerable to delivered outcomes while
allowing the evidence to justify less supervision.
