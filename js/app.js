// Initialize app after login
function initApp() {
    setupLeaderboard();
    loadGroupPredictions();
    loadKnockoutPredictions();
    loadBonusPredictions();
}

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const viewName = btn.dataset.view;
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show correct view
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`${viewName}-view`).classList.add('active');
        
        // Refresh data
        switch(viewName) {
            case 'groups':
                loadGroupPredictions();
                break;
            case 'knockout':
                loadKnockoutPredictions();
                break;
            case 'bonus':
                loadBonusPredictions();
                break;
        }
    });
});
