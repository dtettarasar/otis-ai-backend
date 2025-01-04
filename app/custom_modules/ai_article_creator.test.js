import { expect, test } from 'vitest';
const aiArticleCreator = require('./ai_article_creator');

let testKeywords = [
    'motorsport',
    'video game',
    'retrogaming',
    'science fiction'
];

let testDescription = 'an article about the video game franchise wipeout';

let testLanguage = 'fr';

test('generate a correct prompt', async () => {

    const paramsHasKeywords = testKeywords.length !== 0;
    const paramsHasDescription = testDescription !== '';

    const keywordsTxt = `use the following keywords: ${testKeywords}`;
    const descriptionTxt = `use the following description: ${testDescription}`;

    const addParamInReq = `${paramsHasKeywords ? keywordsTxt : ''}${paramsHasKeywords && paramsHasDescription ? ' & ' : ''}${paramsHasDescription ? descriptionTxt : ''}`;
    
    let testRequest = `write an article optimized for search engine. to define the topics of the article and the lexical field, ${addParamInReq}. 
        it should be written in html format, without the doctype, the head tag, or the html tag. you should use only text related tags, such as p, ul, ol, li and heading tags. the language of the article should be french.
        the article should contain subtitles for each section.`;

    const prompt = aiArticleCreator.generatePrompt(testKeywords, testDescription, testLanguage);

    // console.log("prompt generated:")
    // console.log(prompt);

    // console.log("test request:");
    // console.log(testRequest);

    await expect(prompt).toBeTypeOf('string'); 
    await expect(prompt).toEqual(testRequest);

});

test('generate an article', async() => {

    const prompt = aiArticleCreator.generatePrompt(testKeywords, testDescription, testLanguage);
    let aiArticleResponse = null

    try {

        aiArticleResponse = await aiArticleCreator.generateArticle(prompt);
        console.log(aiArticleResponse);

    } catch(err) {

        console.log(err)

    }

    await expect(aiArticleResponse[0]).toBeTypeOf('object');
    await expect(aiArticleResponse[0].message.content).toBeDefined();
    await expect(aiArticleResponse[0].message.content).toBeTypeOf('string');

}, 15000);