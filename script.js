function switchLanguage() {
    if (currentLanguage === "fr") {
        window.location.href = "index.html"; // Redirect to English version
    } else {
        window.location.href = "index_fr.html"; // Redirect to French version
    }
}
