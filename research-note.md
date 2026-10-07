# Agentic development should optimise the cost of justified acceptance

**Authorship and status:** This is an agent-assisted literature discussion draft,
prepared for the student's critical review. It does not claim that the student has
read these works across the course or already endorses this position. It must be
revised against their own reading before the COMP8020 final submission.

Good agentic software development should minimise the total effort needed to
accept a useful change with justified confidence. Counting generated code or
celebrating uninterrupted autonomy misses the work of establishing whether a
change is correct, appropriate and maintainable. This position does not imply
that every action needs human approval. It instead asks what evidence warrants
delegation, which decisions still require judgement, and whether the cost of
producing that evidence is proportionate to the change.

[Jimenez et al.'s SWE-bench](https://arxiv.org/abs/2310.06770) makes an important
advance over isolated code-completion exercises: its original dataset contains
2,294 problems drawn from issues and pull requests in twelve Python repositories.
Models must modify an existing codebase in response to an issue. This supplies
an inspectable task and execution-based evaluation. However, success at resolving
a supplied issue does not establish that the issue was worth pursuing, or that
the resulting interaction satisfies its users. The limitation is one of scope,
not a reason to dismiss benchmarks. A benchmark can support a capability claim
without supporting every organisational conclusion drawn from it.

[Becker et al.'s 2025 field experiment](https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf)
tests a different claim: whether AI assistance reduces developers' time on their
own work. Sixteen experienced open-source contributors completed 246 tasks, with
AI availability randomised. In that setting, assistance increased completion
time by 19%, although participants believed it had reduced their time. The
contrast makes perceived fluency an inadequate productivity measure. Yet these
developers knew mature repositories well and used early-2025 tools; the study
cannot establish that all developers or later systems are slower. Its strongest
lesson for practice is methodological: evaluate the actual workflow, including
review, rather than substitute a capability score or a satisfying interaction.

The authors' [February 2026 update](https://metr.org/blog/2026-02-24-uplift-update/)
complicates any simple anti-AI interpretation. Developers increasingly avoided
participation or withheld tasks they did not want to attempt without AI. Changes
in compensation and difficulties recording time during parallel agent use also
affected interpretation. METR considers the later signal unreliable for estimating
the current effect's magnitude. That is evidence of a measurement problem, not
proof that the original result persists or has definitively reversed. A useful
evaluation must document the tasks and people it excludes, and distinguish elapsed
time, active human effort and delivered value. Otherwise apparent improvements
can follow from changing the sample rather than improving the work.

[Anthropic's practitioner guidance](https://www.anthropic.com/engineering/building-effective-agents)
offers a complementary engineering response: begin with simple arrangements, use
environmental feedback, and add complexity when evaluation supports it. This
explains how to structure delegation, whereas the empirical studies ask whether
the resulting arrangement helps. The guidance is valuable as accumulated
implementation experience, but it is neither a controlled comparison nor an
independent estimate of productivity. Its simplicity principle should therefore
be treated as a design hypothesis to test, not a guarantee that a particular
framework or agent workflow improves outcomes.

A strong counterargument is that extensive review destroys the advantage of
autonomous agents. If a developer must reconstruct every generated change, even
a correct system may be economically unhelpful. The response is selective
verification. Stable, bounded operations can be delegated behind independent
checks; changes to requirements, permissions or the meaning of user data deserve
closer inspection. Verification effort should track consequence and uncertainty,
rather than line count. Tests generated alongside an implementation remain useful,
but agreement between them is weaker evidence when both inherit the same mistaken
assumption. Alternative examples, real execution and user observation can expose
that shared blind spot.

The practical implication is to evaluate agentic work at acceptance and revisit it
after use. Record the intended outcome, the evidence consulted, the defects found,
and the human effort spent correcting them. Compare similar changes using those
measures, while acknowledging that usefulness cannot be reduced to a single
score. Autonomy can then expand where evidence supports it. The developer's role
is to decide what merits confidence and preserve the reasons for that decision,
so a plausible output does not silently become an accepted product.
