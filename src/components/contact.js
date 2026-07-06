// Link builders used by the profile drawer action buttons.
export function email(address){

    if(!address) return "#";

    return `mailto:${address}`;

}

export function website(url){

    if(!url) return "#";

    if(
        url.startsWith("http")
    ) return url;

    return "https://"+url;

}

export function maps(address){

    if(!address) return "#";

    return `https://www.google.com/maps/search/${encodeURIComponent(address)}`;

}
