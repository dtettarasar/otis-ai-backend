const strSlugGenerator = {

    formatDateToDigits: (dateString) => {

        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month will start at zero
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}${month}${day}${hours}${minutes}${seconds}`;

    },

    slugifyStr: (title) => {

        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')  // Enlève les caractères spéciaux sauf les tirets
            .replace(/\s+/g, '-')       // Remplace les espaces par des tirets
            .replace(/-+/g, '-')        // Remplace plusieurs tirets par un seul
            .replace(/^-+|-+$/g, '');   // Supprime les tirets au début et à la fin

    },

    build: (dateString, title) => {

        console.log("build the slug with:");
        console.log(dateString);
        console.log(title);

        const datePart = strSlugGenerator.formatDateToDigits(dateString);
        console.log("datePart:");
        console.log(datePart);

        const titlePart = strSlugGenerator.slugifyStr(title);
        const slug = `${datePart}-${titlePart}`;
        console.log("Slug final:");
        console.log(slug);

        return slug;

    }

}

exports.method = strSlugGenerator;