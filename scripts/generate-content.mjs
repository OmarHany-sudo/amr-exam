import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { PDFParse } from "pdf-parse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const filesDir = path.join(root, "files");
const dataDir = path.join(root, "data");
const publicDir = path.join(root, "public", "generated");

const MAX_SOURCE_TEXT = 900;
const IMPORTANT_TERMS = [
  "الحاسوب",
  "الإعلام",
  "الإذاعة",
  "التلفزيون",
  "الصحافة",
  "الصحافة الرقمية",
  "البث",
  "البث الرقمي",
  "البودكاست",
  "المونتاج",
  "الأرشيف",
  "الذكاء الاصطناعي",
  "الواقع المعزز",
  "CRM",
  "Salesforce",
  "CMS",
  "WordPress",
  "Drupal",
  "Joomla",
  "Adobe Premiere Pro",
  "Photoshop",
  "Audacity",
  "DAB",
  "HD Radio",
  "Live Streaming",
  "On-Demand",
];

const REVIEW_POINT_LIMIT = 22;
const CARD_BODY_LIMIT = 32;

function normalizeArabic(value = "") {
  return value
    .replace(/[\u200e\u200f\u202a-\u202e]/g, "")
    .replace(/[اإأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value = "") {
  return value
    .replace(/[\u200e\u200f\u202a-\u202e]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function compact(value = "") {
  return cleanText(value.replace(/\n+/g, " "));
}

function limitWords(value = "", max = CARD_BODY_LIMIT) {
  const words = compact(value).split(/\s+/).filter(Boolean);
  if (words.length <= max) return words.join(" ");
  return `${words.slice(0, max).join(" ")}...`;
}

function firstSentence(value = "", max = CARD_BODY_LIMIT) {
  const sentence = splitSentences(value)[0] || compact(value);
  return limitWords(sentence, max);
}

function escapeRegExp(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sourceText(value = "") {
  return cleanText(value).slice(0, MAX_SOURCE_TEXT);
}

function hasArabic(value = "") {
  return /[\u0600-\u06ff]/.test(value);
}

function sourceId(fileIndex, pageNumber, localIndex = 0) {
  return `s-${fileIndex + 1}-${pageNumber}-${localIndex}`;
}

function makeSource(fileName, pageNumber, text, fileIndex = 0, localIndex = 0) {
  return {
    id: sourceId(fileIndex, pageNumber, localIndex),
    fileName,
    page: pageNumber,
    text: sourceText(text),
  };
}

function item(id, title, body, sources, extra = {}) {
  return {
    id,
    title: limitWords(title, 18).slice(0, 160),
    body: limitWords(body, CARD_BODY_LIMIT),
    sources,
    ...extra,
  };
}

function splitLines(text) {
  return cleanText(text)
    .split("\n")
    .map((line) => compact(line))
    .filter((line) => line.length > 2 && !/^Dr\/|^MGN-|^\d+$/.test(line));
}

function splitSentences(text) {
  return compact(text)
    .split(/(?<=[.؟!:؛])\s+|(?:\s+[o]\s+)/u)
    .map((part) => compact(part))
    .filter((part) => part.length > 24 && hasArabic(part));
}

function splitParagraphs(text) {
  const lines = splitLines(text);
  const chunks = [];
  let current = "";
  for (const line of lines) {
    const isBullet = /^[o\-•]|\d+\s*[.)]/.test(line);
    const isHeadingLine = isHeading(line);
    if ((isBullet || isHeadingLine) && current.length > 80) {
      chunks.push(current);
      current = "";
    }
    current = compact(`${current} ${line}`);
    if (/[.؟!:؛]$/.test(line) && current.length > 120) {
      chunks.push(current);
      current = "";
    } else if (current.length > 520) {
      chunks.push(current);
      current = "";
    }
  }
  if (current.length > 35) chunks.push(current);
  return chunks.filter((chunk, index, arr) => arr.findIndex((x) => normalizeArabic(x) === normalizeArabic(chunk)) === index);
}

function isHeading(line) {
  const text = compact(line);
  if (!hasArabic(text) || text.length < 4 || text.length > 120) return false;
  if (/^(|o|-|•)/.test(text)) return false;
  return (
    /^المحاضره|^المحاضرة|^الوحده|^الوحدة|^الفصل|^اولا|^ثانيا|^ثالثا|^رابعا|^[أابجده]\)|^\d+\s*[.)]/.test(
      normalizeArabic(text),
    ) ||
    /[:：]$/.test(text)
  );
}

function detectTitle(pageText, fallback) {
  const lines = splitLines(pageText);
  const firstGood = lines.find((line) => hasArabic(line) && line.length < 100);
  return firstGood || fallback.replace(/\.pdf$/i, "").trim() || fallback;
}

function extractTermFromHeading(heading) {
  return compact(heading)
    .replace(/^[\d\s.)]+/, "")
    .replace(/^[أابجده]\)\s*/, "")
    .replace(/^(اولا|ثانيا|ثالثا|رابعا)\s*[:：]?\s*/u, "")
    .replace(/[:：].*$/, "")
    .slice(0, 90)
    .trim();
}

