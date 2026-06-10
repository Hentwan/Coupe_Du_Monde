// Données de la Coupe du Monde 2026
const WORLD_CUP_DATA = {
    groups: {

        A: ["Mexique", "Afrique du Sud", "Corée du Sud", "Tchéquie"],
        B: ["Canada", "Bosnie-Herzégovine", "Qatar", "Suisse"],
        C: ["Brésil", "Maroc", "Haïti", "Écosse"],
        D: ["USA", "Paraguay", "Australie", "Turquie"],
        E: ["Allemagne", "Curaçao", "Côte d'Ivoire", "Équateur"],
        F: ["Pays-Bas", "Japon", "Suède", "Tunisie"],
        G: ["Belgique", "Égypte", "Iran", "Nouvelle-Zélande"],
        H: ["Espagne", "Cap-Vert", "Arabie Saoudite", "Uruguay"],
        I: ["France", "Sénégal", "Norvège", "Irak"],
        J: ["Argentine", "Algérie", "Autriche", "Jordanie"],
        K: ["Portugal", "RD Congo", "Ouzbékistan", "Colombie"],
        L: ["Angleterre", "Croatie", "Ghana", "Panama"]

    },
    
    // Liste complète des équipes (à compléter avec les qualifiées)

    allTeams: [
        "Mexique","Afrique du Sud","Corée du Sud","Tchéquie",
        "Canada","Bosnie-Herzégovine","Qatar","Suisse",
        "Brésil","Maroc","Haïti","Écosse",
        "USA","Paraguay","Australie","Turquie",
        "Allemagne","Curaçao","Côte d'Ivoire","Équateur",
        "Pays-Bas","Japon","Suède","Tunisie",
        "Belgique","Égypte","Iran","Nouvelle-Zélande",
        "Espagne","Cap-Vert","Arabie Saoudite","Uruguay",
        "France","Sénégal","Norvège","Irak",
        "Argentine","Algérie","Autriche","Jordanie",
        "Portugal","RD Congo","Ouzbékistan","Colombie",
        "Angleterre","Croatie","Ghana","Panama"
    ],

    knockoutPhases: ["round16", "quarter", "semi", "final"],
    
    phaseLabels: {
        round16: "Seizièmes de finale",
        quarter: "Quarts de finale", 
        semi: "Demi-finales",
        final: "Finale"
    },
    
    matchesPerPhase: {
        round16: 16,
        quarter: 8,
        semi: 4,
        final: 1
    }
};

// Points system
const POINTS = {
    groups: {
        exactPosition: 5,
        qualified: 2
    },
    knockout: {
        round16: { winner: 3, exactScore: 5 },
        quarter: { winner: 5, exactScore: 8 },
        semi: { winner: 8, exactScore: 12 },
        final: { winner: 15, exactScore: 25 }
    },
    bonus: {
        champion: 25,
        finalist: 15,
        topScorer: 10
    }
};
