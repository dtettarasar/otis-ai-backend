const mongoose = require("mongoose");
const {marked} = require("marked");

//See https://www.npmjs.com/package/dompurify for more details
// Tools used to remove potential malicious code passed in the markdown field
const createDomPurify = require('dompurify');
const {JSDOM} = require('jsdom');
const dompurify = createDomPurify(new JSDOM().window);

// Todo editer le modèle en fonction du nouvel editeur côté vue js:
/*
Si l'éditeur génère et édite directement du code html sans gérer du markdown, adapter le modèle pour que this.sanitizedHtml récupère du html au lieu du markdown
Modifier également les fonction dans database Obj qui manipule les articles, pour gérer l'attribut html et non plus l'attribut markdown
*/

const ArticleSch = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String},
    //markdown: {type: String, required: true},
    content: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    lastModifiedAt: {type: Date, default: Date.now},
    otisUserId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    sanitizedHtml : {type: String, required: true},
    slug : {type: String, default: ''},
    language: {
        type: String,
        required: true,
        enum: ['en', 'fr'],
        default: 'en'
    },
    keywords: {
        type: [String],
        default: []
    }
});

ArticleSch.pre("validate", function (next) {

    if (this.content) {

        //const markdownToHtml = marked(this.markdown);

        this.sanitizedHtml = dompurify.sanitize(this.content);

    }

    next();

})

const Article = mongoose.model(
    "Article", ArticleSch
);

module.exports = Article;