function readableTitle(title = "") {
  return compact(title)
    .replace(/\s+/g, " ")
    .replace(/\s+([:،.؛])/g, "$1")
    .replace(/([:،.؛])(?=\S)/g, "$1 ")
    .trim();
}

function buildChapterContent(pages, startPage, heading) {
  const page = pages.find((p) => p.page === startPage);
  if (!page) return "";
  const lines = splitLines(page.text);
  const index = lines.findIndex((line) => normalizeArabic(line) === normalizeArabic(heading));
  const after = index >= 0 ? lines.slice(index + 1) : lines;
  const selected = after.filter((line) => !isHeading(line)).slice(0, 8);
  return selected.join(" ");
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((entry) => {
    const key = keyFn(entry);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function extractWithPdfParse(buffer) {
  try {
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo().catch(() => null);
    await parser.destroy();
    return {
      textLength: textResult?.text?.length || 0,
      info: infoResult?.info || null,
    };
  } catch {
    return { textLength: 0, info: null };
  }
}

async function extractPdf(filePath, fileName, fileIndex) {
  const buffer = await readFile(filePath);
  const data = new Uint8Array(buffer);
  const parseCheck = await extractWithPdfParse(buffer);
  const pdf = await pdfjs.getDocument({
    data,
    isEvalSupported: false,
    disableFontFace: true,
    useWorkerFetch: false,
  }).promise;

  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const parts = [];
    for (const textItem of textContent.items) {
      if (!("str" in textItem)) continue;
      const str = textItem.str || "";
      if (!str.trim()) {
        if (textItem.hasEOL) parts.push("\n");
        continue;
      }
      parts.push(str);
      parts.push(textItem.hasEOL ? "\n" : " ");
    }
    const text = cleanText(parts.join(""));
    pages.push({
      id: `p-${fileIndex + 1}-${pageNumber}`,
      fileName,
      page: pageNumber,
      text,
      source: makeSource(fileName, pageNumber, text, fileIndex, 0),
      paragraphs: splitParagraphs(text),
      lines: splitLines(text),
    });
  }

  return {
    id: `file-${fileIndex + 1}`,
    fileName,
    title: detectTitle(pages[0]?.text || "", fileName),
    pageCount: pdf.numPages,
    pdfParseTextLength: parseCheck.textLength,
    pages,
  };
}

function buildUnits(files) {
  return files.map((file, fileIndex) => {
    const headings = [];
    file.pages.forEach((page) => {
      page.lines.forEach((line, lineIndex) => {
        if (isHeading(line)) {
          headings.push({
            id: `h-${fileIndex + 1}-${page.page}-${lineIndex}`,
            title: compact(line),
            page: page.page,
            source: makeSource(file.fileName, page.page, page.text, fileIndex, lineIndex + 1),
          });
        }
      });
    });

    const chapters = uniqueBy(headings, (heading) => normalizeArabic(heading.title)).slice(0, 18).map((heading, index) => ({
      id: `chapter-${fileIndex + 1}-${index + 1}`,
      title: heading.title,
      content: compact(buildChapterContent(file.pages, heading.page, heading.title)).slice(0, 1100),
      sources: [heading.source],
      page: heading.page,
    }));

    const overviewSources = file.pages.slice(0, Math.min(3, file.pages.length)).map((page, index) =>
      makeSource(file.fileName, page.page, page.paragraphs[0] || page.text, fileIndex, index + 30),
    );
    const overview = file.pages
      .flatMap((page) => page.paragraphs.slice(0, 2))
      .filter(Boolean)
      .slice(0, 4)
      .join(" ");

    return {
      id: `unit-${fileIndex + 1}`,
      title: file.title,
      fileName: file.fileName,
      pageCount: file.pageCount,
      overview: compact(overview).slice(0, 1400),
      sources: overviewSources,
      chapters,
    };
  });
}

function buildSummaries(units, files) {
  return units.map((unit, unitIndex) => {
    const file = files[unitIndex];
    const paragraphs = file.pages.flatMap((page) =>
      page.paragraphs.map((paragraph, paragraphIndex) => ({
        paragraph,
        source: makeSource(file.fileName, page.page, paragraph, unitIndex, paragraphIndex + 80),
      })),
    );
    const headings = unit.chapters.map((chapter) =>
      item(`${chapter.id}-idea`, chapter.title, chapter.content || chapter.title, chapter.sources, { kind: "فكرة رئيسية" }),
    );
    const important = paragraphs
      .filter((entry) => /يمكن|اصبح|ساعد|يتيح|يستخدم|ساهم|ادى|يعد|تتيح|تطور|تحول/u.test(normalizeArabic(entry.paragraph)))
      .slice(0, 8)
      .map((entry, index) => item(`summary-${unitIndex + 1}-important-${index + 1}`, "نقطة مهمة", firstSentence(entry.paragraph, REVIEW_POINT_LIMIT), [entry.source], { kind: "نقطة مهمة" }));
    const basics = paragraphs
      .filter((entry) => /قبل|بعد|بدايه|تعتمد|نظام|تقنيه|برنامج|منصات|محتوي/u.test(normalizeArabic(entry.paragraph)))
      .slice(0, 8)
      .map((entry, index) => item(`summary-${unitIndex + 1}-basic-${index + 1}`, "معلومة أساسية", firstSentence(entry.paragraph, REVIEW_POINT_LIMIT), [entry.source], { kind: "معلومة أساسية" }));
    const exam = paragraphs
      .filter((entry) => /مما|لذلك|بالتالي|يساعد|اهميه|جوده|سرعه|دقه|تفاعل|الجمهور/u.test(normalizeArabic(entry.paragraph)))
      .slice(0, 8)
      .map((entry, index) => item(`summary-${unitIndex + 1}-exam-${index + 1}`, "نقطة امتحانية", firstSentence(entry.paragraph, REVIEW_POINT_LIMIT), [entry.source], { kind: "نقطة امتحانية" }));

    return {
      id: `detailed-${unitIndex + 1}`,
      unitId: unit.id,
      unitTitle: unit.title,
      mainIdeas: headings.slice(0, 8),
      importantPoints: important,
      basics,
      examNotes: exam,
    };
  });
}

function buildDefinitions(files) {
  const candidates = [];
  files.forEach((file, fileIndex) => {
    file.pages.forEach((page) => {
      const paragraphs = page.paragraphs.length ? page.paragraphs : splitSentences(page.text);
      paragraphs.forEach((paragraph, paragraphIndex) => {
        const norm = normalizeArabic(paragraph);
        const hasDefinitionSignal =
          /تعريف|هو |هي |يعد |تعد |يقصد|عباره عن|محتوي صوتي|منصات رقميه|انظمه/u.test(norm) ||
          (/[:：]/.test(paragraph) && paragraph.length < 520);
        if (!hasDefinitionSignal) return;
        let title = paragraph.split(/[:：]/)[0] || "تعريف";
        title = title.replace(/^تعريف\s*/u, "").slice(0, 90).trim() || "تعريف";
        candidates.push(
          item(
            `definition-${fileIndex + 1}-${page.page}-${paragraphIndex + 1}`,
            title,
            firstSentence(paragraph, 28),
            [makeSource(file.fileName, page.page, paragraph, fileIndex, paragraphIndex + 160)],
            { term: title },
          ),
        );
      });
    });
  });
  return uniqueBy(candidates, (entry) => normalizeArabic(entry.title + entry.body)).slice(0, 80);
}

function buildConcepts(files, definitions) {
  const candidates = [];
  files.forEach((file, fileIndex) => {
    file.pages.forEach((page) => {
      page.lines.forEach((line, lineIndex) => {
        if (!isHeading(line)) return;
        const term = extractTermFromHeading(line);
        if (term.length < 3) return;
        const paragraphs = page.paragraphs.filter((paragraph) => normalizeArabic(paragraph).includes(normalizeArabic(term).slice(0, 12)));
        const body = paragraphs[0] || buildChapterContent(file.pages, page.page, line) || line;
        candidates.push(
          item(
            `concept-${fileIndex + 1}-${page.page}-${lineIndex + 1}`,
            term,
            firstSentence(body, 28),
            [makeSource(file.fileName, page.page, body, fileIndex, lineIndex + 260)],
            { frequency: 1 },
          ),
        );
      });
    });
  });

  definitions.slice(0, 30).forEach((definition, index) => {
    candidates.push({
      ...definition,
      id: `concept-from-definition-${index + 1}`,
      title: definition.term || definition.title,
      frequency: 1,
    });
  });

  return uniqueBy(candidates, (entry) => normalizeArabic(entry.title)).slice(0, 90);
}

function buildDictionary(files, concepts, definitions) {
  const allText = files.map((file) => file.pages.map((page) => page.text).join("\n")).join("\n");
  const terms = new Map();

  for (const term of IMPORTANT_TERMS) {
    const normTerm = normalizeArabic(term);
    const pages = [];
    files.forEach((file, fileIndex) => {
      file.pages.forEach((page) => {
        if (normalizeArabic(page.text).includes(normTerm)) {
          const paragraph = page.paragraphs.find((part) => normalizeArabic(part).includes(normTerm)) || page.text;
          pages.push(makeSource(file.fileName, page.page, paragraph, fileIndex, pages.length + 360));
        }
      });
    });
    if (pages.length) terms.set(normTerm, { term, sources: pages, count: pages.length });
  }

  concepts.concat(definitions).forEach((entry) => {
    const term = compact(entry.title).slice(0, 70);
    if (term.length < 3 || !hasArabic(term)) return;
    const key = normalizeArabic(term);
    if (!terms.has(key)) terms.set(key, { term, sources: entry.sources, count: (allText.match(new RegExp(escapeRegExp(key), "g")) || []).length || 1 });
  });

  return Array.from(terms.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 100)
    .map((entry, index) =>
      item(
        `term-${index + 1}`,
        entry.term,
        firstSentence(entry.sources[0]?.text || entry.term, 20),
        entry.sources.slice(0, 8),
        { count: entry.count },
      ),
    );
}

function buildQuestions(files, concepts, definitions, dictionary) {
  const extracted = [];
  files.forEach((file, fileIndex) => {
    file.pages.forEach((page) => {
      splitSentences(page.text).forEach((sentence, sentenceIndex) => {
        if (!/[؟?]|\b(اشرح|اذكر|علل|قارن|ما|كيف|لماذا)\b/u.test(sentence)) return;
        extracted.push(
          item(
            `question-extracted-${fileIndex + 1}-${page.page}-${sentenceIndex + 1}`,
            sentence,
            "",
            [makeSource(file.fileName, page.page, sentence, fileIndex, sentenceIndex + 460)],
            { type: "أسئلة قصيرة", answer: "" },
          ),
        );
      });
    });
  });

  const short = definitions.slice(0, 28).map((definition, index) =>
    item(
      `question-short-${index + 1}`,
      `ما المقصود بـ ${definition.term || definition.title}؟`,
      definition.body,
      definition.sources,
      { type: "أسئلة قصيرة", answer: definition.body },
    ),
  );

  const essay = concepts.slice(0, 24).map((concept, index) =>
    item(
      `question-essay-${index + 1}`,
      `اشرح موضوع ${concept.title} كما ورد في المصدر.`,
      concept.body,
      concept.sources,
      { type: "أسئلة مقالية", answer: concept.body },
    ),
  );

  const fill = dictionary.slice(0, 22).map((term, index) => {
    const text = term.body;
    const blanked = compact(text.replace(new RegExp(escapeRegExp(term.title), "i"), "........"));
    return item(
      `question-fill-${index + 1}`,
      blanked !== text ? blanked : `أكمل: ${text.slice(0, 120)} ........`,
      term.title,
      term.sources,
      { type: "أكمل", answer: term.title },
    );
  });

  const tf = concepts.slice(0, 22).map((concept, index) =>
    item(
      `question-tf-${index + 1}`,
      compact(concept.body).slice(0, 220),
      "صح",
      concept.sources,
      { type: "صح أو خطأ", answer: "صح" },
    ),
  );

  const mcqOptions = dictionary.slice(0, 32).map((entry) => entry.title);
  const mcq = definitions.slice(0, 22).map((definition, index) => {
    const correct = definition.term || definition.title;
    const options = uniqueBy([correct, ...mcqOptions.filter((option) => normalizeArabic(option) !== normalizeArabic(correct)).slice(index, index + 5)], normalizeArabic).slice(0, 4);
    return item(
      `question-mcq-${index + 1}`,
      `أي مصطلح يرتبط بالنص التالي: ${definition.body.slice(0, 180)}؟`,
      correct,
      definition.sources,
      { type: "اختر من متعدد", answer: correct, options },
    );
  });

  return uniqueBy([...extracted, ...tf, ...mcq, ...fill, ...short, ...essay], (entry) => normalizeArabic(entry.type + entry.title)).slice(0, 180);
}

function buildPastExams(files) {
  const exams = [];
  files.forEach((file, fileIndex) => {
    file.pages.forEach((page) => {
      const norm = normalizeArabic(page.text);
      if (!/امتحان|اختبار|نموذج|اسئله|اسئلة/u.test(norm)) return;
      exams.push(
        item(
          `exam-${fileIndex + 1}-${page.page}`,
          `محتوى امتحاني من ${file.title}`,
          firstSentence(page.paragraphs.slice(0, 2).join(" "), 30),
          [makeSource(file.fileName, page.page, page.text, fileIndex, page.page + 560)],
          { questions: splitSentences(page.text).filter((sentence) => /[؟?]/.test(sentence)).slice(0, 12) },
        ),
      );
    });
  });
  return exams;
}

function buildExpectedQuestions(dictionary) {
  return dictionary
    .filter((entry) => entry.count > 1 || entry.sources.length > 1)
    .slice(0, 36)
    .map((entry, index) =>
      item(
        `expected-${index + 1}`,
        `اشرح ${entry.title} كما ورد في المصادر.`,
        entry.body,
        entry.sources,
        {
          reason: `ظهر في ${entry.sources.length} صفحة/مصدر، لذلك يصلح كسؤال مراجعة سريع.`,
          files: uniqueBy(entry.sources, (source) => source.fileName).map((source) => source.fileName),
          pages: entry.sources.map((source) => source.page),
        },
      ),
    );
}

function buildFlashCards(concepts, definitions, questions) {
  return [
    ...definitions.slice(0, 35).map((definition, index) =>
      item(`flash-definition-${index + 1}`, definition.term || definition.title, definition.body, definition.sources, { category: "تعريف" }),
    ),
    ...concepts.slice(0, 30).map((concept, index) =>
      item(`flash-concept-${index + 1}`, concept.title, concept.body, concept.sources, { category: "مفهوم" }),
    ),
    ...questions
      .filter((question) => question.answer)
      .slice(0, 35)
      .map((question, index) => item(`flash-question-${index + 1}`, question.title, question.answer, question.sources, { category: "سؤال" })),
  ].slice(0, 90);
}

function belongsToFile(entry, fileName) {
  return (entry.sources || []).some((source) => source.fileName === fileName);
}

function pickForFile(entries, fileName, count) {
  return entries.filter((entry) => belongsToFile(entry, fileName)).slice(0, count);
}

function makeLectureQuickSummary(file, fileIndex, unit) {
  const candidates = file.pages.flatMap((page) =>
    page.paragraphs.map((paragraph, paragraphIndex) => ({
      paragraph,
      source: makeSource(file.fileName, page.page, paragraph, fileIndex, paragraphIndex + 700),
      score:
        (/يمكن|اصبح|ساعد|يتيح|يستخدم|ساهم|ادى|تطور|تحول|جوده|سرعه|دقه|تفاعل/u.test(normalizeArabic(paragraph)) ? 3 : 0) +
        (/قبل|بعد|نظام|تقنيه|برنامج|منصات|محتوي/u.test(normalizeArabic(paragraph)) ? 2 : 0) +
        Math.min(3, Math.floor(paragraph.length / 160)),
    })),
  );
  const selected = uniqueBy(
    candidates
      .sort((a, b) => b.score - a.score)
      .map((entry, index) =>
        item(`lecture-${fileIndex + 1}-quick-${index + 1}`, `نقطة ${index + 1}`, firstSentence(entry.paragraph, REVIEW_POINT_LIMIT), [entry.source], {
          kind: "ملخص سريع",
        }),
      ),
    (entry) => normalizeArabic(entry.body),
  ).slice(0, 12);

  if (selected.length >= 5) return selected;

  return [
    ...selected,
    ...unit.chapters.slice(0, 10 - selected.length).map((chapter, index) =>
      item(`lecture-${fileIndex + 1}-chapter-point-${index + 1}`, chapter.title, firstSentence(chapter.content || chapter.title, REVIEW_POINT_LIMIT), chapter.sources, {
        kind: "ملخص سريع",
      }),
    ),
  ].slice(0, 10);
}

function buildReviewLectures(files, units, definitions, dictionary, concepts, questions) {
  return files.map((file, fileIndex) => {
    const unit = units[fileIndex];
    const quickSummary = makeLectureQuickSummary(file, fileIndex, unit);
    const lectureDefinitions = pickForFile(definitions, file.fileName, 8);
    const lectureTerms = pickForFile(dictionary, file.fileName, 10);
    const lectureConcepts = pickForFile(concepts, file.fileName, 8);
    const examPoints = uniqueBy(
      [...quickSummary.slice(0, 4), ...lectureConcepts.slice(0, 4)].map((entry, index) => ({
        ...entry,
        id: `lecture-${fileIndex + 1}-exam-${index + 1}`,
        title: index < 4 ? "ركّز عليها" : entry.title,
        kind: "نقطة امتحانية",
      })),
      (entry) => normalizeArabic(entry.body || entry.title),
    ).slice(0, 8);
    const lectureQuestions = pickForFile(questions, file.fileName, 10);
    const quickQuiz = lectureQuestions
      .filter((question) => ["اختر من متعدد", "صح أو خطأ", "أكمل", "أسئلة قصيرة"].includes(question.type || "") && question.answer)
      .slice(0, 8);

    return {
      id: `review-lecture-${fileIndex + 1}`,
      title: readableTitle(unit.title || file.title),
      fileName: file.fileName,
      pageCount: file.pageCount,
      sources: unit.sources,
      quickSummary,
      definitions: lectureDefinitions,
      terms: lectureTerms,
      concepts: lectureConcepts,
      examPoints,
      questions: lectureQuestions,
      quickQuiz,
    };
  });
}

function buildRevision(definitions, concepts, summaries, questions) {
  const points = summaries.flatMap((summary) => [...summary.importantPoints, ...summary.examNotes]).slice(0, 42);
  return {
    definitions: definitions.slice(0, 18),
    concepts: concepts.slice(0, 18),
    points,
    questions: questions.filter((question) => question.answer).slice(0, 24),
  };
}

function buildSearchIndex(content) {
  const sections = [
    ["ملخصات", content.reviewLectures.flatMap((lecture) => lecture.quickSummary.concat(lecture.examPoints))],
    ["أسئلة", content.questions],
    ["مصطلحات", content.dictionary],
    ["تعريفات", content.definitions],
    ["امتحانات", content.pastExams],
    ["مفاهيم", content.concepts],
  ];
  return sections.flatMap(([section, entries]) =>
    entries.map((entry) => ({
      id: `${section}-${entry.id}`,
      section,
      title: entry.title,
      body: entry.body || entry.answer || "",
      sources: entry.sources || [],
    })),
  );
}

async function main() {
  const pdfFiles = (await readdir(filesDir)).filter((name) => /\.pdf$/i.test(name)).sort((a, b) => a.localeCompare(b, "ar"));
  if (!pdfFiles.length) {
    throw new Error("No PDF files found inside files/");
  }

  const files = [];
  for (let index = 0; index < pdfFiles.length; index += 1) {
    const fileName = pdfFiles[index];
    const filePath = path.join(filesDir, fileName);
    console.log(`Reading ${fileName}`);
    files.push(await extractPdf(filePath, fileName, index));
  }

  const units = buildUnits(files);
  const summaries = buildSummaries(units, files);
  const definitions = buildDefinitions(files);
  const concepts = buildConcepts(files, definitions);
  const dictionary = buildDictionary(files, concepts, definitions);
  const questions = buildQuestions(files, concepts, definitions, dictionary);
  const reviewLectures = buildReviewLectures(files, units, definitions, dictionary, concepts, questions);
  const pastExams = buildPastExams(files);
  const expectedQuestions = buildExpectedQuestions(dictionary);
  const flashCards = buildFlashCards(concepts, definitions, questions);
  const finalRevision = buildRevision(definitions, concepts, summaries, questions);
  const examNight = {
    topDefinitions: definitions.slice(0, 6),
    topConcepts: concepts.slice(0, 6),
    topQuestions: expectedQuestions.slice(0, 6),
    mustMemorize: reviewLectures.flatMap((lecture) => lecture.examPoints).slice(0, 10),
    repeatedTerms: dictionary.slice(0, 8),
  };

  const content = {
    generatedAt: new Date().toISOString(),
    courseName: "الحاسوب والإذاعة",
    stats: {
      fileCount: files.length,
      pageCount: files.reduce((sum, file) => sum + file.pageCount, 0),
      unitCount: units.length,
      questionCount: questions.length,
      sourcePageCount: files.reduce((sum, file) => sum + file.pages.length, 0),
    },
    reviewLectures,
    files: files.map((file) => ({
      id: file.id,
      fileName: file.fileName,
      title: file.title,
      pageCount: file.pageCount,
      pdfParseTextLength: file.pdfParseTextLength,
      pages: file.pages.map((page) => ({
        id: page.id,
        fileName: page.fileName,
        page: page.page,
        text: page.text,
      })),
    })),
    units,
    summaries,
    concepts,
    definitions,
    dictionary,
    questions,
    pastExams,
    expectedQuestions,
    flashCards,
    finalRevision,
    examNight,
  };
  content.searchIndex = buildSearchIndex(content);

  await mkdir(dataDir, { recursive: true });
  await mkdir(publicDir, { recursive: true });
  const json = JSON.stringify(content, null, 2);
  await writeFile(path.join(dataDir, "content.json"), json, "utf8");
  await writeFile(path.join(publicDir, "content.json"), json, "utf8");
  console.log(
    `Generated content: ${content.stats.fileCount} files, ${content.stats.pageCount} pages, ${content.stats.unitCount} units, ${content.stats.questionCount} questions.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
