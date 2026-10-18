# Agentic development should minimise the cost of justified acceptance

**Status:** Agent-assisted review draft. The student has not yet confirmed their
reading or endorsement of this argument; this text does not establish either.

Good agentic software development should minimise the total cost of accepting a
useful change with justified confidence. That cost includes specifying the task,
implementation, model use, review and subsequent correction. The qualification
matters: rapid acceptance is no achievement if requirements are weakened or
failures merely deferred. This position favours delegation where evidence makes
it worthwhile, with verification proportionate to uncertainty and consequence.
The literature supports this direction by separating three questions too often
collapsed together: what agents can do, whether assistance improves work, and
how to organise it.

[Jimenez et al.'s SWE-bench](https://arxiv.org/abs/2310.06770v3) addresses the first
question through 2,294 problems from twelve Python repositories. Editing an
existing codebase to resolve an issue is a substantial advance over isolated
completion exercises. Its execution-based evaluation makes capability claims
testable. However, passing a supplied task's tests cannot establish whether that
task deserved priority or whether users benefit. A benchmark score therefore
supports bounded technical capability, while leaving the cost and value of
deployment open. Using it as a direct productivity forecast skips those missing
steps.

[Becker et al.'s field experiment](https://arxiv.org/abs/2507.09089v2) asks a
different question. Sixteen experienced contributors completed 246 tasks in
familiar open-source repositories, with AI availability randomised by task.
Early-2025 assistance increased estimated completion time by 19%, although
participants subsequently believed it had saved time. Randomisation gives this
finding more causal force than satisfaction reports, within that setting. It
does not show that every developer or later tool is slower. Nor does it contradict
SWE-bench: agents can solve benchmark tasks while collaboration, checking and
integration make assistance costly. The comparison makes workflow evaluation
necessary rather than treating capability as sufficient evidence for adoption.

METR's [February 2026 update](https://metr.org/blog/2026-02-24-uplift-update/)
also prevents treating the slowdown as permanent. Developers increasingly declined
participation or withheld tasks they preferred to perform with AI; lower
compensation and parallel agent use further complicated interpretation. The
authors considered improved productivity likely, but their later estimates too
affected by selection to reliably measure its size. Excluding enthusiastic users
and favourable tasks could understate benefits. Conversely, willingness to use AI
does not itself measure delivered value. Both objections matter: an experiment
can identify a local effect while its changing sample weakens broader conclusions.

The [May 2026 METR survey](https://metr.org/blog/2026-05-11-ai-usage-survey/)
extends this comparison. Among 349 technical workers, three questions about value
produced yielded median self-reported multipliers between 1.4 and 2. These are
neither measured causal gains nor a confidence interval. The convenience sample
and uncertain counterfactual judgements limit their force. Nevertheless, asking
about value identifies something task timing misses: AI may change which work
people attempt. This strengthens the case for measuring useful outcomes, while
the earlier mismatch between perceived and measured speed cautions against
accepting the reported magnitude uncritically.

[Schluntz and Zhang's practitioner guidance](https://www.anthropic.com/engineering/building-effective-agents)
offers an engineering response: start simply, obtain feedback from execution,
and add complexity when evaluation supports it. This complements the empirical
studies by proposing how to organise delegation, rather than measuring its
productivity effect. It draws on a vendor's implementation experience, not an
independent controlled comparison. Its advice is therefore a hypothesis to test
locally. In particular, successful execution should inform acceptance without
substituting for judgement about requirements and usefulness.

The strongest objection is that verification can consume the savings autonomy
promises. Reconstructing every generated change would defeat delegation. The
answer is selective verification, including automation: use established tests
for stable behaviour, examine permissions and irreversible effects more closely,
and sample routine changes where failures are cheap to detect and reverse.
An implementation and its newly generated tests can share a mistaken assumption;
agreement between them warrants less confidence than checks derived from
independent requirements. None of this requires approving every action. It
requires stating what evidence permits acceptance and revising that rule when
failures expose its limits.

In practice, compare similar work using total human effort, model cost, delivered
usefulness and defects discovered after acceptance, while recording changes in
task selection. Expand autonomy when it reduces those costs without sacrificing
agreed quality or value. If cheaper review produces more serious escaped defects,
the proposed verification policy has failed and must change. This is a practical
decision rule inferred from the literature, not a result any source directly
establishes. It keeps confidence accountable to outcomes instead of equating
plausible output with completed work.
