#!/usr/bin/env python3
"""Consolidate all BuddhaLife research takeaways into a single PDF."""

import re
from fpdf import FPDF

FONT_DIR = "/System/Library/Fonts/Supplemental/"
FONT_REGULAR = FONT_DIR + "Arial.ttf"
FONT_BOLD = FONT_DIR + "Arial Bold.ttf"
FONT_ITALIC = FONT_DIR + "Arial Italic.ttf"
FONT_BOLD_ITALIC = FONT_DIR + "Arial Bold Italic.ttf"


def sanitize(text):
    """Replace problematic Unicode chars with ASCII equivalents."""
    text = text.replace("\u2014", "--")
    text = text.replace("\u2013", "-")
    text = text.replace("\u2018", "'")
    text = text.replace("\u2019", "'")
    text = text.replace("\u201c", '"')
    text = text.replace("\u201d", '"')
    text = text.replace("\u2026", "...")
    text = text.replace("\u00a0", " ")
    # Remove markdown bold/italic markers
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    return text


class ResearchPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)
        # Register Unicode fonts
        self.add_font("body", "", FONT_REGULAR, uni=True)
        self.add_font("body", "B", FONT_BOLD, uni=True)
        self.add_font("body", "I", FONT_ITALIC, uni=True)
        self.add_font("body", "BI", FONT_BOLD_ITALIC, uni=True)

    def header(self):
        if self.page_no() > 1:
            self.set_font("body", "I", 8)
            self.set_text_color(120, 120, 120)
            self.cell(0, 10, "BuddhaLife Research Consolidation", align="R")
            self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("body", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def add_title_page(self):
        self.add_page()
        self.ln(60)
        self.set_font("body", "B", 28)
        self.set_text_color(30, 30, 30)
        self.cell(0, 15, "BuddhaLife", align="C")
        self.ln(12)
        self.set_font("body", "", 18)
        self.set_text_color(80, 80, 80)
        self.cell(0, 12, "Consolidated Research Takeaways", align="C")
        self.ln(30)
        self.set_font("body", "", 11)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "Organized by source, chapter, and page", align="C")
        self.ln(8)
        self.cell(0, 8, "From 19 academic readings on Buddhism in Southeast Asia", align="C")

    def add_section_header(self, text):
        self.set_font("body", "B", 16)
        self.set_text_color(30, 30, 30)
        self.ln(4)
        self.multi_cell(0, 10, sanitize(text))
        self.ln(1)
        self.set_draw_color(200, 200, 200)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)

    def add_subsection(self, text):
        self.set_font("body", "B", 13)
        self.set_text_color(50, 50, 50)
        self.ln(2)
        self.multi_cell(0, 8, sanitize(text))
        self.ln(4)

    def add_subsubsection(self, text):
        self.set_font("body", "B", 11)
        self.set_text_color(70, 70, 70)
        self.ln(1)
        self.multi_cell(0, 7, sanitize(text))
        self.ln(3)

    def add_body(self, text):
        self.set_font("body", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5, sanitize(text))
        self.ln(2)

    def add_bullet(self, text):
        self.set_font("body", "", 10)
        self.set_text_color(30, 30, 30)
        x = self.get_x()
        self.cell(6, 5, "\u2022 ")
        self.multi_cell(0, 5, sanitize(text))
        self.ln(1)

    def add_table_row(self, term, meaning):
        self.set_font("body", "B", 9)
        self.set_text_color(30, 30, 30)
        term_w = 50
        x_start = self.get_x()
        self.cell(term_w, 5, sanitize(term))
        self.set_font("body", "", 9)
        self.multi_cell(0, 5, sanitize(meaning))
        self.ln(1)


def clean(text):
    """Remove markdown formatting."""
    return sanitize(text).strip()


