import fontkit from "@pdf-lib/fontkit";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, rgb } from "pdf-lib";
import { z } from "zod";
import {
  propertySchema,
  offerSchema,
  profileSchema,
  assumptionsSchema,
} from "../../../lib/homebridge/schema";
import {
  DRAFT_NOTICE,
  documentSections,
} from "../../../lib/homebridge/documents";
import {
  apiError,
  readJson,
  sameOrigin,
  limit,
  requestKey,
} from "../../../lib/homebridge/server/http";
const fontFiles = Promise.all([
  readFile(join(process.cwd(), "public/fonts/dm-sans-regular.woff")),
  readFile(join(process.cwd(), "public/fonts/dm-sans-semibold.woff")),
]);
const inputSchema = z.object({
  property: propertySchema,
  draft: offerSchema,
  profile: profileSchema,
  assumptions: assumptionsSchema,
  section: z
    .enum([
      "all",
      "summary",
      "terms",
      "finances",
      "questions",
      "timeline",
      "checklist",
    ])
    .default("all"),
});
const ascii = (text: string) =>
  text
    .replace(/[—–]/g, " - ")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x20-\x7E\n]/g, "?");
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    limit("pdf:" + requestKey(request), 10);
    const input = await readJson(request, inputSchema, 65000);
    const pdf = await PDFDocument.create();
    pdf.setTitle("Homebridge - Demo draft preparation package");
    pdf.setAuthor("Homebridge prototype");
    pdf.registerFontkit(fontkit);
    const [regularFile, boldFile] = await fontFiles;
    const regular = await pdf.embedFont(regularFile, { subset: true }),
      bold = await pdf.embedFont(boldFile, { subset: true });
    let page = pdf.addPage([612, 792]),
      y = 0;
    const navy = rgb(0.08, 0.18, 0.22),
      sage = rgb(0.42, 0.54, 0.43);
    const newPage = () => {
      page = pdf.addPage([612, 792]);
      header();
    };
    function header() {
      page.drawRectangle({
        x: 0,
        y: 690,
        width: 612,
        height: 102,
        color: rgb(0.94, 0.96, 0.92),
      });
      page.drawText("homebridge", {
        x: 44,
        y: 750,
        size: 25,
        font: bold,
        color: navy,
      });
      page.drawText("BUYER PREPARATION PACKAGE  /  DEMONSTRATION ONLY", {
        x: 44,
        y: 724,
        size: 8,
        font: bold,
        color: sage,
      });
      page.drawText(
        "DEMO DRAFT - NOT A VALID PURCHASE AGREEMENT - NOT FOR SUBMISSION",
        { x: 44, y: 702, size: 7, font: bold, color: rgb(0.55, 0.25, 0.18) },
      );
      y = 658;
    }
    header();
    function line(raw: string, size = 10, isBold = false) {
      const font = isBold ? bold : regular;
      for (const paragraph of ascii(raw).split("\n")) {
        const words = paragraph.split(/\s+/);
        let current = "";
        for (const word of words) {
          const trial = current ? current + " " + word : word;
          if (font.widthOfTextAtSize(trial, size) > 520 && current) {
            draw(current);
            current = word;
          } else current = trial;
        }
        draw(current || " ");
      }
      function draw(text: string) {
        let remaining = text;
        while (remaining.length) {
          let low = 1,
            high = remaining.length,
            take = 1;
          while (low <= high) {
            const middle = Math.floor((low + high) / 2);
            if (
              font.widthOfTextAtSize(remaining.slice(0, middle), size) <= 520
            ) {
              take = middle;
              low = middle + 1;
            } else high = middle - 1;
          }
          if (y < 70) newPage();
          page.drawText(remaining.slice(0, take), {
            x: 44,
            y,
            size,
            font,
            color: navy,
          });
          y -= size + 7;
          remaining = remaining.slice(take);
        }
      }
    }

    line(`${input.property.address}, ${input.property.city}`, 16, true);
    line(
      `Revision ${input.draft.revision} | Generated ${new Date().toISOString().slice(0, 10)} | ${input.property.source === "demo" ? "Fictional demo property" : "Supplied property data"}`,
      8,
    );
    y -= 15;
    for (const section of documentSections(
      input.property,
      input.draft,
      input.profile,
      input.assumptions,
    ).filter((s) => input.section === "all" || s.id === input.section)) {
      if (y < 160) newPage();
      line(section.title, 15, true);
      y -= 5;
      for (const text of section.lines) {
        line(text);
        y -= 5;
      }
      y -= 20;
    }
    line(DRAFT_NOTICE, 8, true);
    for (const [i, p] of pdf.getPages().entries()) {
      p.drawLine({
        start: { x: 44, y: 43 },
        end: { x: 568, y: 43 },
        color: rgb(0.8, 0.85, 0.78),
        thickness: 0.5,
      });
      p.drawText(
        `No actual offer or professional approval.  |  ${i + 1} / ${pdf.getPageCount()}`,
        { x: 44, y: 28, size: 8, font: regular, color: sage },
      );
    }
    const bytes = await pdf.save();
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="homebridge-${input.section}-draft-r${input.draft.revision}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return apiError(e);
  }
}
