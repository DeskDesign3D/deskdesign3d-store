export function navigate(url) {

    if (!url) return;

    window.location.href = url;

}

export function redirect(url) {

    window.location.replace(url);

}

export function getQuery(name) {

    const params = new URLSearchParams(

        window.location.search

    );

    return params.get(name);

}

export function setQuery(name, value) {

    const params = new URLSearchParams(

        window.location.search

    );

    if (value === null || value === "") {

        params.delete(name);

    } else {

        params.set(name, value);

    }

    history.replaceState(

        {},

        "",

        `${window.location.pathname}?${params}`

    );

}

export function currentPage() {

    return window.location.pathname

        .split("/")

        .pop()

        .replace(".html", "");

}

export function isPage(page) {

    return currentPage() === page;

}

export function goBack() {

    window.history.back();

}

export function reload() {

    window.location.reload();

}

window.router = {

    navigate,

    redirect,

    getQuery,

    setQuery,

    currentPage,

    isPage,

    goBack,

    reload

};
