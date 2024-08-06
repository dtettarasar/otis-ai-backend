const OpenAI = require("openai");
const env = require('dotenv').config();

const aiArticleCreator = {

    openAIApiData : {
        organization: process.env.OPEN_AI_ORG,
        apiKey: process.env.OPEN_AI_KEY
    },

    generatePrompt(keywordsArr, descriptionStr, chosenLanguage) {

        console.log("init generate prompt method");

        const language = {
            fr: 'french',
            en: 'english',
            es: 'spanish'
        };

        const paramsHasKeywords = keywordsArr.length !== 0;
        const paramsHasDescription = descriptionStr !== '';

        const keywordsTxt = `use the following keywords: ${keywordsArr}`;
        const descriptionTxt = `use the following description: ${descriptionStr}`;

        const addParamInReq = `${paramsHasKeywords ? keywordsTxt : ''}${paramsHasKeywords && paramsHasDescription ? ' & ' : ''}${paramsHasDescription ? descriptionTxt : ''}`;

        const textRequest = `write an article optimized for search engine. to define the topics of the article and the lexical field, ${addParamInReq}. 
        it should be written in html format, without the doctype, the head tag, or the html tag. you should use only text related tags, such as p, ul, ol, li and heading tags. the language of the article should be ${language[chosenLanguage]}.
        the article should contain subtitles for each section.`;

        return textRequest;

    },

    initApiConfig() {

        const openai = new OpenAI(configData);
        return openai;

    },

    async generateArticle(prompt) {
        
        const openai = await new OpenAI(this.openAIApiData);

        if (openai) {

            try {

                const chatCompletion = await openai.chat.completions.create({
                    messages: [{ role: 'user', content: prompt }],
                    model: 'gpt-3.5-turbo',
                  });
    
                return chatCompletion.choices;

            } catch(err) {

                console.log(err);

            }

        } else {

            return false;

        }

    }

}

module.exports = aiArticleCreator

//TODO
//convert API response to markdown file
//Error handler for confidguration process 
//Error handler for API call
//improve the prompt to test sources mentionned in the article (make sure the links doesn't points to pages or content that don't exist)

