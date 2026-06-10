// Load and display group predictions
async function loadGroupPredictions() {
    const container = document.getElementById('groups-container');
    container.innerHTML = '';
    
    // Check if predictions are locked
    const settingsDoc = await db.collection('settings').doc('tournament').get();
    const settings = settingsDoc.exists ? settingsDoc.data() : {};
    const groupsLocked = settings.groupsLocked || false;
    
    // Get user's existing predictions
    const predictionsDoc = await db.collection('predictions').doc(currentUser.uid).get();
    const predictions = predictionsDoc.exists ? predictionsDoc.data().groups || {} : {};
    
    // Get official results for comparison
    const resultsDoc = await db.collection('results').doc('official').get();
    const results = resultsDoc.exists ? resultsDoc.data().groups || {} : {};
    
    if (groupsLocked) {
        container.innerHTML = '<div class="status locked">🔒 Les prédictions de groupes sont verrouillées</div>';
    }
    
    for (const [groupName, teams] of Object.entries(WORLD_CUP_DATA.groups)) {
        const userPrediction = predictions[groupName] || ['', ''];
        const actualResult = results[groupName] || [];
        
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        groupCard.innerHTML = `
            <h3>Groupe ${groupName}</h3>
            <div class="group-slots">
                ${[1, 2].map(pos => {
                    const selectedTeam = userPrediction[pos - 1];
                    const isCorrect = actualResult[pos - 1] === selectedTeam;
                    const isQualified = actualResult.slice(0, 2).includes(selectedTeam);
                    
                    let slotClass = 'slot';
                    if (actualResult.length > 0 && selectedTeam) {
                        if (isCorrect) slotClass += ' correct';
                        else if (isQualified) slotClass += ' partial';
                    }
                    
                    return `
                        <div class="${slotClass}">
                            <span class="slot-position">${pos}</span>
                            <select 
                                data-group="${groupName}" 
                                data-position="${pos - 1}"
                                ${groupsLocked ? 'disabled' : ''}
                            >
                                <option value="">-- Sélectionner --</option>
                                ${teams.filter(t => t !== '?').map(team => `
                                    <option value="${team}" ${selectedTeam === team ? 'selected' : ''}>
                                        ${team}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        container.appendChild(groupCard);
    }
    
    document.getElementById('save-groups').style.display = groupsLocked ? 'none' : 'block';
}

// Save group predictions
document.getElementById('save-groups').addEventListener('click', async () => {
    const groups = {};
    
    document.querySelectorAll('.group-card').forEach(card => {
        const selects = card.querySelectorAll('select');
        const groupName = selects[0].dataset.group;
        
        groups[groupName] = [
            selects[0].value,
            selects[1].value
        ];
    });
    
    try {
        await db.collection('predictions').doc(currentUser.uid).set({
            groups: groups,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        showStatus('save-groups', '✅ Prédictions sauvegardées!', 'success');
    } catch (error) {
        console.error('Error saving predictions:', error);
        showStatus('save-groups', '❌ Erreur de sauvegarde', 'error');
    }
});

// Load knockout predictions
async function loadKnockoutPredictions() {
    const container = document.getElementById('knockout-phases');
    container.innerHTML = '';
    
    const settingsDoc = await db.collection('settings').doc('tournament').get();
    const settings = settingsDoc.exists ? settingsDoc.data() : {};
    
    const predictionsDoc = await db.collection('predictions').doc(currentUser.uid).get();
    const predictions = predictionsDoc.exists ? predictionsDoc.data().knockout || {} : {};
    
    // Get match fixtures
    const fixturesDoc = await db.collection('fixtures').doc('knockout').get();
    const fixtures = fixturesDoc.exists ? fixturesDoc.data() : {};
    
    for (const phase of WORLD_CUP_DATA.knockoutPhases) {
        const phaseLocked = settings[`${phase}Locked`] || false;
        const phaseOpen = settings[`${phase}Open`] || false;
        
        if (!phaseOpen && phase !== 'round16') continue;
        
        const phaseDiv = document.createElement('div');
        phaseDiv.className = 'knockout-phase';
        phaseDiv.innerHTML = `<h3>${WORLD_CUP_DATA.phaseLabels[phase]}</h3>`;
        
        if (phaseLocked) {
            phaseDiv.innerHTML += '<div class="status locked">🔒 Prédictions verrouillées</div>';
        }
        
        const phaseFixtures = fixtures[phase] || {};
        const phasePredictions = predictions[phase] || {};
        
        for (const [matchId, match] of Object.entries(phaseFixtures)) {
            const prediction = phasePredictions[matchId] || {};
            
            const matchCard = document.createElement('div');
            matchCard.className = 'match-card';
            matchCard.innerHTML = `
                <div class="match-header">${match.label || `Match ${matchId}`}</div>
                <div class="match-prediction">
                    <div class="match-teams">
                        <span>${match.team1 || 'TBD'}</span>
                        <span class="vs">vs</span>
                        <span>${match.team2 || 'TBD'}</span>
                    </div>
                    <div class="score-inputs">
                        <label>Score:</label>
                        <input type="number" min="0" max="20" 
                            class="score-input" 
                            data-phase="${phase}" 
                            data-match="${matchId}" 
                            data-team="1"
                            value="${prediction.score1 || ''}"
                            ${phaseLocked ? 'disabled' : ''}
                        >
                        <span>-</span>
                        <input type="number" min="0" max="20" 
                            class="score-input" 
                            data-phase="${phase}" 
                            data-match="${matchId}" 
                            data-team="2"
                            value="${prediction.score2 || ''}"
                            ${phaseLocked ? 'disabled' : ''}
                        >
                    </div>
                    <select class="winner-select" 
                        data-phase="${phase}" 
                        data-match="${matchId}"
                        ${phaseLocked ? 'disabled' : ''}
                    >
                        <option value="">-- Gagnant --</option>
                        <option value="${match.team1}" ${prediction.winner === match.team1 ? 'selected' : ''}>
                            ${match.team1 || 'Équipe 1'}
                        </option>
                        <option value="${match.team2}" ${prediction.winner === match.team2 ? 'selected' : ''}>
                            ${match.team2 || 'Équipe 2'}
                        </option>
                    </select>
                </div>
            `;
            
            phaseDiv.appendChild(matchCard);
        }
        
        if (!phaseLocked && Object.keys(phaseFixtures).length > 0) {
            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn primary full-width';
            saveBtn.textContent = `💾 Sauvegarder ${WORLD_CUP_DATA.phaseLabels[phase]}`;
            saveBtn.onclick = () => saveKnockoutPredictions(phase);
            phaseDiv.appendChild(saveBtn);
        }
        
        container.appendChild(phaseDiv);
    }
}

async function saveKnockoutPredictions(phase) {
    const predictions = {};
    
    document.querySelectorAll(`[data-phase="${phase}"].winner-select`).forEach(select => {
        const matchId = select.dataset.match;
        const score1Input = document.querySelector(`[data-phase="${phase}"][data-match="${matchId}"][data-team="1"]`);
        const score2Input = document.querySelector(`[data-phase="${phase}"][data-match="${matchId}"][data-team="2"]`);
        
        predictions[matchId] = {
            winner: select.value,
            score1: parseInt(score1Input.value) || null,
            score2: parseInt(score2Input.value) || null
        };
    });
    
    try {
        await db.collection('predictions').doc(currentUser.uid).set({
            knockout: {
                [phase]: predictions
            },
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        alert('✅ Prédictions sauvegardées!');
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Erreur de sauvegarde');
    }
}

// Load bonus predictions
async function loadBonusPredictions() {
    const predictionsDoc = await db.collection('predictions').doc(currentUser.uid).get();
    const predictions = predictionsDoc.exists ? predictionsDoc.data().bonus || {} : {};
    
    // Populate team selects
    const championSelect = document.getElementById('bonus-champion');
    const finalistSelect = document.getElementById('bonus-finalist');
    
    [championSelect, finalistSelect].forEach(select => {
        select.innerHTML = '<option value="">-- Sélectionner --</option>';
        WORLD_CUP_DATA.allTeams.forEach(team => {
            select.innerHTML += `<option value="${team}">${team}</option>`;
        });
    });
    
    championSelect.value = predictions.champion || '';
    finalistSelect.value = predictions.finalist || '';
    document.getElementById('bonus-topscorer').value = predictions.topScorer || '';
}

document.getElementById('save-bonus').addEventListener('click', async () => {
    const bonus = {
        champion: document.getElementById('bonus-champion').value,
        finalist: document.getElementById('bonus-finalist').value,
        topScorer: document.getElementById('bonus-topscorer').value.trim()
    };
    
    try {
        await db.collection('predictions').doc(currentUser.uid).set({
            bonus: bonus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        showStatus('save-bonus', '✅ Bonus sauvegardés!', 'success');
    } catch (error) {
        console.error('Error:', error);
        showStatus('save-bonus', '❌ Erreur', 'error');
    }
});

function showStatus(afterElementId, message, type) {
    const existing = document.querySelector('.status-temp');
    if (existing) existing.remove();
    
    const status = document.createElement('div');
    status.className = `status ${type} status-temp`;
    status.textContent = message;
    
    document.getElementById(afterElementId).insertAdjacentElement('afterend', status);
    
    setTimeout(() => status.remove(), 3000);
}
