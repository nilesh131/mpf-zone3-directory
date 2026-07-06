// Single escaping helper shared by every module that injects member data into HTML.
export function escapeHtml(str){
    return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Up to two initials from a name, alphanumerics only (safe to inline in HTML attributes).
export function initials(name){
    return String(name || "")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(w => (w.match(/[A-Za-z0-9]/) || [""])[0])
        .join("")
        .toUpperCase() || "?";
}

// Indian 10-digit numbers need the 91 country code for wa.me links to resolve.
export function whatsappNumber(phone){
    const n = String(phone || "").replace(/\D/g, "");
    if(!n) return "";
    if(n.length === 10) return "91" + n;
    return n;
}

export function titleCase(input){
    if(!input) return "";
    const s = String(input).trim();
    // If already in mixed case (has lowercase letters), prefer preserving words that look like initials/abbrev
    return s
        .split(/\s+/)
        .map(word => {
            // keep parentheses and punctuation attached
            return word
                .split(/(-|\/)/) // keep hyphens and slashes
                .map(part => {
                    if(!part) return part;
                    // If part is all uppercase and short (2-3 letters), keep as uppercase (e.g., CA, Dr stays Dr later)
                    if(/^[A-Z]{2,}$/.test(part)) return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
                    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
                })
                .join('');
        })
        .join(' ');
}
