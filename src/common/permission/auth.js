/***********************
https://www.npmjs.com/package/vue-cookies
Api
Set a cookie
this.$cookies.set(keyName, value[, expireTimes[, path[, domain[, secure]]]])   //return this
Get a cookie
this.$cookies.get(keyName)       // return value
Remove a cookie
this.$cookies.remove(keyName [, path [, domain]])   // return  false or true , warning： next version return this； use isKey(keyname) return true/false,please
Exist a cookie name
this.$cookies.isKey(keyName)        // return false or true
Get All cookie name
this.$cookies.keys()  // return a array
************************/

const LoginKey = window.location.origin + '-hasLogin'

export function getToken() {
    return window.$cookies.get(LoginKey);
    // 直接登录
    // return 1;
}

export function setToken(tonken) {
    return window.$cookies.set(LoginKey, tonken)
}

export function removeToken() {
    return window.$cookies.remove(LoginKey)
}
