const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('mini_blog', 'root', 'password', {
    host: 'localhost',
    port: 3306, // CHANGE ICI EN 3307 SI TU AS MODIFIÉ LE DOCKER-COMPOSE
    dialect: 'mysql',
    logging: false,
    // Optionnel : on ajoute un petit délai d'attente
    dialectOptions: {
        connectTimeout: 60000
    }
});

async function tester() {
    console.log("⏳ Tentative de connexion...");
    try {
        await sequelize.authenticate();
        console.log('✅ SUCCÈS : Connexion établie avec Docker !');
    } catch (error) {
        console.log('❌ ÉCHEC :');
        console.log('Message :', error.message);
        console.log('Code :', error.original ? error.original.code : 'N/A');
        
        if (error.message.includes('Access denied')) {
            console.log('👉 Conseil : Vérifie le mot de passe "password" et que XAMPP est bien éteint.');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.log('👉 Conseil : Le serveur MySQL n\'est pas encore prêt ou le port est mauvais.');
        }
    } finally {
        await sequelize.close();
    }
}

tester();