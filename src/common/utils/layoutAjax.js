import axios from 'axios'

// 创建axios实例
const service = axios.create({
    // withCredentials: true,
    baseURL: 'http://203.6.239.8:7070/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'//默认以formdata形式发送数据
    },
})

/** 添加请求拦截器 **/
service.interceptors.request.use(function(config) {
    // 在发送请求之前做处理...
    config.headers = Object.assign(config.method === 'get' ? {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=UTF-8'
    } : {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }, config.headers);

    if (config.method === 'get') {
        console.log('get')
    }
    return Promise.resolve(config);
}, function(error) {
    // 对请求错误做处理...
    return Promise.reject(error);
})

const { get, post, put, delect }  =  service

class layout {
    async get(self, url) {
        self.$set(self.value.data, 'loading', true)
        let res = await get(url + self.value.data.params)
        self.value.data.loading = false
        return res
    }
    async post(self, url) {
        self.$set(self.value.data, 'loading', true)
        let res = await post(url, self.value.data.params)
        self.value.data.loading = false
        return res
    }
    async put(self, url) {
        self.$set(self.value.data, 'loading', true)
        let res = await put(url, self.value.data.params)
        self.value.data.loading = false
        return res
    }
    async delect(self, url) {
        self.$set(self.value.data, 'loading', true)
        let res = await delect(url, self.value.data.params)
        self.value.data.loading = false
        return res
    }
}

export default {
    install(Vue) {
        Object.defineProperty(Vue.prototype, '$layout', {
            value: new layout()
        });
    }
};
