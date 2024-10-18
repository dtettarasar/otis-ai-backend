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

    build: (dateString, title) => {

        console.log("build the slug with:");
        console.log(dateString);
        console.log(title);

        const datePart = strSlugGenerator.formatDateToDigits(dateString);
        console.log("datePart:");
        console.log(datePart);

    }

}

exports.method = strSlugGenerator;