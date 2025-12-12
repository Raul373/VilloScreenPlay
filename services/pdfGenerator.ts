import { ScriptElement, CoverData } from '../types';

// Access the global jsPDF object loaded via script tag
declare global {
  interface Window {
    jspdf: any;
  }
}

export const generatePDF = (screenplay: ScriptElement[], coverData: CoverData | null) => {
  if (!window.jspdf) {
    alert("Error: jsPDF library not loaded.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    unit: 'in',
    format: 'letter'
  });

  // --- Constants & Config ---
  const FONT = 'courier';
  const FONT_SIZE = 12;
  const LINE_HEIGHT = 0.17; // Approx height for 12pt courier
  const PAGE_HEIGHT = 11.0;
  const MARGIN_TOP = 1.0;
  const MARGIN_BOTTOM = 10.0; // Bottom limit for content
  
  // X Coordinates (Left margins)
  const X_SLUGLINE = 1.5;
  const X_ACTION = 1.5;
  const X_CHARACTER = 3.7;
  const X_PARENTHETICAL = 3.1;
  const X_DIALOGUE = 2.5;
  const X_TRANSITION = 7.5; // Aligned right
  const X_PAGENUM = 7.5;

  // Widths for wrapping
  const WIDTH_ACTION = 6.0;         // 1.5 to 7.5
  const WIDTH_DIALOGUE = 4.0;       // 2.5 to 6.5 (Updated to match 6.5" right edge spec)
  const WIDTH_PARENTHETICAL = 2.0;

  let cursorY = MARGIN_TOP;
  let pageNum = 1;

  doc.setFont(FONT, 'normal');
  doc.setFontSize(FONT_SIZE);

  // --- Helper Functions ---

  const addPage = (isSceneContinuation: boolean = false) => {
    doc.addPage();
    pageNum++;
    
    // Page Number
    doc.setFont(FONT, 'normal');
    doc.text(`${pageNum}.`, X_PAGENUM, 0.5, { align: 'right' });
    
    cursorY = MARGIN_TOP;

    // CONTINUED: Header for Scene Continuation
    if (isSceneContinuation) {
      doc.text('CONTINUED:', X_ACTION, cursorY);
      cursorY += (LINE_HEIGHT * 2);
    }
  };

  const hasSpace = (heightNeeded: number) => {
    return (cursorY + heightNeeded) <= MARGIN_BOTTOM;
  };

  const printBottomContinued = () => {
    doc.setFont(FONT, 'normal');
    doc.text('(CONTINUED)', X_PAGENUM, MARGIN_BOTTOM + LINE_HEIGHT, { align: 'right' });
  };

  const findLastCharacterName = (index: number): string => {
    for (let i = index - 1; i >= 0; i--) {
      if (screenplay[i].type === 'character') {
        return screenplay[i].text;
      }
    }
    return 'CHARACTER';
  };

  // --- Cover Page ---
  if (coverData && coverData.title) {
    // Title: Bold, Larger (24pt)
    doc.setFont(FONT, 'bold');
    doc.setFontSize(24);
    doc.text(coverData.title.toUpperCase(), 4.25, 3.5, { align: 'center' });
    
    // "Written by": Normal, 12pt
    doc.setFont(FONT, 'normal');
    doc.setFontSize(12);
    doc.text('Escrito por', 4.25, 5.0, { align: 'center' });
    
    // Author: Bold, Larger (16pt)
    doc.setFont(FONT, 'bold');
    doc.setFontSize(16);
    doc.text(coverData.author, 4.25, 5.5, { align: 'center' });
    
    // Reset Font for footer info
    doc.setFont(FONT, 'normal');
    doc.setFontSize(12);
    
    // Bottom Left: Version Info (Treatment, Date)
    let leftY = 9.0;
    if (coverData.treatmentNumber) {
        doc.text(`Tratamiento: ${coverData.treatmentNumber}`, 1.5, leftY);
        leftY += 0.2;
    }
    if (coverData.date) {
        doc.text(`Fecha: ${coverData.date}`, 1.5, leftY);
    }

    // Bottom Right: Contact Info (Email, Phone)
    let rightY = 9.0;
    if (coverData.email) {
        doc.text(coverData.email, 7.5, rightY, { align: 'right' });
        rightY += 0.2;
    }
    if (coverData.phone) {
        doc.text(coverData.phone, 7.5, rightY, { align: 'right' });
    }
    
    doc.addPage();
    pageNum++;
  } else if (screenplay.length > 0) {
    // If no cover, page number on first page
    doc.text('1.', X_PAGENUM, 0.5, { align: 'right' });
  }

  // --- Main Loop ---
  let sceneCounter = 1;

  for (let i = 0; i < screenplay.length; i++) {
    const element = screenplay[i];
    doc.setFontSize(FONT_SIZE);
    doc.setFont(FONT, 'normal');

    if (element.type === 'slugline') {
      // Space before slugline (unless top of page)
      const spaceBefore = (cursorY > MARGIN_TOP) ? (LINE_HEIGHT * 2) : 0;
      const heightNeeded = spaceBefore + LINE_HEIGHT + (LINE_HEIGHT * 2); // Space after

      if (!hasSpace(heightNeeded)) {
        addPage(false); // New scene, so NOT a continuation of previous
      } else {
        cursorY += spaceBefore;
      }

      doc.setFont(FONT, 'bold');
      doc.text(`${sceneCounter}. ${element.text}`, X_SLUGLINE, cursorY);
      doc.setFont(FONT, 'normal');
      
      cursorY += (LINE_HEIGHT * 2); // Space after slugline
      sceneCounter++;

    } 
    else if (element.type === 'action') {
      const lines = doc.splitTextToSize(element.text, WIDTH_ACTION);
      // Calculate total height needed
      const totalHeight = (lines.length * LINE_HEIGHT) + LINE_HEIGHT; // +1 line spacing after

      if (hasSpace(totalHeight)) {
        lines.forEach((line: string) => {
          doc.text(line, X_ACTION, cursorY);
          cursorY += LINE_HEIGHT;
        });
        cursorY += LINE_HEIGHT; // Spacing after block
      } else {
        // SPLIT ACTION
        const availableSpace = MARGIN_BOTTOM - cursorY;
        const linesThatFit = Math.floor(availableSpace / LINE_HEIGHT);

        if (linesThatFit <= 0) {
          // Move whole block
          printBottomContinued();
          addPage(true); // Triggers top CONTINUED:
          lines.forEach((line: string) => {
            doc.text(line, X_ACTION, cursorY);
            cursorY += LINE_HEIGHT;
          });
          cursorY += LINE_HEIGHT;
        } else {
          // Split block
          const part1 = lines.slice(0, linesThatFit);
          const part2 = lines.slice(linesThatFit);

          part1.forEach((line: string) => {
            doc.text(line, X_ACTION, cursorY);
            cursorY += LINE_HEIGHT;
          });

          printBottomContinued();
          addPage(true); // Triggers top CONTINUED:

          part2.forEach((line: string) => {
            doc.text(line, X_ACTION, cursorY);
            cursorY += LINE_HEIGHT;
          });
          cursorY += LINE_HEIGHT;
        }
      }
    } 
    else if (element.type === 'character') {
      // Keep with next? Try to avoid orphaning character name
      const heightNeeded = (LINE_HEIGHT * 3); // Char + at least 2 lines of dialogue/parenthetical

      if (!hasSpace(heightNeeded)) {
        printBottomContinued();
        addPage(true);
      }

      doc.setFont(FONT, 'bold');
      doc.text(element.text, X_CHARACTER, cursorY);
      doc.setFont(FONT, 'normal');
      cursorY += LINE_HEIGHT;
    } 
    else if (element.type === 'parenthetical') {
      const lines = doc.splitTextToSize(element.text, WIDTH_PARENTHETICAL);
      // Simple break check for now
      if (!hasSpace(lines.length * LINE_HEIGHT)) {
        printBottomContinued();
        addPage(true);
      }
      lines.forEach((line: string) => {
        doc.text(line, X_PARENTHETICAL, cursorY);
        cursorY += LINE_HEIGHT;
      });
    } 
    else if (element.type === 'dialogue') {
      const lines = doc.splitTextToSize(element.text, WIDTH_DIALOGUE);
      const totalHeight = (lines.length * LINE_HEIGHT) + LINE_HEIGHT;

      if (hasSpace(totalHeight)) {
        lines.forEach((line: string) => {
          doc.text(line, X_DIALOGUE, cursorY);
          cursorY += LINE_HEIGHT;
        });
        cursorY += LINE_HEIGHT; // Spacing after
      } else {
        // SPLIT DIALOGUE
        const availableSpace = MARGIN_BOTTOM - cursorY;
        const linesThatFit = Math.floor(availableSpace / LINE_HEIGHT);

        if (linesThatFit <= 0) {
          // Move entire block (orphaned from character? handled by character check usually)
          // If we are here, just push it and add (CONT'D)
          addPage(false); // Manually handle header
          
          const charName = findLastCharacterName(i);
          doc.setFont(FONT, 'bold');
          doc.text(`${charName} (CONT'D)`, X_CHARACTER, cursorY);
          doc.setFont(FONT, 'normal');
          cursorY += LINE_HEIGHT;

          lines.forEach((line: string) => {
            doc.text(line, X_DIALOGUE, cursorY);
            cursorY += LINE_HEIGHT;
          });
          cursorY += LINE_HEIGHT;

        } else {
          // Break mid-dialogue
          const part1 = lines.slice(0, linesThatFit);
          const part2 = lines.slice(linesThatFit);

          part1.forEach((line: string) => {
            doc.text(line, X_DIALOGUE, cursorY);
            cursorY += LINE_HEIGHT;
          });

          // (MORE)
          // Aligned to right margin of dialogue (2.5 + 4.0 = 6.5)
          doc.text('(MORE)', 6.5, cursorY, { align: 'right' });

          addPage(false);

          // (CONT'D) Header
          const charName = findLastCharacterName(i);
          doc.setFont(FONT, 'bold');
          doc.text(`${charName} (CONT'D)`, X_CHARACTER, cursorY);
          doc.setFont(FONT, 'normal');
          cursorY += LINE_HEIGHT;

          part2.forEach((line: string) => {
            doc.text(line, X_DIALOGUE, cursorY);
            cursorY += LINE_HEIGHT;
          });
          cursorY += LINE_HEIGHT;
        }
      }
    } 
    else if (element.type === 'transition') {
      if (!hasSpace(LINE_HEIGHT * 2)) {
        printBottomContinued();
        addPage(true);
      }
      doc.setFont(FONT, 'bold');
      doc.text(element.text, X_TRANSITION, cursorY, { align: 'right' });
      doc.setFont(FONT, 'normal');
      cursorY += (LINE_HEIGHT * 2);
    }
  }

  doc.save('guion.pdf');
};