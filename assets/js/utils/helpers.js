export function euro(value){

    return new Intl.NumberFormat(

        "nl-BE",

        {

            style:"currency",

            currency:"EUR"

        }

    ).format(value);

}

export function slugify(text){

    return text

    .toLowerCase()

    .trim()

    .replace(/\s+/g,"-")

    .replace(/[^\w-]+/g,"");

}

export function showError(message){

    alert(message);

}

export function showSuccess(message){

    alert(message);

}
