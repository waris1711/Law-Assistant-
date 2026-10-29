import React, { useState, useMemo, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type ConstSubTab = 'constArticlesView' | 'constSchedulesView' | 'constAmendmentsView';

interface ConstitutionItem {
  id: string;
  part?: string;
  metaLeft: string;
  metaLeftUr?: string;
  title: string;
  titleUr?: string;
  modalTitle: string;
  enDesc: string;
  urDesc: string;
  bareAct: string;
  cases: string;
  notes: string;
  keys: string;
  presetPrompt: string;
}

const ARTICLES_DIRECTORY: ConstitutionItem[] = [
  {
    id: 'art-1',
    part: 'Part I',
    metaLeft: 'Part I • Union & Territory',
    metaLeftUr: 'Hissa I • Wafaq aur Ilaqa',
    title: 'Article 1 — Name and Territory of the Union',
    titleUr: 'Article 1 — Union ka Naam aur Ilaqa',
    modalTitle: 'Article 1: Name and territory of the Union',
    enDesc: 'India, that is Bharat, shall be a Union of States.',
    urDesc: 'Hindustan, yani Bharat, riyasaton ka ek ittehad (Union of States) hoga.',
    bareAct:
      'India, that is Bharat, shall be a Union of States. The territory of India shall comprise the territories of the States, the Union territories specified in the First Schedule, and such other territories as may be acquired.',
    cases: 'State of West Bengal v. Union of India (1963), In Re: Berubari Union (1960), In Re: Article 370 (2023).',
    notes:
      'Establishes an indestructible Union composed of destructible States (Parliament can alter state boundaries under Article 3 by ordinary legislative process).',
    keys: '1 article 1 name territory union bharat states part 1',
    presetPrompt:
      'Analyze the constitutional import of "India, that is Bharat, shall be a Union of States" under Article 1 read with Article 3 of the Constitution of India.',
  },
  {
    id: 'art-5-11',
    part: 'Part II',
    metaLeft: 'Part II • Citizenship (Arts 5–11)',
    metaLeftUr: 'Hissa II • Shehriyat (Arts 5–11)',
    title: 'Articles 5–11 — Constitutional Citizenship & Parliamentary Competence',
    titleUr: 'Articles 5–11 — Shehriyat ke Aaeeni Qawaneen',
    modalTitle: 'Articles 5–11: Citizenship at Commencement & Parliamentary Power',
    enDesc:
      'Governs citizenship at the commencement of the Constitution and empowers Parliament under Article 11 to regulate citizenship by law.',
    urDesc:
      'Aaeen ke aaghaz par shehriyat tay karta hai aur Article 11 ke tehat Parliament ko shehriyat ke qawaneen banane ka mukammal ikhtiyar deta hai.',
    bareAct:
      'Articles 5 to 10 determine citizenship at the commencement of the Constitution (26.01.1950). Article 11 empowers Parliament to make any provision with respect to the acquisition and termination of citizenship and all other matters relating to citizenship.',
    cases: 'In Re: Section 6A of the Citizenship Act 1955 (2024 SC 5-Judge Bench), Izhar Ahmad Khan v. Union of India (1962).',
    notes:
      'Fundamental Rights under Articles 15, 16, 19, 29, and 30 are available ONLY to Citizens, whereas Articles 14, 20, 21, 21A, 22, 25–28 apply to all persons (citizens and foreigners alike).',
    keys: '5 6 7 8 9 10 11 citizenship part 2 parliament article 11',
    presetPrompt:
      'Demarcate the Fundamental Rights available exclusively to Citizens (Articles 15, 16, 19, 29, 30) versus All Persons (Articles 14, 20, 21, 22) in light of Part II (Articles 5–11) of the Constitution.',
  },
  {
    id: 'art-12',
    part: 'Part III',
    metaLeft: 'Part III • Fundamental Rights (Art 12)',
    metaLeftUr: 'Hissa III • Riyasat (State) ki Tareef (Art 12)',
    title: "Article 12 — Definition of 'State'",
    titleUr: "Article 12 — 'Riyasat' (State) ki Aaeeni Tareef",
    modalTitle: "Article 12: Definition of 'State'",
    enDesc:
      'Includes Government and Parliament of India, Government and Legislature of States, and all local or other authorities within India or under control of GOI.',
    urDesc:
      'Markazi aur Riyasati Hakoomat, Parliament, Assemblies aur tamam sarkari/muqami idaron (local or other authorities) ko State qarar deta hai.',
    bareAct:
      'In this Part, unless the context otherwise requires, "the State" includes the Government and Parliament of India and the Government and the Legislature of each of the States and all local or other authorities within the territory of India or under the control of the Government of India.',
    cases: 'R.D. Shetty v. International Airport Authority of India (1979), Ajay Hasia v. Khalid Mujib (1981), Pradeep Kumar Biswas v. Indian Institute of Chemical Biology (2002), Zee Telefilms v. UOI (2005).',
    notes:
      'Establishes the deep and pervasive financial, functional, and administrative control test for instrumentality or agency of the State.',
    keys: '12 state definition instrumentality agency rd shetty ajay hasia zee telefilms part 3',
    presetPrompt:
      'Analyze the 6-factor instrumentality test for determining whether a body is "other authority" under Article 12 of the Constitution in light of Ajay Hasia and Pradeep Kumar Biswas.',
  },
  {
    id: 'art-13',
    part: 'Part III',
    metaLeft: 'Part III • Fundamental Rights',
    metaLeftUr: 'Hissa III • Buniyadi Haqooq',
    title: 'Article 13 — Laws Inconsistent with Part III',
    titleUr: 'Article 13 — Buniyadi Haqooq ke Khilaf Qawaneen ka Baatil Hona',
    modalTitle: 'Article 13: Laws inconsistent with Fundamental Rights',
    enDesc:
      'Constitutional basis of judicial review: any law infringing fundamental rights is void to that extent.',
    urDesc:
      'Judicial review ki buniyad: Aaeeni buniyadi haqooq ke khilaf banne wala koi bhi qanoon us had tak baatil hoga.',
    bareAct:
      'All laws in force in the territory of India immediately before the commencement of this Constitution, in so far as they are inconsistent with Part III, shall, to the extent of such inconsistency, be void. The State shall not make any law which takes away or abridges the rights conferred by Part III.',
    cases: 'Kesavananda Bharati (1973), State of Madras v. V.G. Row (1952), Bhikaji Narain Dhakras v. State of M.P. (1955).',
    notes:
      'The cornerstone of Judicial Review in India. Doctrines of Severability, Eclipse, and Non-Waiver of Fundamental Rights (Basheshar Nath v. CIT) stem directly from Article 13.',
    keys: '13 judicial review fundamental rights inconsistency void eclipse severability',
    presetPrompt:
      'Analyze the Doctrines of Eclipse, Severability, and Non-Waiver of Fundamental Rights under Article 13(1) and 13(2) of the Constitution of India.',
  },
  {
    id: 'art-14',
    part: 'Part III',
    metaLeft: 'Part III • Fundamental Rights',
    metaLeftUr: 'Hissa III • Buniyadi Haqooq',
    title: 'Article 14 — Equality Before Law',
    titleUr: 'Article 14 — Qanoon ke Samne Barabari ka Haq',
    modalTitle: 'Article 14: Equality before law',
    enDesc:
      'Prohibits arbitrariness and ensures equal protection of the laws for all persons.',
    urDesc:
      'Har shakhs ke liye qanoon ke samne barabari aur yaksaan qanooni tahaffuz ki zamanat deta hai.',
    bareAct:
      'The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.',
    cases: 'E.P. Royappa v. State of TN (1974), Maneka Gandhi v. UOI (1978), Shayara Bano v. UOI (2017 — Manifest Arbitrariness).',
    notes:
      'Guarantees equality and outlaws arbitrariness in state action. Intelligible differentia test and rational nexus test apply alongside the Manifest Arbitrariness doctrine.',
    keys: '14 equality before law equal protection arbitrariness royappa barabari ka haq',
    presetPrompt:
      'Analyze the Reasonable Classification test (intelligible differentia + rational nexus) and the Manifest Arbitrariness doctrine under Article 14 of the Constitution of India.',
  },
  {
    id: 'art-19',
    part: 'Part III',
    metaLeft: 'Part III • Fundamental Rights',
    metaLeftUr: 'Hissa III • Buniyadi Haqooq',
    title: 'Article 19 — Protection of Core Freedoms',
    titleUr: 'Article 19 — 6 Buniyadi Aazadiyon ka Tahaffuz',
    modalTitle: 'Article 19: Protection of Six Freedoms',
    enDesc:
      'Six fundamental democratic freedoms protected for citizens, governed by reasonable statutory restrictions.',
    urDesc:
      'Shehriyon ko 6 buniyadi aazadiyan faraham karta hai, jin par munasib qanooni pabandiyan lagayi ja sakti hain.',
    bareAct:
      'Guarantees freedoms of (a) speech and expression, (b) peaceful assembly without arms, (c) associations/unions, (d) movement throughout India, (e) residence, and (g) profession, occupation, trade or business to citizens.',
    cases: 'Shreya Singhal v. UOI (2015), Anuradha Bhasin v. UOI (2020), Chintaman Rao v. State of M.P. (1951).',
    notes:
      'Freedoms are not absolute; subject to reasonable restrictions under Clauses (2) through (6). Proportionality test applies.',
    keys: '19 freedoms speech expression assembly trade anuradha bhasin shreya singhal',
    presetPrompt:
      'Examine the constitutional test of Proportionality and Reasonable Restrictions under Articles 19(1)(a) and 19(2) of the Constitution of India.',
  },
  {
    id: 'art-20-22',
    part: 'Part III',
    metaLeft: 'Part III • Criminal & Custodial Safeguards',
    metaLeftUr: 'Hissa III • Giraftari aur Faujdari Tahaffuz',
    title: 'Articles 20 & 22 — Double Jeopardy, Self-Incrimination & Arrest Grounds',
    titleUr: 'Articles 20 & 22 — Giraftari ki Wajoohat aur Khud-Gawahi se Tahaffuz',
    modalTitle: 'Articles 20 & 22: Criminal Trial & Custodial Arrest Safeguards',
    enDesc:
      'Protects against ex-post facto penal law, double jeopardy, self-incrimination, and mandates written grounds of arrest & 24-hour production.',
    urDesc:
      'Giraftari ki tehreeri wajoohat batana, 24 ghante mein Magistrate ke samne pesh karna aur khud ke khilaf gawahi par majboor na karne ka haq.',
    bareAct:
      'Art. 20(1): No retrospective penal law. Art. 20(2): No double jeopardy. Art. 20(3): Right against self-incrimination. Art. 22(1)–(2): Right to be informed of grounds of arrest, consult a legal practitioner, and be produced before a Magistrate within 24 hours.',
    cases: 'Selvi v. State of Karnataka (2010), Pankaj Bansal v. UOI (2023), Prabir Purkayastha v. State (NCT of Delhi) (2024).',
    notes:
      'Furnishing written grounds of arrest is mandatory under Article 22(1) read with Section 47 BNSS (Section 50 CrPC). Violation renders arrest and remand illegal.',
    keys: '20 22 arrest grounds double jeopardy self incrimination pankaj bansal prabir purkayastha',
    presetPrompt:
      'Analyze the mandatory constitutional requirement of furnishing written grounds of arrest under Article 22(1) of the Constitution and Section 47 BNSS in light of Prabir Purkayastha v. State (NCT of Delhi), 2024 INSC 414.',
  },
  {
    id: 'art-21',
    part: 'Part III',
    metaLeft: 'Part III • Fundamental Rights',
    metaLeftUr: 'Hissa III • Buniyadi Haqooq',
    title: 'Article 21 — Protection of Life & Personal Liberty',
    titleUr: 'Article 21 — Zindagi aur Zaati Aazadi ka Tahaffuz',
    modalTitle: 'Article 21: Protection of Life & Personal Liberty',
    enDesc:
      'The bedrock of constitutional liberty. Encompasses right to live with human dignity and privacy.',
    urDesc:
      'Zindagi aur zaati aazadi ka buniyadi tahaffuz. Isme izzat ke sath jeene aur privacy ka haq shamil hai.',
    bareAct:
      'No person shall be deprived of his life or personal liberty except according to procedure established by law.',
    cases: 'Maneka Gandhi v. UOI (1978), K.S. Puttaswamy v. UOI (2017), Hussainara Khatoon v. State of Bihar (1979).',
    notes:
      'Expanded via judicial interpretation to encompass right to privacy, clean environment, free legal aid, speedy trial, fair investigation, and human dignity.',
    keys: '21 life personal liberty privacy maneka gandhi puttaswamy zindagi aazadi',
    presetPrompt:
      'Analyze the Golden Triangle of Articles 14, 19, and 21 and the Proportionality standard in K.S. Puttaswamy v. Union of India, (2017) 10 SCC 1.',
  },
  {
    id: 'art-21a',
    part: 'Part III',
    metaLeft: 'Part III • Fundamental Rights (Art 21A)',
    metaLeftUr: 'Hissa III • Muft aur Lazmi Taleem ka Haq (Art 21A)',
    title: 'Article 21A — Right to Free & Compulsory Education',
    titleUr: 'Article 21A — 6 se 14 Saal ke Bachon ke Liye Muft aur Lazmi Taleem',
    modalTitle: 'Article 21A: Right to Education',
    enDesc:
      'State shall provide free and compulsory education to all children of the age of 6 to 14 years.',
    urDesc:
      'Riyasat 6 se 14 saal ki umar ke tamam bachon ko muft aur lazmi taleem faraham karegi (86th Amendment 2002).',
    bareAct:
      'The State shall provide free and compulsory education to all children of the age of six to fourteen years in such manner as the State may, by law, determine.',
    cases: 'Mohini Jain v. State of Karnataka (1992), Unni Krishnan v. State of A.P. (1993), Society for Unaided Private Schools of Rajasthan v. UOI (2012).',
    notes:
      'Inserted via the 86th Constitutional Amendment Act, 2002. Operative statute: Right of Children to Free and Compulsory Education (RTE) Act, 2009.',
    keys: '21a education free compulsory children 86th amendment rte act mohini jain unni krishnan',
    presetPrompt:
      'Examine the scope of Article 21A and the 25% EWS admission mandate under Section 12(1)(c) of the RTE Act, 2009.',
  },
  {
    id: 'art-25',
    part: 'Part III',
    metaLeft: 'Part III • Freedom of Religion (Art 25)',
    metaLeftUr: 'Hissa III • Mazhabi Aazadi ka Haq (Art 25)',
    title: 'Article 25 — Freedom of Conscience & Religion',
    titleUr: 'Article 25 — Zameer aur Mazhab ki Aazadi',
    modalTitle: 'Article 25: Freedom of Conscience and Free Profession, Practice and Propagation of Religion',
    enDesc:
      'All persons are entitled to freedom of conscience and the right freely to profess, practise and propagate religion, subject to public order, morality, and health.',
    urDesc:
      'Tamam ashkhas ko zameer ki aazadi aur apne mazhab par amal aur tableegh ka haq hai (amno-aman, ikhlaqiyat aur sehat ke tabay).',
    bareAct:
      'Subject to public order, morality and health and to the other provisions of this Part, all persons are equally entitled to freedom of conscience and the right freely to profess, practise and propagate religion.',
    cases: 'Commissioner, Hindu Religious Endowments, Madras v. Sri Lakshmindra Thirtha Swamiar of Sri Shirur Mutt (1954), Indian Young Lawyers Association v. State of Kerala (Sabarimala Case, 2018).',
    notes:
      'Subject to public order, morality, health, and other Part III rights. Protects Essential Religious Practices (ERP doctrine laid down in Shirur Mutt).',
    keys: '25 religion conscience essential religious practices erp sabarimala shirur mutt',
    presetPrompt:
      'Analyze the Essential Religious Practices (ERP) test under Article 25 of the Constitution of India from Shirur Mutt (1954) to Sabarimala (2018).',
  },
  {
    id: 'art-32',
    part: 'Part III',
    metaLeft: 'Part III • Remedies',
    metaLeftUr: 'Hissa III • Aaeeni Chara-Joi (Writs)',
    title: 'Article 32 — Remedies for Enforcement of Rights',
    titleUr: 'Article 32 — Buniyadi Haqooq ki Bahali ke Liye Supreme Court Writs',
    modalTitle: 'Article 32: Constitutional Remedies',
    enDesc:
      'Prerogative writs enforceable directly before the Supreme Court for protecting Fundamental Rights.',
    urDesc:
      'Buniyadi haqooq ke tahaffuz ke liye seedha Supreme Court mein writ dakhil karne ka aaeeni haq.',
    bareAct:
      'Guarantees the right to move the Supreme Court directly for enforcement of Fundamental Rights by issuing Writs.',
    cases: 'Fertilizer Corporation Kamgar Union (1981), Bandhua Mukti Morcha (1984), L. Chandra Kumar v. UOI (1997).',
    notes:
      'Dr. B.R. Ambedkar termed it the Heart and Soul of the Constitution. Prerogative writs: Habeas Corpus, Mandamus, Prohibition, Quo Warranto, Certiorari.',
    keys: '32 remedies supreme court writs habeas corpus ambedkar mandamus certiorari',
    presetPrompt:
      'Compare the scope of Writ Jurisdiction of the Supreme Court under Article 32 with that of the High Courts under Article 226 of the Constitution of India.',
  },
  {
    id: 'art-226',
    part: 'Part V',
    metaLeft: 'Part VI • High Court Writ Jurisdiction (Art 226)',
    metaLeftUr: 'High Court ke Writ Ikhtiyarat (Art 226)',
    title: 'Article 226 — Power of High Courts to Issue Writs',
    titleUr: 'Article 226 — High Courts ka Writ Jaari Karne ka Wasee Ikhtiyar',
    modalTitle: 'Article 226: Power of High Courts to Issue Certain Writs',
    enDesc:
      "High Courts can issue writs for enforcement of Fundamental Rights and for 'any other purpose'.",
    urDesc:
      "High Courts ko Buniyadi Haqooq ke alawa 'kisi bhi doosre qanooni maqsad' (any other purpose) ke liye Writs jaari karne ka wasee ikhtiyar hai.",
    bareAct:
      'Notwithstanding anything in Article 32, every High Court shall have power, throughout the territories in relation to which it exercises jurisdiction, to issue to any person or authority, including in appropriate cases, any Government, directions, orders or writs for the enforcement of any of the rights conferred by Part III and for any other purpose.',
    cases: 'L. Chandra Kumar v. Union of India (1997) 3 SCC 261, Whirlpool Corporation v. Registrar of Trade Marks (1998) 8 SCC 1, Radha Krishan Industries v. State of H.P. (2021).',
    notes:
      'Wider territorial/subject-matter ambit than Article 32 ("for any other purpose"). Judicial review under Articles 226/227 is an inviolable part of the Basic Structure (L. Chandra Kumar). Availability of alternative remedy is a rule of self-restraint, not a bar where natural justice or fundamental rights are violated (Whirlpool).',
    keys: '226 high court writs any other purpose whirlpool l chandra kumar judicial review',
    presetPrompt:
      'Analyze the 4 Whirlpool exceptions where a High Court will entertain a Writ Petition under Article 226 despite the existence of an alternative statutory remedy.',
  },
  {
    id: 'art-300a',
    part: 'Part XX',
    metaLeft: 'Part XII • Right to Property (Art 300A)',
    metaLeftUr: 'Hissa XII • Jaidad ka Aaeeni Haq (Art 300A)',
    title: 'Article 300A — Persons Not to be Deprived of Property',
    titleUr: 'Article 300A — Qanoon ke Baghair Kisi ko Jaidad se Mehroom Nahi Kiya Jayega',
    modalTitle: 'Article 300A: Persons Not to be Deprived of Property Save by Authority of Law',
    enDesc:
      'No person shall be deprived of his property save by authority of law (Constitutional & Human Right).',
    urDesc:
      'Kisi bhi shakhs ko qanooni ikhtiyar ke baghair uski jaidad (property) se mehroom nahi kiya jayega (44th Amendment 1978).',
    bareAct:
      'No person shall be deprived of his property save by authority of law.',
    cases: 'K.T. Plantation Pvt. Ltd. v. State of Karnataka (2011) 9 SCC 1, Vidya Devi v. State of Himachal Pradesh (2020) 2 SCC 569, Kolkata Municipal Corporation v. Bimal Kumar Shah (2024 INSC 435 — 7 Sub-Rights under Art. 300A).',
    notes:
      'Transferred from Part III (Articles 19(1)(f) & 31) by the 44th Amendment Act, 1978. The Supreme Court in Kolkata Municipal Corp (2024) held that Article 300A encompasses seven procedural and substantive sub-rights including notice, hearing, fair compensation, and restitution.',
    keys: '300a property right constitutional human right kt plantation vidya devi 44th amendment',
    presetPrompt:
      'Analyze the seven foundational sub-rights read into Article 300A of the Constitution by the Supreme Court in Kolkata Municipal Corporation v. Bimal Kumar Shah, 2024 INSC 435.',
  },
  {
    id: 'art-36-51',
    part: 'Part IV',
    metaLeft: 'Part IV • Directive Principles (Arts 36–51)',
    metaLeftUr: 'Hissa IV • Riyasati Policy ke Rehnuma Asool (DPSP)',
    title: 'Articles 36–51 — Directive Principles of State Policy (DPSP)',
    titleUr: 'Articles 36–51 — Falahi Riyasat ke Rehnuma Asool aur Muft Qanooni Imdad (Art 39A)',
    modalTitle: 'Articles 36–51: Directive Principles of State Policy',
    enDesc:
      'Constitutional directives for establishing a welfare state, equal justice & free legal aid (Art. 39A), and Uniform Civil Code (Art. 44).',
    urDesc:
      'Falahi riyasat qaim karne, muft qanooni imdad (Article 39A) aur samaji-maashi insaf ke aaeeni rehnuma asool.',
    bareAct:
      'Though not directly enforceable by any court (Art. 37), the principles laid down in Part IV are nevertheless fundamental in the governance of the country and it shall be the duty of the State to apply these principles in making laws.',
    cases: 'Minerva Mills v. Union of India (1980), Kesavananda Bharati (1973), Olga Tellis v. Bombay Municipal Corp (1985).',
    notes:
      'Harmony and balance between Fundamental Rights (Part III) and Directive Principles (Part IV) is an essential feature of the Basic Structure of the Constitution.',
    keys: '36 37 38 39a 44 51 part 4 dpsp directive principles legal aid welfare',
    presetPrompt:
      'Analyze the constitutional harmony between Part III (Fundamental Rights) and Part IV (Directive Principles) as laid down in Minerva Mills v. Union of India, (1980) 3 SCC 625.',
  },
  {
    id: 'art-51a',
    part: 'Part IVA',
    metaLeft: 'Part IVA • Fundamental Duties',
    metaLeftUr: 'Hissa IVA • Buniyadi Faraiz',
    title: 'Article 51A — 11 Fundamental Duties of Citizens',
    titleUr: 'Article 51A — Shehriyon ke 11 Buniyadi Faraiz',
    modalTitle: 'Article 51A: Fundamental Duties of Citizens',
    enDesc:
      'Enumerates 11 civic and constitutional duties of every Indian citizen (inserted by 42nd & 86th Amendments).',
    urDesc:
      'Har shehri ke 11 aaeeni aur ikhlaqi faraiz jo 42nd aur 86th Amendment ke zariye shamil kiye gaye.',
    bareAct:
      'It shall be the duty of every citizen of India to abide by the Constitution, cherish noble ideals of freedom struggle, uphold sovereignty, unity and integrity, promote harmony, protect natural environment, and develop scientific temper.',
    cases: 'AIIMS Students Union v. AIIMS (2002), M.C. Mehta v. Union of India (1988).',
    notes:
      'Courts rely upon Article 51A to uphold the reasonableness of legislative restrictions under Articles 14, 19, and 21.',
    keys: '51a part 4a fundamental duties 42nd amendment 86th amendment',
    presetPrompt:
      'Examine the interpretive role of Article 51A (Fundamental Duties) in testing the reasonableness of statutory restrictions on Fundamental Rights.',
  },
  {
    id: 'art-52-151',
    part: 'Part V',
    metaLeft: 'Part V • The Union & Supreme Court (Arts 52–151)',
    metaLeftUr: 'Hissa V • Markazi Hakoomat aur Supreme Court (Arts 52–151)',
    title: 'Articles 52–151 — Union Executive, Parliament & Supreme Court (Arts 124–147)',
    titleUr: 'Articles 52–151 — Sadar, Parliament aur Supreme Court ke Ikhtiyarat (Arts 124–147)',
    modalTitle: 'Part V (Articles 52–151): The Union Executive, Parliament & Judiciary',
    enDesc:
      'Governs President (Pardon Power Art. 72), Parliament, and Supreme Court jurisdiction (Original Art. 131, SLP Art. 136, Binding Law Art. 141, Complete Justice Art. 142).',
    urDesc:
      'Sadar-e-Jamhooriya (Art. 72 Maafi ka Ikhtiyar), Parliament, aur Supreme Court ke ikhtiyarat (SLP Art. 136, Binding Precedent Art. 141, Complete Justice Art. 142).',
    bareAct:
      'Article 72: Pardoning power of President. Article 136: Special Leave to Appeal (SLP) by Supreme Court. Article 141: Law declared by Supreme Court to be binding on all courts. Article 142: Enforcement of decrees and orders to do "complete justice".',
    cases: 'Supreme Court Advocates-on-Record Assn. v. UOI (2016 NJAC Case), Shilpa Sailesh v. Varun Sreenivasan (2023 — Art. 142 Scope).',
    notes:
      'Articles 136, 141, and 142 are the most frequently invoked provisions before the Supreme Court in criminal and constitutional litigation.',
    keys: '52 72 124 131 136 141 142 151 part 5 union supreme court slp complete justice',
    presetPrompt:
      'Analyze the scope and constitutional limits of the Supreme Court’s power to do "Complete Justice" under Article 142 and Special Leave Jurisdiction under Article 136.',
  },
  {
    id: 'art-243',
    part: 'Part IX',
    metaLeft: 'Part IX • Panchayats & Municipalities',
    metaLeftUr: 'Hissa IX • Panchayati Raj aur Muqami Hakoomat',
    title: 'Articles 243–243ZG — Panchayats & Urban Local Bodies',
    titleUr: 'Articles 243–243ZG — Panchayati Raj aur Municipalities ka Aaeeni Nizam',
    modalTitle: 'Part IX & Part IXA: Local Self-Government (73rd & 74th Amendments)',
    enDesc:
      'Constitutionalizes grassroots democracy through three-tier Panchayati Raj institutions and Urban Municipalities.',
    urDesc:
      '73rd aur 74th Tarmeem ke tehat Gram Sabha, Panchayats aur shehri Municipalities ko aaeeni darja diya gaya.',
    bareAct:
      'Inserted by the 73rd and 74th Constitutional Amendment Acts, 1992, establishing Gram Sabhas, three-tier Panchayats, State Election Commissions (Art. 243K), and mandatory seat reservations.',
    cases: 'Kishansing Tomar v. Municipal Corporation of Ahmedabad (2006), Vikas Kishanrao Gawali v. State of Maharashtra (2021).',
    notes:
      'Reads directly with the Eleventh Schedule (29 Panchayat subjects) and Twelfth Schedule (18 Municipal subjects).',
    keys: '243 part 9 panchayats municipalities local self government 73rd 74th',
    presetPrompt:
      'Analyze the constitutional mandate of timely local body elections under Articles 243E and 243U of the Constitution of India.',
  },
  {
    id: 'art-352-360',
    part: 'Part XVIII',
    metaLeft: 'Part XVIII • Emergency Provisions',
    metaLeftUr: 'Hissa XVIII •Hungaami Haalaat (Emergency)',
    title: 'Articles 352, 356 & 360 — National, State & Financial Emergency',
    titleUr: 'Articles 352, 356 & 360 — Qaumi, Riyasati (President Rule) aur Maali Emergency',
    modalTitle: 'Part XVIII (Articles 352–360): Emergency Provisions',
    enDesc:
      'Governs National Emergency (Art. 352), Failure of Constitutional Machinery in States (Art. 356), and non-suspension of Articles 20 & 21 (Art. 359).',
    urDesc:
      'Qaumi Emergency (Art. 352), Riyasat mein President Rule (Art. 356), aur Emergency mein bhi Articles 20 aur 21 ka muattal na hona (44th Amendment).',
    bareAct:
      'Article 352: Proclamation of Emergency on war, external aggression, or armed rebellion. Article 356: President’s Rule in States. Article 359 (as amended by 44th Amendment): Enforcement of Articles 20 and 21 can NEVER be suspended even during a National Emergency.',
    cases: 'S.R. Bommai v. Union of India (1994) 3 SCC 1, Rameshwar Prasad v. Union of India (2006).',
    notes:
      'Per S.R. Bommai, a Proclamation under Article 356 is subject to Judicial Review on grounds of mala fides or extraneous considerations, and the floor test is the sole constitutional test of majority.',
    keys: '352 356 359 360 part 18 emergency president rule bommai armed rebellion',
    presetPrompt:
      'Analyze the scope of Judicial Review of a Presidential Proclamation under Article 356 of the Constitution as settled in S.R. Bommai v. Union of India, (1994) 3 SCC 1.',
  },
  {
    id: 'art-368',
    part: 'Part XX',
    metaLeft: 'Part XX • Amendment',
    metaLeftUr: 'Hissa XX • Aaeeni Tarmeem',
    title: "Article 368 — Parliament's Power to Amend",
    titleUr: 'Article 368 — Aaeen mein Tarmeem Karne ka Parlimani Ikhtiyar',
    modalTitle: 'Article 368: Power of Parliament to Amend Constitution',
    enDesc:
      'Constituent amending mechanism, bounded by the non-negotiable Basic Structure Doctrine.',
    urDesc:
      'Aaeen mein tarmeem karne ka parliamentary ikhtiyar, jo Basic Structure doctrine ke tehat paband hai.',
    bareAct:
      'Parliament may in exercise of its constituent power amend by way of addition, variation or repeal any provision of this Constitution in accordance with the procedure laid down in this article.',
    cases: 'Kesavananda Bharati v. State of Kerala (1973), Minerva Mills v. UOI (1980), I.R. Coelho v. State of TN (2007).',
    notes:
      'Constituent power is not unlimited. Parliament cannot destroy or alter the Basic Structure of the Constitution.',
    keys: '368 amendment constituent power basic structure kesavananda part 20',
    presetPrompt:
      'Analyze the scope and implied limitations on Parliament’s constituent power under Article 368 of the Constitution of India.',
  },
];

const SCHEDULES_DIRECTORY: ConstitutionItem[] = [
  {
    id: 'sched-1',
    metaLeft: 'First Schedule',
    metaLeftUr: 'Pehla Schedule',
    title: 'Schedule 1 — States and Union Territories',
    titleUr: 'Schedule 1 — Riyasatein aur Union Territories',
    modalTitle: 'First Schedule (Articles 1 and 4)',
    enDesc: 'Lists all Indian States and Union Territories with demarcated geographical boundaries.',
    urDesc: 'Hindustan ki tamam riyasaton aur UTs ki sarhadon ki fehrist.',
    bareAct: 'Contains the official constitutional list and territorial extent of 28 States and 8 Union Territories of India.',
    cases: 'In Re: Berubari Union (1960), In Re: Article 370 (2023).',
    notes: 'Any alteration to state boundaries under Articles 2 or 3 requires a consequential amendment to the First Schedule.',
    keys: 'schedule 1 first states union territories',
    presetPrompt: 'Explain the relationship between Articles 1–4 and the First and Fourth Schedules of the Constitution of India.',
  },
  {
    id: 'sched-2',
    metaLeft: 'Second Schedule',
    metaLeftUr: 'Doosra Schedule',
    title: 'Schedule 2 — Salaries & Emoluments',
    titleUr: 'Schedule 2 — Aala Aohdedaron aur Judges ki Tankhwahein',
    modalTitle: 'Second Schedule: Emoluments, Allowances and Privileges',
    enDesc: 'Provisions regarding salaries and privileges of the President, Governors, Judges, and CAG.',
    urDesc: 'Sadar, Governors, Judges aur CAG ki tankhwahon aur maraat ke qawaneen.',
    bareAct: 'Governs emoluments of the President, Governors, Speakers/Deputy Speakers, Judges of the Supreme Court and High Courts, and the Comptroller and Auditor-General of India.',
    cases: 'All India Judges Association v. Union of India.',
    notes: 'Charged on the Consolidated Fund of India to guarantee financial independence of constitutional offices.',
    keys: 'schedule 2 second salaries president governors judges',
    presetPrompt: 'Examine how the Second Schedule safeguards the institutional independence of the Supreme Court and High Court Judiciary.',
  },
  {
    id: 'sched-3',
    metaLeft: 'Third Schedule',
    metaLeftUr: 'Teesra Schedule',
    title: 'Schedule 3 — Forms of Oaths & Affirmations',
    titleUr: 'Schedule 3 — Halaf (Oaths) aur Iqrar ke Namoonay',
    modalTitle: 'Third Schedule: Forms of Oaths or Affirmations',
    enDesc: 'Prescribed official oaths for Union/State ministers, MPs, MLAs, and SC/HC judges.',
    urDesc: 'Wuzra, Parlimani arkaan aur Judges ke halaf lene ke qanooni alfaz.',
    bareAct: 'Contains the statutory text of oaths of office and secrecy for Union & State Ministers, candidates for Parliament/State Legislature, MPs, MLAs, Supreme Court & High Court Judges, and the CAG.',
    cases: 'Manoj Narula v. Union of India (2014) 9 SCC 1.',
    notes: 'Note that the Oaths of the President (Art. 60), Vice-President (Art. 69), and Governors (Art. 159) are set out in their respective Articles rather than the Third Schedule.',
    keys: 'schedule 3 third oaths affirmations ministers judges',
    presetPrompt: 'Compare the constitutional oaths contained in the Third Schedule with the oaths prescribed in Articles 60, 69, and 159.',
  },
  {
    id: 'sched-4',
    metaLeft: 'Fourth Schedule',
    metaLeftUr: 'Chautha Schedule',
    title: 'Schedule 4 — Allocation of Seats in Rajya Sabha',
    titleUr: 'Schedule 4 — Rajya Sabha ki Nashaston (Seats) ki Taqseem',
    modalTitle: 'Fourth Schedule (Articles 4(1) and 80(2))',
    enDesc: 'Allocation of Council of States (Rajya Sabha) seats across States and Union Territories.',
    urDesc: 'Rajya Sabha mein har riyasat aur UT ki maqsoos nashaston (seats) ki taqseem.',
    bareAct: 'Specifies the exact number of seats allocated to each State and Union Territory (Delhi, Puducherry, Jammu & Kashmir) in the Council of States (Rajya Sabha).',
    cases: 'Kuldip Nayar v. Union of India (2006) 7 SCC 1.',
    notes: 'Amendments to the Fourth Schedule require ratification by one-half of the State Legislatures under the Proviso to Article 368(2).',
    keys: 'schedule 4 fourth allocation seats rajya sabha',
    presetPrompt: 'Analyze the federal significance of the Fourth Schedule and Kuldip Nayar v. Union of India, (2006) 7 SCC 1.',
  },
  {
    id: 'sched-5',
    metaLeft: 'Fifth Schedule',
    metaLeftUr: 'Panchwan Schedule',
    title: 'Schedule 5 — Administration of Scheduled Areas',
    titleUr: 'Schedule 5 — Scheduled Ilaqon aur Qabail (Tribes) ka Intezam',
    modalTitle: 'Fifth Schedule (Article 244(1)): Scheduled Areas & Tribes',
    enDesc: 'Governance and safeguards for Scheduled Areas and Scheduled Tribes across Indian states.',
    urDesc: 'Makhsoos qabaili aur Scheduled ilaqon ka intezami dacha aur qanooni tahaffuz.',
    bareAct: 'Governs administration and control of Scheduled Areas and Scheduled Tribes in any State other than the States of Assam, Meghalaya, Tripura, and Mizoram through Tribes Advisory Councils and Governor’s notifications.',
    cases: 'Samatha v. State of A.P. (1997) 8 SCC 191, Chebrolu Leela Prasad Rao v. State of A.P. (2020).',
    notes: 'Empowers the Governor to direct that any particular Act of Parliament or State Legislature shall not apply or shall apply with modifications to a Scheduled Area.',
    keys: 'schedule 5 fifth scheduled areas scheduled tribes governance',
    presetPrompt: 'Analyze the scope of the Governor’s law-modifying power under Paragraph 5 of the Fifth Schedule in light of Samatha v. State of A.P., (1997) 8 SCC 191.',
  },
  {
    id: 'sched-6',
    metaLeft: 'Sixth Schedule',
    metaLeftUr: 'Chhata Schedule',
    title: 'Schedule 6 — Tribal Areas in North-East',
    titleUr: 'Schedule 6 — Assam, Meghalaya, Tripura aur Mizoram ke Tribal Ilaqe',
    modalTitle: 'Sixth Schedule (Articles 244(2) and 275(1))',
    enDesc: 'Autonomous district councils governance in Assam, Meghalaya, Tripura, and Mizoram.',
    urDesc: 'Assam, Meghalaya, Tripura aur Mizoram ke khud-mukhtar tribal councils ka nizam.',
    bareAct: 'Provides for Autonomous Districts and Autonomous Regions with elected District and Regional Councils possessing legislative, judicial, and taxation powers over land, forests, village administration, and social customs.',
    cases: 'Pu Myllai Hlychho v. State of Mizoram (2005) 2 SCC 92.',
    notes: 'Creates a higher degree of legislative and judicial self-governance than the Fifth Schedule for the four specified North-Eastern states.',
    keys: 'schedule 6 sixth tribal areas assam meghalaya tripura mizoram',
    presetPrompt: 'Compare the constitutional autonomy of Autonomous District Councils under the Sixth Schedule with Tribes Advisory Councils under the Fifth Schedule.',
  },
  {
    id: 'sched-7',
    metaLeft: 'Seventh Schedule',
    metaLeftUr: 'Satwan Schedule',
    title: 'Schedule 7 — Legislative Distribution (Union, State, Concurrent Lists)',
    titleUr: 'Schedule 7 — Qanoon Saazi ki 3 Fehristein (Union, State, Concurrent)',
    modalTitle: 'Seventh Schedule (Article 246): Three Legislative Lists',
    enDesc: 'Defines distribution of law-making power: List I (Union), List II (State), List III (Concurrent).',
    urDesc: 'Qanoon saazi ke ikhtiyarat ki 3 fehristein: Markazi (Union), Riyasati (State), aur Mushtarka (Concurrent).',
    bareAct: 'List I (Union List — 97/100 subjects); List II (State List — 66/61 subjects including Public Order & Police under Entries 1 & 2); List III (Concurrent List — 47/52 subjects including Criminal Law, Criminal Procedure, and Evidence under Entries 1, 2 & 12).',
    cases: 'State of Bombay v. F.N. Balsara (1951 — Pith & Substance), Hoechst Pharmaceuticals v. State of Bihar (1983 — Art. 254 Repugnancy).',
    notes: 'Criminal Law (BNS), Criminal Procedure (BNSS), and Evidence (BSA) fall in List III (Concurrent List), allowing State Amendments with Presidential assent under Article 254(2).',
    keys: 'schedule 7 seventh union list state concurrent legislative subjects',
    presetPrompt: 'Analyze the Doctrine of Pith and Substance under Article 246 and the Doctrine of Repugnancy under Article 254 read with List III (Entries 1 & 2) of the Seventh Schedule.',
  },
  {
    id: 'sched-8',
    metaLeft: 'Eighth Schedule',
    metaLeftUr: 'Aathwan Schedule',
    title: 'Schedule 8 — Recognized Official Languages',
    titleUr: 'Schedule 8 — Aaeen mein Tasleem Shuda 22 Sarkari Zabanein',
    modalTitle: 'Eighth Schedule (Articles 344(1) and 351): 22 Languages',
    enDesc: 'Specifies the 22 official languages recognized under the Constitution of India.',
    urDesc: 'Aaeen mein tasleem shuda 22 sarkari zabanon ki fehrist.',
    bareAct: 'Lists 22 recognized languages including Assamese, Bengali, Bodo, Dogri, Gujarati, Hindi, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri, Marathi, Nepali, Odia, Punjabi, Sanskrit, Santhali, Sindhi, Tamil, Telugu, and Urdu.',
    cases: 'Union of India v. Murasoli Maran (1977) 2 SCC 416.',
    notes: 'Dogri, Bodo, Maithili, and Santhali were added by the 92nd Constitutional Amendment Act, 2003.',
    keys: 'schedule 8 eighth 22 official recognized languages urdu dogri kashmiri hindi',
    presetPrompt: 'Examine the constitutional provisions governing language of the Supreme Court, High Courts, and authoritative texts under Articles 348 and the Eighth Schedule.',
  },
  {
    id: 'sched-9',
    metaLeft: 'Ninth Schedule',
    metaLeftUr: 'Nawan Schedule',
    title: 'Schedule 9 — Validation of Acts (Judicial Review Barrier)',
    titleUr: 'Schedule 9 — Qawaneen ka Tahaffuz aur I.R. Coelho Basic Structure Test',
    modalTitle: 'Ninth Schedule (Article 31B): Judicial Review After 24.04.1973',
    enDesc: 'Historically protected land reforms; laws post-April 24, 1973 subject to Basic Structure review (I.R. Coelho).',
    urDesc: 'Zameen ki islaahat; lekin April 1973 ke baad daali gayi kanoon par judicial review laagu hota hai.',
    bareAct: 'Added by the 1st Amendment Act, 1951 (Art. 31B) to immunize agrarian and land reform statutes from challenge on the ground of violation of Fundamental Rights.',
    cases: 'I.R. Coelho v. State of Tamil Nadu (2007) 2 SCC 1 (9-Judge Bench), Waman Rao v. Union of India (1981).',
    notes: 'In I.R. Coelho (2007), a 9-Judge Bench unanimously held that any law placed in the Ninth Schedule after 24.04.1973 (the date of Kesavananda Bharati) is open to judicial review if it damages the Basic Structure or the Golden Triangle (Arts. 14, 19, 21).',
    keys: 'schedule 9 ninth land reforms judicial review validation ir coelho',
    presetPrompt: 'Analyze the ratio decidendi of the 9-Judge Constitution Bench in I.R. Coelho v. State of Tamil Nadu, (2007) 2 SCC 1 regarding the Ninth Schedule.',
  },
  {
    id: 'sched-10',
    metaLeft: 'Tenth Schedule',
    metaLeftUr: 'Daswan Schedule',
    title: 'Schedule 10 — Anti-Defection Law',
    titleUr: 'Schedule 10 — Siyasi Party Badalne (Defection) par Na-Ahli ka Qanoon',
    modalTitle: 'Tenth Schedule (Articles 102(2) and 191(2)): Anti-Defection Law',
    enDesc: 'Provisions for disqualification of MPs/MLAs on grounds of party defection (Added by 52nd Amendment).',
    urDesc: 'Siyasi party badalne par Parliman ya Assembly arkaan ko na-ahal (disqualify) karne ka qanoon.',
    bareAct: 'Inserted by the 52nd Amendment Act, 1985 (and amended by the 91st Amendment Act, 2003 omitting the 1/3rd split exception). Disqualifies legislators who voluntarily give up party membership or vote/abstain contrary to party whip.',
    cases: 'Kihoto Hollohan v. Zachillhu, 1992 Supp (2) SCC 651, Subhash Desai v. Principal Secretary, Governor of Maharashtra (2023).',
    notes: 'Per Kihoto Hollohan, the Speaker acts as a Tribunal under the Tenth Schedule and his final order is subject to Judicial Review under Articles 136, 226, and 227.',
    keys: 'schedule 10 tenth anti defection law disqualification 52nd amendment kihoto hollohan',
    presetPrompt: 'Analyze the grounds of disqualification under Paragraph 2(1)(a) and 2(1)(b) of the Tenth Schedule and the scope of Judicial Review under Kihoto Hollohan.',
  },
  {
    id: 'sched-11',
    metaLeft: 'Eleventh Schedule',
    metaLeftUr: 'Gyarhwan Schedule',
    title: 'Schedule 11 — Powers of Panchayats (Rural Governance)',
    titleUr: 'Schedule 11 — Panchayats ke 29 Intezami Ikhtiyarat',
    modalTitle: 'Eleventh Schedule (Article 243G): 29 Panchayat Matters',
    enDesc: 'Contains 29 operational subjects specified for Panchayati Raj bodies (73rd Amendment, 1992).',
    urDesc: 'Panchayati Raj ke 29 intezami shobe aur muqami dehi hakoomat ke ikhtiyarat.',
    bareAct: 'Inserted by the 73rd Amendment Act, 1992, enumerating 29 functional items including agriculture, minor irrigation, rural housing, drinking water, rural electrification, primary education, health, and public distribution system.',
    cases: 'Bhanumati v. State of Uttar Pradesh (2010) 12 SCC 1.',
    notes: 'Read with Article 243G for devolution of powers and responsibilities to Panchayats.',
    keys: 'schedule 11 eleventh panchayats rural local self government 29 matters',
    presetPrompt: 'Examine the constitutional scheme of devolution under Article 243G read with the Eleventh Schedule.',
  },
  {
    id: 'sched-12',
    metaLeft: 'Twelfth Schedule',
    metaLeftUr: 'Barhwan Schedule',
    title: 'Schedule 12 — Powers of Municipalities (Urban Governance)',
    titleUr: 'Schedule 12 — Shehri Municipalities ke 18 Ikhtiyarat',
    modalTitle: 'Twelfth Schedule (Article 243W): 18 Municipal Matters',
    enDesc: 'Specifies 18 functional matters for Municipalities and urban governance (74th Amendment, 1992).',
    urDesc: 'Shehri muqami hakoomaton (Municipalities) ke 18 intezami ikhtiyarat.',
    bareAct: 'Inserted by the 74th Amendment Act, 1992, enumerating 18 functional items including urban planning, regulation of land-use, roads and bridges, water supply, public health, solid waste management, and urban forestry.',
    cases: 'Lafarge Umiam Mining Pvt. Ltd. v. Union of India (2011).',
    notes: 'Read with Article 243W for devolution of powers to Urban Local Bodies.',
    keys: 'schedule 12 twelfth municipalities urban local bodies 18 matters',
    presetPrompt: 'Examine the constitutional mandate of Article 243W read with the Twelfth Schedule regarding urban local governance.',
  },
];

const AMENDMENTS_DIRECTORY: ConstitutionItem[] = [
  {
    id: 'amend-1',
    metaLeft: '1951 • Fundamental Rights Modification',
    metaLeftUr: '1951 • Buniyadi Haqooq aur 9th Schedule',
    title: '1st Amendment Act, 1951',
    titleUr: 'Pehli Aaeeni Tarmeem (1st Amendment Act, 1951)',
    modalTitle: '1st Constitutional Amendment Act, 1951',
    enDesc: 'Added 9th Schedule, Articles 31A/31B, and placed reasonable restrictions on free speech under 19(2).',
    urDesc: '9th Schedule shamil kiya aur aazadi-e-izhar par munasib pabandiyan lagayin.',
    bareAct: 'Inserted Articles 15(4), 31A, 31B, and the Ninth Schedule; amended Article 19(2) to add "public order", "friendly relations with foreign States", and "incitement to an offence" as grounds of reasonable restriction.',
    cases: 'Shankari Prasad Singh Deo v. Union of India, AIR 1951 SC 458; Romesh Thappar v. State of Madras, AIR 1950 SC 124.',
    notes: 'Enacted by the Provisional Parliament to overcome judicial invalidation of zamindari abolition laws and speech restrictions.',
    keys: '1st 1951 amendment ninth schedule free speech restrictions 31a 31b',
    presetPrompt: 'Analyze the constitutional background and validity of the First Amendment Act, 1951 in Shankari Prasad v. Union of India, AIR 1951 SC 458.',
  },
  {
    id: 'amend-42',
    metaLeft: '1976 • "Mini-Constitution"',
    metaLeftUr: '1976 • "Mini-Constitution" Tarmeem',
    title: '42nd Amendment Act, 1976',
    titleUr: '42nd Aaeeni Tarmeem, 1976 (Mini-Constitution)',
    modalTitle: '42nd Constitutional Amendment Act, 1976',
    enDesc: "Added 'Socialist, Secular, Integrity' to Preamble; introduced Fundamental Duties (Part IVA, Art 51A).",
    urDesc: "Preamble mein 'Socialist, Secular' alfaz jode aur Buniyadi Faraiz (Art 51A) nafiz kiye.",
    bareAct: 'Added "Socialist", "Secular", and "and integrity" to the Preamble; inserted Part IVA (Fundamental Duties — Art. 51A) and Part XIVA (Tribunals — Arts. 323A/323B); added Articles 39A, 43A, 48A; transferred Education and Forests to the Concurrent List.',
    cases: 'Minerva Mills v. Union of India, (1980) 3 SCC 625 (struck down Clauses 4 & 5 of Art. 368 added by 42nd Amendment).',
    notes: 'While the Supreme Court struck down the clauses attempting to oust judicial review of constitutional amendments in Minerva Mills, the Preamble additions and Part IVA remain in force.',
    keys: '42nd 1976 mini constitution socialist secular integrity duties 51a minerva mills',
    presetPrompt: 'Examine which provisions of the 42nd Constitutional Amendment Act, 1976 were struck down in Minerva Mills v. Union of India, (1980) 3 SCC 625.',
  },
  {
    id: 'amend-44',
    metaLeft: '1978 • Restoration of Civil Liberties',
    metaLeftUr: '1978 • Shehri Aazadiyon ki Bahali',
    title: '44th Amendment Act, 1978',
    titleUr: '44th Aaeeni Tarmeem, 1978 (Articles 20 & 21 ka Tahaffuz)',
    modalTitle: '44th Constitutional Amendment Act, 1978',
    enDesc: 'Removed Right to Property from Part III (transferred to Art 300A); Art 20 & 21 immune during Emergency.',
    urDesc: 'Jaidad ke haq ko buniyadi haqooq se nikaal kar legal right banaya; Emergency mein bhi Art 20 aur 21 muattal nahi honge.',
    bareAct: 'Omitted Articles 19(1)(f) and 31 (Right to Property) and inserted Article 300A; replaced "internal disturbance" with "armed rebellion" in Art. 352; amended Art. 359 so that enforcement of Articles 20 and 21 can never be suspended during an Emergency.',
    cases: 'K.T. Plantation Pvt. Ltd. v. State of Karnataka, (2011) 9 SCC 1.',
    notes: 'Statutorily neutralized the ADM Jabalpur (1976) majority ruling by rendering Articles 20 and 21 non-derogable even during a National Emergency.',
    keys: '44th 1978 property legal right article 300a 20 21 emergency armed rebellion',
    presetPrompt: 'Analyze how the 44th Constitutional Amendment Act, 1978 transformed the Emergency framework and the status of Right to Property under Article 300A.',
  },
  {
    id: 'amend-52',
    metaLeft: '1985 • Political Defection',
    metaLeftUr: '1985 • Anti-Defection Qanoon',
    title: '52nd Amendment Act, 1985',
    titleUr: '52nd Aaeeni Tarmeem, 1985 (Anti-Defection Law)',
    modalTitle: '52nd Constitutional Amendment Act, 1985',
    enDesc: 'Introduced Tenth Schedule to combat political defection and opportunistic floor crossing.',
    urDesc: 'Party badalne ke khilaf 10th Schedule shamil karke sakhth qanoon banaya.',
    bareAct: 'Amended Articles 101, 102, 190, and 191 and added the Tenth Schedule providing for disqualification of Members of Parliament and State Legislatures on the ground of defection.',
    cases: 'Kihoto Hollohan v. Zachillhu, 1992 Supp (2) SCC 651.',
    notes: 'Further strengthened by the 91st Amendment Act, 2003, which deleted Paragraph 3 (the one-third split exception) and capped Council of Ministers strength at 15%.',
    keys: '52nd 1985 anti defection tenth schedule floor crossing kihoto hollohan',
    presetPrompt: 'Analyze the constitutional validity and judicial review of Speaker decisions under the 52nd Amendment Act, 1985 (Tenth Schedule).',
  },
  {
    id: 'amend-73-74',
    metaLeft: '1992 • Local Self Governance',
    metaLeftUr: '1992 • Panchayati Raj aur Municipalities',
    title: '73rd & 74th Amendment Acts, 1992',
    titleUr: '73rd aur 74th Aaeeni Tarmeem, 1992 (Panchayats & Municipalities)',
    modalTitle: '73rd & 74th Constitutional Amendment Acts, 1992',
    enDesc: 'Granted constitutional status to Panchayats (Part IX) and Municipalities (Part IXA).',
    urDesc: 'Gaon ke Panchayats aur shehron ke Municipalities ko aaeeni darja ata kiya.',
    bareAct: 'Inserted Part IX (The Panchayats — Arts. 243 to 243O) + Eleventh Schedule, and Part IXA (The Municipalities — Arts. 243P to 243ZG) + Twelfth Schedule.',
    cases: 'Vikas Kishanrao Gawali v. State of Maharashtra, (2021) 6 SCC 73.',
    notes: 'Mandates minimum one-third reservation for women in all rural and urban local bodies.',
    keys: '73rd 74th 1992 panchayati raj municipalities local government part 9',
    presetPrompt: 'Examine the constitutional framework of third-tier governance introduced by the 73rd and 74th Constitutional Amendment Acts, 1992.',
  },
  {
    id: 'amend-86',
    metaLeft: '2002 • Right to Education',
    metaLeftUr: '2002 • Taleem ka Buniyadi Haq (Art 21A)',
    title: '86th Amendment Act, 2002',
    titleUr: '86th Aaeeni Tarmeem, 2002 (Muft aur Lazmi Taleem — Art 21A)',
    modalTitle: '86th Constitutional Amendment Act, 2002',
    enDesc: 'Inserted Article 21A: Right to free and compulsory education for children aged 6 to 14 years.',
    urDesc: 'Article 21A joda: 6 se 14 saal ke bachon ke liye muft aur lazmi taleem ko buniyadi haq banaya.',
    bareAct: 'Inserted Article 21A (Fundamental Right to Education for children 6–14 years), substituted Article 45 (early childhood care below 6 years), and added Clause (k) to Article 51A (Fundamental Duty of parent/guardian).',
    cases: 'Society for Unaided Private Schools of Rajasthan v. Union of India, (2012) 6 SCC 1; Pramati Educational & Cultural Trust v. UOI, (2014) 8 SCC 1.',
    notes: 'Operationalized through the Right of Children to Free and Compulsory Education (RTE) Act, 2009.',
    keys: '86th 2002 education fundamental right 21a children rte',
    presetPrompt: 'Analyze the constitutional validity of Article 21A (86th Amendment) as upheld in Pramati Educational & Cultural Trust v. Union of India, (2014) 8 SCC 1.',
  },
  {
    id: 'amend-101',
    metaLeft: '2016 • Indirect Taxation',
    metaLeftUr: '2016 • GST Nizam (Art 246A & 279A)',
    title: '101st Amendment Act, 2016',
    titleUr: '101st Aaeeni Tarmeem, 2016 (Goods & Services Tax — GST)',
    modalTitle: '101st Constitutional Amendment Act, 2016 (GST)',
    enDesc: 'Introduced uniform Goods and Services Tax (GST) regime and constituted the GST Council.',
    urDesc: 'Goods & Services Tax (GST) ka yaksaan markazi nizam nafiz kiya.',
    bareAct: 'Inserted Articles 246A (simultaneous legislative power of Parliament and State Legislatures over GST), 269A (inter-state GST), and 279A (GST Council).',
    cases: 'Union of India v. Mohit Minerals Pvt. Ltd., (2022) 10 SCC 700.',
    notes: 'In Mohit Minerals (2022), the Supreme Court held that Article 246A embodies "cooperative federalism" and recommendations of the GST Council under Article 279A have persuasive value.',
    keys: '101st 2016 gst goods and services tax 246a 279a mohit minerals',
    presetPrompt: 'Analyze the nature of simultaneous legislative competence under Article 246A and the ratio of Union of India v. Mohit Minerals Pvt. Ltd., (2022) 10 SCC 700.',
  },
  {
    id: 'amend-103',
    metaLeft: '2019 • Affirmative Action',
    metaLeftUr: '2019 • EWS 10% Reservation Quota',
    title: '103rd Amendment Act, 2019',
    titleUr: '103rd Aaeeni Tarmeem, 2019 (EWS 10% Quota — Arts 15(6) & 16(6))',
    modalTitle: '103rd Constitutional Amendment Act, 2019 (EWS Quota)',
    enDesc: 'Provided up to 10% reservation for Economically Weaker Sections (EWS) in education & jobs.',
    urDesc: 'Mali taur par kamzor tabqaat (EWS) ke liye taleem aur naukriyon mein 10% quota mukhtas kiya.',
    bareAct: 'Inserted Clause (6) in Article 15 and Clause (6) in Article 16 empowering the State to make up to 10% reservation for Economically Weaker Sections (EWS) of citizens other than classes mentioned in Clauses (4) and (5).',
    cases: 'Janhit Abhiyan v. Union of India, (2023) 5 SCC 1 (5-Judge Constitution Bench — Upheld 3:2).',
    notes: 'The 5-Judge Constitution Bench in Janhit Abhiyan (2022/2023) held that reservation structured singularly on economic criteria does not violate the Basic Structure of the Constitution.',
    keys: '103rd 2019 ews 10 reservation economically weaker sections janhit abhiyan 15(6) 16(6)',
    presetPrompt: 'Analyze the majority and minority opinions of the 5-Judge Constitution Bench in Janhit Abhiyan v. Union of India, (2023) 5 SCC 1 regarding the 103rd Amendment.',
  },
  {
    id: 'amend-106',
    metaLeft: '2023 • Gender Representation',
    metaLeftUr: '2023 • Khawateen ke Liye 33% Nashastein',
    title: '106th Amendment Act, 2023',
    titleUr: '106th Aaeeni Tarmeem, 2023 (Nari Shakti Vandan Adhiniyam)',
    modalTitle: '106th Constitutional Amendment Act, 2023',
    enDesc: 'Nari Shakti Vandan Adhiniyam: One-third reservation for women in Lok Sabha and State Legislative Assemblies.',
    urDesc: 'Lok Sabha aur Assemblies mein aurton ke liye 33% (ek-tihai) nashastein makhsoos ki gayi.',
    bareAct: 'Inserted Articles 330A (1/3rd reservation for women in Lok Sabha), 332A (1/3rd reservation for women in State Legislative Assemblies), 239AA(2)(ba) (NCT of Delhi Assembly), and 334A.',
    cases: 'Jaya Thakur v. Union of India (Pending/Considered before Supreme Court regarding delimitation clause under Art. 334A).',
    notes: 'Under Article 334A(1), the reservation shall take effect after an exercise of delimitation is undertaken after the relevant figures for the first census taken after commencement of the 106th Amendment have been published.',
    keys: '106th 2023 women reservation lok sabha assemblies nari shakti 330a 332a',
    presetPrompt: 'Examine the constitutional scheme of Articles 330A, 332A, and 334A introduced by the 106th Constitutional Amendment Act, 2023.',
  },
];

const PART_CHIPS = [
  { id: 'ALL', en: 'All Parts', ur: 'Tamam Hisse' },
  { id: 'Part I', en: 'Part I (1–4)', ur: 'Hissa I (1–4)' },
  { id: 'Part II', en: 'Part II (5–11)', ur: 'Hissa II (5–11)' },
  { id: 'Part III', en: 'Part III (12–35)', ur: 'Hissa III (12–35)' },
  { id: 'Part IV', en: 'Part IV (36–51)', ur: 'Hissa IV (36–51)' },
  { id: 'Part IVA', en: 'Part IVA (51A)', ur: 'Hissa IVA (51A)' },
  { id: 'Part V', en: 'Part V (52–151)', ur: 'Hissa V (52–151)' },
  { id: 'Part IX', en: 'Part IX (Panchayats)', ur: 'Hissa IX (Panchayats)' },
  { id: 'Part XVIII', en: 'Part XVIII (Emergency)', ur: 'Hissa XVIII (Emergency)' },
  { id: 'Part XX', en: 'Part XX (Art 368)', ur: 'Hissa XX (Art 368)' },
];

interface ConstitutionViewProps {
  onBackToStation: () => void;
  onInjectConstitutionalQuery: (prompt: string) => void;
}

export const ConstitutionView: React.FC<ConstitutionViewProps> = ({
  onInjectConstitutionalQuery,
}) => {
  const { lang, t, isBookmarked, toggleBookmark, openFeedbackModal, triggerHaptic } = useLanguage();
  const [subTab, setSubTab] = useState<ConstSubTab>('constArticlesView');
  const [selectedPart, setSelectedPart] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModalItem, setActiveModalItem] = useState<ConstitutionItem | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filterList = (items: ConstitutionItem[], checkPart: boolean) => {
    const q = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      if (checkPart && selectedPart !== 'ALL' && item.part !== selectedPart) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        item.metaLeft,
        item.metaLeftUr || '',
        item.title,
        item.titleUr || '',
        item.enDesc,
        item.urDesc,
        item.bareAct,
        item.cases,
        item.notes,
        item.keys,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  };

  const filteredArticles = useMemo(
    () => filterList(ARTICLES_DIRECTORY, true),
    [searchTerm, selectedPart]
  );
  const filteredSchedules = useMemo(() => filterList(SCHEDULES_DIRECTORY, false), [searchTerm]);
  const filteredAmendments = useMemo(() => filterList(AMENDMENTS_DIRECTORY, false), [searchTerm]);

  const handleSearchFocus = () => {
    setTimeout(() => {
      searchInputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 300);
  };

  const renderCards = (items: ConstitutionItem[]) =>
    items.map((card) => (
      <div
        key={card.id}
        data-part={card.part}
        data-keys={card.keys}
        onClick={() => {
          triggerHaptic();
          setActiveModalItem(card);
        }}
        className="card const-card flex flex-col justify-between"
      >
        <div>
          <div className="card-meta pr-6">
            <span>{lang === 'ur' && card.metaLeftUr ? card.metaLeftUr : card.metaLeft}</span>
            <span>{t('Tap Details ➔', 'Tafseel Dekhein ➔')}</span>
          </div>
          <h4>{lang === 'ur' && card.titleUr ? card.titleUr : card.title}</h4>
          <p data-en={card.enDesc} data-ur={card.urDesc}>
            {lang === 'ur' ? card.urDesc : card.enDesc}
          </p>
        </div>
        <button
          type="button"
          title={t('Bookmark with personal notes', 'Bookmark aur notes mein mehfooz karein')}
          className={`card-bookmark-btn ${isBookmarked('art', card.id) ? 'saved' : ''}`}
          onClick={(e) => toggleBookmark(e, 'art', card.id, card.title, card.bareAct)}
        >
          🔖
        </button>
      </div>
    ));

  return (
    <div id="constitution" className="tab-content active max-w-[1440px] w-full mx-auto flex-1">
      {/* Sub navigation for Articles, Schedules, Amendments */}
      <div className="sub-tabs">
        <button
          type="button"
          id="subBtnArticles"
          onClick={() => setSubTab('constArticlesView')}
          className={`sub-tab-btn ${subTab === 'constArticlesView' ? 'active' : ''}`}
        >
          {t('Articles (1–395 Directory)', 'Dafaat (1–395 Directory)')}
        </button>
        <button
          type="button"
          id="subBtnSchedules"
          onClick={() => setSubTab('constSchedulesView')}
          className={`sub-tab-btn ${subTab === 'constSchedulesView' ? 'active' : ''}`}
        >
          {t('12 Schedules', '12 Schedules (Fehrist)')}
        </button>
        <button
          type="button"
          id="subBtnAmendments"
          onClick={() => setSubTab('constAmendmentsView')}
          className={`sub-tab-btn ${subTab === 'constAmendmentsView' ? 'active' : ''}`}
        >
          {t('Major Amendments', 'Ahem Tarameem (Amendments)')}
        </button>
      </div>

      {/* Unified Search Box for Constitution */}
      <input
        ref={searchInputRef}
        type="text"
        id="constMainSearch"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={handleSearchFocus}
        className="search-box"
        placeholder={t(
          'Search Article no., schedule, amendment, fundamental rights...',
          'Article number, schedule ya amendment talash karein...'
        )}
      />

      {/* View 1: Articles Directory */}
      {subTab === 'constArticlesView' && (
        <div id="constArticlesView">
          <div className="chip-container">
            {PART_CHIPS.map((c) => (
              <span
                key={c.id}
                onClick={() => setSelectedPart(c.id)}
                className={`chip ${selectedPart === c.id ? 'active' : ''}`}
              >
                {lang === 'ur' ? c.ur : c.en}
              </span>
            ))}
          </div>

          <div id="articlesList" className="grid-container">
            {renderCards(filteredArticles)}
          </div>
        </div>
      )}

      {/* View 2: 12 Schedules Breakdown */}
      {subTab === 'constSchedulesView' && (
        <div id="constSchedulesView">
          <div id="schedulesList" className="grid-container">
            {renderCards(filteredSchedules)}
          </div>
        </div>
      )}

      {/* View 3: Major Amendments */}
      {subTab === 'constAmendmentsView' && (
        <div id="constAmendmentsView">
          <div id="amendmentsList" className="grid-container">
            {renderCards(filteredAmendments)}
          </div>
        </div>
      )}

      {/* Universal Interactive Modal */}
      <div
        id="detailModal"
        className={`modal-overlay ${activeModalItem ? 'open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setActiveModalItem(null);
          }
        }}
      >
        {activeModalItem && (
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div id="modalTitle" className="modal-title">
                {activeModalItem.modalTitle}
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setActiveModalItem(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body" id="modalDynamicBody">
              <h5>{t('Bare Act Provision / Summary', 'Bare Act Dafaa / Khulasa')}</h5>
              <p>{activeModalItem.bareAct}</p>

              <h5>{t('Key Landmark Precedents', 'Ahem Adalati Faisle (Landmark Cases)')}</h5>
              <p>{activeModalItem.cases}</p>

              <h5>{t('Judicial & Exam Examination Notes', 'Adalati Tashreeh aur Imtihani Notes')}</h5>
              <p>{activeModalItem.notes}</p>

              <div className="mt-4 pt-3 border-t border-[#2b313c] flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      activeModalItem.title + ' site:indiacode.nic.in'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dossier-action-btn"
                  >
                    Official IndiaCode Link ➔
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const subj = activeModalItem.title;
                      setActiveModalItem(null);
                      openFeedbackModal(subj);
                    }}
                    className="dossier-action-btn"
                  >
                    ⚠️ {t('Report Issue', 'Ghalti Report Karein')}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const prompt = activeModalItem.presetPrompt;
                    setActiveModalItem(null);
                    onInjectConstitutionalQuery(prompt);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#f59e0b] text-black font-semibold text-xs cursor-pointer"
                >
                  <span>
                    {t('Analyze in AI Counsel Station', 'AI Counsel Station mein Tajziya Karein')}
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
