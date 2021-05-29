export function addDidNotAnswerResult(questionConceptId: any, results: any[], countValue: any) {
        let didNotAnswerCount = countValue;
        for (const r of results) {
            didNotAnswerCount = didNotAnswerCount - r.countValue;
        }
        const result = results[0];
        if (didNotAnswerCount <= 0) {
            didNotAnswerCount = 20;
        }
        const notAnswerPercent = countPercentage(didNotAnswerCount, countValue);
        const didNotAnswerResult = {
            analysisId: result.analysisId,
            countValue: didNotAnswerCount,
            countPercent: notAnswerPercent,
            stratum1: result.stratum1,
            stratum2: result.stratum2,
            stratum3: '0',
            stratum4: 'Did not answer',
            stratum5: result.stratum5,
            stratum6: result.stratum6,
        };
        return didNotAnswerResult;
}

export function countPercentage(answerCount: number, countValue: number) {
        if (!answerCount || answerCount <= 0) { return 0; }
        let percent: number = answerCount / countValue;
        percent = parseFloat(percent.toFixed(4));
        return percent * 100;
}
