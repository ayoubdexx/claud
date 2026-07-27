import React from "react";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { DocBlock, DocSpec } from "@/lib/pdf/spec";

const COLORS = {
  ink: "#0f172a",
  muted: "#64748b",
  line: "#dbe2ea",
  soft: "#f4f7fb",
  primary: "#1d4ed8",
  accent: "#7c3aed",
  warn: "#b45309",
  good: "#047857",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 46,
    paddingBottom: 54,
    paddingHorizontal: 44,
    fontSize: 9.6,
    lineHeight: 1.5,
    color: COLORS.ink,
    fontFamily: "Helvetica",
  },
  coverKicker: { fontSize: 9, color: COLORS.primary, letterSpacing: 1.4, marginBottom: 10, fontFamily: "Helvetica-Bold" },
  coverTitle: { fontSize: 26, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  coverSubtitle: { fontSize: 12, color: COLORS.muted, marginBottom: 18 },
  badgeRow: { flexDirection: "row", gap: 6, marginBottom: 22 },
  badge: {
    fontSize: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: COLORS.soft,
    color: COLORS.primary,
    fontFamily: "Helvetica-Bold",
  },
  rule: { height: 2, backgroundColor: COLORS.primary, width: 54, marginBottom: 18 },
  tocTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  tocRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: COLORS.line },
  sectionTitle: { fontSize: 15, fontFamily: "Helvetica-Bold", marginTop: 4, marginBottom: 10 },
  h2: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 12, marginBottom: 6 },
  h3: { fontSize: 10.6, fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 4 },
  paragraph: { marginBottom: 6, textAlign: "left" },
  listItem: { flexDirection: "row", marginBottom: 3 },
  bullet: { width: 12, color: COLORS.primary },
  table: { borderWidth: 0.5, borderColor: COLORS.line, borderRadius: 4, marginBottom: 10, overflow: "hidden" },
  tableTitle: { fontSize: 9.6, fontFamily: "Helvetica-Bold", marginBottom: 4, marginTop: 8 },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: COLORS.line },
  th: { backgroundColor: COLORS.soft, padding: 5, fontFamily: "Helvetica-Bold", fontSize: 8.4, color: COLORS.muted },
  td: { padding: 5, fontSize: 8.8 },
  note: { fontSize: 8, color: COLORS.muted, marginTop: -6, marginBottom: 10, fontStyle: "italic" },
  callout: { borderLeftWidth: 2.5, paddingLeft: 8, paddingVertical: 6, marginBottom: 8, backgroundColor: COLORS.soft, borderRadius: 3 },
  calloutTitle: { fontFamily: "Helvetica-Bold", fontSize: 9.4, marginBottom: 2 },
  exampleRow: { marginBottom: 5, paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: COLORS.line },
  exampleDe: { fontFamily: "Helvetica-Bold" },
  exampleEn: { color: COLORS.muted, fontSize: 8.8 },
  dialogueRow: { flexDirection: "row", marginBottom: 4 },
  speaker: { width: 74, color: COLORS.primary, fontSize: 8.6, fontFamily: "Helvetica-Bold" },
  keyRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: COLORS.line, paddingVertical: 3 },
  keyLabel: { width: "42%", fontFamily: "Helvetica-Bold", fontSize: 8.8 },
  keyValue: { width: "58%", fontSize: 8.8 },
  exerciseItem: { marginBottom: 8 },
  exerciseNumber: { fontFamily: "Helvetica-Bold", color: COLORS.primary },
  answerLine: { borderBottomWidth: 0.5, borderBottomColor: COLORS.line, height: 13, marginTop: 3 },
  solutionRow: { marginBottom: 5 },
  solutionAnswer: { color: COLORS.good, fontFamily: "Helvetica-Bold" },
  footer: {
    position: "absolute",
    bottom: 26,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.6,
    color: COLORS.muted,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.line,
    paddingTop: 6,
  },
});

function columnWidths(count: number) {
  return Array.from({ length: count }, () => `${100 / count}%`);
}

function Table({ block }: { block: Extract<DocBlock, { type: "table" }> }) {
  const widths = columnWidths(block.headers.length);
  /* Long tables must be allowed to break across pages. */
  const keepTogether = block.rows.length <= 10;
  return (
    <View wrap={!keepTogether}>
      {block.title ? <Text style={styles.tableTitle}>{block.title}</Text> : null}
      <View style={styles.table}>
        <View style={styles.tr}>
          {block.headers.map((header, index) => (
            <Text key={index} style={[styles.th, { width: widths[index] }]}>
              {header}
            </Text>
          ))}
        </View>
        {block.rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.tr}>
            {row.map((cell, cellIndex) => (
              <Text key={cellIndex} style={[styles.td, { width: widths[cellIndex] }]}>
                {cell}
              </Text>
            ))}
          </View>
        ))}
      </View>
      {block.note ? <Text style={styles.note}>{block.note}</Text> : null}
    </View>
  );
}

