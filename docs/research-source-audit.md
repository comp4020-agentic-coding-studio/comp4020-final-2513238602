# Research note: source audit and student decisions

Primary sources checked on **18 October 2026**. This records the agent's source
verification and revision, not the student's reading history or endorsement.
The note is complete prose for critical review, not a personal-reading account.
The [COMP8020 brief](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/assessments/final-project/)
asks for a 600–800-word position which weighs scholarly and practitioner sources,
answers a counter-case, and reaches beyond the student's own project. It also
advises students to draft the portfolio writing themselves; the agent-assisted
status remains explicit pending genuine student review.

Word count: **702 words** in the argument, **725** including the status disclosure,
or **734** including the title as well. Counts use displayed link labels rather
than URL text, with whitespace-separated words; all conventions fit 600–800.

## Claims and primary-source checks

| Source and location checked | Verified claim used | Limit retained |
| --- | --- | --- |
| [Jimenez et al., SWE-bench, ICLR 2024; arXiv v3](https://arxiv.org/abs/2310.06770v3), abstract, §2.2 and Appendix A.4 | Original dataset: **2,294** problems from **12** Python repositories; existing-codebase edits evaluated through execution | These are the original benchmark's dimensions, not SWE-bench Verified or a current model score. Task completion does not establish workplace value. |
| [Becker et al., early-2025 RCT, arXiv v2](https://arxiv.org/abs/2507.09089v2), abstract, §§2–3 and Appendix D; cross-checked against [METR's PDF](https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf) | **16** contributors, **246** tasks, task-level randomisation; estimated completion time **19% longer** with AI allowed; participants perceived savings | The effect concerns familiar repositories and February–June 2025 tools. It is a regression estimate, not the unadjusted difference of sample means or a current universal effect. |
| [METR, 24 February 2026 update](https://metr.org/blog/2026-02-24-uplift-update/), introduction and selection discussion | Participation, task submission, compensation and concurrent work undermine interpretation of the follow-up | The authors favour improvement but say its size is poorly identified. This is neither a replicated slowdown nor decisive proof of a reversal. |
| [Becker / METR, 11 May 2026 survey](https://metr.org/blog/2026-05-11-ai-usage-survey/), Summary, Methodology and Key questions | **349** technical workers; the three value questions have self-reported medians ranging from **1.4× to 2×** | The range is across questions, not a confidence interval. Convenience sampling and hypothetical judgements prevent treating it as causal productivity measurement. |
| [Schluntz and Zhang, Anthropic, 19 December 2024](https://www.anthropic.com/engineering/building-effective-agents), When (and when not) to use agents; Agents; Combining and customizing these patterns | Simplicity, execution feedback and evaluation before additional complexity | Practitioner experience from a vendor, not a controlled productivity study. The page now flags changed tooling; the note uses the design principle, not its tool recommendations. |

The Anthropic author attribution was also checked against its
[official companion repository](https://github.com/anthropics/claude-cookbooks/blob/main/patterns/agents/README.md).

## Corrections and scope

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

## Student reading and judgement still required

1. Read the [SWE-bench abstract and evaluation section](https://arxiv.org/html/2310.06770v3)
   and the [2025 RCT's §§2–3](https://arxiv.org/pdf/2507.09089v2). Decide whether the
   draft fairly separates capability from assistance in a working team.
2. Read the [February update](https://metr.org/blog/2026-02-24-uplift-update/) and
   the [May survey's methodology](https://metr.org/blog/2026-05-11-ai-usage-survey/).
   Explain in your own words why their estimates cannot simply replace one another.
3. Read [Anthropic's simplicity and evaluation advice](https://www.anthropic.com/engineering/building-effective-agents).
   Decide whether selective verification answers the cost objection, and specify
   one situation where the proposed rule would permit too much or too little autonomy.
4. Retain, revise or reject the central position. Add only course readings you
   actually engaged with when they strengthen that reasoning; confirm the final
   wording represents your judgement while preserving accurate AI-assistance disclosure.
