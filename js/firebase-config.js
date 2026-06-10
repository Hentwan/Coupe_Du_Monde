<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCL1SQP3vCrazBwRtAk9RMaC3FpzjIzSaM",
    authDomain: "coupedumonde-72cad.firebaseapp.com",
    projectId: "coupedumonde-72cad",
    storageBucket: "coupedumonde-72cad.firebasestorage.app",
    messagingSenderId: "1032155137153",
    appId: "1:1032155137153:web:ea4c96f455438648ec7980",
    measurementId: "G-YV9S3R7ZN0"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
