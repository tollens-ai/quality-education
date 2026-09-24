# Software quality failures: examples with sources

Researched 2026-09-24 as a pool of examples for the series. Each entry notes how sensitive it is.

## Getting the basics wrong

| Example | What happened | Who wasn't served | Source | Sensitivity |
|---|---|---|---|---|
| Sonos app, May 2024 | A redesign shipped without alarms, sleep timers or accessibility features, despite warnings from staff. The CEO resigned in Jan 2025 | People who already owned the speakers | [Bloomberg](https://www.bloomberg.com/opinion/articles/2024-09-23/how-sonos-botched-an-app-and-infuriated-its-customers), [MacRumors](https://www.macrumors.com/2025/01/13/sonos-ceo-steps-down-after-app-redesign/) | Low. Well known to young developers |
| CrowdStrike, July 2024 | A content update had 21 input fields where the sensor expected 20. The company's own validator passed it | Machine operators and their customers | [Root-cause analysis](https://www.crowdstrike.com/wp-content/uploads/2024/08/Channel-File-291-Incident-Root-Cause-Analysis-08.06.2024.pdf) | Litigation is live. Stick to the root-cause report |
| Cyberpunk 2077, Dec 2020 | Close to unplayable on PS4 and Xbox One. Sony pulled it from its store | Players on older consoles | [CNBC](https://www.cnbc.com/2020/12/18/sony-pulls-cyberpunk-2077-from-playstation-store-after-backlash.html) | Low |
| Healthcare.gov, Oct 2013 | About 4M visitors and 6 enrolments on day one | Uninsured people | [NPR](https://www.npr.org/sections/health-shots/2013/12/27/257398910/the-number-6-says-it-all-about-the-healthcare-gov-rollout), [HHS OIG](https://oig.hhs.gov/reports/all/2016/healthcaregov-case-study-of-cms-management-of-the-federal-marketplace) | Political in the US. Keep it neutral |
| Knight Capital, Aug 2012 | A deployment to 7 of 8 servers revived dead code. About $440M lost in 45 minutes | The firm and the market | [SEC order](https://www.sec.gov/files/litigation/admin/2013/34-70694.pdf) | Low. More a deployment failure |
| TSB migration, Apr 2018 | Up to 5.2M customers disrupted. Fined £48.65M | Bank customers | [FCA](https://www.fca.org.uk/news/press-releases/tsb-fined-48m-operational-resilience-failings) | Settled. Name no individuals |
| Phoenix pay, Canada, 2016– | "An incomprehensible failure of project management and oversight" | Public servants who went unpaid | [Auditor General](https://www.oag-bvg.gc.ca/internet/English/parl_oag_201805_00_e_43032.html) | Hardship is still going on. Keep the humour gentle |
| Queensland Health payroll, 2010 | A contract of about A$6M ended up costing about A$1.2B | Health workers | [Inquiry report](https://cabinet.qld.gov.au/documents/2013/aug/health%20payroll%20response/Attachments/Report.pdf) | Moderate |
| Apple Maps, 2012 | Launch failures. Tim Cook apologised publicly | Users | [CNN](https://money.cnn.com/2012/09/28/technology/apple-maps-apology/index.html) | Low |

**Serious tone only.** Deaths are linked to both of these, so never use them in a joke:
- **UK Post Office Horizon.** Over 900 prosecutions, while the Post Office insisted the system was "robust". A court found Legacy Horizon "was not remotely robust" ([judgment](https://www.bailii.org/ew/cases/EWHC/QB/2019/3408.html), [inquiry](https://www.postofficehorizoninquiry.org.uk/volume-1-post-office-horizon-it-inquirys-final-report)).
- **Robodebt, Australia.** 470,000 wrong debts, "a crude and cruel mechanism, neither fair nor legal" ([Royal Commission](https://robodebt.royalcommission.gov.au/publications/report)).

## Enshittification, in Cory Doctorow's sense

This is deliberate: platforms move value from users to business customers, and then to themselves.
It is not incompetence. Doctorow objects to the word being used to mean "got worse" in general.
Definition and examples: [Pluralistic, 2023-01-21](https://pluralistic.net/2023/01/21/potemkin-ai/).

- **Amazon search:** results ranked by what sellers pay.
- **Facebook:** "terminally enshittified", in Doctorow's words.
- **Google Search:** see [Pluralistic, 2024-04-24](https://pluralistic.net/2024/04/24/naming-names/). The academic evidence is more mixed ([Bevendorff et al. 2024](https://downloads.webis.de/publications/papers/bevendorff_2024a.pdf)).
- **Unity runtime fee, 2023:** reversed after protest ([TechCrunch](https://techcrunch.com/2023/09/22/unity-u-turns-on-controversial-runtime-fee-and-begs-forgiveness/)).

## Industry evidence

- **World Quality Report 2025–26:** only 25% of organisations tie quality engineering to business outcomes ([Capgemini](https://www.capgemini.com/insights/research-library/world-quality-report-2025-26/)).
- **CISQ 2022:** the estimated cost of poor software quality in the US is $2.41T. It is industry-sponsored, so say "estimated" ([CISQ](https://www.it-cisq.org/the-cost-of-poor-quality-software-in-the-us-a-2022-report/)).
- Nothing published says "quality professionals are shocked". That is Qing's testimony as the expert.
