// +----------------------------------------------------------------------
// | gas-web [JUST DO IT]
// +----------------------------------------------------------------------
// | Author     : Kangaroo
// +----------------------------------------------------------------------
// | Date       : 2018-11-15 11:33
// +----------------------------------------------------------------------
// | Description: 公共校验方法
// +----------------------------------------------------------------------

/**
 * @desc 基于ElementUI Form rules 进行使用, 参考官方文档: http://element-cn.eleme.io/#/zh-CN/component/form [自定义校验规则]
 *
 * @example  rules: {
 *  ipv4: [
 *    {required: true, message: '请输入矩阵IP', trigger: 'blur'},
 *    {validator: this.$rules.ipv4, trigger: 'blur'}
 *  ]
 * }
 *
 */
const validators = {

    /**
     * IPV4 地址验证
     */
    ipv4(rule, value, callback) {

        if (value && value === "...") {
            callback(new Error('请输入IP地址'))
        }

        if (value && !(/^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i).test(value)) {
            callback(new Error('请正确填写ip地址'))
        } else {
            callback()
        }
    },

    /**
     * IPV6 地址验证
     */
    ipv6(rule, value, callback) {

        if (value && value === "...") {
            callback(new Error('请输入IP地址'))
        }

        if (value && !/^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i.test(value)) {
            callback(new Error('请正确填写ip地址'))
        } else {
            callback()
        }
    },

    /**
     * 手机号码校验
     */
    phone(rule, value, callback) {

        if (value && (!(/^[1][34578]\d{9}$/).test(value) || !(/^[1-9]\d*$/).test(value) || value.length !== 11)) {
            callback(new Error('请正确填写手机号码'))
        } else {
            callback()
        }
    },

    /**
     * 联系电话(手机/电话皆可)验证
     */
    tel(rule, value, callback) {

        if (value && !(/^\d{3,4}-?\d{7,8}$/.test(value) || (value.length === 11 && /^1[3-8]{1}\d{9}$/.test(value)))) {
            callback(new Error('请正确填写联系电话'))
        } else {
            callback()
        }
    },


    /**
     * 邮箱校验
     */
    email(rule, value, callback) {
        if (value && !(/^[\w.-]+@(?:[a-z0-9]+(?:-[a-z0-9]+)*\.)+[a-z]{2,3}$/.test(value))) {
            callback(new Error('请输入正确的邮箱地址'))
        } else {
            callback()
        }
    },


    /**
     * 数字校验
     */
    number(rule, value, callback) {

        if (value && !(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value))) {
            callback(new Error('请输入正确的数字'))
        } else {
            callback()
        }
    },

    /**
     * 正整数校验
     */
    digits(rule, value, callback) {

        if (value && !(/^[1-9]\d*$/).test(value)) {
            callback(new Error('请输入正确的正整数'))
        } else {
            callback()
        }
    },

    /**
     * 保留多少位小数点校验，默认保留两位小数点
     * rule.length
     *
     * xxx: [
     *      {validator: this.$bui.rules.decimal, length: 2, trigger: 'blur'}
     * ]
     */
    decimal(rule, value, callback) {

        if (!rule.length || rule.length < 1) {
            rule.length = 2;
        }

        let regex = new RegExp('(^-?[1-9](\\d+)?(\\.\\d{1,' + rule.length + '})?$)|(^-?0$)|(^-?\\d\\.\\d{1,' + rule.length + '}$)');

        if (value && !regex.test(value)) {
            callback(new Error('请保留最多' + rule.length + '位小数点'))
        } else {
            callback()
        }
    },

    /**
     * 负整数校验
     */
    negtive(rule, value, callback) {
        if (value && !(/^-[1-9]\d*$/).test(value)) {
            callback(new Error('请输入正确的负整数'))
        } else {
            callback()
        }
    },


    /**
     * 最多输入多少个字符
     * rule.length
     *
     * xxx: [
     *      {validator: this.$bui.rules.maxlength, length: 2, trigger: 'blur'}
     * ]
     */
    maxlength(rule, value, callback) {

        if (!rule.length) {
            return callback();
        }

        if (value && rule.length < value.length) {
            callback(new Error('请输入最多 ' + rule.length + ' 个字符'))
        } else {
            callback()
        }
    },

    /**
     * 最少输入多少个字符
     * rule.length
     *
     * xxx: [
     *      {validator: this.$bui.rules.minlength, length: 2, trigger: 'blur'}
     * ]
     */
    minlength(rule, value, callback) {

        if (!rule.length) {
            return callback();
        }

        if (value && rule.length > value.length) {
            callback(new Error('请输入最少 ' + rule.length + ' 个字符'))
        } else {
            callback()
        }
    },

    /**
     * 输入字符范围
     *
     * rule.min
     * rule.max
     *
     * xxx: [
     *      {validator: this.$bui.rules.rangelength, min: 5, max:7, trigger: 'blur'}
     * ]
     */
    rangelength(rule, value, callback) {

        if (!rule.min || !rule.max) {
            return callback();
        }

        if (value && (value.length < rule.min || value.length > rule.max)) {
            callback(new Error('请输入长度为 ' + rule.min + ' 至 ' + rule.max + ' 之间的字符'))
        } else {
            callback()
        }
    },

    /**
     * 最小数值校验
     *
     * rule.value
     *
     * xxx: [
     *      {validator: this.$bui.rules.min, value: 5, trigger: 'blur'}
     * ]
     */
    min(rule, value, callback) {

        if (!rule.value) {
            return callback();
        }

        if (value && !(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value))) {
            return callback(new Error('请输入正确的数字'))
        }

        if (value && (value < rule.value)) {
            callback(new Error('请输入不小于 ' + rule.value + ' 的数值'))
        } else {
            callback()
        }
    },

    /**
     * 最大数值校验
     *
     * rule.value
     *
     * xxx: [
     *      {validator: this.$bui.rules.max, value: 5, trigger: 'blur'}
     * ]
     */
    max(rule, value, callback) {

        if (!rule.value) {
            return callback();
        }

        if (value && !(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value))) {
            return callback(new Error('请输入正确的数字'))
        }

        if (value && (value > rule.value)) {
            callback(new Error('请输入不大于 ' + rule.value + ' 的数值'))
        } else {
            callback()
        }
    },

    /**
     * 数值范围校验
     *
     * rule.min
     * rule.max
     *
     * xxx: [
     *      {validator: this.$bui.rules.range, min: 5, max: 7, trigger: 'blur'}
     * ]
     */
    range(rule, value, callback) {

        if (!rule.min || !rule.max) {
            return callback();
        }

        if (value && !(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value))) {
            return callback(new Error('请输入正确的数字'))
        }

        if (value && (value < rule.min || value > rule.max)) {
            callback(new Error('请输入 ' + rule.min + ' 至 ' + rule.max + ' 之间的数值'))
        } else {
            callback()
        }
    },

    /**
     * 身份证号码校验
     */
    idCard(rule, value, callback) {

        // 是否为空
        if (value === '') {
            return callback(new Error('请输入身份证号码'));
        }

        let error = '您输入的身份证号码不正确，请重新输入';

        // 校验长度，类型
        if (idUtils.isIDCard(value) === false) {
            return callback(new Error(error));
        }
        // 检查省份
        if (idUtils.checkProvince(value) === false) {
            return callback(new Error(error));
        }
        // 校验生日
        if (idUtils.checkBirthday(value) === false) {
            return callback(new Error(error));
        }
        // 检验位的检测
        if (idUtils.checkParity(value) === false) {
            return callback(new Error(error));
        }

        return callback();
    },

    /**
     * 字母和数字的验证
     */
    chrnum(rule, value, callback) {

        if (value && !(/^([a-zA-Z0-9]+)$/).test(value)) {
            callback(new Error('请输入数字和字母(字符A-Z, a-z, 0-9)'))
        } else {
            callback()
        }
    },
    /**
     * 中文字符校验
     */
    cn(rule, value, callback) {

        if (value && !(/^[\u4e00-\u9fa5]+$/).test(value)) {
            callback(new Error('请输入中文字符'))
        } else {
            callback()
        }
    },

    /**
     * 校验电脑Mac地址
     * 以xx-xx-xx-xx-xx-xx的形式输入（xx为16进制数字）
     */
    mac(rule, value, callback) {

        if (!/[A-Fa-f0-9]{2}-[A-Fa-f0-9]{2}-[A-Fa-f0-9]{2}-[A-Fa-f0-9]{2}-[A-Fa-f0-9]{2}-[A-Fa-f0-9]{2}/.test(value)) {
            callback(new Error('请输入xx-xx-xx-xx-xx-xx形式的MAC地址'));
        } else {
            callback();
        }
    },

    /**
     * 校验电脑Mac地址
     * 以xx-xx-xx-xx-xx-xx的形式输入（xx为16进制数字）
     */
    qq(rule, value, callback) {

        if (!/^[1-9][0-9]{4,}$/.test(value)) {
            callback(new Error('请正确填写qq号码'));
        } else {
            callback();
        }
    },


    /**
     * 校验经度是否符合规范
     *
     */
    longitude(rule, value, callback) {
        let longrg = /^(-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,6})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,6}|180)$/;
        if (!longrg.test(value)) {
            callback(new Error('经度整数部分为0-180,小数部分为0到6位'));
        } else {
            callback();
        }
    },

    /**
     * 校验纬度是否符合规范
     *
     */
    latitude(rule, value, callback) {
        let latreg = /^(-|\+)?([0-8]?\d{1}\.\d{0,6}|90\.0{0,6}|[0-8]?\d{1}|90)$/;
        if (!latreg.test(value)) {
            callback(new Error('纬度整数部分为0-90,小数部分为0到6位'));
        } else {
            callback();
        }
    }
};

