# Research note: source audit and review scope

Primary sources checked on **18 October and 25 October 2026**. This records the agent's source
verification and revision, not the student's reading history. The student's
25 October request to narrow unsupported claims is recorded in the
[claim review](claim-review-2026-10-25.md). The note is an assisted argument,
not a personal-reading account.
The [COMP8020 brief](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/assessments/final-project/)
asks for a 600–800-word position which weighs scholarly and practitioner sources,
answers a counter-case, and reaches beyond the student's own project. It also
advises students to draft the portfolio writing themselves; the agent-assisted
status remains explicit. The recorded review direction does not imply that the
student independently drafted the text or read every original source.

The current count is reported by `pnpm check:portfolio` (whitespace-separated
words, including headings, disclosure and Markdown links). Earlier 18 October
counts described the preceding revision, not this expanded comparison.

## Claims and primary-source checks

| Source and location checked | Verified claim used | Limit retained |
| --- | --- | --- |
| [Jimenez et al., SWE-bench, ICLR 2024; arXiv v3](https://arxiv.org/abs/2310.06770v3), abstract, §2.2 and Appendix A.4 | Original dataset: **2,294** problems from **12** Python repositories; existing-codebase edits evaluated through execution | These are the original benchmark's dimensions, not SWE-bench Verified or a current model score. Task completion does not establish workplace value. |
| [Cui et al., February 2025 working paper](https://economics.mit.edu/sites/default/files/inline-files/draft_copilot_experiments.pdf), abstract, §§2.3 and 3 | **4,867** developers; pooled IV estimate **26.08%**, SE **10.3 percentage points** | Outcome: completed tasks, proxied by pull requests. Access was randomised; the estimate concerns use, not access alone. Completion assistance is not autonomous delivery. |
| [Becker et al., early-2025 RCT, arXiv v2](https://arxiv.org/abs/2507.09089v2), abstract, §§2–3 and Appendix D; cross-checked against [METR's PDF](https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf) | **16** contributors, **246** tasks, task-level randomisation; estimated completion time **19% longer** with AI allowed; participants perceived savings | The effect concerns familiar repositories and February–June 2025 tools. It is a regression estimate, not the unadjusted difference of sample means or a current universal effect. |
| [METR, 24 February 2026 update](https://metr.org/blog/2026-02-24-uplift-update/), introduction and selection discussion | Participation, task submission, compensation and concurrent work undermine interpretation of the follow-up | The authors favour improvement but say its size is poorly identified. This is neither a replicated slowdown nor decisive proof of a reversal. |
| [Becker / METR, 11 May 2026 survey](https://metr.org/blog/2026-05-11-ai-usage-survey/), Summary, Methodology and Key questions | **349** technical workers; the three value questions have self-reported medians ranging from **1.4× to 2×** | The range is across questions, not a confidence interval. Convenience sampling and hypothetical judgements prevent treating it as causal productivity measurement. |
| [Schluntz and Zhang, Anthropic, 19 December 2024](https://www.anthropic.com/engineering/building-effective-agents), When (and when not) to use agents; Agents; Combining and customizing these patterns | Simplicity, execution feedback and evaluation before additional complexity | Practitioner experience from a vendor, not a controlled productivity study. The page now flags changed tooling; the note uses the design principle, not its tool recommendations. |

The Anthropic author attribution was also checked against its
[official companion repository](https://github.com/anthropics/claude-cookbooks/blob/main/patterns/agents/README.md).

## Corrections and scope

- **25 October, student-directed claim audit:** removed the inference from higher
  task output to an adoption recommendation; stated the IV assumption boundary;
  specified task-level permission in Becker et al.; and made convenience sampling
  explicit for the May survey. A possible change in attempted tasks is not proof
  of additional value. The proposed local comparison now distinguishes time from
  money and acknowledges that similar tasks alone cannot identify a causal effect.
- **25 October:** introduced Cui et al. as a substantive positive comparison,
  instead of relying on METR for every empirical productivity claim. It is a
  working paper; the note does not invent peer-review status. The note separates
  what these studies estimate from the proposed acceptance policy, and explicitly
  declines to attribute their different outcomes to verification alone.
- Defined the policy's boundary: hold outcome/quality fixed, include subsequent
  repair, choose evidence according to consequences, and name a follow-up period.
  Proposed measurements are a prospective evaluation, not a study conducted by
  the student. The proposed policy favours more autonomy if lighter review works.

- Retained **19%** after checking the METR-hosted PDF and arXiv v2. The February
  update opens with a **20%** description but gives **19%** in its
  detailed comparison; the note follows the paper's reported estimate.
- Added the May survey because February was not the last relevant 2026 publication
  found in [METR's research index](https://metr.org/research/). The note names dates
  rather than claiming to summarise the latest evidence. This was a targeted
  source check, not a systematic review of the field.
- Separated benchmark capability, randomised workflow effects, self-reported
  value and practitioner recommendations. They do not measure interchangeable
  outcomes, and none directly establishes the proposed acceptance rule.
- Strengthened the counter-case: review can erase savings. The response permits
  automated checks and proportionate sampling; subsequent serious defects can
  invalidate a verification policy. This is the draft's argument, not a fabricated
  experimental finding or claim about this project's users.
- All factual source references are linked inline; no direct quotations or
  current model-performance claims were added. The draft contains no invented
  course reading history, student endorsement or human playtest evidence.

## Source navigation for further scrutiny

The following prompts are a reference guide, not additional publication gates.
The student's request for the current correction is already recorded. No reading
boxes have been marked complete and no oral defence is inferred from that request.

1. Read the [SWE-bench abstract and evaluation section](https://arxiv.org/html/2310.06770v3)
   and the [2025 RCT's §§2–3](https://arxiv.org/pdf/2507.09089v2). Decide whether the
   note fairly separates capability from assistance in a working team.
2. Read the [February update](https://metr.org/blog/2026-02-24-uplift-update/) and
   the [May survey's methodology](https://metr.org/blog/2026-05-11-ai-usage-survey/).
   Explain in your own words why their estimates cannot simply replace one another.
3. Read [Anthropic's simplicity and evaluation advice](https://www.anthropic.com/engineering/building-effective-agents).
   Decide whether selective verification answers the cost objection, and specify
   one situation where the proposed rule would permit too much or too little autonomy.
4. Retain, revise or reject the central position. Add only course readings you
   actually engaged with when they strengthen that reasoning; confirm the final
   wording represents your judgement while preserving accurate AI-assistance disclosure.
5. Compare Cui et al.'s abstract, outcome definitions (§2.3) and estimation (§3)
   with Becker et al. Explain why their different signs are not enough to show
   that one study is wrong. Decide whether task output adequately represents the
   kind of value you want agents to produce.

## Argument stress test

| Challenge | What the revised argument must defend |
| --- | --- |
| Is “justified acceptance” just a label for more testing? | No: lighter review may win; review itself is a cost, and usefulness needs judgement. |
| Does the note dismiss positive results? | No: it treats company experiments as evidence for benefits in their settings, while identifying a transfer limit. |
| What would change the recommendation? | Comparable outcomes with lower combined implementation/review/repair effort justify more autonomy. Serious escaped defects can reverse that decision. |
| Does the game prove the research thesis? | No: this project has no controlled productivity comparison. Its defects illustrate a concern but cannot validate a field-wide causal claim. |
| What remains uncertain? | Suitable follow-up windows, how to compare unlike task value, and transfer to newer tools or teams. |
