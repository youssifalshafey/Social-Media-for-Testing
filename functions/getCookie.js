/**
 * 
 * @param {string} cookies 
 * @param {string} cname 
 * @returns 
 */
function getCookie(cookies, cname) {
    let name = cname + "=";
    let ca = cookies.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

module.exports = getCookie;