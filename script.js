const { Sequelize, DataTypes, Op } = require('sequelize');

// --- 1. CONNEXION ---
// Modifie 'root' et 'password' selon ta configuration locale
const sequelize = new Sequelize('mini_blog', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // On désactive les logs SQL pour y voir clair dans la console
});

// --- 2. MODÈLES ---
const User = sequelize.define('User', {
    nom: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true, len: [2, 100] } },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    age: { type: DataTypes.INTEGER, validate: { min: 0, max: 150 } },
});

const Post = sequelize.define('Post', {
    titre: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    contenu: { type: DataTypes.TEXT },
});

const Comment = sequelize.define('Comment', {
    texte: { type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
});

const Tag = sequelize.define('Tag', {
    label: { type: DataTypes.STRING, allowNull: false, unique: true },
});

// --- 3. ASSOCIATIONS ---
// Un User a plusieurs Posts
User.hasMany(Post);
Post.belongsTo(User);

// Un Post a plusieurs Commentaires
Post.hasMany(Comment);
Comment.belongsTo(Post);

// Un User a plusieurs Commentaires
User.hasMany(Comment);
Comment.belongsTo(User);

// Relation N:N entre Post et Tag via une table pivot 'PostTags'
Post.belongsToMany(Tag, { through: 'PostTags' });
Tag.belongsToMany(Post, { through: 'PostTags' });

// --- 4. PROGRAMME PRINCIPAL ---
async function main() {
    try {
        // Synchronisation (force: true efface et recrée les tables à chaque lancement)
        await sequelize.sync({ force: true });
        console.log('✅ Base de données synchronisée !');

        // --- CRÉATION DES DONNÉES ---
        const alice = await User.create({ nom: 'Alice Dupont', email: 'alice@mail.com', age: 22 });
        const bob = await User.create({ nom: 'Bob Martin', email: 'bob@mail.com', age: 25 });
        const clara = await User.create({ nom: 'Clara Petit', email: 'clara@mail.com', age: 20 });

        const post1 = await alice.createPost({ titre: 'Découvrir Sequelize', contenu: 'Un ORM génial...' });
        const post2 = await alice.createPost({ titre: 'Node.js en 2026', contenu: 'Les nouveautés...' });
        const post3 = await bob.createPost({ titre: 'Apprendre le SQL', contenu: 'Les bases...' });

        // Commentaires (On précise qui commente via UserId)
        await post1.createComment({ texte: 'Super article !', UserId: bob.id });
        await post1.createComment({ texte: 'Merci pour le partage', UserId: clara.id });

        // Tags
        const jsTag = await Tag.create({ label: 'JavaScript' });
        const sqlTag = await Tag.create({ label: 'SQL' });
        const nodeTag = await Tag.create({ label: 'Node.js' });

        // Associations N:N
        await post1.addTags([jsTag, nodeTag]);
        await post2.addTags([jsTag, nodeTag]);
        await post3.addTag(sqlTag);

        // --- EXEMPLES DE REQUÊTES ---

        // 1. Lister les posts d'Alice avec ses commentaires
        console.log('\n--- Posts d\'Alice avec commentaires ---');
        const user = await User.findByPk(alice.id, {
            include: { model: Post, include: Comment }
        });
        user.Posts.forEach(p => {
            console.log(`- ${p.titre} (${p.Comments.length} comms)`);
        });

        // 2. Trouver les posts avec le tag "JavaScript"
        console.log('\n--- Posts avec le tag JavaScript ---');
        const postsJS = await Post.findAll({
            include: { model: Tag, where: { label: 'JavaScript' } }
        });
        postsJS.forEach(p => console.log(`- ${p.titre}`));

        // 3. Compter les posts par utilisateur
        console.log('\n--- Statistiques ---');
        const count = await Post.count({ where: { UserId: alice.id } });
        console.log(`Alice a écrit ${count} posts.`);

    } catch (error) {
        console.error('❌ Erreur :', error);
    } finally {
        await sequelize.close(); // Ferme la connexion proprement
    }
}

main();