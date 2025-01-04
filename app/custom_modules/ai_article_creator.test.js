import { expect, test } from 'vitest';
const aiArticleCreator = require('./ai_article_creator');

test('generate a correct prompt', async () => {

    const testKeywords = [
        'motorsport',
        'video game',
        'retrogaming',
        'science fiction'
    ];

    const testDescription = 'an article about the video game franchise wipeout';

    const testLanguage = 'fr';

    const prompt = aiArticleCreator.generatePrompt(testKeywords, testDescription, testLanguage);

    console.log(prompt);

    await expect(prompt).toBeTypeOf('string'); 

});