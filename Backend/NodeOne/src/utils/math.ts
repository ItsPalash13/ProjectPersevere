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

export { winProbability, getQuestionMuForWinProb };