const idUtils = {
    /**
     * 检查号码是否符合规范，包括长度，类型
     *
     * @param card
     * @returns {boolean}
     */
    isIDCard(card) {

        // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
        return /(^\d{15}$)|(^\d{17}(\d|X)$)/.test(card)
    },

    /**
     * 取身份证前两位,校验省份
     *
     * @param card 身份证号码
     * @returns {boolean}
     */
    checkProvince(card) {

        let cities = {
            11: "北京",
            12: "天津",
            13: "河北",
            14: "山西",
            15: "内蒙古",
            21: "辽宁",
            22: "吉林",
            23: "黑龙江",
            31: "上海",
            32: "江苏",
            33: "浙江",
            34: "安徽",
            35: "福建",
            36: "江西",
            37: "山东",
            41: "河南",
            42: "湖北",
            43: "湖南",
            44: "广东",
            45: "广西",
            46: "海南",
            50: "重庆",
            51: "四川",
            52: "贵州",
            53: "云南",
            54: "西藏",
            61: "陕西",
            62: "甘肃",
            63: "青海",
            64: "宁夏",
            65: "新疆",
            71: "台湾",
            81: "香港",
            82: "澳门",
            91: "国外"
        };

        let province = card.substr(0, 2);

        if (cities[province] === undefined || cities[province] === null) {
            return false;
        }

        return true;
    },

    /**
     * 检查生日是否正确
     *
     * @param card
     * @returns {*}
     */
    checkBirthday(card) {
        let len = card.length;

        // 身份证15位时，次序为省（3位）市（3位）年（2位）月（2位）日（2位）校验位（3位），皆为数字
        if (len === 15) {
            let dates = card.match(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);

            let year = dates[2];
            let month = dates[3];
            let day = dates[4];

            let birthday = new Date('19' + year + '/' + month + '/' + day);

            return this.verifyBirthday('19' + year, month, day, birthday);
        }

        // 身份证18位时，次序为省（3位）市（3位）年（4位）月（2位）日（2位）校验位（4位），校验位末尾可能为X
        if (len === 18) {
            let dates = card.match(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);

            let year = dates[2];
            let month = dates[3];
            let day = dates[4];

            let birthday = new Date(year + '/' + month + '/' + day);

            return this.verifyBirthday(year, month, day, birthday);
        }

        return false;
    },

    /**
     * 校验日期
     *
     * @param year
     * @param month
     * @param day
     * @param birthday
     * @returns {boolean}
     */
    verifyBirthday(year, month, day, birthday) {

        let currentYear = new Date().getFullYear();

        // 年月日是否合理
        if (birthday.getFullYear() == year && (birthday.getMonth() + 1) == month && birthday.getDate() == day) {

            // 判断年份的范围（3岁到100岁之间)
            let time = currentYear - year;

            return time >= 3 && time <= 100;
        }

        return false;
    },

    /**
     * 校验位的检测
     *
     * @param card
     * @returns {boolean}
     */
    checkParity(card) {

        // 15位转18位
        card = this.changeFifteenToEighteen(card);

        let len = card.length;

        if (len === 18) {

            let arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
            let arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
            let cardTemp = 0, i, valnum;

            for (i = 0; i < 17; i++) {
                cardTemp += card.substr(i, 1) * arrInt[i];
            }

            valnum = arrCh[cardTemp % 11];

            return valnum == card.substr(17, 1);
        }

        return false;
    },

    /**
     * 15位转18位身份证号
     *
     * @param card
     * @returns {*}
     */
    changeFifteenToEighteen(card) {

        if (card.length === 15) {

            let arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
            let arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
            let cardTemp = 0, i;

            card = card.substr(0, 6) + '19' + card.substr(6, card.length - 6);

            for (i = 0; i < 17; i++) {
                cardTemp += card.substr(i, 1) * arrInt[i];
            }

            card += arrCh[cardTemp % 11];

            return card;
        }

        return card;
    },
};

export default {
    install(Vue) {
        Object.defineProperty(Vue.prototype.$bui, 'rules', {
            value: validators
        });
    }
};
