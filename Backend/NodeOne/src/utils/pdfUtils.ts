import { logger } from './logger';

export async function getOneSampleFromPDF(expression: string, xMin: number, xMax: number) {
  try {
    const evaluatePDF = Function('x', `return ${expression};`);

    // Estimate the max value of the PDF (normally at the mean for normal dist)
    const midPoint = (xMin + xMax) / 2;
    const peak = evaluatePDF(midPoint);
  
    if (isNaN(peak)) {
      throw new Error(`Invalid PDF evaluation at midpoint: ${peak}`);
    }

    while (true) {
      const x = Math.random() * (xMax - xMin) + xMin;
      const y = Math.random() * peak;
      const pdfValue = evaluatePDF(x);

      if (isNaN(pdfValue)) {
        throw new Error(`Invalid PDF evaluation at x=${x}: ${pdfValue}`);
      }

      if (y <= pdfValue) {
        return x;
      }
    }
  } catch (error) {
    logger.error('Error in getOneSampleFromPDF:', error);
    throw error;
  }
} 