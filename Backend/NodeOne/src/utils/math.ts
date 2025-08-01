import { erf } from 'mathjs';
import erfinv from 'compute-erfinv';

function phi(x: number): number {
    return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

function phiInv(p: number): number {
    // Inverse CDF using erfinv
    return Math.sqrt(2) * erfinv(2 * p - 1);
}

function winProbability(
    studentMu: number,
    studentSigma: number,
    questionMu: number,
    questionSigma: number,
    beta: number = Number(process.env.BETA) || 200
): number {
    const numerator = studentMu - questionMu;
    const denominator = Math.sqrt(2 * beta ** 2 + studentSigma ** 2 + questionSigma ** 2);
    return phi(numerator / denominator);
}

function getQuestionMuForWinProb(
    studentMu: number,
    studentSigma: number,
    winProb: number,
    questionSigma: number = 300,
    beta: number = Number(process.env.BETA) || 200
): number {
    if (winProb <= 0 || winProb >= 1) {
        throw new Error('winProb must be between 0 and 1 (exclusive)');
    }

    const z = phiInv(winProb);
    const denominator = Math.sqrt(2 * beta ** 2 + studentSigma ** 2 + questionSigma ** 2);
    return studentMu - z * denominator;
}


// @ts-ignore
function getSkewNormalRandom(mu = 750, sigma = 150, alpha = 5) {
    function erf(x: number) {
      const sign = x >= 0 ? 1 : -1;
      x = Math.abs(x);
      const t = 1 / (1 + 0.3275911 * x);
      const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
      const a4 = -1.453152027, a5 = 1.061405429;
      const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);
      return sign * y;
    }

    function skewNormalPDF(x: number, mu: number, sigma: number, alpha: number) {
      const z = (x - mu) / sigma;
      const norm = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
      const skew = 1 + erf((alpha * z) / Math.sqrt(2));
      return norm * skew;
    }

    const peak = skewNormalPDF(mu + alpha * sigma / Math.sqrt(1 + alpha * alpha), mu, sigma, alpha);

    for (let i = 0; i < 1000; i++) {
      const x = mu + (Math.random() - 0.5) * 8 * sigma;
      const y = Math.random() * peak;
      if (y < skewNormalPDF(x, mu, sigma, alpha)) {
        return x;
      }
    }
}


export { winProbability, getQuestionMuForWinProb, getSkewNormalRandom };
