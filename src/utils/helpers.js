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
