#!/usr/bin/env python3
"""Generate BuddhaLife_Citations.pdf from CITATIONS.md."""

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


class CitationsPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)
        self.add_font("body", "", FONT_REGULAR)
        self.add_font("body", "B", FONT_BOLD)
        self.add_font("body", "I", FONT_ITALIC)
        self.add_font("body", "BI", FONT_BOLD_ITALIC)

    def header(self):
        if self.page_no() > 1:
            self.set_font("body", "I", 8)
            self.set_text_color(120, 120, 120)
            self.cell(0, 10, "BuddhaLife: Academic Citation Reference", align="R")
            self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("body", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def add_title_page(self):
        self.add_page()
        self.ln(50)
        self.set_font("body", "B", 28)
        self.set_text_color(30, 30, 30)
        self.cell(0, 15, "BuddhaLife", align="C")
        self.ln(12)
        self.set_font("body", "", 18)
        self.set_text_color(80, 80, 80)
        self.cell(0, 12, "Academic Citation Reference", align="C")
        self.ln(30)
        self.set_font("body", "", 11)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "All 90 game events with full academic source tracing", align="C")
        self.ln(8)
        self.cell(0, 8, "February 28, 2026", align="C")


def parse_and_render(pdf, filepath):
    """Parse CITATIONS.md and render into the PDF."""
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    pdf.add_page()
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()

        if not line.strip():
            i += 1
            continue

        # Horizontal rule
        if line.strip() == "---":
            pdf.ln(3)
            pdf.set_draw_color(200, 200, 200)
            pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
            pdf.ln(3)
            i += 1
            continue

        # Skip the title block (first # heading and metadata lines)
        if line.startswith("# ") and i < 10:
            i += 1
            continue

        # Bold metadata lines at top
        if line.startswith("**") and i < 10:
            text = sanitize(line)
            pdf.set_font("body", "", 10)
            pdf.set_text_color(80, 80, 80)
            pdf.multi_cell(0, 5, text)
            pdf.ln(1)
            i += 1
            continue

        # ## Section header (country name, Bibliography, Citation Gaps)
        if line.startswith("## "):
            pdf.add_page()
            text = sanitize(line[3:].strip())
            pdf.set_font("body", "B", 16)
            pdf.set_text_color(30, 30, 30)
            pdf.multi_cell(0, 10, text)
            pdf.ln(1)
            pdf.set_draw_color(180, 180, 180)
            pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
            pdf.ln(4)
            i += 1
            continue

        # ### Subsection (life stage or bibliography category)
        if line.startswith("### "):
            text = sanitize(line[4:].strip())
            pdf.set_font("body", "B", 13)
            pdf.set_text_color(50, 50, 50)
            pdf.ln(2)
            pdf.multi_cell(0, 8, text)
            pdf.ln(3)
            i += 1
            continue

        # #### Event entry header
        if line.startswith("#### "):
            text = sanitize(line[5:].strip())
            pdf.set_font("body", "B", 11)
            pdf.set_text_color(40, 40, 40)
            pdf.ln(2)
            pdf.multi_cell(0, 6, text)
            pdf.ln(2)
            i += 1
            continue

        # Labeled field lines (Cultural Practice, Academic Source, etc.)
        if line.startswith("**") and ":**" in line:
            match = re.match(r'\*\*(.+?):\*\*\s*(.*)', line)
            if match:
                label = match.group(1)
                value = sanitize(match.group(2))
                # Collect continuation lines
                i += 1
                while i < len(lines):
                    next_line = lines[i].rstrip()
                    if (not next_line.strip() or
                        next_line.startswith("**") or
                        next_line.startswith("#") or
                        next_line.strip() == "---" or
                        next_line.strip().startswith("- ")):
                        break
                    value += " " + sanitize(next_line.strip())
                    i += 1

                # Render label on its own line, value below
                pdf.set_font("body", "B", 9)
                pdf.set_text_color(70, 70, 70)
                pdf.cell(0, 5, label + ":")
                pdf.ln(4)
                pdf.set_font("body", "", 9)
                pdf.set_text_color(30, 30, 30)
                pdf.multi_cell(0, 5, value)
                pdf.ln(1)
                continue

        # Numbered list items (bibliography)
        m = re.match(r'^(\d+)\.\s+(.+)', line.strip())
        if m:
            text = sanitize(m.group(0))
            # Collect continuation lines
            i += 1
            while i < len(lines):
                next_line = lines[i].rstrip()
                if (not next_line.strip() or
                    next_line.startswith("#") or
                    next_line.strip() == "---" or
                    re.match(r'^\d+\.\s+', next_line.strip())):
                    break
                text += " " + sanitize(next_line.strip())
                i += 1
            pdf.set_font("body", "", 9)
            pdf.set_text_color(30, 30, 30)
            pdf.multi_cell(0, 5, text)
            pdf.ln(2)
            continue

        # Bullet points
        if line.strip().startswith("- "):
            text = sanitize(line.strip()[2:])
            pdf.set_font("body", "", 9)
            pdf.set_text_color(30, 30, 30)
            bullet_char = "\u2022 "
            pdf.cell(5, 5, bullet_char)
            pdf.multi_cell(0, 5, text)
            pdf.ln(1)
            i += 1
            continue

        # Regular paragraph
        para_lines = [line.strip()]
        i += 1
        while i < len(lines):
            next_line = lines[i].rstrip()
            if (not next_line.strip() or
                next_line.startswith("#") or
                next_line.startswith("**") or
                next_line.strip().startswith("- ") or
                next_line.strip() == "---" or
                re.match(r'^\d+\.\s+', next_line.strip())):
                break
            para_lines.append(next_line.strip())
            i += 1

        text = sanitize(" ".join(para_lines))
        pdf.set_font("body", "", 9)
        pdf.set_text_color(30, 30, 30)
        pdf.multi_cell(0, 5, text)
        pdf.ln(2)


def main():
    pdf = CitationsPDF()
    pdf.add_title_page()

    base = "/Users/oliverzemans/Desktop/Claude Code/bitlife/buddhalife/game-content"
    parse_and_render(pdf, f"{base}/CITATIONS.md")

    output_path = f"{base}/BuddhaLife_Citations.pdf"
    pdf.output(output_path)
    print(f"PDF generated: {output_path}")
    print(f"Total pages: {pdf.page_no()}")


if __name__ == "__main__":
    main()