function Block({ block, index }: { block: DocBlock; index: number }) {
  switch (block.type) {
    case "heading":
      return (
        <Text style={block.level === 1 ? styles.sectionTitle : block.level === 2 ? styles.h2 : styles.h3}>
          {block.text}
        </Text>
      );
    case "paragraph":
      return <Text style={styles.paragraph}>{block.text}</Text>;
    case "list":
      return (
        <View style={{ marginBottom: 8 }}>
          {block.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.listItem}>
              <Text style={styles.bullet}>{block.ordered ? `${itemIndex + 1}.` : "•"}</Text>
              <Text style={{ flex: 1 }}>{item}</Text>
            </View>
          ))}
        </View>
      );
    case "table":
      return <Table block={block} />;
    case "keyvalue":
      return (
        <View wrap={false} style={{ marginBottom: 10 }}>
          {block.title ? <Text style={styles.tableTitle}>{block.title}</Text> : null}
          {block.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.keyRow}>
              <Text style={styles.keyLabel}>{item.label}</Text>
              <Text style={styles.keyValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      );
    case "callout": {
      const color =
        block.variant === "warning" ? COLORS.warn : block.variant === "tip" ? COLORS.good : COLORS.primary;
      return (
        <View style={[styles.callout, { borderLeftColor: color }]} wrap={false}>
          {block.title ? <Text style={[styles.calloutTitle, { color }]}>{block.title}</Text> : null}
          <Text>{block.text}</Text>
        </View>
      );
    }
    case "examples":
      return (
        <View style={{ marginBottom: 8 }}>
          {block.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.exampleRow} wrap={false}>
              <Text style={styles.exampleDe}>{item.de}</Text>
              {item.en ? <Text style={styles.exampleEn}>{item.en}</Text> : null}
              {item.note ? <Text style={styles.exampleEn}>→ {item.note}</Text> : null}
            </View>
          ))}
        </View>
      );
    case "dialogue":
      return (
        <View style={{ marginBottom: 10 }}>
          {block.title ? <Text style={styles.tableTitle}>{block.title}</Text> : null}
          {block.lines.map((line, lineIndex) => (
            <View key={lineIndex} style={styles.dialogueRow} wrap={false}>
              <Text style={styles.speaker}>{line.speaker}</Text>
              <View style={{ flex: 1 }}>
                <Text>{line.de}</Text>
                {line.en ? <Text style={styles.exampleEn}>{line.en}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      );
    case "exercises":
      return (
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.h3}>{block.title}</Text>
          {block.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.exerciseItem} wrap={false}>
              <Text>
                <Text style={styles.exerciseNumber}>{itemIndex + 1}. </Text>
                {item.prompt}
              </Text>
              {item.hint ? <Text style={styles.exampleEn}>Hinweis: {item.hint}</Text> : null}
              {Array.from({ length: item.lines ?? 1 }).map((_, lineIndex) => (
                <View key={lineIndex} style={styles.answerLine} />
              ))}
            </View>
          ))}
        </View>
      );
    case "solutions":
      return (
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.h3}>{block.title}</Text>
          {block.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.solutionRow} wrap={false}>
              <Text>
                <Text style={styles.exerciseNumber}>{itemIndex + 1}. </Text>
                <Text style={styles.solutionAnswer}>{item.answer}</Text>
              </Text>
              {item.explanation ? <Text style={styles.exampleEn}>{item.explanation}</Text> : null}
            </View>
          ))}
        </View>
      );
    case "spacer":
      return <View style={{ height: block.size ?? 10 }} />;
    case "pagebreak":
      return <View break key={`break-${index}`} />;
    default:
      return null;
  }
}

function Footer({ spec }: { spec: DocSpec }) {
  return (
    <View style={styles.footer} fixed>
      <Text>{spec.footer ?? `DeutschPfad · ${spec.title}`}</Text>
      <Text render={({ pageNumber, totalPages }) => `Seite ${pageNumber} / ${totalPages}`} />
    </View>
  );
}

/**
 * Each section becomes its own <Page> element. Content inside a section flows
 * over as many physical pages as needed, which keeps the layout engine stable
 * even for 40-page documents.
 */
function DocumentView({ spec }: { spec: DocSpec }) {
  const generated = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Document
      title={spec.title}
      author="DeutschPfad"
      subject={spec.subtitle}
      keywords={`Deutsch, ${spec.level ?? ""}, Goethe, telc, Ausbildung`}
    >
      <Page size="A4" style={styles.page}>
        {spec.kicker ? <Text style={styles.coverKicker}>{spec.kicker.toUpperCase()}</Text> : null}
        <Text style={styles.coverTitle}>{spec.title}</Text>
        {spec.subtitle ? <Text style={styles.coverSubtitle}>{spec.subtitle}</Text> : null}
        <View style={styles.rule} />
        <View style={styles.badgeRow}>
          {spec.level ? <Text style={styles.badge}>NIVEAU {spec.level}</Text> : null}
          <Text style={styles.badge}>{spec.sections.length} ABSCHNITTE</Text>
          <Text style={styles.badge}>{generated}</Text>
        </View>

        {spec.toc ? (
          <View>
            <Text style={styles.tocTitle}>Inhaltsverzeichnis</Text>
            {spec.sections.map((section, index) => (
              <View key={section.id} style={styles.tocRow}>
                <Text>
                  {index + 1}. {section.title}
                </Text>
                <Text style={{ color: COLORS.muted }}>
                  {section.blocks.length === 1 ? "1 Abschnitt" : `${section.blocks.length} Abschnitte`}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <Footer spec={spec} />
      </Page>

      {spec.sections.map((section, sectionIndex) => (
        <Page key={section.id} size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>
            {sectionIndex + 1}. {section.title}
          </Text>
          {section.blocks.map((block, blockIndex) => (
            <Block key={`${section.id}-${blockIndex}`} block={block} index={blockIndex} />
          ))}
          <Footer spec={spec} />
        </Page>
      ))}
    </Document>
  );
}

export async function renderSpecToPdf(spec: DocSpec): Promise<Buffer> {
  return renderToBuffer(<DocumentView spec={spec} />);
}

export function pdfFileName(spec: DocSpec) {
  const base = spec.title
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `deutschpfad-${base || "dokument"}.pdf`;
}