def parse_and_render(pdf, filepath, title):
    """Parse a markdown scholar file and render it into the PDF."""
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    pdf.add_page()
    pdf.add_section_header(title)

    i = 0
    in_table = False
    while i < len(lines):
        line = lines[i].rstrip()

        if not line.strip():
            i += 1
            continue

        if line.strip() == "---":
            pdf.ln(3)
            pdf.set_draw_color(220, 220, 220)
            pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
            pdf.ln(3)
            i += 1
            continue

        # Table header row
        if line.strip().startswith("|") and i + 1 < len(lines) and lines[i + 1].strip().startswith("|---"):
            i += 2
            in_table = True
            continue

        # Table data row
        if in_table and line.strip().startswith("|"):
            parts = [p.strip() for p in line.split("|")]
            parts = [p for p in parts if p]
            if len(parts) >= 2:
                pdf.add_table_row(parts[0], " | ".join(parts[1:]))
            i += 1
            continue
        else:
            in_table = False

        if line.startswith("# "):
            pdf.add_section_header(clean(line[2:]))
            i += 1
            continue

        if line.startswith("## "):
            pdf.add_subsection(clean(line[3:]))
            i += 1
            continue

        if line.startswith("### "):
            pdf.add_subsubsection(clean(line[4:]))
            i += 1
            continue

        if line.startswith("#### "):
            pdf.set_font("body", "B", 10)
            pdf.set_text_color(50, 50, 50)
            pdf.multi_cell(0, 5, clean(line[5:]))
            pdf.ln(2)
            i += 1
            continue

        if line.strip().startswith("- "):
            text = line.strip()[2:]
            pdf.add_bullet(text)
            i += 1
            continue

        m = re.match(r'^\d+\.\s+(.+)', line.strip())
        if m:
            pdf.add_bullet(m.group(1))
            i += 1
            continue

        # Paragraph
        para_lines = [line.strip()]
        i += 1
        while i < len(lines):
            next_line = lines[i].rstrip()
            if (not next_line.strip() or
                next_line.startswith("#") or
                next_line.strip().startswith("- ") or
                next_line.strip().startswith("|") or
                next_line.strip() == "---" or
                re.match(r'^\d+\.\s+', next_line.strip())):
                break
            para_lines.append(next_line.strip())
            i += 1

        pdf.add_body(" ".join(para_lines))


def main():
    pdf = ResearchPDF()
    pdf.add_title_page()

    # Table of contents
    pdf.add_page()
    pdf.add_section_header("Table of Contents")
    toc_items = [
        "1. Foundations of Buddhist Life (Eberhardt Ch. 1-4, 6; Gustafsson Ch. 2)",
        "   - Country Profiles: Thailand (Shan), Vietnam, Myanmar",
        "   - Karma, Merit, and Rebirth",
        "   - The Five Precepts",
        "   - Monastic Life and Ordination",
        "   - Festivals and Ceremonies",
        "   - Spirit Beliefs and Syncretism",
        "   - Healing Practices",
        "   - Case Studies and Encounter Seeds",
        "",
        "2. Regional Buddhism & Southeast Asian Context",
        "   (Eberhardt Ch. 7-8; Rush Ch. 1-2; Blackburn; Sevea;",
        "    Thongchai; Edwards)",
        "   - Country Profiles: Thailand, Myanmar, Cambodia, Vietnam, Laos",
        "   - Textual Traditions",
        "   - Syncretism",
        "   - Sacred Sites and Pilgrimage",
        "   - Religious Authority",
        "   - Case Studies and Encounter Seeds",
        "",
        "3. Contemporary Buddhism in Southeast Asia",
        "   (Boute 2024; Chambers 2024; Kidpromma & Taylor 2024;",
        "    Kittisenee 2024; Nguyen 2024)",
        "   - Country Profiles: Laos, Myanmar/Karen, Thailand, Cambodia, Vietnam",
        "   - Contemporary Practices: Merit, Karma, Environmental Buddhism",
        "   - Youth Engagement",
        "   - Ancestor Veneration and Funerary Practices",
        "   - Transgender/Gender in Monasticism",
        "   - Case Studies and Encounter Seeds",
        "",
        "4. Detailed Case Studies (All Sources)",
        "   - Thailand (T1-T12)",
        "   - Myanmar (M1-M4)",
        "   - Cambodia (C1-C3)",
        "   - Vietnam (V1-V4)",
        "   - Laos (L1-L2)",
        "   - Cross-Country (S1-S5)",
    ]
    for item in toc_items:
        if not item:
            pdf.ln(2)
            continue
        pdf.set_font("body", "", 10)
        pdf.set_text_color(50, 50, 50)
        pdf.cell(0, 5, item)
        pdf.ln(5)

    base = "/Users/oliverzemans/Desktop/Claude Code/bitlife/buddhalife/game-content"

    parse_and_render(
        pdf,
        f"{base}/scholar-1-foundations.md",
        "Part 1: Foundations of Buddhist Life in Southeast Asia"
    )

    parse_and_render(
        pdf,
        f"{base}/scholar-2-regional.md",
        "Part 2: Regional Buddhism & Southeast Asian Context"
    )

    parse_and_render(
        pdf,
        f"{base}/scholar-3-contemporary.md",
        "Part 3: Contemporary Buddhism in Southeast Asia"
    )

    parse_and_render(
        pdf,
        f"{base}/case-studies.md",
        "Part 4: Detailed Case Studies"
    )

    output_path = f"{base}/BuddhaLife_Research_Consolidation.pdf"
    pdf.output(output_path)
    print(f"PDF generated: {output_path}")
    print(f"Total pages: {pdf.page_no()}")


if __name__ == "__main__":
    main()
