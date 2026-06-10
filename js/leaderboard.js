// Real-time leaderboard listener
let leaderboardUnsubscribe = null;

function setupLeaderboard() {
    if (leaderboardUnsubscribe) leaderboardUnsubscribe();
    
    leaderboardUnsubscribe = db.collection('users')
        .orderBy('score', 'desc')
        .onSnapshot(snapshot => {
            renderLeaderboard(snapshot.docs);
        });
}

function renderLeaderboard(users) {
    const container = document.getElementById('leaderboard');
    container.innerHTML = '';
    
    users.forEach((doc, index) => {
        const user = doc.data();
        const rank = index + 1;
        const isCurrentUser = doc.id === currentUser.uid;
        
        const breakdown = user.scoreBreakdown || { groups: 0, knockout: 0, bonus: 0 };
        
        const item = document.createElement('div');
        item.className = `leaderboard-item ${isCurrentUser ? 'current-user' : ''}`;
        item.innerHTML = `
            <div class="rank rank-${rank <= 3 ? rank : ''}">${getRankEmoji(rank)}</div>
            <div class="player-info">
                <div class="player-name">${user.name}${isCurrentUser ? ' (toi)' : ''}</div>
                <div class="player-breakdown">
                    Groupes: ${breakdown.groups} | Matchs: ${breakdown.knockout} | Bonus: ${breakdown.bonus}
                </div>
            </div>
            <div class="player-score">
                ${user.score || 0}<span>pts</span>
            </div>
        `;
        
        container.appendChild(item);
    });
}

function getRankEmoji(rank) {
    switch(rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return rank;
    }
}
