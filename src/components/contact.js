export function whatsapp(phone){

    if(!phone) return "#";

    const number = phone.replace(/\D/g,"");

    return `https://wa.me/91${number}`;

}

export function call(phone){

    if(!phone) return "#";

    return `tel:${phone}`;

}

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

export function share(member){

    if(navigator.share){

        navigator.share({

            title:member.name,

            text:member.company,

            url:window.location.href

        });

    }

}