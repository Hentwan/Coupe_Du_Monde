let currentUser = null;

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const tabName = tab.dataset.tab;
        document.getElementById('login-form').classList.toggle('hidden', tabName !== 'login');
        document.getElementById('register-form').classList.toggle('hidden', tabName !== 'register');
    });
});

// Register
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const password = document.getElementById('register-password').value;
    
    if (name.length < 2) {
        alert('Le nom doit avoir au moins 2 caractères');
        return;
    }
    
    try {
        // Create a fake email from the username
        const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@pool2026.local`;
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Create user profile in Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            isAdmin: false
        });
        
        console.log('User registered:', name);
    } catch (error) {
        console.error('Register error:', error);
        if (error.code === 'auth/email-already-in-use') {
            alert('Ce nom est déjà utilisé!');
        } else {
            alert('Erreur: ' + error.message);
        }
    }
});

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('login-name').value.trim();
    const password = document.getElementById('login-password').value;
    
    try {
        const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@pool2026.local`;
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        console.error('Login error:', error);
        alert('Nom ou mot de passe incorrect');
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.signOut();
});

// Auth state listener
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // Get user profile
        const userDoc = await db.collection('users').doc(user.uid).get();
        currentUser = {
            uid: user.uid,
            ...userDoc.data()
        };
        
        document.getElementById('user-display').textContent = `👋 ${currentUser.name}`;
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        
        // Initialize app
        initApp();
    } else {
        currentUser = null;
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('app-section').classList.add('hidden');
    }
});
