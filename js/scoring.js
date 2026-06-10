// Calculate scores based on predictions and official results
async function calculateUserScore(userId) {
    let totalScore = 0;
    let breakdown = {
        groups: 0,
        knockout: 0,
        bonus: 0
    };
    
    // Get user predictions
    const predictionsDoc = await db.collection('predictions').doc(userId).get();
    if (!predictionsDoc.exists) return { total: 0, breakdown };
    
    const predictions = predictionsDoc.data();
    
    // Get official results
    const resultsDoc = await db.collection('results').doc('official').get();
    if (!resultsDoc.exists) return { total: 0, breakdown };
    
    const results = resultsDoc.data();
    
    // === GROUP STAGE SCORING ===
    if (predictions.groups && results.groups) {
        for (const [groupName, predictedOrder] of Object.entries(predictions.groups)) {
            const actualOrder = results.groups[groupName];
            if (!actualOrder) continue;
            
            // Check positions 1 and 2 (qualified teams)
            for (let i = 0; i < 2; i++) {
                const predictedTeam = predictedOrder[i];
                const actualTeam = actualOrder[i];
                
                if (predictedTeam === actualTeam) {
                    // Exact position
                    breakdown.groups += POINTS.groups.exactPosition;
                } else if (actualOrder.slice(0, 2).includes(predictedTeam)) {
                    // Qualified but wrong position
                    breakdown.groups += POINTS.groups.qualified;
                }
            }
        }
    }
    
    // === KNOCKOUT STAGE SCORING ===
    if (predictions.knockout && results.knockout) {
        for (const phase of WORLD_CUP_DATA.knockoutPhases) {
            const phasePredictions = predictions.knockout[phase];
            const phaseResults = results.knockout[phase];
            
            if (!phasePredictions || !phaseResults) continue;
            
            for (const [matchId, prediction] of Object.entries(phasePredictions)) {
                const result = phaseResults[matchId];
                if (!result) continue;
                
                const points = POINTS.knockout[phase];
                
                // Check winner
                if (prediction.winner === result.winner) {
                    breakdown.knockout += points.winner;
                    
                    // Check exact score
                    if (prediction.score1 === result.score1 && 
                        prediction.score2 === result.score2) {
                        breakdown.knockout += points.exactScore;
                    }
                }
            }
        }
    }
    
    // === BONUS SCORING ===
    if (predictions.bonus && results.bonus) {
        if (predictions.bonus.champion === results.bonus.champion) {
            breakdown.bonus += POINTS.bonus.champion;
        }
        if (predictions.bonus.finalist === results.bonus.finalist) {
            breakdown.bonus += POINTS.bonus.finalist;
        }
        if (predictions.bonus.topScorer && 
            predictions.bonus.topScorer.toLowerCase() === results.bonus.topScorer?.toLowerCase()) {
            breakdown.bonus += POINTS.bonus.topScorer;
        }
    }
    
    totalScore = breakdown.groups + breakdown.knockout + breakdown.bonus;
    
    return { total: totalScore, breakdown };
}

// Update all scores in database
async function updateAllScores() {
    const usersSnapshot = await db.collection('users').get();
    
    const batch = db.batch();
    
    for (const userDoc of usersSnapshot.docs) {
        const scoreData = await calculateUserScore(userDoc.id);
        
        batch.update(db.collection('users').doc(userDoc.id), {
            score: scoreData.total,
            scoreBreakdown: scoreData.breakdown,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    
    await batch.commit();
}
