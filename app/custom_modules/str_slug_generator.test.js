import { expect, test } from 'vitest';
import { method as strSlugGenerator } from './str_slug_generator';

const dateString = "2024-10-17T17:31:31.819Z";
const title = "Les Meilleurs Jeux Vidéo en 2024!";
const titleTwo = "the Story of UFC !!! ";

const formattedDateString = "20241017173131819";
const formattedTitleString = "les-meilleurs-jeux-video-en-2024";
const formattedTitleStringTwo = "the-story-of-ufc";

const finalSlug = "20241017173131819-the-story-of-ufc";

test('test the formatDateToDigits method', async () => {

    const datePart = strSlugGenerator.formatDateToDigits(dateString);
    //console.log(datePart);

    expect(typeof datePart).toBe('string');
    expect(datePart).toStrictEqual(formattedDateString);

});

test('test the slugifyStr method', async () => {

    const titlePart = strSlugGenerator.slugifyStr(title);
    const titlePartTwo = strSlugGenerator.slugifyStr(titleTwo);

    expect(typeof titlePart).toBe('string');
    expect(typeof titlePartTwo).toBe('string');

    expect(titlePart).toStrictEqual(formattedTitleString);
    expect(titlePartTwo).toStrictEqual(formattedTitleStringTwo);

});

test('test the build method', async () => {

    const builtSlug = strSlugGenerator.build(dateString, titleTwo);
    expect(typeof builtSlug).toBe('string');
    expect(builtSlug).toStrictEqual(finalSlug);

});
