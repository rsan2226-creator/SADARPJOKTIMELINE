import pptxgen from 'pptxgenjs';
import { NextRequest, NextResponse } from 'next/server';
import { PresentationData, SlideItem } from '@/lib/slide-presentation';

export async function POST(req: NextRequest) {
  try {
    const { presentation, temaWarna = 'teal' }: { presentation: PresentationData; temaWarna: string } = await req.json();

    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = presentation.guru;
    pptx.company = presentation.sekolah;
    pptx.subject = presentation.mapel;
    pptx.title = presentation.judulMateri;

    const primaryColor =
      temaWarna === 'teal' ? '0D9488' :
      temaWarna === 'ocean' ? '0284C7' :
      temaWarna === 'sunset' ? 'EA580C' :
      temaWarna === 'purple' ? '9333EA' : '059669';

    const darkBgColor =
      temaWarna === 'teal' ? '134E4A' :
      temaWarna === 'ocean' ? '0C4A6E' :
      temaWarna === 'sunset' ? '7C2D12' :
      temaWarna === 'purple' ? '581C87' : '064E3B';

    presentation.slides.forEach((s: SlideItem) => {
      const slide = pptx.addSlide();

      if (s.type === 'title') {
        slide.background = { color: darkBgColor };

        slide.addText(presentation.mapel.toUpperCase() + ' • ' + presentation.kelas, {
          x: 0.8,
          y: 1.2,
          w: 8.5,
          h: 0.5,
          fontSize: 14,
          bold: true,
          color: '5EEAD4',
        });

        slide.addText(s.title, {
          x: 0.8,
          y: 1.8,
          w: 8.5,
          h: 1.8,
          fontSize: 32,
          bold: true,
          color: 'FFFFFF',
          breakLine: true,
        });

        if (s.subtitle) {
          slide.addText(s.subtitle, {
            x: 0.8,
            y: 3.7,
            w: 8.5,
            h: 0.8,
            fontSize: 16,
            color: 'CCFBF1',
          });
        }

        slide.addText(`Penyusun: ${presentation.guru}\n${presentation.sekolah}`, {
          x: 0.8,
          y: 5.2,
          w: 8.5,
          h: 1.2,
          fontSize: 13,
          bold: true,
          color: '99F6E4',
        });
      } else if (s.type === 'closing') {
        slide.background = { color: darkBgColor };

        slide.addText(s.title, {
          x: 0.8,
          y: 1.5,
          w: 8.5,
          h: 1.5,
          fontSize: 30,
          bold: true,
          color: 'FFFFFF',
          align: 'center',
        });

        if (s.subtitle) {
          slide.addText(s.subtitle, {
            x: 0.8,
            y: 3.0,
            w: 8.5,
            h: 0.8,
            fontSize: 16,
            color: 'CCFBF1',
            align: 'center',
          });
        }

        if (s.bullets && s.bullets.length > 0) {
          slide.addText(s.bullets[0], {
            x: 1.0,
            y: 4.0,
            w: 8.0,
            h: 1.2,
            fontSize: 15,
            italic: true,
            color: 'FDE047',
            align: 'center',
          });
        }

        if (s.keyConcept) {
          slide.addText(s.keyConcept, {
            x: 0.8,
            y: 5.4,
            w: 8.5,
            h: 1.0,
            fontSize: 13,
            bold: true,
            color: 'FFFFFF',
            align: 'center',
          });
        }
      } else {
        slide.background = { color: 'FFFFFF' };

        slide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 10,
          h: 0.15,
          fill: { color: primaryColor },
        });

        const tagText = s.submateriTag || (s.type === 'hook' ? 'PERTANYAAN PEMANTIK' : s.type === 'objective' ? 'TUJUAN PEMBELAJARAN' : s.type === 'reflection' ? 'REFLEKSI MURID' : s.type === 'summary' ? 'KESIMPULAN' : 'MATERI PEMBELAJARAN');
        slide.addText(tagText.toUpperCase(), {
          x: 0.8,
          y: 0.5,
          w: 8.5,
          h: 0.4,
          fontSize: 11,
          bold: true,
          color: primaryColor,
        });

        slide.addText(s.title, {
          x: 0.8,
          y: 0.9,
          w: 8.5,
          h: 1.0,
          fontSize: 24,
          bold: true,
          color: '0F172A',
        });

        if (s.subtitle) {
          slide.addText(s.subtitle, {
            x: 0.8,
            y: 1.9,
            w: 8.5,
            h: 0.5,
            fontSize: 13,
            italic: true,
            color: '64748B',
          });
        }

        if (s.questionPrompt) {
          slide.addText(s.questionPrompt, {
            x: 0.8,
            y: 2.5,
            w: 8.5,
            h: 1.0,
            fontSize: 15,
            bold: true,
            color: '1E293B',
            fill: { color: 'F1F5F9' },
          });
        }

        if (s.bullets && s.bullets.length > 0) {
          const startY = s.questionPrompt ? 3.6 : 2.5;
          const bulletItems = s.bullets.map((b) => ({
            text: b,
            options: { fontSize: 13, color: '334155', breakLine: true },
          }));
          slide.addText(bulletItems, {
            x: 0.8,
            y: startY,
            w: 8.5,
            h: 2.2,
            bullet: true,
          });
        }

        if (s.activityBox) {
          slide.addShape(pptx.ShapeType.rect, {
            x: 0.8,
            y: 4.8,
            w: 8.5,
            h: 1.4,
            fill: { color: 'FEF3C7' },
            line: { color: 'F59E0B', width: 1.5 },
          });
          slide.addText(`TANTANGAN AKTIVITAS (${s.activityBox.duration}):\n${s.activityBox.instruction}`, {
            x: 1.0,
            y: 4.9,
            w: 8.1,
            h: 1.2,
            fontSize: 12,
            bold: true,
            color: '92400E',
          });
        } else if (s.keyConcept) {
          slide.addShape(pptx.ShapeType.rect, {
            x: 0.8,
            y: 5.5,
            w: 8.5,
            h: 0.9,
            fill: { color: 'F0FDFA' },
            line: { color: primaryColor, width: 1 },
          });
          slide.addText(`KUNCI PEMBELAJARAN: ${s.keyConcept}`, {
            x: 1.0,
            y: 5.6,
            w: 8.1,
            h: 0.7,
            fontSize: 11,
            bold: true,
            color: primaryColor,
          });
        }

        slide.addText(`${presentation.sekolah} • Slide ${s.id} dari ${presentation.slides.length}`, {
          x: 0.8,
          y: 6.8,
          w: 8.5,
          h: 0.3,
          fontSize: 9,
          color: '94A3B8',
        });
      }

      if (s.speakerNotes) {
        const notesText = `[CANVA VISUAL IDEA]: ${s.visualIdea}\n[CANVA SEARCH KEYWORDS]: ${s.canvaKeywordTag}\n\n[CATATAN GURU / SPEAKER NOTES]:\n${s.speakerNotes}`;
        slide.addNotes(notesText);
      }
    });

    const buffer = await pptx.write({ outputType: 'nodebuffer' });

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="Presentasi_Canva_${Date.now()}.pptx"`,
      },
    });
  } catch (err: unknown) {
    console.error('Error generating PPTX in server route:', err);
    return NextResponse.json({ error: 'Failed to generate PPTX' }, { status: 500 });
  }
}
